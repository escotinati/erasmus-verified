// ─────────────────────────────────────────────────────────────
//  AUTHSERVICE.JS — Erasmus Verified
//
//  Capa de acceso a Supabase Auth (email + contraseña, sin OAuth en
//  esta versión). Mismo patrón que citiesService.js/partnersService.js:
//  funciones globales sueltas, sin envolverlas en un objeto — quedan
//  en window por ser <script> clásico, sin ES Modules.
//
//  El perfil (public.profiles) NO se inserta desde aquí: lo crea el
//  trigger handle_new_user (ya aplicado en Supabase) al leer
//  raw_user_meta_data del usuario recién creado. signUp() solo tiene
//  que mandar esas claves exactas dentro de options.data — city_id,
//  university, interests — para que el trigger las encuentre.
//
//  Depende de: window.supabaseClient (supabaseClient.js)
// ─────────────────────────────────────────────────────────────

// Devuelve { data, error } tal cual lo da Supabase — cada página
// decide cómo mostrar el error, igual que ya hace login() en admin.js
// con signInWithPassword(). city_id llega como number (o null si no
// se seleccionó ciudad); el trigger hace (raw_user_meta_data->>'city_id')::bigint,
// así que un valor no numérico rompería el INSERT — validar la
// selección de ciudad ANTES de llamar a esta función es cosa de quien
// la llama (ver registro.js), no de aquí.
async function signUp({ email, password, cityId, university, interests }) {
    return window.supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: {
                city_id: cityId,
                university: university || '',
                interests: interests || [],
            },
        },
    });
}

async function signIn({ email, password }) {
    return window.supabaseClient.auth.signInWithPassword({ email, password });
}

async function signOut() {
    return window.supabaseClient.auth.signOut();
}

// A diferencia de signUp/signIn/signOut, aquí sí se simplifica el
// resultado (igual que fetchActiveCities() en citiesService.js): quien
// llama solo necesita saber "hay sesión o no", nunca el objeto error.
async function getSession() {
    const { data, error } = await window.supabaseClient.auth.getSession();
    if (error) {
        console.error('[authService] error obteniendo sesión:', error);
        return null;
    }
    return data.session;
}
