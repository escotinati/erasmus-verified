'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signUpAction, type AuthState } from '@/lib/auth/actions';
import { NAME_MAX, PASSWORD_MIN, validateEmail, validateName, validatePassword } from '@/lib/auth/validation';
import { Field } from './Field';
import styles from './auth.module.css';

const initial: AuthState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Botón desactivado hasta que todo sea válido (la validación real se repite en el servidor).
  const valid = !validateName(name) && !validateEmail(email) && !validatePassword(password);

  if (state.sent) {
    return (
      <div className={styles.notice} role="status">
        <h2 className={styles.noticeTitle}>Revisa tu correo</h2>
        <p>
          Te hemos enviado un enlace a <strong>{state.email}</strong> para confirmar tu cuenta. Cuando lo pulses,
          podrás entrar.
        </p>
        <p className={styles.hint}>Si no lo ves, mira en spam. El enlace caduca en 1 hora.</p>
        <Link href="/login" className={styles.linkBtn}>Ir a iniciar sesión</Link>
      </div>
    );
  }

  return (
    <form action={action} className={styles.form} noValidate>
      <Field id="name" name="name" label="Nombre" autoComplete="given-name" maxLength={NAME_MAX} required
        value={name} onChange={(e) => setName(e.target.value)} error={state.errors?.name} />
      <Field id="email" name="email" label="Correo" type="email" inputMode="email" autoComplete="email" required
        value={email} onChange={(e) => setEmail(e.target.value)} error={state.errors?.email} />
      <Field id="password" name="password" label="Contraseña" type="password" autoComplete="new-password" required
        hint={`Mínimo ${PASSWORD_MIN} caracteres.`}
        value={password} onChange={(e) => setPassword(e.target.value)} error={state.errors?.password} />

      {state.message && <p className={styles.formError} role="alert">{state.message}</p>}

      <button type="submit" className={styles.cta} disabled={!valid || pending}>
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
      <p className={styles.switch}>¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
    </form>
  );
}
