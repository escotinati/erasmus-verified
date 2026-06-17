---
name: add-partner
description: Guía paso a paso para añadir un nuevo partner (local nocturno, alojamiento, servicio, etc.) al mapa de Erasmus Parties. Valida la estructura del objeto, verifica que la ciudad exista en data.js, y obtiene coordenadas precisas. Usa cuando el usuario quiera dar de alta un nuevo socio comercial en la app.
disable-model-invocation: true
---

El usuario quiere añadir un nuevo partner a `js/partners.js`. Sigue estos pasos en orden:

## 1. Recopilar información

Pide al usuario los siguientes datos (en un solo mensaje):

- **Nombre** del local o negocio
- **Categoría**: `nightlife` | `housing` | `services` | `community` | `travel`
- **País y ciudad**: deben coincidir exactamente con los valores en `js/data.js`
- **Descripción corta** (1-2 frases para el card del mapa)
- **URLs**: web oficial, ticketera (opcional), evento propio de Erasmus Parties (opcional, probablemente `null` por ahora)
- **Coordenadas** (lat/lng): pide al usuario que las obtenga de Google Maps (clic derecho → "¿Qué hay aquí?") o que indique la dirección exacta para geocodificarlas

## 2. Verificar que la ciudad existe

Lee `js/data.js` y confirma que el nombre de ciudad que el usuario ha dado aparece en el array `cities` del país correspondiente. Si no existe, advierte al usuario y pregunta si primero quiere añadir la ciudad con `/add-city`.

## 3. Generar el objeto del partner

Construye el objeto siguiendo exactamente este patrón (sin desviarte de la estructura):

```js
{
  id: 'p-slug-en-kebab-case',
  name: 'Nombre del Local',
  category: 'nightlife',
  pais: 'País',
  ciudad: 'Ciudad',
  lat: 43.26434,
  lng: -2.92756,
  description: 'Descripción corta.',
  links: [
    { type: 'WEBSITE', label: 'Web oficial', url: 'https://...' },
    // Añadir solo los links que el usuario haya proporcionado
    // { type: 'TICKETS', label: 'Entradas', url: 'https://...' },
    // { type: 'OWN_EVENT', label: 'Evento Erasmus', url: 'https://...' },
  ],
}
```

**Reglas del `id`**: prefijo `p-`, seguido del nombre en kebab-case, sin acentos ni caracteres especiales. Ej: "Backstage" → `p-backstage`, "La Fábrica" → `p-la-fabrica`.

## 4. Añadir a partners.js

Inserta el nuevo objeto al final del array `PARTNERS` en `js/partners.js`, antes del cierre `]`. Mantén el estilo de indentación existente (4 espacios) y los separadores de sección con `//`.

## 5. Confirmar y explicar

Tras editar el archivo, explica al usuario:
- Qué se añadió y dónde
- Que el partner aparecerá en el mapa de la ciudad indicada cuando el usuario abra `mapa.html?pais=X&ciudad=Y`
- Si la categoría no tiene datos todavía (ej. `housing`), recuerda que el acordeón la mostrará como vacía hasta que haya más partners de esa categoría
