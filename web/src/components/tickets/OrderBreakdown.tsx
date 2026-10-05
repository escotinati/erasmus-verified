import { formatEuros } from '@/lib/format';
import type { TicketRate } from '@/lib/fourvenues/types';
import { lineTotalCents, type OrderSummary, type Selection } from '@/lib/pricing';
import styles from './OrderBreakdown.module.css';

/** Líneas de entradas elegidas + desglose del total. Recibe datos YA validados en el servidor. */
export function OrderBreakdown({ rates, selection, summary }: { rates: TicketRate[]; selection: Selection; summary: OrderSummary }) {
  const lines = rates.filter((rate) => selection[rate.id] > 0);
  return (
    <>
      {lines.length > 0 && (
        <section aria-label="Entradas elegidas">
          <ul className={styles.lines}>
            {lines.map((rate) => {
              const qty = selection[rate.id];
              return (
                <li key={rate.id} className={styles.line}>
                  <div>
                    <div className={styles.lineName}>{rate.name}</div>
                    <div className={styles.note}>
                      {qty} {qty === 1 ? 'entrada' : 'entradas'}
                    </div>
                  </div>
                  <div className={styles.lineTotal}>{formatEuros(lineTotalCents(rate, qty))}</div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <dl className={styles.totals}>
        <div className={styles.row}>
          <dt>Entradas</dt>
          <dd>{formatEuros(summary.subtotalCents)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Gastos de gestión</dt>
          <dd>{formatEuros(summary.feesCents)}</dd>
        </div>
        <div className={`${styles.row} ${styles.grand}`}>
          <dt>Total</dt>
          <dd>{formatEuros(summary.totalCents)}</dd>
        </div>
      </dl>
    </>
  );
}
