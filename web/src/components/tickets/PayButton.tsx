'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';

/**
 * Botón de envío del pago. Mientras la acción está en curso queda "apagado" (aria-disabled, no
 * `disabled`, para no perder el foco) y bloquea un segundo toque: así un doble clic no la lanza dos veces.
 */
export function PayButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth aria-disabled={pending} onClick={(e) => pending && e.preventDefault()}>
      {pending ? 'Procesando…' : label}
    </Button>
  );
}
