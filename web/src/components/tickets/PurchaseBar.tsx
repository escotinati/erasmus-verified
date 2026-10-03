import type { ReactNode } from 'react';
import { formatEuros } from '@/lib/format';
import styles from './PurchaseBar.module.css';

/**
 * Barra fija con el total y la acción principal. Se reutiliza en la ficha ("Continuar")
 * y en el resumen ("Pagar"): quien la usa pone el botón como `children`.
 * El total es orientativo: lo calcula `lib/pricing.ts` en el cliente y el servidor lo
 * recalcula en la compra real.
 */
export function PurchaseBar({ tickets, totalCents, children }: { tickets: number; totalCents: number; children: ReactNode }) {
  return (
    <div className={`dock ${styles.bar}`}>
      <div className={styles.barTotal}>
        <div className={styles.note} aria-live="polite">
          {tickets === 0 ? 'Elige tus entradas' : `${tickets} ${tickets === 1 ? 'entrada' : 'entradas'} · gastos incluidos`}
        </div>
        <div className={styles.total}>{formatEuros(totalCents)}</div>
      </div>
      <div className={styles.cta}>{children}</div>
    </div>
  );
}
