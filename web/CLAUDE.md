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
- **Nunca** edites, muevas ni borres archivos de la web antigua mientras trabajas en `web`. Eso incluye: `index.html` y demás `.html` de la raíz, `src/` (raíz), `admin/`, `vite.config.js`, `package.json` y `package-lock.json` **de la raíz**, `vercel.json`, `.claude/` (salvo añadir agentes `web-*`, que son de `web`), `scripts/`, `dev/`, `docs/`.
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

**Secretos.** Jamás prefijo `NEXT_PUBLIC_` en la service role key de Supabase ni en la clave de Fourvenues. Solo llevan `NEXT_PUBLIC_` la URL y la anon key de Supabase (públicas por diseño, protegidas por RLS). Nunca commitear `.env*.local`. **Secret key de Supabase (`SUPABASE_SERVICE_ROLE_KEY`, `sb_secret_…`)**: salta RLS, así que solo la usa `lib/supabase/admin.ts` (`server-only`), solo para escribir pedidos y solo DESPUÉS de verificar al usuario con `getUser()`; si falta, `createAdminClient()` lanza `MissingServiceKeyError` con un mensaje claro. Local: `web/.env.local`. Vercel: variable de tipo Secret solo en Preview (aún no en Production). La base de datos la limita además por `REVOKE` (leer/insertar pedidos, actualizar solo `status` y `provider_ref`, sin borrar).

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
- Layout: **dos versiones, cortadas en 900 px** (`min-width: 900px`; los `@media` no leen variables, repite el literal). **Móvil (<900 px):** columna de 480 px (`.shell`, `--content-max`), menú inferior `BottomNav` (72 px) y barras fijas con la clase `.dock` apiladas con `--nav-total`. **Escritorio (≥900 px):** `BottomNav` se oculta, manda la cabecera `SiteHeader` (72 px, sticky; marca, Noches / Mis entradas, y botón «Mi cuenta» con desplegable «Mi cuenta / Cerrar sesión», o «Iniciar sesión» sin sesión) y `--nav-total` pasa a 0. La tableta (600–899 px) usa el diseño móvil. Las dos navegaciones comparten `components/nav-items.ts`. No uses `position: fixed` con `inset: 0` suelto.
- **Anchos y espaciado:** contenido de escritorio a `--content-wide` (1120 px). Escala de espaciado `--space-1 … --space-24` (base 4 px) y tres roles que cambian en escritorio: `--gutter` (margen lateral: 20 → 32), `--gap-cards` (24 → 32) y `--gap-section` (40 → 96). **Usa estos tokens, no píxeles sueltos** (el código antiguo aún los tiene: se corrige pantalla a pantalla).
- **Cómo opta una pantalla a escritorio:** su raíz lleva `data-layout="wide"` (el `.shell` pasa a ancho completo mediante `:has()`) y su contenido se centra con la clase global `.wide`. Las pantallas sin migrar siguen en la columna de 480 px bajo la cabecera de escritorio, de forma transitoria. Una pantalla = una PR. Orden: listado, ficha, Mis entradas, y después las de compra y las de cuenta.
- **Decisiones de escritorio (05/10/2026):** ancho 1120 px; ficha en 2 columnas con panel «Tu pedido» lateral fijo (su ancho se adapta al texto de las tarifas); listado en rejilla de 2–3 columnas con una **noche destacada** que se elige por un campo numérico `priority` (más alto = más prioridad; el criterio es de negocio: pago del promotor, proximidad…); Mis entradas en 1 o 2 columnas según el nº de pedidos. **Pendiente (recordatorio):** filtro en Mis entradas.
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
- Agentes de `.claude/agents/`: los de `web` llevan el prefijo `web-` (`web-code-reviewer`, `web-security-auditor`, `web-ui-reviewer`, `web-pr-orchestrator`) y se escriben solo con las reglas de este archivo. `supabase-schema-guardian` es compartido (Supabase es un único proyecto). **Los demás** (`code-reviewer`, `design-reviewer`, `security-auditor`, `accessibility-auditor`, `functionality-reviewer`, `pr-orchestrator`) son de la **web antigua**: no se usan sobre `web/`, porque sus reglas (vanilla JS, `sanitize.js`, `tokens.css` de la raíz…) no aplican aquí.
- `web-pr-orchestrator` lanza a los demás con la herramienta de subagentes: ejecútalo como agente principal (`claude --agent web-pr-orchestrator`). Si lo lanza otro agente, no podrá delegar y devolverá la lista de revisores que hay que lanzar a mano.

## Estado y pendientes

| Fase | Contenido                                                                                 | Estado                          |
| ---- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| 1    | Scaffold Next.js, tokens, shell, dominios                                                 | Hecha                           |
| 2    | Catálogo (listado + ficha con selector), datos simulados                                  | Hecha (PR #125 mergeada)        |
| 3    | Cuentas con Supabase Auth                                                                 | Hecha (PR #128)                 |
| 4    | Compra simulada (datos, resumen, pago simulado, éxito, Mis entradas); activar "Continuar" | Hecha (PR #140, #141 y #142)    |
| 4b   | Pedidos reales: tablas `orders`/`order_items` + `create_order()` (PR #142); `payAction`, `exito` y `Mis entradas` leen/escriben pedidos (esta PR) | Hecha al mergear esta PR        |
| 5    | Integración real con Fourvenues (adapter real, webhook, clave alpha)                      | Bloqueada (SL, clave, contrato) |
| 6    | Legal, pruebas end-to-end, producción y dominios                                          | Bloqueada                       |

Pendientes conocidos: el precio destacado debe incluir los gastos obligatorios (decisión legal, contrastar con `erasmuscumplimientolegal.pdf`); el pago simulado está apagado en los dominios de producción (`lib/checkout/simulation.ts`); **pedidos**: `payAction` guarda un pedido `provider='simulated'`, `status='paid'` con `create_order()` (RPC, una transacción, totales calculados en la base de datos; si el total guardado no coincide con el calculado, el pedido se marca `failed`) y `exito?pedido=<uuid>`/`Mis entradas` lo leen con el cliente del usuario (RLS). Aún NO hay entradas individuales: en la fase 5 hará falta la tabla `tickets` (código, usada/no, controlada por Fourvenues) y `webhook_events` (idempotencia), y que el estado `paid` lo fije el webhook, no llegar a `exito`. Un doble envío del pago crea dos pedidos (el botón se desactiva, pero no hay clave de idempotencia); **borrar un usuario con pedidos falla a propósito** (`ON DELETE RESTRICT`: retención contable) y hay que decidir antes de la fase 6 cómo cumplir una petición de supresión RGPD (p. ej. anonimizar `buyer_*`); los usuarios de prueba con pedidos se borran antes sus pedidos por SQL/Table Editor; los admins no pueden leer pedidos (no hay política `private.is_admin()`); **claves API legacy de Supabase (anon/service_role JWT) dejan de funcionar a finales de 2026**: migrar ambas apps a las claves nuevas (hay una tarea programada para el 16/11/2026); falta la recuperación de contraseña y el login con Google (decisión pendiente); **el enlace del correo de confirmación solo inicia sesión si se abre en el mismo navegador del registro** (flujo PKCE, cookie del verificador): en otro navegador/app de correo el correo queda confirmado pero hay que iniciar sesión con la contraseña (`/login?aviso=enlace`). Solución futura: `token_hash` + `verifyOtp` con plantilla propia (la plantilla es global y afecta a la web antigua); SMTP propio antes de producción; auditoría de seguridad (CSP con nonce, `img-src` más estricto, HSTS `preload`); que el adapter falle en producción si falta `FOURVENUES_ADAPTER` en lugar de servir el mock.

Las decisiones y su historial están en el documento `claude/decisiones-entradas-fourvenues.md` del proyecto ERASMUS en claude.ai.
