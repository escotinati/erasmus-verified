// ─────────────────────────────────────────────────────────────
//  CITIESSERVICE.JS — Erasmus Verified
//
//  Capa de acceso a datos de ciudades y grupos.
//  Expone funciones globales que sustituyen a COUNTRIES y LINKS
//  de data.js en las páginas que lo necesitan.
//
//  Depende de: window.supabaseClient (supabaseClient.js)
// ─────────────────────────────────────────────────────────────

// Devuelve todas las ciudades activas ordenadas por prioridad
async function fetchActiveCities() {
    const { data, error } = await window.supabaseClient
        .from('cities')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false });

    if (error) {
        console.error('[citiesService] error cargando ciudades:', error);
        return [];
    }
    return data;
}

// Devuelve una ciudad por su id (para admin, incluye inactivas)
async function fetchCityById(cityId) {
    const { data, error } = await window.supabaseClient
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .single();

    if (error) {
        console.error('[citiesService]', error);
        return null;
    }
    return data;
}

// Devuelve TODAS las ciudades (para admin, incluye inactivas)
async function fetchAllCities() {
    const { data, error } = await window.supabaseClient
        .from('cities')
        .select('*')
        .order('priority', { ascending: false });

    if (error) {
        console.error('[citiesService]', error);
        return [];
    }
    return data;
}
