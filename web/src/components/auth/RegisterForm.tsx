'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { signUpAction, type AuthState } from '@/lib/auth/actions';
import { NAME_MAX, PASSWORD_MIN, validateEmail, validateName, validatePassword } from '@/lib/auth/validation';
import { Field } from './Field';
import { useAuthForm } from './useAuthForm';
import styles from './auth.module.css';

const initial: AuthState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const sentTitle = useRef<HTMLHeadingElement>(null);

  const form = useAuthForm(state, pending, (v) => ({
    name: validateName(v.name ?? ''),
    email: validateEmail(v.email ?? ''),
    password: validatePassword(v.password ?? ''),
  }));
  const valid = !validateName(name) && !validateEmail(email) && !validatePassword(password);

  // Al enviar con éxito el formulario se desmonta: llevamos el foco al título del aviso.
  useEffect(() => {
    if (state.sent) sentTitle.current?.focus();
  }, [state.sent]);

  if (state.sent) {
    return (
      <div className={styles.notice}>
        <h1 ref={sentTitle} tabIndex={-1}>Revisa tu correo</h1>
        <p>
          Te hemos enviado un enlace a <strong>{state.email}</strong> para confirmar tu cuenta. Cuando lo pulses,
          podrás entrar.
        </p>
        <p className={styles.hint}>Si no lo ves, mira en spam. Si ya tenías cuenta con este correo, no recibirás nada: inicia sesión.</p>
        <Link href="/login" className={styles.linkBtn}>Ir a iniciar sesión</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Crea tu cuenta</h1>
      <form ref={form.formRef} action={action} onSubmit={form.onSubmit} className={styles.form} noValidate>
        <p className={styles.hint}>Todos los campos son obligatorios.</p>
        <Field id="name" name="name" label="Nombre" autoComplete="given-name" autoCapitalize="words" maxLength={NAME_MAX} required
          value={name} onChange={(e) => { setName(e.target.value); form.onEdit(); }} error={form.errors.name} />
        <Field id="email" name="email" label="Correo" type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off"
          spellCheck={false} required
          value={email} onChange={(e) => { setEmail(e.target.value); form.onEdit(); }} error={form.errors.email} />
        <Field id="password" name="password" label="Contraseña" type="password" autoComplete="new-password" required
          hint={`Mínimo ${PASSWORD_MIN} caracteres.`}
          value={password} onChange={(e) => { setPassword(e.target.value); form.onEdit(); }} error={form.errors.password} />

        {form.message && (
          <p ref={form.messageRef} tabIndex={-1} className={styles.formError} role="alert">
            <span aria-hidden="true">⚠ </span>{form.message}
          </p>
        )}

        <button type="submit" className={styles.cta} aria-disabled={!valid || pending} onClick={form.onSubmitClick}>
          {pending ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        <p className={styles.switch}>¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
      </form>
    </>
  );
}
