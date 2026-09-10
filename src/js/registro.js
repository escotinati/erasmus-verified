// ─────────────────────────────────────────────────────────────
//  REGISTRO.JS — Erasmus Verified
//
//  Formulario de registro: email + contraseña (mínimo 6 caracteres) +
//  ciudad obligatoria + universidad/intereses opcionales. El perfil
//  (public.profiles) NO se inserta desde aquí — lo crea el trigger
//  handle_new_user (ya aplicado en Supabase) al leer las claves que
//  signUp() manda en options.data (ver authService.js); este archivo
//  solo valida el formulario y llama a esa función.
//
//  Mismo patrón de accesibilidad que admin.js (rama
//  fix/admin-form-error-accessibility): setFieldError() solo
//  actualiza lo que cambia por intento (aria-invalid + el texto de un
//  <p role="alert"> ya enlazado por aria-describedby en el HTML), y
//  el submit deriva su validación de una única lista `fieldChecks`
//  (con el orden del DOM documentado como invariante, igual que allá)
//  usada tanto para pintar los errores como para mover el foco al
//  primer campo inválido.
//
//  A petición: los <p class="auth-error"> ya no viven en el HTML ni
//  reservan hueco vacíos — renderAuthError() los crea al aparecer un
//  error y los quita del DOM en cuanto desaparece (registro.html ya
//  no tiene ningún <p id="*-error">, solo el aria-describedby que
//  apunta a un id que existirá o no según el momento — válido: un
//  lector de pantalla ignora un aria-describedby sin destino y lo
//  recoge en cuanto el nodo aparece). Mismo cambio en login.js.
//
//  A petición: el email también se valida en vivo (blur + input),
//  no solo al enviar — ver getEmailError()/el listener sobre reg-email
//  más abajo. Mismo criterio que login.js.
//
//  A petición: reg-city ya no es un <select> — es un input de texto
//  autocompletable (mismo patrón que #citySearch en index.js: dropdown
//  de sugerencias que se filtra según se escribe, ver
//  initCityAutocomplete() más abajo). El id real de la ciudad elegida
//  vive aparte, en el input oculto reg-city-id — es ESE valor el que
//  lee el submit, nunca el texto visible de reg-city.
//
//  Depende de: fetchActiveCities() (citiesService.js), signUp()
//  (authService.js), window.I18n (i18n.js/translations.js).
// ─────────────────────────────────────────────────────────────

// parentEl: dónde vive el <p> cuando existe. insertBeforeEl (opcional):
// referencia para mantener el orden visual original al crearlo — solo
// hace falta cuando el <p> no es, de por sí, el último hijo de
// parentEl (ver el uso con register-form-error más abajo, que debe
// quedar antes del botón de submit).
function renderAuthError(parentEl, id, message, insertBeforeEl) {
    const existingEl = document.getElementById(id);

    if (!message) {
        existingEl?.remove();
        return;
    }

    if (existingEl) {
        existingEl.textContent = message;
        return;
    }

    const errorEl = document.createElement('p');
    errorEl.className = 'auth-error';
    errorEl.id = id;
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = message;
    parentEl.insertBefore(errorEl, insertBeforeEl || null);
}

function setFieldError(fieldId, message) {
    const inputEl = document.getElementById(fieldId);
    if (inputEl) inputEl.setAttribute('aria-invalid', String(Boolean(message)));

    const fieldEl = inputEl?.closest('.auth-field');
    if (fieldEl) renderAuthError(fieldEl, `${fieldId}-error`, message);
}

// Mismo criterio que el type="email" nativo (el form lleva novalidate,
// así que el navegador ya no lo comprueba solo) — regex simplificada,
// suficiente para el mensaje propio sin intentar cubrir todo RFC 5322.
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Única fuente de verdad para el mensaje de error del email — la usan
// tanto el submit como la validación en vivo (blur/input) de más
// abajo, así los dos caminos nunca pueden desincronizar su criterio.
function getEmailError(value) {
    if (!value) return I18n.t('auth.error_email_required');
    if (!isValidEmail(value)) return I18n.t('auth.error_email_invalid');
    return '';
}

// Mismo criterio que normalize() en index.js (initAutocomplete) — quita
// diacríticos para que "leon" encuentre "León". Duplicado a propósito
// en vez de compartido: cada script de página es autocontenido, sin
// ES Modules entre archivos clásicos (ver Stack en CLAUDE.md).
function normalize(str) {
    return str
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
}

// Autocompletado de ciudad — mismo patrón que #citySearch en index.js
// (dropdown de texto libre reutilizando .search-dropdown/
// .search-dropdown-item/.sdi-* de components.css, sin CSS nuevo): desde
// 1 carácter se filtran `cities` por substring normalizado, coincidencias
// por prefijo antes que por contención. reg-city (texto visible) es solo
// lo que teclea el usuario — la ciudad realmente elegida guarda su id en
// el input oculto reg-city-id, que es lo único que lee el submit.
function initCityAutocomplete(cities) {
    const input = document.getElementById('reg-city');
    const hiddenInput = document.getElementById('reg-city-id');
    const dropdown = document.getElementById('reg-city-dropdown');
    const fieldEl = input?.closest('.auth-field');
    if (!input || !hiddenInput || !dropdown || !fieldEl) return;

    let activeIdx = -1;

    function closeDropdown() {
        dropdown.classList.remove('is-open');
        activeIdx = -1;
    }

    function selectCity(city) {
        input.value = city.name;
        hiddenInput.value = city.id;
        setFieldError('reg-city', '');
        closeDropdown();
    }

    function renderResults(results) {
        dropdown.innerHTML = '';
        activeIdx = -1;
        if (!results.length) {
            dropdown.classList.remove('is-open');
            return;
        }

        results.slice(0, 8).forEach((city) => {
            const el = document.createElement('button');
            el.type = 'button';
            el.className = 'search-dropdown-item';
            el.setAttribute('role', 'option');

            // Nodos + .textContent, no innerHTML con template string —
            // nombre/país vienen de Supabase, mismo criterio que ya
            // usaba el <option> del <select> anterior.
            const icon = document.createElement('span');
            icon.className = 'sdi-icon';
            icon.textContent = city.flag || '';
            const name = document.createElement('span');
            name.className = 'sdi-name';
            name.textContent = city.name;
            const sub = document.createElement('span');
            sub.className = 'sdi-sub';
            sub.textContent = city.country;
            const text = document.createElement('span');
            text.className = 'sdi-text';
            text.append(name, sub);
            el.append(icon, text);

            el.addEventListener('click', () => selectCity(city));
            dropdown.appendChild(el);
        });

        dropdown.classList.add('is-open');
    }

    function setActive(idx) {
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        items.forEach((el) => el.classList.remove('is-active'));
        activeIdx = Math.max(-1, Math.min(idx, items.length - 1));
        if (activeIdx >= 0) items[activeIdx].classList.add('is-active');
    }

    input.addEventListener('input', () => {
        // Cualquier tecleo invalida la selección previa — el id
        // guardado solo puede volver a rellenarse eligiendo de la
        // lista (o por el fallback de coincidencia exacta en blur, ver
        // más abajo), nunca quedarse "pegado" a un texto ya editado.
        hiddenInput.value = '';

        const q = input.value.trim();
        if (!q) {
            closeDropdown();
            return;
        }
        const nq = normalize(q);
        const results = cities.filter((c) => normalize(c.name).includes(nq));
        results.sort((a, b) => {
            const an = normalize(a.name),
                bn = normalize(b.name);
            const aStarts = an.startsWith(nq),
                bStarts = bn.startsWith(nq);
            if (aStarts !== bStarts) return aStarts ? -1 : 1;
            return an.localeCompare(bn);
        });
        renderResults(results);
    });

    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        if (!dropdown.classList.contains('is-open') || !items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(activeIdx + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(activeIdx - 1);
        } else if (e.key === 'Enter') {
            // preventDefault SIEMPRE que el dropdown esté abierto — si
            // no, Enter dispara el submit del formulario en vez de
            // confirmar la ciudad resaltada.
            e.preventDefault();
            if (activeIdx >= 0) items[activeIdx].click();
        } else if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    document.addEventListener('click', (e) => {
        if (!fieldEl.contains(e.target)) closeDropdown();
    });

    // Fallback: si el usuario teclea el nombre completo y exacto de una
    // ciudad pero nunca llega a elegirla de la lista (clic/Enter), al
    // salir del campo se resuelve igual si el texto coincide EXACTO
    // (sin acentos/mayúsculas) con una única ciudad — evita que algo
    // bien escrito a mano cuente como "sin seleccionar" solo por no
    // haber tocado el dropdown. setTimeout: un clic en un item del
    // dropdown dispara blur en este input ANTES que el click del item
    // (orden real del navegador: mousedown mueve el foco → blur, luego
    // click) — sin diferir, este fallback correría antes que
    // selectCity() y perdería la selección real que el usuario sí hizo.
    input.addEventListener('blur', () => {
        setTimeout(() => {
            closeDropdown();
            if (hiddenInput.value) return;
            const nq = normalize(input.value.trim());
            if (!nq) return;
            const matches = cities.filter((c) => normalize(c.name) === nq);
            if (matches.length === 1) selectCity(matches[0]);
        }, 150);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    const form = document.getElementById('register-form');
    if (!form) return;

    const emailInput = document.getElementById('reg-email');

    // Validación en vivo del email, a petición: en el blur (al salir
    // del campo) se valida siempre — es el primer momento en que tiene
    // sentido reprochar un email a medio escribir. En el input (cada
    // tecla) solo se revalida si el campo YA está marcado inválido —
    // así el error desaparece en cuanto se corrige sin esperar a un
    // segundo blur, pero no se le echa en cara nada mientras el
    // usuario todavía está escribiendo por primera vez (progressive
    // disclosure, no "overwhelm upfront").
    emailInput.addEventListener('blur', function () {
        setFieldError('reg-email', getEmailError(emailInput.value.trim()));
    });
    emailInput.addEventListener('input', function () {
        if (emailInput.getAttribute('aria-invalid') === 'true') {
            setFieldError('reg-email', getEmailError(emailInput.value.trim()));
        }
    });

    const cities = await fetchActiveCities();
    initCityAutocomplete(cities);

    const submitBtn = document.getElementById('register-submit');
    const successBox = document.getElementById('register-success');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = document.getElementById('reg-password').value;
        const cityId = document.getElementById('reg-city-id').value;
        const university = document.getElementById('reg-university').value.trim();
        const interests = Array.from(
            form.querySelectorAll('input[name="interests"]:checked')
        ).map((el) => el.value);
        const emailError = getEmailError(email);

        // Única fuente de verdad para qué campo falla y por qué — el
        // ORDEN de este array coincide con el orden real de los campos
        // en el HTML (reg-email, reg-password, reg-city): firstInvalid
        // de abajo asume que recorrerlo de arriba a abajo equivale a
        // recorrer el formulario de arriba a abajo.
        const fieldChecks = [
            {
                id: 'reg-email',
                valid: !emailError,
                message: emailError,
            },
            {
                id: 'reg-password',
                valid: password.length >= 6,
                message: !password
                    ? I18n.t('auth.error_password_required')
                    : I18n.t('auth.error_password_short'),
            },
            {
                id: 'reg-city',
                valid: Boolean(cityId),
                message: I18n.t('auth.error_city_required'),
            },
        ];

        fieldChecks.forEach(({ id, valid, message }) => setFieldError(id, valid ? '' : message));
        renderAuthError(form, 'register-form-error', '', submitBtn);

        const firstInvalid = fieldChecks.find((f) => !f.valid);
        if (firstInvalid) {
            document.getElementById(firstInvalid.id)?.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = I18n.t('auth.register_submitting');

        const { error } = await signUp({
            email,
            password,
            cityId: parseInt(cityId, 10),
            university,
            interests,
        });

        if (error) {
            submitBtn.disabled = false;
            // I18n.t(), no un submitLabel capturado antes de applyTranslations()
            // (bug real detectado en esta misma rama, ver login.js): el
            // <script> de esta página corre ANTES que el que llama a
            // applyTranslations(), así que capturar .textContent en
            // DOMContentLoaded habría guardado el texto en español de
            // partida sin importar el idioma activo.
            submitBtn.textContent = I18n.t('auth.register_submit_cta');
            renderAuthError(
                form,
                'register-form-error',
                error.message || I18n.t('auth.error_generic'),
                submitBtn
            );
            return;
        }

        // Con la confirmación de email activada (decisión ya cerrada,
        // ver contexto de la tarea), signUp() no deja ninguna sesión
        // activa — no hay a dónde redirigir todavía. Se sustituye el
        // formulario por el aviso de "revisa tu correo" en vez de
        // navegar a ningún sitio.
        form.hidden = true;
        successBox.hidden = false;
    });
});
