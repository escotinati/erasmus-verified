import Link from 'next/link';
import { Icon } from '@/components/Icon';
import styles from './BackButton.module.css';

/**
 * Flecha de volver, con zona táctil de 44 px.
 * `overlay`: para colocarla sobre una imagen o degradado (fondo semitransparente).
 * `text`: enlace con texto visible junto a la flecha (en vez de solo el icono).
 */
export function BackButton({
  href = '/',
  label,
  overlay = false,
  text,
}: {
  href?: string;
  label: string;
  overlay?: boolean;
  text?: string;
}) {
  const classes = [styles.back, overlay ? styles.overlay : '', text ? styles.withText : ''].filter(Boolean).join(' ');
  return (
    <Link href={href} className={classes} aria-label={label}>
      <Icon name="back" size={24} />
      {text}
    </Link>
  );
}
