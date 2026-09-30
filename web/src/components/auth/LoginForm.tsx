'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signInAction, type AuthState } from '@/lib/auth/actions';
import { validateEmail } from '@/lib/auth/validation';
import { Field } from './Field';
import styles from './auth.module.css';

const initial: AuthState = {};

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const valid = !validateEmail(email) && password.length > 0;

  return (
    <form action={action} className={styles.form} noValidate>
      {notice && <p className={styles.infoBox} role="status">{notice}</p>}
      <input type="hidden" name="next" value={next} />
      <Field id="email" name="email" label="Correo" type="email" inputMode="email" autoComplete="email" required
        value={email} onChange={(e) => setEmail(e.target.value)} error={state.errors?.email} />
      <Field id="password" name="password" label="Contraseña" type="password" autoComplete="current-password" required
        value={password} onChange={(e) => setPassword(e.target.value)} error={state.errors?.password} />

      {state.message && <p className={styles.formError} role="alert">{state.message}</p>}

      <button type="submit" className={styles.cta} disabled={!valid || pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
      <p className={styles.switch}>¿No tienes cuenta? <Link href="/registro">Regístrate</Link></p>
    </form>
  );
}
