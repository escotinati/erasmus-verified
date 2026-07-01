(function () {
    var url = window.__SUPABASE_URL__;
    var key = window.__SUPABASE_KEY__;

    if (!url) {
        console.error('[supabase] VITE_SUPABASE_URL no está definida. ¿Creaste .env.local?');
        return;
    }

    window.supabaseClient = supabase.createClient(url, key);
    console.info('[supabase] cliente inicializado');
})();
