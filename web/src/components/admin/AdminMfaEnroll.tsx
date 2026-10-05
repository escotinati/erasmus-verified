'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/auth/Field';
import {
  confirmAdminEnrollAction,
  startAdminEnrollAction,
  type EnrollState,
  type MfaState,
} from '@/lib/auth/admin-actions';
import styles from '@/app/admin/admin.module.css';
import authStyles from '@/components/auth/auth.module.css';

const noState: EnrollState = {};
const noCode: MfaState = {};

/** «ABCD EFGH …»: el secreto en grupos de 4 para teclearlo a mano si no se puede escanear el QR. */
const grouped = (secret: string) => secret.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

/**
 * Alta del segundo factor en dos pasos: 1) generar el QR, 2) confirmar con el primer código.
 * El secreto vive solo en este estado de React mientras la pantalla está abierta.
 */
export function AdminMfaEnroll() {
  const [start, startAction, starting] = useActionState(
    (_prev: EnrollState) => startAdminEnrollAction(),
    noState,
  );
  const [confirm, confirmAction, confirming] = useActionState(confirmAdminEnrollAction, noCode);

  if (!start.qrCode) {
    return (
      <form action={startAction} className={authStyles.form}>
        {start.message && <p className={styles.alert} role="alert">⚠ {start.message}</p>}
        <Button type="submit" fullWidth aria-disabled={starting} onClick={(e) => starting && e.preventDefault()}>
          {starting ? 'Generando…' : 'Generar código QR'}
        </Button>
      </form>
    );
  }

  return (
    <>
      <div className={styles.qr}>
        {/* SVG de datos que genera Supabase (validado en el servidor); no es contenido de usuario */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={start.qrCode} alt="Código QR para tu app de autenticación" width={200} height={200} />
      </div>
      <p>¿No puedes escanearlo? Introduce esta clave a mano en la app:</p>
      <code className={styles.secret} translate="no">{grouped(start.secret ?? '')}</code>
      <form action={confirmAction} className={authStyles.form} noValidate>
        <Field
          id="code"
          name="code"
          label="Primer código de 6 dígitos"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          required
          autoFocus
          error={confirm.message}
        />
        <Button type="submit" fullWidth aria-disabled={confirming} onClick={(e) => confirming && e.preventDefault()}>
          {confirming ? 'Verificando…' : 'Activar verificación'}
        </Button>
      </form>
    </>
  );
}
