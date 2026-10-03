'use client';

import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { PurchaseBar } from '@/components/tickets/PurchaseBar';
import { RateCard } from '@/components/tickets/RateCard';
import type { TicketRate } from '@/lib/fourvenues/types';
import { clampQty, isSoldOut, summarize, type Selection } from '@/lib/pricing';
import { encodeSelection } from '@/lib/selection';
import styles from './TicketSelector.module.css';

/**
 * Selector de entradas de la ficha. Cliente: solo guarda cantidades. El total mostrado es
 * orientativo; en la compra real el servidor recalcula con los precios de Fourvenues.
 */
export function TicketSelector({ slug, rates }: { slug: string; rates: TicketRate[] }) {
  const [selection, setSelection] = useState<Selection>({});
  const summary = summarize(rates, selection);
  const onSale = rates.some((rate) => !isSoldOut(rate));

  const change = (rate: TicketRate, delta: number) =>
    setSelection((prev) => ({ ...prev, [rate.id]: clampQty(rate, (prev[rate.id] ?? 0) + delta) }));

  return (
    <>
      <div className={styles.list}>
        {rates.map((rate) => (
          <RateCard
            key={rate.id}
            rate={rate}
            qty={clampQty(rate, selection[rate.id] ?? 0)}
            onChange={(delta) => change(rate, delta)}
          />
        ))}
      </div>

      {!onSale && (
        <p className={styles.empty} role="status">
          {rates.length === 0 ? 'Aún no hay entradas a la venta.' : 'Entradas agotadas.'}
        </p>
      )}

      {onSale && (
        <PurchaseBar tickets={summary.tickets} totalCents={summary.totalCents}>
          {/* Sin entradas elegidas no hay a dónde ir; con ellas, al resumen (el servidor valida la selección). */}
          {summary.tickets === 0 ? (
            <Button disabled>Continuar</Button>
          ) : (
            <ButtonLink href={`/eventos/${slug}/comprar?t=${encodeSelection(selection)}`}>Continuar</ButtonLink>
          )}
        </PurchaseBar>
      )}
    </>
  );
}
