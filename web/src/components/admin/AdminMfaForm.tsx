'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/auth/Field';
import { verifyAdminMfaAction, type MfaState } from '@/lib/auth/admin-actions';
import styles from '@/components/auth/auth.module.css';

const initial: MfaState = {};

/** Código TOTP de 6 dígitos. Enter envía el formulario (envío implícito). */
export function AdminMfaForm() {
  const [state, action, pending] = useActionState(verifyAdminMfaAction, initial);
  return (
    <form action={action} className={styles.form} noValidate>
      <Field
        id="code"
        name="code"
        label="Código"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7} // admite «123 456» al pegar; el servidor quita los espacios
        required
        autoFocus
        error={state.message}
      />
      <Button type="submit" fullWidth aria-disabled={pending} onClick={(e) => pending && e.preventDefault()}>
        {pending ? 'Verificando…' : 'Verificar'}
      </Button>
    </form>
  );
}
