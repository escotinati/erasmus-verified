---
name: add-city
description: Guía para añadir una nueva ciudad (o un país entero) a la base de datos de Erasmus Parties. Actualiza data.js y ciudad.html con los enlaces de WhatsApp/Telegram. Usar cuando el usuario quiera ampliar la cobertura geográfica de la app.
disable-model-invocation: true
---

El usuario quiere añadir una nueva ciudad o país a la app. Sigue estos pasos:

## 1. Recopilar información

Pide en un solo mensaje:

- **Nombre del país** (tal como se escribirá en la UI, en español con tildes: ej. "Países Bajos", "República Checa")
- **Nombre(s) de ciudad(es)** a añadir (en español si aplica: ej. "Praga", "Viena")
- **Enlace de WhatsApp** del grupo (o `null` si no existe aún)
- **Enlace de Telegram** del grupo (o `null` si no existe aún)
- **URL de imagen** para la ciudad (Unsplash recomendado; si no tiene una, usar la imagen genérica del país)
- Si es un **país nuevo**: bandera emoji, URL de imagen hero (1400px) y card (600px) de Unsplash

## 2. Actualizar js/data.js

### Si la ciudad pertenece a un país ya existente

Añade un objeto `{ name, img }` al array `cities` del país correspondiente dentro del objeto `COUNTRIES`.

### Si es un país nuevo

Añade una nueva entrada al objeto `COUNTRIES` siguiendo exactamente este patrón:

```js
"Nombre País": {
  flag: "🇽🇽",
  heroImg: "https://images.unsplash.com/photo-XXXXX?w=1400&q=80&auto=format&fit=crop",
  cardImg: "https://images.unsplash.com/photo-XXXXX?w=600&q=75&auto=format&fit=crop",
  cities: [
    { name: "Ciudad", img: "https://images.unsplash.com/photo-XXXXX?w=600&q=75&auto=format&fit=crop" }
  ],
},
```

Mantén el orden alfabético de países en el objeto.

## 3. Actualizar ciudad.html

Localiza el objeto `links` al inicio del script inline de `ciudad.html` y añade la nueva ciudad:

```js
"Nombre Ciudad": { wa: "https://chat.whatsapp.com/CODIGO", tg: null },
```

- `wa: null` si no hay enlace de WhatsApp
- `tg: null` si no hay enlace de Telegram
- Si ambos son `null`, la UI mostrará automáticamente "Próximamente"

## 4. Confirmar y explicar

Tras las ediciones, explica al usuario:
- Qué archivos se modificaron y qué se añadió en cada uno
- Que la ciudad ya aparecerá en el buscador de `index.html` (alimentado por `data.js`)
- Si los enlaces de WhatsApp/Telegram son `null`, la ciudad estará visible en el directorio pero sin grupos activos todavía
- Si el usuario quiere añadir también partners para esta ciudad, sugerirle `/add-partner`
