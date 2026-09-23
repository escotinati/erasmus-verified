// ─────────────────────────────────────────────────────────────
//  RECUPERAR.JS — Erasmus Verified
//
//  Flujo de recuperación de contraseña de Supabase Auth, en dos
//  estados dentro de la misma página (recuperar.html):
//
//    1. #recover-request — formulario de email. Llama a
//       resetPasswordForEmail() (authService.js), que manda el email de
//       Supabase con un enlace de vuelta a ESTA MISMA página.
//    2. #recover-reset — al volver desde ese enlace, la URL trae
//       "type=recovery" en el hash (#access_token=...&type=recovery).
//       El SDK de Supabase lo detecta solo al cargar (detectSessionInUrl,
//       activado por defecto) y deja una sesión temporal activa — este
//       archivo solo decide qué mitad de la página mostrar mirando ese
//       hash, la sesión en sí la gestiona el SDK. updatePassword()
//       (authService.js) usa esa sesión para cambiar la contraseña; si
//       no hay sesión válida (enlace caducado o reusado), Supabase
//       devuelve un error que se muestra tal cual, igual que el resto
//       de errores de esta familia de formularios.
//
//  Mismo patrón de accesibilidad que login.js/registro.js
//  (renderAuthError/setFieldError/fieldChecks, duplicado a propósito —
//  ver el comentario largo en registro.js sobre por qué no se comparte
//  entre scripts clásicos).
//
//  Tras guardar la contraseña con éxito, se redirige a 'index.html' (no
//  a login.html): la sesión de recuperación YA es una sesión válida, así
//  que pedir credenciales otra vez sería redundante — mismo criterio que
//  "no volver a pedir lo que ya se tiene" del resto del proyecto.
//
//  Depende de: resetPasswordForEmail()/updatePassword() (authService.js),
//  window.I18n (i18n.js/translations.js).
// ─────────────────────────────────────────────────────────────

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

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getEmailError(value) {
    if (!value) return I18n.t('auth.error_email_required');
    if (!isValidEmail(value)) return I18n.t('auth.error_email_invalid');
    return '';
}

// Duplicado a propósito de login.js/registro.js.
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

function initRequestForm() {
    const form = document.getElementById('recover-request-form');
    if (!form) return;

    const submitBtn = document.getElementById('recover-request-submit');
    const emailInput = document.getElementById('recover-email');
    const successBox = document.getElementById('recover-request-success');

    emailInput.addEventListener('blur', function () {
        setFieldError('recover-email', getEmailError(emailInput.value.trim()));
    });
    emailInput.addEventListener('input', function () {
        if (emailInput.getAttribute('aria-invalid') === 'true') {
            setFieldError('recover-email', getEmailError(emailInput.value.trim()));
        }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const emailError = getEmailError(email);
        setFieldError('recover-email', emailError);
        renderAuthError(form, 'recover-request-form-error', '', submitBtn);

        if (emailError) {
            emailInput.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = I18n.t('auth.reset_submitting');

        const { error } = await resetPasswordForEmail(email);

        if (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = I18n.t('auth.reset_submit_cta');
            renderAuthError(
                form,
                'recover-request-form-error',
                error.message || I18n.t('auth.error_generic'),
                submitBtn
            );
            return;
        }

        // Supabase no distingue "email no registrado" del éxito real (para
        // no filtrar qué emails tienen cuenta) — el mismo aviso de "revisa
        // tu correo" cubre ambos casos, igual que hacen la mayoría de
        // flujos de recuperación de contraseña.
        form.hidden = true;
        successBox.hidden = false;
    });
}

function initResetForm() {
    const form = document.getElementById('recover-reset-form');
    if (!form) return;

    initPasswordToggle(
        'recover-new-password',
        'recover-new-password-toggle',
        'recover-new-password-toggle-icon'
    );

    const submitBtn = document.getElementById('recover-reset-submit');
    const passwordInput = document.getElementById('recover-new-password');
    const confirmInput = document.getElementById('recover-confirm-password');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;

        const fieldChecks = [
            {
                id: 'recover-new-password',
                valid: password.length >= 6,
                message: !password
                    ? I18n.t('auth.error_password_required')
                    : I18n.t('auth.error_password_short'),
            },
            {
                id: 'recover-confirm-password',
                valid: Boolean(confirmPassword) && confirmPassword === password,
                message: !confirmPassword
                    ? I18n.t('auth.error_password_required')
                    : I18n.t('auth.error_password_mismatch'),
            },
        ];

        fieldChecks.forEach(({ id, valid, message }) => setFieldError(id, valid ? '' : message));
        renderAuthError(form, 'recover-reset-form-error', '', submitBtn);

        const firstInvalid = fieldChecks.find((f) => !f.valid);
        if (firstInvalid) {
            document.getElementById(firstInvalid.id)?.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = I18n.t('auth.reset_password_submitting');

        const { error } = await updatePassword(password);

        if (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = I18n.t('auth.reset_password_submit_cta');
            renderAuthError(
                form,
                'recover-reset-form-error',
                error.message || I18n.t('auth.error_generic'),
                submitBtn
            );
            return;
        }

        window.location.href = 'index.html';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const requestSection = document.getElementById('recover-request');
    const resetSection = document.getElementById('recover-reset');
    if (!requestSection || !resetSection) return;

    const isRecovery = window.location.hash.includes('type=recovery');
    requestSection.hidden = isRecovery;
    resetSection.hidden = !isRecovery;

    if (isRecovery) {
        initResetForm();
    } else {
        initRequestForm();
    }
});
