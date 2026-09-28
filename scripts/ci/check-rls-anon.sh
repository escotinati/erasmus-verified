#!/usr/bin/env bash
# Regresión de permisos: comprueba, con la clave ANON (pública), que un visitante
# sin sesión NO puede leer ni escribir donde no debe. Solo hace peticiones que,
# si el permiso estuviera roto, no alterarían datos reales (filtros que no casan
# con ninguna fila).
# Variables de entorno: SUPABASE_URL, SUPABASE_ANON_KEY
set -u
: "${SUPABASE_URL:?Falta SUPABASE_URL}"; : "${SUPABASE_ANON_KEY:?Falta SUPABASE_ANON_KEY}"
API="${SUPABASE_URL%/}/rest/v1"
ZERO_UUID="00000000-0000-0000-0000-000000000000"
FAIL=0

req() { # req METHOD PATH [BODY] -> imprime el código HTTP
  curl -sS -o /dev/null -w '%{http_code}' --max-time 20 -X "$1" \
    -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" ${3:+-d "$3"} "$API$2"
}
expect_denied() { # descripción, método, ruta, [cuerpo]
  local code; code="$(req "$2" "$3" "${4:-}")"
  case "$code" in 401|403|404) echo "OK   denegado ($code): $1" ;;
    *) echo "::error::Un visitante anónimo NO debería poder: $1 (HTTP $code)"; FAIL=1 ;; esac
}
expect_allowed() {
  local code; code="$(req GET "$2")"
  case "$code" in 200|206) echo "OK   permitido ($code): $1" ;;
    *) echo "::error::La lectura pública debería funcionar: $1 (HTTP $code)"; FAIL=1 ;; esac
}

# Lo público debe seguir funcionando (si esto falla, la web está caída para todos).
expect_allowed "leer partners activos"  /partners?select=id\&limit=1
expect_allowed "leer ciudades"          /cities?select=id\&limit=1

# Lo privado debe seguir cerrado.
expect_denied "leer profiles"           GET    "/profiles?select=id&limit=1"
expect_denied "leer admins"             GET    "/admins?select=user_id&limit=1"
expect_denied "leer cta_clicks"         GET    "/cta_clicks?select=id&limit=1"
expect_denied "modificar profiles"      PATCH  "/profiles?id=eq.$ZERO_UUID" '{"membership_tier":"plus"}'
expect_denied "borrar partners"         DELETE "/partners?id=eq.-1"
expect_denied "modificar ciudades"      PATCH  "/cities?id=eq.-1" '{"name":"x"}'
expect_denied "llamar a handle_new_user por RPC" POST "/rpc/handle_new_user" '{}'

[ "$FAIL" -eq 0 ] && echo "Permisos anónimos correctos." || echo "Hay permisos que han cambiado."
exit "$FAIL"
