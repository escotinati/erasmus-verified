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

## Pendiente en el primer despliegue
1. Crear proyecto Vercel nuevo sobre este repo con Root Directory `web`.
2. Variables de entorno (ver `.env.example`).
3. Comprobar que el proyecto antiguo no sirve nada de `web/`.
