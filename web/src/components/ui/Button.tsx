import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'outline';

type Shared = {
  /** primary = relleno magenta (acción principal, solo una por pantalla); outline = acción secundaria. */
  variant?: Variant;
  /** Ocupa todo el ancho disponible. */
  fullWidth?: boolean;
  /** Para ajustes de colocación del contenedor (margen, flex), nunca de aspecto. */
  className?: string;
  children: ReactNode;
};

function classes({ variant = 'primary', fullWidth, className }: Omit<Shared, 'children'>) {
  return [styles.btn, styles[variant], fullWidth ? styles.full : '', className ?? ''].filter(Boolean).join(' ');
}

type ButtonProps = Shared & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

/** Botón. `type` es "button" por defecto: los de envío de formulario deben pedir type="submit". */
export function Button({ variant, fullWidth, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, fullWidth, className })} {...rest}>
      {children}
    </button>
  );
}

/** Enlace con aspecto de botón. */
export function ButtonLink({
  variant,
  fullWidth,
  className,
  children,
  href,
}: Shared & { href: string }) {
  return (
    <Link href={href} className={classes({ variant, fullWidth, className })}>
      {children}
    </Link>
  );
}
