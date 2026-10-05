'use client';

import { useState, type ReactNode } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { OrderPanel } from '@/components/tickets/OrderPanel';
import { RateCard } from '@/components/tickets/RateCard';
import type { TicketRate } from '@/lib/fourvenues/types';
import { clampQty, isSoldOut, summarize, type Selection } from '@/lib/pricing';
import { encodeSelection } from '@/lib/selection';
import styles from './TicketSelector.module.css';

/** Límites (en caracteres del nombre de tarifa más largo) para pasar de panel de 360 a 400 y de 400 a 440 px. */
const PANEL_MD_FROM = 18;
const PANEL_LG_FROM = 30;

/**
 * Cuerpo de la ficha: datos de la noche (`children`, renderizados en el servidor) + tarifas a la
 * izquierda y «Tu pedido» a la derecha en escritorio. Cliente: solo guarda cantidades. El total
 * mostrado es orientativo; en la compra real el servidor recalcula con los precios de Fourvenues.
 */
export function TicketSelector({
  slug,
  rates,
  initialSelection = {},
  children,
}: {
  slug: string;
  rates: TicketRate[];
  /** Selección de partida (al volver desde el resumen); ya validada por el servidor. */
  initialSelection?: Selection;
  children?: ReactNode;
}) {
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const summary = summarize(rates, selection);
  const onSale = rates.some((rate) => !isSoldOut(rate));

  const change = (rate: TicketRate, delta: number) =>
    setSelection((prev) => ({ ...prev, [rate.id]: clampQty(rate, (prev[rate.id] ?? 0) + delta) }));

  // Ancho del panel según el nombre de tarifa más largo (fijo para esta ficha: no salta al elegir entradas).
  const longest = Math.max(0, ...rates.map((rate) => rate.name.length));
  const panelSize = !onSale ? 'none' : longest <= PANEL_MD_FROM ? 'sm' : longest <= PANEL_LG_FROM ? 'md' : 'lg';

  return (
    <div className={`wide ${styles.layout}`} data-panel={panelSize}>
      <div className={styles.info}>
        {children}

        <h2 className={styles.h2}>Entradas</h2>
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
      </div>

      {onSale && (
        <OrderPanel rates={rates} selection={selection} summary={summary}>
          {/* Sin entradas elegidas no hay a dónde ir; con ellas, al resumen (el servidor valida la selección). */}
          {summary.tickets === 0 ? (
            <Button disabled>Continuar</Button>
          ) : (
            <ButtonLink href={`/eventos/${slug}/comprar?t=${encodeSelection(selection)}`}>Continuar</ButtonLink>
          )}
        </OrderPanel>
      )}
    </div>
  );
}
