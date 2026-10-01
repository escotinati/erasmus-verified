'use client';

import { Button } from '@/components/ui/Button';
import { StatusScreen } from '@/components/ui/StatusScreen';

/** Fallo inesperado (p. ej. la ticketera no responde). No se muestra el detalle técnico al usuario. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatusScreen title="Algo ha ido mal" text="No hemos podido cargar las noches. Inténtalo de nuevo en unos segundos.">
      <Button onClick={reset}>Reintentar</Button>
    </StatusScreen>
  );
}
