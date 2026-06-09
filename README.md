# Erasmus Groups

Directorio de grupos de WhatsApp y Telegram para estudiantes Erasmus.

## Estructura

```
Erasmus/
├── index.html     → Página principal con todos los países y ciudades
├── ciudad.html    → Página de ciudad con botones de WhatsApp / Telegram
└── README.md
```

## Cómo añadir un nuevo grupo

Abre `ciudad.html` y localiza el objeto `links` al inicio del script:

```js
const links = {
  "Madrid": { wa: "https://chat.whatsapp.com/TU_CODIGO", tg: "https://t.me/TU_CANAL" },
  "Barcelona": { wa: "https://chat.whatsapp.com/TU_CODIGO", tg: null },
  // ...
};
```

- Si no tienes enlace de WhatsApp para esa ciudad, pon `wa: null`.
- Si no tienes Telegram, pon `tg: null`.
- Si ambos son null, aparece automáticamente un mensaje "Próximamente".

## Cómo añadir un nuevo país / ciudad

1. En `index.html`, copia uno de los bloques `<div class="country-section">` existentes.
2. Cambia la bandera, el nombre del país y la lista de ciudades.
3. Actualiza el atributo `data-country` para incluir variantes de búsqueda (ej: "Grecia Greece Grèce").
4. Añade los enlaces en `ciudad.html` siguiendo el patrón del objeto `links`.

## Stack

HTML + CSS + JS vanilla. Sin dependencias, sin build step.
Abre `index.html` directamente en el navegador.
