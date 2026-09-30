# web/ — erasmusparties (Next.js)

Venta de entradas para fiestas (Fourvenues como ticketera). Convive en el repo con la web actual
(Vite, en la raíz) pero se despliega **por separado**: proyecto de Vercel con *Root Directory* = `web`.

## Comandos (desde `web/`)
- `npm install` · `npm run dev` · `npm run build` · `npm run typecheck`

## Cómo funciona
- `src/proxy.ts` (Next 16, antes "middleware") resuelve la experiencia por dominio:
  `erasmusparties.org` → `parties`; cualquier otro → `verified`. `?exp=` solo se respeta fuera de los dominios de producción.
- `src/lib/fourvenues/` — la UI solo usa `tickets` (adapter). Hoy `FOURVENUES_ADAPTER=mock`; el adapter real llega con la clave alpha.
- `next.config.ts` — cabeceras de seguridad (parten de las del `vercel.json` de la raíz; ver comentarios para las diferencias).

## Despliegue
- Proyecto de Vercel `erasmusparties-web`, Root Directory = `web`, framework Next.js.
- Variables (Settings -> Environment Variables): `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (tipo Config, son públicas por diseño y se protegen con RLS) y `FOURVENUES_ADAPTER=mock`.
- Nunca usar el prefijo `NEXT_PUBLIC_` con la service role key de Supabase ni con la clave de Fourvenues.
- El proyecto de la raíz (`erasmus-verified`, Vite) sigue desplegándose aparte y no sirve nada de `web/`.
