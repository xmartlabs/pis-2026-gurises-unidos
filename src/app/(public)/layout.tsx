import { Header } from '@/components/header';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-public flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-border text-muted-foreground border-t px-6 py-8 text-center text-xs">
        Prototipo de navegación · datos de ejemplo · Proyecto de Ingeniería de Software 2026
      </footer>
    </div>
  );
}
