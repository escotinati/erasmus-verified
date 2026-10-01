import Link from 'next/link';
import { Icon } from '@/components/Icon';
import styles from './BackButton.module.css';

/**
 * Flecha de volver, con zona táctil de 44 px.
 * `overlay`: para colocarla sobre una imagen o degradado (fondo semitransparente).
 */
export function BackButton({ href = '/', label, overlay = false }: { href?: string; label: string; overlay?: boolean }) {
  return (
    <Link href={href} className={`${styles.back} ${overlay ? styles.overlay : ''}`} aria-label={label}>
      <Icon name="back" size={24} />
    </Link>
  );
}
