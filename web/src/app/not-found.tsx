import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container" style={{ paddingTop: 96, display: 'grid', gap: 16, textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.75rem' }}>No encontramos esta página</h1>
      <p style={{ margin: 0, color: 'var(--muted)' }}>Puede que la noche ya no esté disponible o que el enlace esté mal.</p>
      <Link
        href="/"
        style={{
          justifySelf: 'center', display: 'inline-flex', alignItems: 'center', height: 56, padding: '0 32px',
          borderRadius: 28, background: 'var(--primary)', color: '#fff', fontWeight: 700,
        }}
      >
        Ver las noches
      </Link>
    </main>
  );
}
