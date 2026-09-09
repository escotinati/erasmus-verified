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
//  Depende de: fetchActiveCities() (citiesService.js), signUp()
//  (authService.js), window.I18n (i18n.js/translations.js).
// ─────────────────────────────────────────────────────────────

function setFieldError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message || '';
    if (inputEl) inputEl.setAttribute('aria-invalid', String(Boolean(message)));
}

// Mismo criterio que el type="email" nativo (el form lleva novalidate,
// así que el navegador ya no lo comprueba solo) — regex simplificada,
// suficiente para el mensaje propio sin intentar cubrir todo RFC 5322.
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

document.addEventListener('DOMContentLoaded', async function () {
    const form = document.getElementById('register-form');
    if (!form) return;

    const citySelect = document.getElementById('reg-city');
    const cities = await fetchActiveCities();
    for (const city of cities) {
        const opt = document.createElement('option');
        opt.value = city.id;
        // .textContent, no .innerHTML — los datos de Supabase (nombre/
        // país de la ciudad) nunca se interpolan sin escapar.
        opt.textContent = `${city.flag} ${city.name} (${city.country})`;
        citySelect.appendChild(opt);
    }

    const submitBtn = document.getElementById('register-submit');
    const formErrorEl = document.getElementById('register-form-error');
    const successBox = document.getElementById('register-success');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const cityId = document.getElementById('reg-city').value;
        const university = document.getElementById('reg-university').value.trim();
        const interests = Array.from(
            form.querySelectorAll('input[name="interests"]:checked')
        ).map((el) => el.value);

        // Única fuente de verdad para qué campo falla y por qué — el
        // ORDEN de este array coincide con el orden real de los campos
        // en el HTML (reg-email, reg-password, reg-city): firstInvalid
        // de abajo asume que recorrerlo de arriba a abajo equivale a
        // recorrer el formulario de arriba a abajo.
        const fieldChecks = [
            {
                id: 'reg-email',
                valid: Boolean(email) && isValidEmail(email),
                message: !email
                    ? I18n.t('auth.error_email_required')
                    : I18n.t('auth.error_email_invalid'),
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
        formErrorEl.textContent = '';

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
            formErrorEl.textContent = error.message || I18n.t('auth.error_generic');
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
