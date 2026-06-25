(function () {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error(
            '[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
                '¿Creaste .env.local?'
        );
        return;
    }

    window.supabaseClient = supabase.createClient(url, key);
    console.info('[supabase] cliente inicializado');
})();
