// ─────────────────────────────────────────────────────────────
//  DATA.JS — Fuente única de verdad del proyecto Erasmus Groups
//
//  CÓMO AÑADIR UN PAÍS:
//    1. Añade una entrada nueva al objeto COUNTRIES siguiendo
//       el mismo formato que los existentes.
//    2. Nada más. index.html y ciudades.html lo renderizan solos.
//
//  CÓMO AÑADIR UNA CIUDAD A UN PAÍS:
//    1. Añade un objeto { name, img } al array cities del país.
//    2. Si ya tienes el enlace de grupo, añádelo también en LINKS.
//
//  CÓMO AÑADIR UN ENLACE DE GRUPO:
//    1. Añade o edita la entrada en LINKS con el nombre exacto
//       de la ciudad (sensible a mayúsculas/tildes).
//    2. wa: null  → no aparece el botón de WhatsApp
//       tg: null  → no aparece el botón de Telegram
//       Si los dos son null → aparece "Próximamente"
// ─────────────────────────────────────────────────────────────

const COUNTRIES = {

  "España": {
    flag:    "🇪🇸",
    heroImg: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Madrid",    img: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=75&auto=format&fit=crop" },
      { name: "Barcelona", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=75&auto=format&fit=crop" },
      { name: "Sevilla",   img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=75&auto=format&fit=crop" },
      { name: "Valencia",  img: "https://images.unsplash.com/photo-1520116469508-bf27a5bbe95f?w=600&q=75&auto=format&fit=crop" },
      { name: "Bilbao",    img: "https://images.unsplash.com/photo-1513623935135-c896b59073c1?w=600&q=75&auto=format&fit=crop" },
      { name: "Granada",   img: "https://images.unsplash.com/photo-1533601017-dc83a0ec0e19?w=600&q=75&auto=format&fit=crop" },
      { name: "Salamanca", img: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=75&auto=format&fit=crop" },
      { name: "Málaga",    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=75&auto=format&fit=crop" },
      { name: "Alicante",  img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=75&auto=format&fit=crop" },
      { name: "Zaragoza",  img: "https://images.unsplash.com/photo-1583195765157-0f3f1ab6e843?w=600&q=75&auto=format&fit=crop" },
      { name: "Murcia",    img: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&q=75&auto=format&fit=crop" },
      { name: "Santiago",  img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "Italia": {
    flag:    "🇮🇹",
    heroImg: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Roma",      img: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=600&q=75&auto=format&fit=crop" },
      { name: "Milán",     img: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&q=75&auto=format&fit=crop" },
      { name: "Florencia", img: "https://images.unsplash.com/photo-1541370976299-4d24be63a4dd?w=600&q=75&auto=format&fit=crop" },
      { name: "Bolonia",   img: "https://images.unsplash.com/photo-1574173037671-4bb2b5cf80a1?w=600&q=75&auto=format&fit=crop" },
      { name: "Nápoles",   img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=75&auto=format&fit=crop" },
      { name: "Turín",     img: "https://images.unsplash.com/photo-1582623838120-a3b3e3745c2d?w=600&q=75&auto=format&fit=crop" },
      { name: "Padua",     img: "https://images.unsplash.com/photo-1559867604-f9c0e5c3a8c2?w=600&q=75&auto=format&fit=crop" },
      { name: "Venecia",   img: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600&q=75&auto=format&fit=crop" },
      { name: "Palermo",   img: "https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=600&q=75&auto=format&fit=crop" },
      { name: "Pisa",      img: "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "Alemania": {
    flag:    "🇩🇪",
    heroImg: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Berlín",     img: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=75&auto=format&fit=crop" },
      { name: "Múnich",     img: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=600&q=75&auto=format&fit=crop" },
      { name: "Hamburgo",   img: "https://images.unsplash.com/photo-1554931670-4ebfabf6e7a9?w=600&q=75&auto=format&fit=crop" },
      { name: "Colonia",    img: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&q=75&auto=format&fit=crop" },
      { name: "Frankfurt",  img: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=75&auto=format&fit=crop" },
      { name: "Stuttgart",  img: "https://images.unsplash.com/photo-1592278602922-eab9c2eb25f8?w=600&q=75&auto=format&fit=crop" },
      { name: "Düsseldorf", img: "https://images.unsplash.com/photo-1529655682523-4bdc3618ffd3?w=600&q=75&auto=format&fit=crop" },
      { name: "Leipzig",    img: "https://images.unsplash.com/photo-1602414432042-c3d0b0d09e60?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "Francia": {
    flag:    "🇫🇷",
    heroImg: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "París",       img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=75&auto=format&fit=crop" },
      { name: "Lyon",        img: "https://images.unsplash.com/photo-1557946523-f4459c50eff0?w=600&q=75&auto=format&fit=crop" },
      { name: "Marsella",    img: "https://images.unsplash.com/photo-1578902506977-8e28e7831b9e?w=600&q=75&auto=format&fit=crop" },
      { name: "Toulouse",    img: "https://images.unsplash.com/photo-1537949158723-12de6a57f4b2?w=600&q=75&auto=format&fit=crop" },
      { name: "Burdeos",     img: "https://images.unsplash.com/photo-1597000640826-0bfc51f6eba8?w=600&q=75&auto=format&fit=crop" },
      { name: "Estrasburgo", img: "https://images.unsplash.com/photo-1574349853637-52d5d3ea5898?w=600&q=75&auto=format&fit=crop" },
      { name: "Montpellier", img: "https://images.unsplash.com/photo-1558013776-67d7f5c0ab83?w=600&q=75&auto=format&fit=crop" },
      { name: "Nantes",      img: "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "Portugal": {
    flag:    "🇵🇹",
    heroImg: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Lisboa",  img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&q=75&auto=format&fit=crop" },
      { name: "Oporto",  img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=75&auto=format&fit=crop" },
      { name: "Coimbra", img: "https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=600&q=75&auto=format&fit=crop" },
      { name: "Braga",   img: "https://images.unsplash.com/photo-1567233782940-54ac5edfa9ff?w=600&q=75&auto=format&fit=crop" },
      { name: "Aveiro",  img: "https://images.unsplash.com/photo-1600456899121-68eda5b33ef7?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "Países Bajos": {
    flag:    "🇳🇱",
    heroImg: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Ámsterdam", img: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=75&auto=format&fit=crop" },
      { name: "Rotterdam",  img: "https://images.unsplash.com/photo-1555991643-e81a0ad8898c?w=600&q=75&auto=format&fit=crop" },
      { name: "Utrecht",    img: "https://images.unsplash.com/photo-1583394293214-5f04f8d5b9ef?w=600&q=75&auto=format&fit=crop" },
      { name: "Leiden",     img: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&q=75&auto=format&fit=crop" },
      { name: "Groninga",   img: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "Bélgica": {
    flag:    "🇧🇪",
    heroImg: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Bruselas", img: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=600&q=75&auto=format&fit=crop" },
      { name: "Gante",    img: "https://images.unsplash.com/photo-1559841644-08984562005f?w=600&q=75&auto=format&fit=crop" },
      { name: "Brujas",   img: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=600&q=75&auto=format&fit=crop" },
      { name: "Lovaina",  img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "Polonia": {
    flag:    "🇵🇱",
    heroImg: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Varsovia", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=75&auto=format&fit=crop" },
      { name: "Cracovia", img: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=600&q=75&auto=format&fit=crop" },
      { name: "Wrocław",  img: "https://images.unsplash.com/photo-1546506831-dd55c64a8ef3?w=600&q=75&auto=format&fit=crop" },
      { name: "Gdańsk",   img: "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=600&q=75&auto=format&fit=crop" },
      { name: "Poznan",   img: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "República Checa": {
    flag:    "🇨🇿",
    heroImg: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Praga",   img: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=75&auto=format&fit=crop" },
      { name: "Brno",    img: "https://images.unsplash.com/photo-1567129937891-ef60c2dbdb0e?w=600&q=75&auto=format&fit=crop" },
      { name: "Olomouc", img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=75&auto=format&fit=crop" },
    ],
  },

  "Hungría": {
    flag:    "🇭🇺",
    heroImg: "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=1400&q=80&auto=format&fit=crop",
    cardImg: "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=600&q=75&auto=format&fit=crop",
    cities: [
      { name: "Budapest", img: "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=600&q=75&auto=format&fit=crop" },
      { name: "Debrecen", img: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&q=75&auto=format&fit=crop" },
      { name: "Pécs",     img: "https://images.unsplash.com/photo-1567309028346-9aef0c0b8e3b?w=600&q=75&auto=format&fit=crop" },
    ],
  },

};

// ─────────────────────────────────────────────────────────────
//  LINKS — Enlaces de grupos por ciudad
//  Clave: nombre exacto de la ciudad (igual que en cities[].name)
//  wa: URL de WhatsApp  |  tg: URL de Telegram  |  null = oculto
// ─────────────────────────────────────────────────────────────

const LINKS = {
  "Madrid":    { wa: null, tg: null },
  "Barcelona": { wa: null, tg: null },
  "Sevilla":   { wa: null, tg: null },
  "Valencia":  { wa: null, tg: null },
  "Bilbao":    { wa: null, tg: null },
  "Granada":   { wa: null, tg: null },
  "Salamanca": { wa: null, tg: null },
  "Málaga":    { wa: null, tg: null },
  "Alicante":  { wa: null, tg: null },
  "Zaragoza":  { wa: null, tg: null },
  "Murcia":    { wa: null, tg: null },
  "Santiago":  { wa: null, tg: null },
  "Roma":      { wa: null, tg: null },
  "Milán":     { wa: null, tg: null },
  "Florencia": { wa: null, tg: null },
  "Bolonia":   { wa: null, tg: null },
  "Nápoles":   { wa: null, tg: null },
  "Turín":     { wa: null, tg: null },
  "Padua":     { wa: null, tg: null },
  "Venecia":   { wa: null, tg: null },
  "Palermo":   { wa: null, tg: null },
  "Pisa":      { wa: null, tg: null },
  "Berlín":    { wa: null, tg: null },
  "Múnich":    { wa: null, tg: null },
  "Hamburgo":  { wa: null, tg: null },
  "Colonia":   { wa: null, tg: null },
  "Frankfurt": { wa: null, tg: null },
  "Stuttgart": { wa: null, tg: null },
  "Düsseldorf":{ wa: null, tg: null },
  "Leipzig":   { wa: null, tg: null },
  "París":     { wa: null, tg: null },
  "Lyon":      { wa: null, tg: null },
  "Marsella":  { wa: null, tg: null },
  "Toulouse":  { wa: null, tg: null },
  "Burdeos":   { wa: null, tg: null },
  "Estrasburgo":{ wa: null, tg: null },
  "Montpellier":{ wa: null, tg: null },
  "Nantes":    { wa: null, tg: null },
  "Lisboa":    { wa: null, tg: null },
  "Oporto":    { wa: null, tg: null },
  "Coimbra":   { wa: null, tg: null },
  "Braga":     { wa: null, tg: null },
  "Aveiro":    { wa: null, tg: null },
  "Ámsterdam": { wa: null, tg: null },
  "Rotterdam":  { wa: null, tg: null },
  "Utrecht":   { wa: null, tg: null },
  "Leiden":    { wa: null, tg: null },
  "Groninga":  { wa: null, tg: null },
  "Bruselas":  { wa: null, tg: null },
  "Gante":     { wa: null, tg: null },
  "Brujas":    { wa: null, tg: null },
  "Lovaina":   { wa: null, tg: null },
  "Varsovia":  { wa: null, tg: null },
  "Cracovia":  { wa: null, tg: null },
  "Wrocław":   { wa: null, tg: null },
  "Gdańsk":    { wa: null, tg: null },
  "Poznan":    { wa: null, tg: null },
  "Praga":     { wa: null, tg: null },
  "Brno":      { wa: null, tg: null },
  "Olomouc":   { wa: null, tg: null },
  "Budapest":  { wa: null, tg: null },
  "Debrecen":  { wa: null, tg: null },
  "Pécs":      { wa: null, tg: null },
};
