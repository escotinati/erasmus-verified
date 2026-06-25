import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const supabaseUrl = JSON.stringify(env.VITE_SUPABASE_URL || '');
    const supabaseKey = JSON.stringify(env.VITE_SUPABASE_ANON_KEY || '');

    return {
        plugins: [
            {
                name: 'inject-supabase-globals',
                transformIndexHtml(html) {
                    return html.replace(
                        '<head>',
                        `<head>\n    <script>window.__SUPABASE_URL__=${supabaseUrl};window.__SUPABASE_KEY__=${supabaseKey};</script>`
                    );
                },
            },
        ],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'index.html'),
                    ciudad: resolve(__dirname, 'ciudad.html'),
                    ciudades: resolve(__dirname, 'ciudades.html'),
                    ciudadesTodas: resolve(__dirname, 'ciudades-todas.html'),
                    mapa: resolve(__dirname, 'mapa.html'),
                    alojamiento: resolve(__dirname, 'alojamiento.html'),
                    servicios: resolve(__dirname, 'servicios.html'),
                    viajes: resolve(__dirname, 'viajes.html'),
                },
            },
        },
    };
});
