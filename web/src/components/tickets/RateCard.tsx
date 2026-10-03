import { Icon } from '@/components/Icon';
import { Badge } from '@/components/ui/Badge';
import type { TicketRate } from '@/lib/fourvenues/types';
import { formatEuros } from '@/lib/format';
import { isSoldOut, maxQty } from '@/lib/pricing';
import styles from './RateCard.module.css';

/** Una tarifa con su selector de cantidad. Presentacional: el estado vive en quien la usa. */
export function RateCard({ rate, qty, onChange }: { rate: TicketRate; qty: number; onChange: (delta: number) => void }) {
  const max = maxQty(rate);
  const soldOut = isSoldOut(rate);
  return (
    <section
      aria-label={soldOut ? `${rate.name}, agotada` : rate.name}
      className={`${styles.rate} ${qty > 0 ? styles.rateSelected : ''}`}
    >
      <div className={styles.rateHead}>
        <span className={`${styles.rateName} ${soldOut ? styles.muted : ''}`}>{rate.name}</span>
        {soldOut ? <Badge variant="outline">Agotado</Badge> : rate.badge ? <Badge>{rate.badge}</Badge> : null}
      </div>

      {soldOut ? (
        <p className={styles.note}>No quedan entradas de este tipo.</p>
      ) : (
        <>
          <p className={styles.priceRow}>
            <span className={styles.price}>{formatEuros(rate.priceCents)}</span>
            <span className={styles.note}>+ {formatEuros(rate.feeCents)} de gastos</span>
          </p>
          {rate.includes && (
            <p className={styles.includes}>
              <span className={styles.ok}>
                <Icon name="check" size={18} />
              </span>
              {rate.includes}
            </p>
          )}
          {rate.nextTier && (
            <p className={styles.tier}>
              <Icon name="clock" size={18} />
              Quedan {rate.nextTier.remaining} a este precio · después {formatEuros(rate.nextTier.priceCents)}
            </p>
          )}
        </>
      )}

      <div className={styles.qtyRow}>
        <span className={styles.qtyLabel} id={`qty-${rate.id}`}>
          Cantidad
        </span>
        <div className={styles.stepper} role="group" aria-labelledby={`qty-${rate.id}`}>
          <button
            type="button"
            className={styles.stepBtn}
            aria-label={`Quitar una entrada ${rate.name}`}
            aria-disabled={qty === 0}
            onClick={() => onChange(-1)}
          >
            <Icon name="minus" size={20} />
          </button>
          <span className={`${styles.qty} ${qty === 0 ? styles.muted : ''}`} aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            className={styles.stepBtn}
            aria-label={`Añadir una entrada ${rate.name}`}
            aria-disabled={qty >= max}
            onClick={() => onChange(1)}
          >
            <Icon name="plus" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
