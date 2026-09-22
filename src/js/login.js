// ─────────────────────────────────────────────────────────────
//  LOGIN.JS — Erasmus Verified
//
//  Formulario de login: email + contraseña. Mismo patrón de
//  accesibilidad que registro.js/admin.js (rama
//  fix/admin-form-error-accessibility) — ver el comentario largo de
//  registro.js para el porqué.
//
//  Bug real detectado en un prototipo anterior, no lo repitas: el
//  destino tras un login correcto es SIEMPRE el literal 'index.html',
//  nunca un parámetro leído de la URL (tipo ?redirect=) — eso sería
//  un open redirect (cualquiera podría mandar un enlace de login que,
//  tras autenticarse, te redirigiera a un sitio ajeno).
//
//  Depende de: signIn() (authService.js), window.I18n (i18n.js/
//  translations.js).
//
//  A petición: el email se valida también en formato (no solo "no
//  vacío") — mismo isValidEmail()/error_email_invalid que ya usaba
//  registro.js, más validación en vivo (blur + input) sobre
//  login-email, ver el comentario junto a ese listener más abajo.
//
//  A petición: los <p class="auth-error"> ya no viven en el HTML ni
//  reservan hueco vacíos — renderAuthError() los crea al aparecer un
//  error y los quita del DOM en cuanto desaparece (login.html ya no
//  tiene ningún <p id="*-error">, solo el aria-describedby que apunta
//  a un id que existirá o no según el momento — válido: un lector de
//  pantalla ignora un aria-describedby sin destino y lo recoge en
//  cuanto el nodo aparece). Mismo cambio en registro.js.
// ─────────────────────────────────────────────────────────────

// parentEl: dónde vive el <p> cuando existe. insertBeforeEl (opcional):
// referencia para mantener el orden visual original al crearlo — solo
// hace falta cuando el <p> no es, de por sí, el último hijo de
// parentEl (ver el uso con login-form-error más abajo, que debe
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

// Alterna type="password"/"text" del campo + icono (visibility ↔
// visibility_off, mismo par que usa admin.js con sus SVG propios) y el
// aria-label del botón, vía I18n.t() (no data-i18n: el botón solo tiene
// un icono como hijo, escribirle textContent lo borraría). Duplicado en
// registro.js a propósito — sin ES Modules entre scripts clásicos, ver
// normalize() en registro.js para el mismo criterio.
function initPasswordToggle(inputId, toggleId, iconId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    const icon = document.getElementById(iconId);
    if (!input || !toggle || !icon) return;

    toggle.setAttribute('aria-label', I18n.t('auth.show_password'));
    toggle.addEventListener('click', function () {
        const willShow = input.type === 'password';
        input.type = willShow ? 'text' : 'password';
        icon.textContent = willShow ? 'visibility_off' : 'visibility';
        toggle.setAttribute(
            'aria-label',
            I18n.t(willShow ? 'auth.hide_password' : 'auth.show_password')
        );
    });
}

// Transición sencilla al cambiar de Iniciar sesión a Crear cuenta (o
// viceversa): la tarjeta se desvanece (.auth-card--leaving, auth.css) y
// SOLO ENTONCES navega de verdad — nunca el planteamiento anterior con
// view-transition-name (morphing de la píldora/tarjeta entre las dos
// páginas, descartado a petición). El pestañeo ya activo ("Iniciar
// sesión" en login.html) no dispara nada, es a donde ya estás.
// animationend, no un setTimeout con la duración copiada de la CSS: así
// nunca puede desincronizarse si cambia el token --anim-duration-fast
// (theme-dependiente, Verified/Parties). El setTimeout de más abajo es
// solo una red de seguridad por si esa animación no llegara a disparar
// el evento. Duplicada a propósito en registro.js — mismo criterio que
// initPasswordToggle()/normalize(), sin ES Modules entre scripts
// clásicos.
function initAuthSwitcherFade() {
    const card = document.querySelector('.auth-card');
    const tabs = document.querySelectorAll('.auth-switcher__tab');
    if (!card || !tabs.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function (e) {
            if (reduceMotion || tab.getAttribute('aria-current') === 'page') return;
            e.preventDefault();

            const href = tab.href;
            let navigated = false;
            function go() {
                if (navigated) return;
                navigated = true;
                window.location.href = href;
            }

            card.addEventListener('animationend', go, { once: true });
            setTimeout(go, 400);
            card.classList.add('auth-card--leaving');
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initAuthSwitcherFade();

    const form = document.getElementById('login-form');
    if (!form) return;

    initPasswordToggle('login-password', 'login-password-toggle', 'login-password-toggle-icon');

    const submitBtn = document.getElementById('login-submit');
    const emailInput = document.getElementById('login-email');

    // Validación en vivo del email, a petición: en el blur (al salir
    // del campo) se valida siempre — es el primer momento en que tiene
    // sentido reprochar un email a medio escribir. En el input (cada
    // tecla) solo se revalida si el campo YA está marcado inválido —
    // así el error desaparece en cuanto se corrige sin esperar a un
    // segundo blur, pero no se le echa en cara nada mientras el
    // usuario todavía está escribiendo por primera vez (progressive
    // disclosure, no "overwhelm upfront").
    emailInput.addEventListener('blur', function () {
        setFieldError('login-email', getEmailError(emailInput.value.trim()));
    });
    emailInput.addEventListener('input', function () {
        if (emailInput.getAttribute('aria-invalid') === 'true') {
            setFieldError('login-email', getEmailError(emailInput.value.trim()));
        }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = document.getElementById('login-password').value;
        const emailError = getEmailError(email);

        // Mismo patrón que registro.js: una única lista de validación,
        // orden = orden real de los campos en el HTML.
        const fieldChecks = [
            {
                id: 'login-email',
                valid: !emailError,
                message: emailError,
            },
            {
                id: 'login-password',
                valid: Boolean(password),
                message: I18n.t('auth.error_password_required'),
            },
        ];

        fieldChecks.forEach(({ id, valid, message }) => setFieldError(id, valid ? '' : message));
        renderAuthError(form, 'login-form-error', '', submitBtn);

        const firstInvalid = fieldChecks.find((f) => !f.valid);
        if (firstInvalid) {
            document.getElementById(firstInvalid.id)?.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = I18n.t('auth.login_submitting');

        const { error } = await signIn({ email, password });

        if (error) {
            submitBtn.disabled = false;
            // I18n.t(), no un submitLabel capturado antes de applyTranslations()
            // (bug real detectado en esta misma rama): el <script> de esta
            // página corre ANTES que el que llama a applyTranslations(), así
            // que capturar .textContent en DOMContentLoaded habría guardado
            // el texto en español de partida sin importar el idioma activo.
            submitBtn.textContent = I18n.t('auth.login_submit_cta');
            renderAuthError(
                form,
                'login-form-error',
                error.message || I18n.t('auth.error_generic'),
                submitBtn
            );
            return;
        }

        window.location.href = 'index.html';
    });
});
