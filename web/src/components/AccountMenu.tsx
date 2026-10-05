'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { signOutAction } from '@/lib/auth/actions';
import styles from './SiteHeader.module.css';

/**
 * Botón «Mi cuenta» con desplegable (Mi cuenta / Cerrar sesión). Sin sesión es un enlace a /login.
 * Patrón «disclosure»: un botón con aria-expanded que abre una lista de enlaces (no un role="menu",
 * que exigiría navegación con flechas). Se cierra con Escape, al pulsar fuera o al cambiar de ruta.
 */
export function AccountMenu({ loggedIn, initial, isAdmin = false }: { loggedIn: boolean; initial: string; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Al navegar se cierra (el header persiste entre rutas, el estado no se reinicia solo).
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!loggedIn) {
    return (
      <Link href="/login" className={styles.account}>
        <span className={styles.avatar}><Icon name="user" size={16} /></span>
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div ref={rootRef} className={styles.accountWrap}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.account}
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Con sesión: inicial del nombre + punto verde. El punto es decorativo; el estado se dice en texto. */}
        <span className={styles.avatar}>
          {initial ? <span aria-hidden="true" className={styles.initial}>{initial}</span> : <Icon name="user" size={16} />}
          <span aria-hidden="true" className={styles.statusDot} />
        </span>
        Mi cuenta
        <span className="sr-only">, sesión iniciada</span>
      </button>
      {open && (
        <div id="account-menu" className={styles.menu}>
          <Link href="/cuenta" className={styles.menuItem}>Mi cuenta</Link>
          {/* Solo admins. Es un atajo: la autorización real está en cada página de /admin. */}
          {isAdmin && <Link href="/admin" className={styles.menuItem}>Panel de administrador</Link>}
          <form action={signOutAction}>
            <button type="submit" className={styles.menuItem}>Cerrar sesión</button>
          </form>
        </div>
      )}
    </div>
  );
}
