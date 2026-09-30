'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import type { TicketRate } from '@/lib/fourvenues/types';
import { formatEuros } from '@/lib/format';
import { clampQty, isSoldOut, maxQty, summarize, type Selection } from '@/lib/pricing';
import styles from './TicketSelector.module.css';

/**
 * Selector de entradas + barra de compra fija.
 * Cliente: solo guarda cantidades. El total mostrado es orientativo; en la compra
 * real el servidor recalcula con los precios de Fourvenues.
 */
export function TicketSelector({ rates }: { rates: TicketRate[] }) {
  const [selection, setSelection] = useState<Selection>({});
  const summary = summarize(rates, selection);
  const onSale = rates.some((rate) => !isSoldOut(rate));

  const change = (rate: TicketRate, delta: number) =>
    setSelection((prev) => ({ ...prev, [rate.id]: clampQty(rate, (prev[rate.id] ?? 0) + delta) }));

  return (
    <>
      <div className={styles.list}>
        {rates.map((rate) => {
          const qty = clampQty(rate, selection[rate.id] ?? 0);
          const max = maxQty(rate);
          const selected = qty > 0;
          const soldOut = isSoldOut(rate);
          return (
            <section
              key={rate.id}
              aria-label={soldOut ? `${rate.name}, agotada` : rate.name}
              className={`${styles.rate} ${selected ? styles.rateSelected : ''}`}
            >
              <div className={styles.rateHead}>
                <span className={`${styles.rateName} ${soldOut ? styles.muted : ''}`}>{rate.name}</span>
                {soldOut ? (
                  <span className={styles.badgeOutline}>Agotado</span>
                ) : rate.badge ? (
                  <span className={styles.badge}>{rate.badge}</span>
                ) : null}
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
                    onClick={() => change(rate, -1)}
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
                    onClick={() => change(rate, 1)}
                  >
                    <Icon name="plus" size={20} />
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {!onSale && (
        <p className={styles.empty} role="status">
          {rates.length === 0 ? 'Aún no hay entradas a la venta.' : 'Entradas agotadas.'}
        </p>
      )}

      {onSale && (
      <div className={styles.bar}>
        <div className={styles.barTotal}>
          <div className={styles.note} aria-live="polite">
            {summary.tickets === 0
              ? 'Elige tus entradas'
              : `${summary.tickets} ${summary.tickets === 1 ? 'entrada' : 'entradas'} · gastos incluidos`}
          </div>
          <div className={styles.total}>{formatEuros(summary.totalCents)}</div>
        </div>
        {/* Fase 2: catálogo. El botón se activa en la fase de compra (resumen y pago). */}
        <button type="button" className={styles.cta} disabled>
          Continuar
        </button>
      </div>
      )}
    </>
  );
}
