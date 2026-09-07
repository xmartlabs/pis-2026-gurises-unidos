import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { auth } from '@/auth';

export async function Header() {
  const session = await auth();

  return (
    <header className="border-line bg-paper/85 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          Gurises Unidos
          <span className="text-ink-3 ml-2 font-mono text-[11px] font-normal">alcance</span>
        </Link>
        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link href="/" className="text-ink-2 hover:text-ink hidden sm:inline">
            Alcance público
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard/projects" className="text-ink-2 hover:text-ink">
                Proyectos
              </Link>
              <Link href="/dashboard" className="text-ink-2 hover:text-ink">
                Panel interno
              </Link>
              <span className="text-ink-3 hidden font-mono text-xs sm:inline">
                {session.user.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="border-line text-ink-2 hover:border-ink-3 hover:text-ink rounded-full border px-3.5 py-1.5"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-deep text-on-deep rounded-full px-4 py-1.5 hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
