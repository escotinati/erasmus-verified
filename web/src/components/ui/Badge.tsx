import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type Variant = 'accent' | 'outline' | 'solid';

/**
 * Etiqueta corta en forma de píldora.
 * accent = tramo/destacado · outline = estado neutro (p. ej. "Agotado") · solid = dato clave (p. ej. edad mínima).
 */
export function Badge({ variant = 'accent', className, children }: { variant?: Variant; className?: string; children: ReactNode }) {
  return <span className={[styles.badge, styles[variant], className ?? ''].filter(Boolean).join(' ')}>{children}</span>;
}
