import type { ReactNode } from 'react';
import styles from './StatusScreen.module.css';

/** Pantalla de estado a página completa (error, no encontrado…): título, texto y una acción opcional. */
export function StatusScreen({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <main className={`wide ${styles.screen}`}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{text}</p>
      {children}
    </main>
  );
}
