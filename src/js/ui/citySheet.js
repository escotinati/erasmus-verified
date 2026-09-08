// ─────────────────────────────────────────────────────────────
//  CITYSHEET.JS — Erasmus Verified
//
//  Panel arrastrable sobre el mapa a pantalla completa de
//  ciudad.html en móvil (<900px), estilo Google Maps. Expone
//  window.CitySheet.mount(sheetEl).
//
//  Vanilla y aislado, mismo criterio que sheet.js: el único
//  consumidor (ciudad.js) ya es vanilla — montar React aquí solo
//  para el contenedor arrastrable reintroduciría el problema de
//  timing que documenta src/react/Nav.jsx (un script clásico
//  enganchado a DOMContentLoaded puede disparar antes de que React
//  termine de montar el nodo).
//
//  3 posiciones — peek / half / full —, nunca 0: el mapa no
//  desaparece del todo detrás del panel ni siquiera en "full" (deja
//  una franja visible arriba), igual que en Google Maps. El gesto de
//  arrastre vive SOLO en la cabecera (.city-sheet-grip-row), nunca en
//  toda la superficie del panel — si no, competiría con el scroll
//  interno de la lista de partners.
//
//  WCAG 2.2 (Dragging Movements) exige una alternativa de un solo
//  puntero para cualquier gesto de arrastre: .city-sheet-grip-row ES
//  un <button> (no un <div> con role/tabindex a mano — foco y
//  activación por teclado gratis), así que un tap o un Enter/Espacio
//  sobre la cabecera cicla las 3 posiciones sin depender de arrastrar
//  nada. No hay un botón aparte para esto (lo hubo: .city-sheet-cycle-btn,
//  retirado — la propia cabecera ya hacía de alternativa vía tap desde
//  el principio, el botón separado era redundante).
//
//  La flecha (.city-sheet-arrow-icon) dentro de esa cabecera apunta
//  arriba mientras quede contenido por ver — el panel puede
//  expandirse más, o (ya en "full") la lista todavía no ha llegado al
//  final — y abajo solo cuando de verdad no queda nada más: panel en
//  "full" Y lista con scroll llegado al final. Ver
//  updateArrowDirection() más abajo.
//
//  wireScrollFades() (más abajo) es lo segundo que hace mount(): pinta
//  el desvanecido arriba/abajo de .partners-list (ver .city-sheet-fade
//  en ciudad.css) según su scroll real — sustituye a la barra de
//  scroll, oculta a propósito en móvil, como pista de "hay más
//  contenido". Le pasa un callback a mount() para que la flecha de
//  arriba se actualice también cuando cambia el scroll de la lista,
//  no solo cuando cambia la posición del panel.
// ─────────────────────────────────────────────────────────────

(function () {
    const ORDER = ['peek', 'half', 'full'];
    const PEEK_VISIBLE_PX = 128;
    const FULL_FRACTION = 0.08;
    const HALF_FRACTION = 0.46;
    // Por debajo de este desplazamiento, un pointerup se trata como
    // tap (cicla de posición) en vez de como arrastre (snap al más
    // cercano) — igual de criterio que DRAG_CLOSE_THRESHOLD en sheet.js.
    const TAP_THRESHOLD_PX = 6;

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Copia local de isDesktopLayout() — idéntica a la de ciudad.js y
    // sheet.js. Cada script clásico que la necesita lleva su propia
    // copia (patrón ya asentado en el proyecto, ver isPartiesExperience
    // en mapPartners.js), no una función compartida.
    function isDesktopLayout() {
        const raw = getComputedStyle(document.documentElement).getPropertyValue('--bp-md');
        const bpMd = parseFloat(raw) || 900;
        return window.matchMedia('(min-width: ' + bpMd + 'px)').matches;
    }

    function translateFor(state, height) {
        if (state === 'full') return height * FULL_FRACTION;
        if (state === 'half') return height * HALF_FRACTION;
        return Math.max(height - PEEK_VISIBLE_PX, height * FULL_FRACTION);
    }

    function nearestState(y, height) {
        let best = ORDER[0];
        let bestDist = Infinity;
        for (const state of ORDER) {
            const dist = Math.abs(translateFor(state, height) - y);
            if (dist < bestDist) {
                bestDist = dist;
                best = state;
            }
        }
        return best;
    }

    // Pinta las clases is-scrolled/has-more sobre .partners-list según
    // su scroll real (ver .city-sheet-fade en ciudad.css) — sustituyen
    // a la barra de scroll oculta como pista de "hay más contenido" en
    // esa dirección. Un ResizeObserver además de "scroll" porque
    // togglear una categoría (mapPartners.js) puede cambiar
    // scrollHeight sin que el usuario haga scroll él mismo. onChange
    // se llama después de cada actualización — mount() lo usa para
    // refrescar también la flecha de la cabecera (ver
    // updateArrowDirection), que depende de este mismo "has-more".
    function wireScrollFades(sheetEl, onChange) {
        const list = sheetEl.querySelector('.partners-list');
        if (!list) return () => {};

        function update() {
            const atTop = list.scrollTop <= 2;
            const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
            list.classList.toggle('is-scrolled', !atTop);
            list.classList.toggle('has-more', !atBottom);
            if (onChange) onChange();
        }

        list.addEventListener('scroll', update, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(list);
        update();

        return () => {
            list.removeEventListener('scroll', update);
            observer.disconnect();
        };
    }

    // sheetEl: el <div class="city-sheet"> ya insertado en el DOM, con
    // .city-sheet-grip-row (cabecera, a la vez zona de arrastre y
    // alternativa sin arrastre — ver comentario de arriba) dentro.
    // Devuelve null si el marcado esperado no está — nunca lanza.
    function mount(sheetEl) {
        const grip = sheetEl.querySelector('.city-sheet-grip-row');
        if (!grip) return null;
        const list = sheetEl.querySelector('.partners-list');

        let current = 'peek';
        let dragging = false;
        let startClientY = 0;
        let startTranslate = 0;
        let moved = 0;

        function currentTranslate() {
            return translateFor(current, sheetEl.getBoundingClientRect().height);
        }

        // Arriba mientras quede algo por ver: el panel no está del
        // todo desplegado, o (ya en "full") la lista aún no ha
        // llegado a su final. Abajo solo cuando las dos cosas a la
        // vez son ciertas — nada más que revelar, solo plegar.
        function updateArrowDirection() {
            const pointsDown = current === 'full' && !(list && list.classList.contains('has-more'));
            grip.dataset.arrow = pointsDown ? 'down' : 'up';
            grip.setAttribute('aria-expanded', String(pointsDown));
            grip.setAttribute(
                'aria-label',
                pointsDown ? I18n.t('map.sheet_collapse') : I18n.t('map.sheet_expand')
            );
        }

        function apply(state, animate) {
            const height = sheetEl.getBoundingClientRect().height;
            const y = translateFor(state, height);
            sheetEl.classList.toggle('city-sheet--dragging', !animate);
            sheetEl.style.transform = 'translateY(' + y + 'px)';
            sheetEl.dataset.state = state;
            updateArrowDirection();
        }

        function setState(state, animate = true) {
            current = state;
            if (isDesktopLayout()) return;
            apply(state, animate && !prefersReducedMotion());
        }

        function cycle() {
            const idx = ORDER.indexOf(current);
            setState(ORDER[(idx + 1) % ORDER.length]);
        }

        function onPointerDown(e) {
            if (isDesktopLayout()) return;
            dragging = true;
            moved = 0;
            startClientY = e.clientY;
            startTranslate = currentTranslate();
            sheetEl.classList.add('city-sheet--dragging');
            grip.setPointerCapture(e.pointerId);
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const height = sheetEl.getBoundingClientRect().height;
            const delta = e.clientY - startClientY;
            moved = Math.max(moved, Math.abs(delta));
            const min = translateFor('full', height);
            const max = translateFor('peek', height);
            const y = Math.min(Math.max(startTranslate + delta, min), max);
            sheetEl.style.transform = 'translateY(' + y + 'px)';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            sheetEl.classList.remove('city-sheet--dragging');

            if (moved < TAP_THRESHOLD_PX) {
                cycle();
                return;
            }
            const height = sheetEl.getBoundingClientRect().height;
            const match = /-?\d+(\.\d+)?/.exec(sheetEl.style.transform);
            const y = match ? parseFloat(match[0]) : currentTranslate();
            setState(nearestState(y, height));
        }

        // click con detail:0 = disparado por teclado (Enter/Espacio
        // sobre el <button>), no por puntero — el tap por puntero ya
        // lo gestiona onPointerUp() arriba (moved < TAP_THRESHOLD_PX);
        // sin este filtro, un tap real dispararía cycle() dos veces
        // (una desde pointerup, otra desde el click sintético que el
        // navegador dispara después en cualquier <button>).
        function onKeyboardClick(e) {
            if (e.detail === 0) cycle();
        }

        grip.addEventListener('pointerdown', onPointerDown);
        grip.addEventListener('pointermove', onPointerMove);
        grip.addEventListener('pointerup', onPointerUp);
        grip.addEventListener('pointercancel', onPointerUp);
        grip.addEventListener('click', onKeyboardClick);

        function onLayoutChange() {
            if (isDesktopLayout()) {
                sheetEl.style.transform = '';
                sheetEl.classList.remove('city-sheet--dragging');
            } else {
                apply(current, false);
            }
        }
        window.addEventListener('resize', onLayoutChange);
        onLayoutChange();

        const unwireScrollFades = wireScrollFades(sheetEl, updateArrowDirection);

        return {
            setState,
            destroy() {
                grip.removeEventListener('pointerdown', onPointerDown);
                grip.removeEventListener('pointermove', onPointerMove);
                grip.removeEventListener('pointerup', onPointerUp);
                grip.removeEventListener('pointercancel', onPointerUp);
                grip.removeEventListener('click', onKeyboardClick);
                window.removeEventListener('resize', onLayoutChange);
                unwireScrollFades();
            },
        };
    }

    window.CitySheet = { mount };
})();
