import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const supabaseUrl = JSON.stringify(env.VITE_SUPABASE_URL || '');
    const supabaseKey = JSON.stringify(env.VITE_SUPABASE_ANON_KEY || '');
    const cartoApiKey = JSON.stringify(env.VITE_CARTO_API_KEY || '');

    return {
        // 'mpa' (no 'spa', el default de Vite): sin esto, Vite hace fallback
        // a index.html para cualquier ruta que no exista, tanto en `npm run
        // dev` como en `npm run preview` — silenciaría el propio 404.html en
        // local y haría imposible probarlo antes de desplegar. En producción
        // (Vercel, sin vercel.json) esto no aplica: es Vercel quien decide
        // servir dist/404.html con status 404 de verdad para cualquier ruta
        // sin archivo — comportamiento por defecto de su output estático, ver
        // CLAUDE.md.
        appType: 'mpa',
        plugins: [
            react(),
            {
                name: 'inject-supabase-globals',
                transformIndexHtml(html) {
                    return html.replace(
                        '<head>',
                        `<head>\n    <script>window.__SUPABASE_URL__=${supabaseUrl};window.__SUPABASE_KEY__=${supabaseKey};window.__CARTO_API_KEY__=${cartoApiKey};</script>`
                    );
                },
            },
            viteStaticCopy({
                targets: [
                    { src: 'src/js/**/*', dest: 'src/js' },
                    { src: 'src/css/**/*', dest: 'src/css' },
                    // src/utils/i18n.js se referencia como <script src="/src/utils/i18n.js">
                    // (script clásico, no import) en index.html/ciudad.html/mapa.html — sin
                    // este target el build de producción lo omite y esas páginas devuelven
                    // 404 para ese script, aunque `npm run dev` no lo detecta porque Vite
                    // sirve todo el repo directamente en desarrollo.
                    { src: 'src/utils/**/*', dest: 'src/utils' },
                ],
            }),
            {
                // Vite (appType 'mpa') ya devuelve un 404 real para rutas sin
                // archivo, pero sin contenido propio. Este plugin hace que
                // `npm run preview` sirva el dist/404.html YA COMPILADO (con
                // status 404 de verdad) para esas rutas — el mismo
                // comportamiento que Vercel aplica en producción sin
                // vercel.json, para poder comprobar la página de error antes
                // de desplegar. Solo en preview: en `npm run dev` 404.html
                // aún no está compilado (sin inyectar las globals de Supabase
                // ni pasar por transformIndexHtml), así que ahí sigue
                // devolviendo un 404 genérico sin cuerpo.
                name: 'serve-built-404',
                configurePreviewServer(server) {
                    return () => {
                        server.middlewares.use((req, res) => {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'text/html; charset=utf-8');
                            res.end(readFileSync(resolve(__dirname, 'dist/404.html')));
                        });
                    };
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
                    alojamientos: resolve(__dirname, 'alojamientos.html'),
                    alojamiento: resolve(__dirname, 'alojamiento.html'),
                    servicios: resolve(__dirname, 'servicios.html'),
                    viajes: resolve(__dirname, 'viajes.html'),
                    viaje: resolve(__dirname, 'viaje.html'),
                    registro: resolve(__dirname, 'registro.html'),
                    login: resolve(__dirname, 'login.html'),
                    recuperar: resolve(__dirname, 'recuperar.html'),
                    admin: resolve(__dirname, 'admin/index.html'),
                    notFound: resolve(__dirname, '404.html'),
                },
            },
        },
    };
});
