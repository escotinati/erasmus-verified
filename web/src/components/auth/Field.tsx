'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Icon } from '@/components/Icon';
import styles from './auth.module.css';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

/**
 * Campo con etiqueta visible y el error JUNTO al campo (nunca un aviso flotante).
 * Los campos de contraseña llevan un botón para mostrar/ocultar lo escrito (comprobar que no hay erratas).
 */
export function Field({ label, error, hint, id, type, ...input }: Props) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  const control = (
    <input
      {...input}
      id={id}
      type={isPassword && revealed ? 'text' : type}
      className={`${styles.input} ${isPassword ? styles.inputWithToggle : ''}`}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    />
  );
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {isPassword ? (
        <div className={styles.inputWrap}>
          {control}
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealed((v) => !v)}
            aria-pressed={revealed}
            aria-label="Mostrar contraseña"
          >
            <Icon name={revealed ? 'eyeOff' : 'eye'} size={22} />
          </button>
        </div>
      ) : (
        control
      )}
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
