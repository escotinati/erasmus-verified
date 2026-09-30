'use client';

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import type { AuthState } from '@/lib/auth/actions';
import type { FieldErrors } from '@/lib/auth/validation';

/**
 * Comportamiento común de los formularios de cuenta:
 * - Botón "apagado" con aria-disabled (no `disabled`): sigue en el orden de tabulación, el
 *   lector de pantalla lo anuncia, y al pulsarlo se muestran los errores junto a cada campo
 *   en lugar de dejar al usuario sin explicación.
 * - La validez se recalcula desde el DOM al pulsar (no solo desde el estado de React), para no
 *   dejar bloqueado el formulario si un gestor de contraseñas/autofill no disparó `onChange`.
 * - Los errores del servidor desaparecen en cuanto el usuario vuelve a escribir.
 * - El foco va al primer campo con error, o al mensaje/título tras un resultado.
 */
export function useAuthForm(
  state: AuthState,
  pending: boolean,
  validateAll: (values: Record<string, string>) => FieldErrors,
) {
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [dismissed, setDismissed] = useState<AuthState | null>(null);

  const live = dismissed === state ? {} : state; // resultado del servidor aún vigente
  const errors: FieldErrors = { ...clientErrors, ...live.errors };

  const readValues = () => {
    const data = new FormData(formRef.current!);
    return Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v)]));
  };

  /** Llamar en el onChange de cada campo. */
  const onEdit = () => {
    setDismissed(state);
    setClientErrors({});
  };

  const onSubmitClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (pending) return event.preventDefault();
    const found = validateAll(readValues());
    if (Object.values(found).some(Boolean)) {
      event.preventDefault();
      setClientErrors(found);
      setDismissed(state);
    }
  };

  // Enter con el botón "apagado": el envío implícito dispara el click del botón, que ya se controla.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (pending) event.preventDefault();
  };

  // Foco tras un error (cliente o servidor): primer campo inválido, o el mensaje general.
  useEffect(() => {
    if (state.sent) return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) invalid.focus();
    else if (live.message) messageRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, clientErrors]);

  return { formRef, messageRef, errors, message: live.message, onEdit, onSubmitClick, onSubmit };
}
