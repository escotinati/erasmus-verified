// ─────────────────────────────────────────────────────────────
//  MAPA.JS — Erasmus Parties
//  Orquestador de mapa.html (vista a pantalla completa).
//  Toda la lógica de mapa vive en cityMap.js, compartida con
//  el mapa embebido de ciudad.html.
// ─────────────────────────────────────────────────────────────
(async function () {
    const params = new URLSearchParams(window.location.search);
    const cityId = parseInt(params.get('city'), 10);

    function showMapError() {
        document.querySelector('.map-page-main').innerHTML = `
    <div style="text-align:center;padding:60px 20px;color:var(--on-surface-variant);">
      <span style="font-size:2.5rem;display:block;margin-bottom:16px;">😵</span>
      <h2 style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--on-surface);margin-bottom:8px;">Ciudad no encontrada</h2>
      <p>Vuelve al inicio y selecciona tu destino.</p>
      <a href="index.html" style="display:inline-block;margin-top:20px;color:var(--primary);">← Inicio</a>
    </div>`;
    }

    if (!cityId) {
        showMapError();
        return;
    }

    const { data: city, error } = await window.supabaseClient
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .single();

    if (error || !city) {
        showMapError();
        return;
    }

    document.title = `Mapa de ${city.name}, ${city.country} — Erasmus Verified`;
    document.getElementById('breadcrumbPais').textContent = city.country;
    document.getElementById('breadcrumbPaisLink').href = `ciudades.html?pais=${encodeURIComponent(city.country)}`;
    document.getElementById('breadcrumbCiudad').textContent = city.name;
    document.getElementById('breadcrumbCiudadLink').href = `ciudad.html?ciudad=${city.id}`;
    document.getElementById('backLink').href = `ciudad.html?ciudad=${city.id}`;
    document.getElementById('backLinkText').textContent = city.name;

    const mapEl = document.getElementById('map');
    const topbarHeight = document.querySelector('header.topbar').offsetHeight;
    const syncMapHeight = () => {
        mapEl.style.setProperty('height', window.innerHeight - topbarHeight + 'px', 'important');
    };
    syncMapHeight();
    window.addEventListener('resize', syncMapHeight);

    mountCityMap('map', { pais: city.country, ciudad: city.name, interactive: true }).then(
        (mapInstance) => {
            if (mapInstance) {
                syncMapHeight();
                mapInstance.invalidateSize();
                mountPartnersList(
                    'partners-list',
                    mapInstance,
                    city.id,
                    window.ERASMUS_EXPERIENCE.defaultCategory
                );
            }
        }
    );
})();
