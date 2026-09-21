// ─────────────────────────────────────────────────────────────
//  collabData.js — colaboradores (enlaces de afiliado) que pinta
//  CollabGrid.jsx. Antes eran 12 <a class="collab-card"> copiados a
//  mano en alojamiento.html, viajes.html e index.html — 8 entradas
//  únicas. Un solo sitio para añadir/cambiar un colaborador.
//
//  descKey: clave de I18n (translations.js). fallback: texto en español
//  por si I18n no estuviera cargado.
// ─────────────────────────────────────────────────────────────

export const COLLAB_SETS = {
    housing: [
        {
            name: 'Uniplaces',
            href: 'https://www.uniplaces.com',
            descKey: 'home.collab_uniplaces_desc',
            fallback: 'Pisos para estudiantes en toda Europa',
        },
        {
            name: 'Spotahome',
            href: 'https://www.spotahome.com',
            descKey: 'home.collab_spotahome_desc',
            fallback: 'Alquiler sin visita presencial',
        },
        {
            name: 'HousingAnywhere',
            href: 'https://housinganywhere.com',
            descKey: 'home.collab_housinganywhere_desc',
            fallback: 'Alojamiento flexible para Erasmus',
        },
        {
            name: 'Badi',
            href: 'https://badi.com',
            descKey: 'home.collab_badi_desc',
            fallback: 'Comparte piso con estudiantes',
        },
    ],
    trips: [
        {
            name: 'FlixBus',
            href: 'https://www.flixbus.es',
            descKey: 'trips.collab_flixbus_desc',
            fallback: 'Autobuses interurbanos económicos por Europa',
        },
        {
            name: 'BlaBlaCar',
            href: 'https://www.blablacar.es',
            descKey: 'trips.collab_blablacar_desc',
            fallback: 'Compartir trayecto entre ciudades',
        },
        {
            name: 'Omio',
            href: 'https://www.omio.es',
            descKey: 'trips.collab_omio_desc',
            fallback: 'Compara trenes, buses y vuelos',
        },
        {
            name: 'Rentalcars',
            href: 'https://www.rentalcars.com',
            descKey: 'trips.collab_rentalcars_desc',
            fallback: 'Alquiler de coches en toda Europa',
        },
    ],
};
