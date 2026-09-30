import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * Cabeceras de seguridad.
 * Parten de las del vercel.json de la web actual (nosniff, X-Frame-Options,
 * Referrer-Policy, Permissions-Policy, CSP) para no rebajar el nivel de seguridad.
 *
 * Diferencias respecto a la CSP de la web actual (a revisar en la auditoría):
 *  - script-src lleva 'unsafe-inline' porque Next inyecta scripts inline de arranque.
 *    Endurecimiento previsto: CSP con nonce generada en proxy.ts.
 *  - En desarrollo se añade 'unsafe-eval' (lo exige el refresco en caliente); nunca en producción.
 *  - Se añade HSTS.
 *  - frame-src / form-action se ampliarán al integrar Fourvenues (widget y pasarela).
 */
const isDev = process.env.NODE_ENV !== 'production';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${supabaseUrl}${isDev ? ' ws:' : ''}`.trim(),
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Oculta el logo de Next.js que aparece abajo a la izquierda en desarrollo (solo afecta a `next dev`).
  devIndicators: false,
  // El repo tiene otro package-lock.json en la raíz (web antigua): sin esto Turbopack
  // infiere mal la raíz del workspace y avisa de "multiple lockfiles".
  turbopack: { root: path.resolve(__dirname) },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
