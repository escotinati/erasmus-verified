// ─────────────────────────────────────────────────────────────
//  CITYPARTNERS.JS — Erasmus Verified
//
//  Lista de categorías/partners de ciudad.html SIN mapa (rama
//  feature/city-no-map) — sustituye a mapPartners.js en esta página
//  concreta. mapPartners.js sigue existiendo tal cual para mapa.html
//  (esa página sí necesita sincronizar pines con la lista); aquí no
//  hay ningún mapa con el que sincronizar nada, así que en vez de
//  convertir mapPartners.js en un "si hay mapa / si no hay mapa" se
//  duplica un archivo más simple — mismo criterio que ya usa el
//  proyecto para isPartiesExperience()/normalize() (cada script
//  clásico que lo necesita lleva su propia copia): cuando dos
//  contextos divergen de verdad, se copia en vez de forzar una
//  abstracción compartida.
//
//  activeCategories (Set, multi-selección + declutter de pines) deja
//  de tener sentido sin mapa. El estado aquí es otro:
//    - collapsedCategories (Set) — solo visual, plegar/desplegar una
//      categoría para escanear más rápido. Nunca la hace desaparecer.
//    - focusCategory (string|null) — "ver todo de esta categoría
//      sola", sin tope de tarjetas. La respuesta a categorías con
//      muchos partners (ver el mockup "Ciudad Sin Mapa" acordado con
//      Álvaro antes de esta rama: tope de 6 tarjetas + "ver todo").
//
//  Devuelve { listGroups, selectPartner, activateOnlyCategory } — LA
//  MISMA forma que mountPartnersList() (mapPartners.js) a propósito:
//  initCitySearch() en ciudad.js sigue funcionando prácticamente sin
//  cambios — activateOnlyCategory ahora entra en modo foco en vez de
//  desactivar pines, mismo significado ("mostrar solo este tipo"),
//  mecanismo distinto.
//
//  Depende de: fetchPartnersByCity/groupPartnersByCategory
//  (partnersService.js), CATEGORY_META (categoryMeta.js), window.Sheet
//  (sheet.js), window.mountPartnerDetail (mount-partner-detail.jsx),
//  window.mountCityPartnerList (mount-city-partner-list.jsx),
//  getUserLocation/distanceMeters (geolocation.js) para la distancia a
//  cada partner.
// ─────────────────────────────────────────────────────────────

// Copia local idéntica a la de mapPartners.js/navShared.jsx/index.js —
// ver el comentario de cabecera de arriba sobre por qué se duplica en
// vez de compartirse.
function isPartiesExperience() {
    return window.ERASMUS_EXPERIENCE && window.ERASMUS_EXPERIENCE.theme === 'theme-parties';
}

// Idéntica a categoryLabel() en mapPartners.js — mismo motivo.
function categoryLabel(category, fallbackLabel) {
    const key = 'map.category_' + category;
    const translated = I18n.t(key);
    return translated !== key ? translated : fallbackLabel;
}

async function mountCityPartners(listContainerId, city, { autoOpenPartnerId } = {}) {
    const container = document.getElementById(listContainerId);
    Skeleton.render(container, 4, () => Skeleton.block('skeleton--row'));

    const partners = await fetchPartnersByCity(city.id);
    const groups = groupPartnersByCategory(partners); // ya filtra categorías sin partners

    if (groups.length === 0) {
        renderNoPartnersState();
        return;
    }

    // Mismo cálculo que mapPartners.js: label/icon/color resueltos una
    // sola vez, CATEGORY_META es un `const` de script clásico (no vive
    // en window), así que esta traducción de dominio se queda aquí.
    const listGroups = groups.map(({ category, partners }) => {
        const meta = CATEGORY_META[category] || {
            label: category,
            color: '#64748b',
            icon: 'place',
        };
        return {
            category,
            label: categoryLabel(category, meta.label),
            icon: meta.icon,
            color: meta.color,
            partners,
        };
    });

    const state = {
        collapsedCategories: initialCollapsedCategories(),
        focusCategory: null,
    };

    Skeleton.clear(container);
    const listRoot = mountCityPartnerList(container);
    renderList();

    // Distancia a cada partner ("a 800 m") — pedida automáticamente al
    // cargar, sin bloquear el primer render (la lista ya está pintada
    // cuando esto resuelve). getUserLocation() nunca rechaza: sin
    // permiso/soporte, resuelve null y ningún partner recibe distancia
    // (mountCityPartnerList/CityPartnerList.jsx ya tratan
    // distanceMeters como opcional). Los objetos partner son los
    // mismos que ya vive listGroups — se mutan in place y se vuelve a
    // pintar, mismo patrón que toggleCollapse()/enterFocus().
    getUserLocation().then((coords) => {
        if (!coords) return;
        for (const group of listGroups) {
            for (const partner of group.partners) {
                if (partner.lat == null || partner.lng == null) continue;
                partner.distanceMeters = distanceMeters(coords.lat, coords.lng, partner.lat, partner.lng);
            }
        }
        renderList();
    });

    // Deep link desde el buscador global (index.js) — ?partner=ID en
    // ciudad.html. selectPartner() ya valida por su cuenta que el id
    // exista en esta ciudad. Si pertenece a una categoría que arrancó
    // plegada (Parties con una categoría que no sea nightlife), se
    // despliega ESA — y solo esa — antes de abrir el Sheet, para que al
    // cerrarlo el usuario no se encuentre la categoría del partner que
    // acaba de ver escondida. (Si además queda más allá del tope de
    // tarjetas dentro de su categoría, no entra en modo foco
    // automáticamente todavía — límite conocido, pendiente de pulir.)
    if (autoOpenPartnerId) {
        const autoOpenPartner = findPartnerById(autoOpenPartnerId);
        if (autoOpenPartner && state.collapsedCategories.has(autoOpenPartner.category)) {
            state.collapsedCategories.delete(autoOpenPartner.category);
            renderList();
        }
        if (autoOpenPartner) selectPartner(autoOpenPartnerId);
    }

    // ── Arranque por marca (mismo criterio que "Regla 1" en
    // mapPartners.js) — en Parties, solo Fiestas arranca desplegada; el
    // resto de categorías sigue ahí (nunca desaparece del todo, solo
    // plegada) para no enterrar contenido ajeno a la marca de esa
    // página bajo el de otras categorías. ──────────────────────────
    function initialCollapsedCategories() {
        if (!isPartiesExperience()) return new Set();
        return new Set(
            groups.filter((g) => g.category !== 'nightlife').map((g) => g.category)
        );
    }

    function toggleCollapse(category) {
        if (state.collapsedCategories.has(category)) {
            state.collapsedCategories.delete(category);
        } else {
            state.collapsedCategories.add(category);
        }
        renderList();
    }

    // Reemplaza activeCategories por completo con una única categoría —
    // mismo caso de uso que activateOnlyCategory tenía en
    // mapPartners.js (el buscador de ciudad.js, ver initCitySearch()),
    // aquí como entrada al modo foco.
    function enterFocus(category) {
        state.focusCategory = category;
        renderList();
    }

    function exitFocus() {
        state.focusCategory = null;
        renderList();
    }

    function renderList() {
        listRoot.render({
            groups: listGroups,
            collapsedCategories: state.collapsedCategories,
            focusCategory: state.focusCategory,
            onToggleCollapse: toggleCollapse,
            onEnterFocus: enterFocus,
            onExitFocus: exitFocus,
            onSelectPartner: selectPartner,
            onDirectionsClick: trackDirectionsClick,
        });
    }

    function trackDirectionsClick(partner) {
        trackEvent('partner_directions_click', {
            partnerId: partner.id,
            partnerName: partner.name,
            // Distingue el atajo directo de la tarjeta del mismo evento
            // disparado desde dentro del Sheet (ver selectPartner más
            // abajo) — mismo nombre de evento, un origen más en el
            // payload en vez de fragmentar la taxonomía de analítica.
            source: 'list',
        });
    }

    // ── Ciudad sin ningún partner — idéntico a mapPartners.js ──────
    function renderNoPartnersState() {
        Skeleton.clear(container);
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'partners-empty-state';

        const msg = document.createElement('p');
        msg.textContent = I18n.t('map.no_partners');
        wrap.appendChild(msg);

        const safeWhatsapp = sanitizeUrl(city.whatsapp_url);
        if (safeWhatsapp) {
            const btn = document.createElement('a');
            btn.href = safeWhatsapp;
            btn.target = '_blank';
            btn.rel = 'noopener noreferrer';
            btn.className = 'btn-primary-pill';
            btn.textContent = I18n.t('city.join_whatsapp_group');
            wrap.appendChild(btn);
        }

        container.appendChild(wrap);
    }

    // ── Abrir un partner → Sheet (PartnerDetail.jsx), sin marker que
    // expandir/contraer (esa era la única parte de esto que dependía
    // del mapa en mapPartners.js) ──────────────────────────────────
    function selectPartner(partnerId, triggerElement) {
        const partner = findPartnerById(partnerId);
        if (!partner) return;

        const contentEl = document.createElement('div');
        const detailRoot = mountPartnerDetail(contentEl, {
            partner,
            directionsLabel: I18n.t('map.directions'),
            onLinkClick: (link, safeUrl) => {
                trackEvent('partner_link_click', {
                    partnerId: partner.id,
                    partnerName: partner.name,
                    linkType: link.type,
                    linkUrl: safeUrl,
                });
            },
            onDirectionsClick: () => trackDirectionsClick(partner),
        });

        const sheet = Sheet.create({
            title: partner.name,
            content: contentEl,
            closeLabel: I18n.t('common.close'),
            onClose: () => detailRoot.unmount(),
        });
        sheet.open(triggerElement);
    }

    function findPartnerById(id) {
        for (const { partners } of listGroups) {
            const found = partners.find((p) => p.id === id);
            if (found) return found;
        }
        return null;
    }

    // Handle mínimo para quien llame a mountCityPartners() — hoy solo
    // ciudad.js, para su buscador local (ver initCitySearch()): mismo
    // contrato que mountPartnersList() en mapPartners.js.
    return { listGroups, selectPartner, activateOnlyCategory: enterFocus };
}
