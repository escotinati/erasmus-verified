# CLAUDE.md — `web/` (la web)

> **Alcance de este archivo: TODO lo que hay dentro de `web/`.** Para el código de `web/`, este archivo
> **manda sobre el `CLAUDE.md` de la raíz del repo**, que describe la _web antigua_ (Vite + JS vanilla) y
> **no aplica aquí**. Si una regla de la raíz contradice a esta, gana esta.

## Qué es esto y cómo lo llamamos

Dos aplicaciones conviven en el repo `escotinati/erasmus-verified`. Nombres fijos, para no confundirlas:

| Nombre          | Dónde vive                                                        | Stack                                                         | Estado                                             |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| **web**         | `web/` (esta carpeta)                                             | Next.js 16 (App Router) + React 19 + TypeScript + CSS Modules | **Activa. Aquí se hace todo el desarrollo nuevo.** |
| **web antigua** | raíz del repo (`index.html`, `src/`, `admin/`, `vite.config.js`…) | Vite + HTML/CSS/JS vanilla + islas de React + Supabase        | **Congelada.** No se toca salvo petición expresa.  |

**`web` es el producto que sale a producción**, en los dos dominios: `erasmusparties.org` (experiencia
`parties`) y `erasmusverified.com` (experiencia `verified`). La experiencia se decide por el host en `src/proxy.ts`.

**Alcance de la primera salida:** registro, login y venta de entradas para fiestas con Fourvenues. Nada más
(mapa, alojamiento, viajes y admin de la web antigua quedan fuera y no se migran ahora). Mobile-first.

## Regla de trabajo: qué es `web` y qué es `web antigua`

- Si el usuario dice **"web"**, o **no aclara** a cuál se refiere → es `web/` (Next.js). Se asume esto por defecto.
- Si dice **"web antigua"** → es la raíz del repo. Está congelada: **antes de editar nada de la web antigua, confirma con el usuario** que es lo que quiere.
- **Nunca** edites, muevas ni borres archivos de la web antigua mientras trabajas en `web`. Eso incluye: `index.html` y demás `.html` de la raíz, `src/` (raíz), `admin/`, `vite.config.js`, `package.json` y `package-lock.json` **de la raíz**, `vercel.json`, `.claude/`, `scripts/`, `dev/`, `docs/`.
- **No copies patrones de la web antigua.** En la antigua hay JS vanilla sin módulos, `window.escapeHtml`, `sanitizeUrl()`, `Card.jsx`, `I18n`… Nada de eso existe en `web`. Aquí se usan módulos ES, TypeScript y componentes React normales.
- Excepción compartida: **Supabase** (ver más abajo) es el mismo proyecto para las dos aplicaciones.
- Si un cambio necesita tocar algo de la raíz (por ejemplo, una migración de Supabase), dilo antes de hacerlo y pide confirmación.

## Comandos (siempre desde `web/`)

- `npm install` · `npm run dev` (http://localhost:3000) · `npm run build` · `npm run typecheck` (`tsc --noEmit`).
- Node ≥ 22. `web/` tiene su propio `package.json`/`package-lock.json`, independientes de los de la raíz.
- Comprobación mínima antes de cada commit: `npm run typecheck`.
- El entorno de Claude en la nube **no puede completar `next build`** (no llega a Google Fonts); el build real lo hace Vercel en el preview. En local con red normal sí funciona.
- Entorno del usuario: WSL con el repo en `/mnt/c/...`. Si la recarga en caliente falla: `CHOKIDAR_USEPOLLING=true WATCHPACK_POLLING=true npm run dev`.
- Un cambio en `next.config.ts` exige reiniciar `npm run dev`.

## Estructura

```
web/src/
  app/            rutas (App Router). (tabs)/ agrupa las pestañas; eventos/[slug]/ = ficha
  components/     componentes (cada uno con su .module.css)
  components/ui/  piezas básicas reutilizables: Button/ButtonLink, Badge, BackButton, StatusScreen
  lib/
    experience.ts, get-experience.ts   experiencia parties/verified por dominio
    fourvenues/                        capa de acceso a la ticketera (ver abajo)
    pricing.ts                         ÚNICA fuente del total que ve el usuario
    format.ts                          formato de euros/fechas (Europe/Madrid)
  proxy.ts        Next 16: sustituye a middleware.ts (export nombrado `proxy`)
  styles/tokens.css  tokens de diseño
```

## Next.js 16 — diferencias que suelen fallar

- `proxy.ts` (no `middleware.ts`), con export nombrado `proxy`.
- `params` y `searchParams` son **asíncronos** (`await params`).
- Componentes de servidor por defecto; `'use client'` solo donde hay estado o eventos.
- Ante duda sobre una API de Next/React, consulta la documentación actual (Context7) en lugar de fiarte de memoria.

## Reglas que NO se negocian

**Dinero.** Siempre en **céntimos enteros** (`number`), nunca decimales. `lib/pricing.ts` es la única fuente del total en cliente; en la compra real **el servidor recalcula** con los precios de Fourvenues y nunca se fía del total enviado por el cliente.

**Fourvenues.** La UI **solo** importa `tickets` de `@/lib/fourvenues`; nunca habla con la API directamente.

- `lib/fourvenues/index.ts` lleva `import 'server-only'`: la clave nunca llega al navegador.
- `FOURVENUES_ADAPTER=mock` es el modo actual (3 eventos ficticios). El adapter real se añade con la clave alpha; al llegar, se cambia **una sola pieza**.
- El adapter real debe convertir los datos a nuestros tipos (`types.ts`) y **no pasar campos internos de Fourvenues al cliente**; validar que precios y gastos son enteros no negativos y filtrar eventos pasados.
- Volver de la pasarela (`redirect_url`) **no confirma el pago**: solo el webhook `payment.success` lo confirma. Webhook con firma HMAC-SHA256 (`X-Webhook-Signature`) e idempotencia (tabla `webhook_events`).
- Si cambia el precio entre la ficha y el pago (`conditions_changed`), se avisa y se pide confirmación.

**Secretos.** Jamás prefijo `NEXT_PUBLIC_` en la service role key de Supabase ni en la clave de Fourvenues. Solo llevan `NEXT_PUBLIC_` la URL y la anon key de Supabase (públicas por diseño, protegidas por RLS). Nunca commitear `.env*.local`.

**Seguridad de la web.** Cabeceras y CSP viven en `next.config.ts`; no las rebajes. La CSP lleva `'unsafe-inline'` en scripts (pendiente de pasar a nonce en la auditoría de seguridad). Sin `dangerouslySetInnerHTML`. Validar `params`/`searchParams` contra listas o patrones conocidos (ya se hace con `ciudad` y `slug`). `?exp=` solo se respeta fuera de los dominios de producción.

## Supabase (compartido con la web antigua)

Proyecto **`puivkbjgbfnlpepyednt`**, el mismo de la web antigua, sin datos reales aún. **Se mantiene TODA la seguridad existente**: RLS activado, `private.is_admin()`, tabla `admins`, CHECK de URLs `https://`, MFA del admin.

- **Antes de cualquier cambio de esquema, RLS o tabla nueva: usa el agente `supabase-schema-guardian`** (el estado real de la base de datos se consulta con el MCP de Supabase; no todas las migraciones están en el repo).
- Tablas nuevas (`orders`, `webhook_events`…) **nacen con RLS activado** y políticas explícitas. Nunca desactivar RLS "para probar".
- Los cambios de esquema se aplican con `apply_migration` (no `execute_sql`) y el archivo de migración se guarda en `supabase/migrations/` **de la raíz** (es el único sitio). Tocar la raíz aquí es la excepción permitida, pero avisa antes.
- Auth de usuarios (implementado en `src/lib/supabase/`, `src/lib/auth/`, rutas `/login`, `/registro`, `/cuenta`, `/auth/callback`): Supabase Auth con email + contraseña, sesión en cookies con `@supabase/ssr`, formularios con Server Actions. El proxy solo refresca la sesión; la comprobación de acceso va en cada página de servidor con `getUser()`. `profiles.city_id` es opcional (migración `20260930150946`); el registro solo envía `first_name` (máx. 60, CHECK de `profiles`).
- Auth de usuarios (reglas): `profiles` la rellena el trigger `handle_new_user`, nunca un `INSERT` desde el frontend. No cambies claves de `options.data` sin comprobar el trigger.
- La web antigua y `web` comparten usuarios. Un cambio de esquema afecta a las dos: compruébalo.

## Diseño

- Tokens en `src/styles/tokens.css` (paleta de septiembre, fondo `#0A0A0F`, primario `#E1147B`). **No escribas colores a mano**: usa `var(--…)`.
- El primario `#E1147B` **solo como relleno** (texto blanco encima: 4,58:1). Como texto pequeño usa `--accent-text` (`#FF5FAE`).
- Tipografía: Plus Jakarta Sans (títulos y precios), Inter (cuerpo), Archivo Black (titular de portada), cargadas con `next/font/google` como variables CSS.
- Layout: **toda** la web es una columna móvil centrada (`.shell`, `--content-max` 480 px) también en escritorio, y el menú inferior (`BottomNav`, en el layout raíz) está en todas las pantallas. Las barras fijas (menú, barra de compra) usan la clase `.dock` y se apilan con `--nav-total`; no uses `position: fixed` con `inset: 0` suelto.
- **Escritorio (decidido 02/10/2026, aún sin implementar):** la columna móvil de 480 px es un estado **transitorio**, no el diseño final de escritorio. Dos reglas del usuario: (1) el menú **no** es el mismo en móvil y en escritorio, ni va en el mismo sitio (móvil: barra inferior; escritorio: otra ubicación, a definir); (2) en escritorio **no** se estira el móvil: cada pantalla tiene una maquetación pensada para pantalla ancha. Las pantallas nuevas (fase 4) se construyen mobile-first y sin suponer que la columna de 480 px es el límite definitivo (nada de anchos fijos en píxeles dentro de los componentes). La maquetación de escritorio se hace en una PR única después de la fase 4, cuando existan todas las pantallas.
- Mobile-first. Tap targets ≥ 44 px (`--tap-min`), botón principal 56 px. Un solo botón magenta por pantalla.
- Ningún estado depende solo del color. Errores de formulario junto al campo, nunca en un aviso flotante; sin `alert()`.
- Tamaños de letra: **solo los tokens `--text-xs … --text-hero`** de `tokens.css` (9 escalones, de 12 px a 36 px). Nunca un `font-size` suelto; si hace falta un tamaño nuevo, se discute antes de añadir un escalón.
- Antes de escribir un botón, etiqueta, flecha de volver o pantalla de estado, **usa las piezas de `components/ui/`** (`Button`/`ButtonLink` con `variant="primary"|"outline"`, `Badge`, `BackButton`, `StatusScreen`). Un componente se extrae cuando se repite o la pantalla lo pide, no antes. Nada de estilos en línea (`style={{…}}`).
- Estilos: **CSS Modules** por componente. Sin Tailwind, sin librerías de UI, sin estado global (Redux…) salvo decisión expresa.
- Los mockups de las pantallas críticas están en el proyecto de claude.ai (`mobile-app-shell-mockups.html`); el resto se diseña directamente en código.

## Convenciones de código

- TypeScript estricto; sin `any`. Código comentado donde el porqué no sea obvio, sin over-engineering para la fase actual.
- Estilo actual: 2 espacios, comillas simples, punto y coma. `web/` **no tiene Prettier configurado**, y el hook de Prettier de la raíz **no aplica a `.ts`/`.tsx`**: respeta el estilo de los archivos vecinos.
- Textos de interfaz en español. La internacionalización (es/en) **no está decidida** para `web`: no inventes un sistema de i18n sin preguntar.
- Nada de `alert()`.

## Git y despliegue

- **Nunca trabajar en `main`.** Una rama por fase/cambio, desde `main` actualizada: `feature/…`, `fix/…`, `chore/…`. Commits convencionales (`feat(web):`, `fix(web):`, `chore(web):`, `docs(web):`). Las PR las abre y mergea el usuario a mano.
- Cada fase debe poder desplegarse sola. `web` se despliega en el proyecto de Vercel **`erasmusparties-web`** (Root Directory = `web`); la web antigua en `erasmus-verified` (raíz). Son independientes: cada rama genera un preview en cada uno.
- Los previews están protegidos con SSO de Vercel.
- Variables de entorno en Vercel: las `NEXT_PUBLIC_*` van como tipo **Config** (Sensitive no las admite); las secretas no llevan ese prefijo.
- Los agentes de `.claude/agents/` (`code-reviewer`, `design-reviewer`, `security-auditor`, `accessibility-auditor`, `functionality-reviewer`, `pr-orchestrator`) están escritos para la **web antigua**. Al usarlos sobre `web`, indícales explícitamente el contexto: Next.js/TypeScript, CSS Modules, tokens de `web/src/styles/tokens.css`, y que las reglas de vanilla JS/`sanitize.js` no aplican.

## Estado y pendientes

| Fase | Contenido                                                                                 | Estado                          |
| ---- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| 1    | Scaffold Next.js, tokens, shell, dominios                                                 | Hecha                           |
| 2    | Catálogo (listado + ficha con selector), datos simulados                                  | Hecha (PR #125 mergeada)        |
| 3    | Cuentas con Supabase Auth                                                                 | Hecha (PR #128)                 |
| 4    | Compra simulada (datos, resumen, pago simulado, éxito, Mis entradas); activar "Continuar" | Pendiente                       |
| 5    | Integración real con Fourvenues (adapter real, webhook, clave alpha)                      | Bloqueada (SL, clave, contrato) |
| 6    | Legal, pruebas end-to-end, producción y dominios                                          | Bloqueada                       |

Pendientes conocidos: el precio destacado debe incluir los gastos obligatorios (decisión legal, contrastar con `erasmuscumplimientolegal.pdf`); `Mis entradas` (ruta de la barra inferior) da 404 hasta la fase 4; falta la recuperación de contraseña y el login con Google (decisión pendiente); **el enlace del correo de confirmación solo inicia sesión si se abre en el mismo navegador del registro** (flujo PKCE, cookie del verificador): en otro navegador/app de correo el correo queda confirmado pero hay que iniciar sesión con la contraseña (`/login?aviso=enlace`). Solución futura: `token_hash` + `verifyOtp` con plantilla propia (la plantilla es global y afecta a la web antigua); SMTP propio antes de producción; auditoría de seguridad (CSP con nonce, `img-src` más estricto, HSTS `preload`); que el adapter falle en producción si falta `FOURVENUES_ADAPTER` en lugar de servir el mock.

Las decisiones y su historial están en el documento `claude/decisiones-entradas-fourvenues.md` del proyecto ERASMUS en claude.ai.
