import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                ciudad: resolve(__dirname, 'ciudad.html'),
                ciudades: resolve(__dirname, 'ciudades.html'),
                'ciudades-todas': resolve(__dirname, 'ciudades-todas.html'),
                mapa: resolve(__dirname, 'mapa.html'),
                alojamiento: resolve(__dirname, 'alojamiento.html'),
                servicios: resolve(__dirname, 'servicios.html'),
                viajes: resolve(__dirname, 'viajes.html'),
            },
        },
    },
});
