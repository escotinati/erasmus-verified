#!/usr/bin/env bash
# Comprueba que la URL indicada sirve las cabeceras de seguridad esperadas.
# Uso: bash scripts/ci/check-headers.sh https://erasmus-verified.vercel.app
# Falla (exit 1) si falta alguna. Es la red de seguridad frente a un cambio en
# vercel.json que las rompa sin que nadie lo note.
set -u
URL="${1:?Falta la URL. Uso: check-headers.sh https://ejemplo.com}"

HEADERS="$(curl -sS -I --max-time 20 -L "$URL")" || { echo "::error::No se pudo conectar con $URL"; exit 1; }
# Nos quedamos con el último bloque de cabeceras (tras posibles redirecciones), en minúsculas.
HEADERS="$(printf '%s' "$HEADERS" | tr -d '\r' | tr 'A-Z' 'a-z' | awk 'BEGIN{RS="";ORS="\n\n"} {b=$0} END{print b}')"

FAIL=0
need() { # need "<descripción>" "<regex>"
  if printf '%s\n' "$HEADERS" | grep -qE "$2"; then echo "OK   $1"
  else echo "::error::FALTA o es incorrecta: $1"; FAIL=1; fi
}

echo "Comprobando $URL"
need "X-Frame-Options: DENY"            '^x-frame-options: deny'
need "X-Content-Type-Options: nosniff"  '^x-content-type-options: nosniff'
need "Referrer-Policy"                  '^referrer-policy: .+'
need "Permissions-Policy"               '^permissions-policy: .+'
need "Strict-Transport-Security"        '^strict-transport-security: max-age=[0-9]{7,}'
need "CSP en modo bloqueo (no Report-Only)" '^content-security-policy: '
need "CSP: frame-ancestors 'none'"      "^content-security-policy: .*frame-ancestors 'none'"
need "CSP: object-src 'none'"           "^content-security-policy: .*object-src 'none'"
need "CSP: base-uri 'self'"             "^content-security-policy: .*base-uri 'self'"

# Una CSP que permita cualquier origen de script no protege nada.
if printf '%s\n' "$HEADERS" | grep -E '^content-security-policy: ' | grep -qE "script-src[^;]*( \*|https:( |;|$))"; then
  echo "::error::La CSP permite scripts de cualquier origen (script-src demasiado abierto)"; FAIL=1
fi

[ "$FAIL" -eq 0 ] && echo "Todas las cabeceras correctas." || echo "Hay cabeceras que fallan."
exit "$FAIL"
