import { ButtonLink } from '@/components/ui/Button';
import { StatusScreen } from '@/components/ui/StatusScreen';

export default function NotFound() {
  return (
    <StatusScreen
      title="No encontramos esta página"
      text="Puede que la noche ya no esté disponible o que el enlace esté mal."
    >
      <ButtonLink href="/">Ver las noches</ButtonLink>
    </StatusScreen>
  );
}
