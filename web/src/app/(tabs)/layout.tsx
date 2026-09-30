import { BottomNav } from '@/components/BottomNav';

/** Pantallas con navegación inferior (Noches / Mis entradas / Cuenta). */
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="has-nav">
      {children}
      <BottomNav />
    </div>
  );
}
