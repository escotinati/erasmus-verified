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
// ─────────────────────────────────────────────────────────────

function setFieldError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message || '';
    if (inputEl) inputEl.setAttribute('aria-invalid', String(Boolean(message)));
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    if (!form) return;

    const submitBtn = document.getElementById('login-submit');
    const formErrorEl = document.getElementById('login-form-error');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Mismo patrón que registro.js: una única lista de validación,
        // orden = orden real de los campos en el HTML.
        const fieldChecks = [
            {
                id: 'login-email',
                valid: Boolean(email),
                message: I18n.t('auth.error_email_required'),
            },
            {
                id: 'login-password',
                valid: Boolean(password),
                message: I18n.t('auth.error_password_required'),
            },
        ];

        fieldChecks.forEach(({ id, valid, message }) => setFieldError(id, valid ? '' : message));
        formErrorEl.textContent = '';

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
            formErrorEl.textContent = error.message || I18n.t('auth.error_generic');
            return;
        }

        window.location.href = 'index.html';
    });
});
