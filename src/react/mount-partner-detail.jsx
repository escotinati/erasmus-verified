// ─────────────────────────────────────────────────────────────
//  mount-partner-detail.jsx — puente para que mapPartners.js (script
//  clásico) monte PartnerDetail.jsx dentro de un Sheet (sheet.js,
//  vanilla, no se toca).
//
//  A diferencia de mount-summary-cards.jsx / mount-partner-list.jsx
//  (un root ÚNICO, reutilizado toda la vida de la página, repintado en
//  cada cambio de filtro/categoría), aquí el contenedor es efímero:
//  Sheet.create() crea un <dialog> NUEVO cada vez que se abre un
//  partner y no lo elimina del DOM al cerrarse (solo lo oculta —
//  deuda ya existente en sheet.js, no la introduce esta isla). Sin
//  desmontar el root al cerrar, cada partner que un estudiante mire
//  (sesiones típicas en móvil abren y cierran varios seguidos) dejaría
//  un árbol de fibra de React completo huérfano en memoria.
//
//  Por eso mountPartnerDetail() NO devuelve un `.render()` reutilizable
//  — devuelve `{ unmount() }`, y es mapPartners.js quien llama a
//  `.unmount()` explícitamente en el onClose del propio Sheet.
//
//  Tampoco hace falta vaciar containerEl antes de createRoot() (a
//  diferencia de esos otros dos mount-*.jsx): aquí containerEl es un
//  <div> recién creado por mapPartners.js en cada selectPartner(),
//  nunca reutilizado, así que nunca puede tener nada pintado antes —
//  el motivo original de ese vaciado (DOM imperativo previo, como un
//  esqueleto de carga, mezclándose con el contenido de React) no
//  aplica a un contenedor que nace vacío y se usa una sola vez.
// ─────────────────────────────────────────────────────────────

import { createRoot } from 'react-dom/client';
import PartnerDetail from './PartnerDetail.jsx';

export function mountPartnerDetail(containerEl, props) {
    const root = createRoot(containerEl);
    root.render(<PartnerDetail {...props} />);
    return {
        unmount() {
            root.unmount();
        },
    };
}

window.mountPartnerDetail = mountPartnerDetail;
