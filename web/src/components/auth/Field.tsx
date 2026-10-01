import type { InputHTMLAttributes } from 'react';
import styles from './auth.module.css';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

/** Campo con etiqueta visible y el error JUNTO al campo (nunca un aviso flotante). */
export function Field({ label, error, hint, id, ...input }: Props) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {hint && !error && <p id={hintId} className={styles.hint}>{hint}</p>}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {/* el icono es decorativo: el lector lee solo el texto */}
          <span aria-hidden="true">⚠ </span>{error}
        </p>
      )}
    </div>
  );
}
