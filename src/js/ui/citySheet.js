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
//  puntero para cualquier gesto de arrastre: .city-sheet-cycle-btn
//  cicla las 3 posiciones con un simple tap, sin depender de que el
//  usuario arrastre nada. Un tap corto sobre la propia cabecera hace
//  lo mismo por comodidad, pero es un extra — el botón es la
//  alternativa que cuenta a efectos de accesibilidad.
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

    // sheetEl: el <div class="city-sheet"> ya insertado en el DOM, con
    // .city-sheet-grip-row (cabecera arrastrable) y .city-sheet-cycle-btn
    // (alternativa sin arrastre) dentro. Devuelve null si el marcado
    // esperado no está — nunca lanza.
    function mount(sheetEl) {
        const grip = sheetEl.querySelector('.city-sheet-grip-row');
        const cycleBtn = sheetEl.querySelector('.city-sheet-cycle-btn');
        if (!grip || !cycleBtn) return null;

        let current = 'peek';
        let dragging = false;
        let startClientY = 0;
        let startTranslate = 0;
        let moved = 0;

        function currentTranslate() {
            return translateFor(current, sheetEl.getBoundingClientRect().height);
        }

        function apply(state, animate) {
            const height = sheetEl.getBoundingClientRect().height;
            const y = translateFor(state, height);
            sheetEl.classList.toggle('city-sheet--dragging', !animate);
            sheetEl.style.transform = 'translateY(' + y + 'px)';
            sheetEl.dataset.state = state;
            cycleBtn.setAttribute('aria-expanded', String(state === 'full'));
            cycleBtn.setAttribute(
                'aria-label',
                state === 'full' ? I18n.t('map.sheet_collapse') : I18n.t('map.sheet_expand')
            );
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

        grip.addEventListener('pointerdown', onPointerDown);
        grip.addEventListener('pointermove', onPointerMove);
        grip.addEventListener('pointerup', onPointerUp);
        grip.addEventListener('pointercancel', onPointerUp);
        cycleBtn.addEventListener('click', cycle);

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

        return {
            setState,
            destroy() {
                grip.removeEventListener('pointerdown', onPointerDown);
                grip.removeEventListener('pointermove', onPointerMove);
                grip.removeEventListener('pointerup', onPointerUp);
                grip.removeEventListener('pointercancel', onPointerUp);
                cycleBtn.removeEventListener('click', cycle);
                window.removeEventListener('resize', onLayoutChange);
            },
        };
    }

    window.CitySheet = { mount };
})();
