import Link from 'next/link';
import { Menu } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { auth } from '@/auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10" style={{ backgroundColor: '#0E3A2E' }}>
      <div className="flex h-16 items-center justify-between px-4 sm:px-16">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex size-6 items-center justify-center rounded bg-orange-500 text-xs">
            {/* logo icon, placeholder */}
          </span>
          <span className="text-base font-medium">Gurises Unidos</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm text-emerald-100 sm:flex">
          <Link
            href={session?.user ? '/dashboard/projects' : '#proyectos'}
            className="hover:text-white"
          >
            Proyectos
          </Link>
          <Link href="#impacto" className="hover:text-white">
            Impacto 2026
          </Link>
          <Link href="#sobre-nosotros" className="hover:text-white">
            Sobre nosotros
          </Link>
          {session?.user ? (
            <>
              <span className="text-xs text-emerald-300">{session.user.email}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-emerald-700 px-3.5 py-1.5 hover:border-emerald-400 hover:text-white"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white px-4 py-1.5 text-sm text-emerald-950 hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger className="text-white sm:hidden" aria-label="Abrir menú">
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 px-4 text-sm">
              <Link href={session?.user ? '/dashboard/projects' : '#proyectos'}>Proyectos</Link>
              <Link href="#impacto">Impacto 2026</Link>
              <Link href="#sobre-nosotros">Sobre nosotros</Link>
              {session?.user ? (
                <>
                  <span className="text-muted-foreground text-xs">{session.user.email}</span>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="border-border rounded-full border px-3.5 py-1.5 text-left"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-center"
                >
                  Iniciar sesión
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
