import type { ReactNode } from 'react';
import { OrderBreakdown } from '@/components/tickets/OrderBreakdown';
import type { TicketRate } from '@/lib/fourvenues/types';
import { formatEuros } from '@/lib/format';
import type { OrderSummary, Selection } from '@/lib/pricing';
import styles from './OrderPanel.module.css';

/**
 * «Tu pedido» de la ficha. Una sola pieza con dos formas (el CSS decide, sin duplicar el botón):
 *  - móvil/tableta (<900 px): barra fija sobre el menú inferior, con total y acción;
 *  - escritorio (≥900 px): panel lateral pegado a la pantalla, con líneas, desglose y total.
 * El total es orientativo: lo calcula `lib/pricing.ts` en el cliente y el servidor lo recalcula al pagar.
 * El botón principal lo pone quien la usa (`children`).
 */
export function OrderPanel({
  rates,
  selection,
  summary,
  children,
}: {
  rates: TicketRate[];
  selection: Selection;
  summary: OrderSummary;
  children: ReactNode;
}) {
  const { tickets, totalCents } = summary;
  return (
    <aside aria-label="Tu pedido" className={styles.panel}>
      {/* Anuncio para lectores de pantalla, siempre presente (el resto cambia de visible según el ancho) */}
      <p className={styles.srOnly} role="status">
        {tickets === 0 ? 'Aún no has elegido entradas.' : `${tickets} ${tickets === 1 ? 'entrada' : 'entradas'}, total ${formatEuros(totalCents)}.`}
      </p>
      <div className={styles.detail}>
        <h2 className={styles.title}>Tu pedido</h2>
        {tickets === 0 && <p className={styles.hint}>Elige tus entradas para ver aquí el resumen.</p>}
        <OrderBreakdown rates={rates} selection={selection} summary={summary} />
      </div>

      <div className={styles.compact}>
        <div className={styles.note}>
          {tickets === 0 ? 'Elige tus entradas' : `${tickets} ${tickets === 1 ? 'entrada' : 'entradas'} · gastos incluidos`}
        </div>
        <div className={styles.total}>{formatEuros(totalCents)}</div>
      </div>

      <div className={styles.cta}>{children}</div>
      <p className={styles.legal}>El precio final incluye los gastos. Pagarás en el siguiente paso.</p>
    </aside>
  );
}
