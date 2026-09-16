// ─────────────────────────────────────────────────────────────
//  mount-city-partner-list.jsx — mismo patrón que mount-partner-list.jsx:
//  cityPartners.js (script clásico, sin ES Modules) crea un root de
//  React sobre el contenedor de la lista UNA ÚNICA VEZ y vuelve a
//  pintar sobre ESE MISMO root en cada cambio de estado (plegar/
//  desplegar categoría, entrar/salir de modo foco), sin destruirlo y
//  recrearlo.
// ─────────────────────────────────────────────────────────────

import { createRoot } from 'react-dom/client';
import CityPartnerList from './CityPartnerList.jsx';

export function mountCityPartnerList(containerEl) {
    // createRoot() (React 18) no borra los hijos preexistentes del
    // contenedor al montarse — sin este vaciado, el skeleton pintado a
    // mano antes de montar (Skeleton.render(), cityPartners.js) se
    // quedaría mezclado para siempre con las categorías reales.
    containerEl.innerHTML = '';
    const root = createRoot(containerEl);
    return {
        render(props) {
            root.render(<CityPartnerList {...props} />);
        },
    };
}

window.mountCityPartnerList = mountCityPartnerList;
