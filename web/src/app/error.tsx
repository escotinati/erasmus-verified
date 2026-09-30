'use client';

/** Fallo inesperado (p. ej. la ticketera no responde). No se muestra el detalle técnico al usuario. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container" style={{ paddingTop: 96, display: 'grid', gap: 16, textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem' }}>Algo ha ido mal</h1>
      <p style={{ margin: 0, color: 'var(--muted)' }}>No hemos podido cargar las noches. Inténtalo de nuevo en unos segundos.</p>
      <button
        type="button"
        onClick={reset}
        style={{
          justifySelf: 'center', height: 56, padding: '0 32px', border: 0, borderRadius: 28,
          background: 'var(--primary)', color: '#fff', font: '700 1rem var(--font-body)', cursor: 'pointer',
        }}
      >
        Reintentar
      </button>
    </main>
  );
}
