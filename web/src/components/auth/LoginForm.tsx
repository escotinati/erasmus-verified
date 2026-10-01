'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signInAction, type AuthState } from '@/lib/auth/actions';
import { validateEmail } from '@/lib/auth/validation';
import { Field } from './Field';
import { useAuthForm } from './useAuthForm';
import styles from './auth.module.css';

const initial: AuthState = {};

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const form = useAuthForm(state, pending, (v) => ({
    email: validateEmail(v.email ?? ''),
    password: v.password ? undefined : 'Escribe tu contraseña.',
  }));
  const valid = !validateEmail(email) && password.length > 0;

  return (
    <>
      {notice && <p className={styles.infoBox}>{notice}</p>}
      <form ref={form.formRef} action={action} onSubmit={form.onSubmit} className={styles.form} noValidate>
        <input type="hidden" name="next" value={next} />
        <Field id="email" name="email" label="Correo" type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off"
          spellCheck={false} required
          value={email} onChange={(e) => { setEmail(e.target.value); form.onEdit(); }} error={form.errors.email} />
        <Field id="password" name="password" label="Contraseña" type="password" autoComplete="current-password" required
          value={password} onChange={(e) => { setPassword(e.target.value); form.onEdit(); }} error={form.errors.password} />

        {form.message && (
          <p ref={form.messageRef} tabIndex={-1} className={styles.formError} role="alert">
            <span aria-hidden="true">⚠ </span>{form.message}
          </p>
        )}

        <button type="submit" className={styles.cta} aria-disabled={!valid || pending} onClick={form.onSubmitClick}>
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
        <p className={styles.switch}>¿No tienes cuenta? <Link href="/registro">Regístrate</Link></p>
      </form>
    </>
  );
}
