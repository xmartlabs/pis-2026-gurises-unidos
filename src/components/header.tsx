import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { auth } from '@/auth';

export async function Header() {
  const session = await auth();

  return (
    <header className="border-border bg-background/85 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Gurises Unidos
          <span className="text-muted-foreground ml-2 text-xs font-normal">alcance</span>
        </Link>
        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground hidden sm:inline">
            Alcance público
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/dashboard/projects"
                className="text-muted-foreground hover:text-foreground"
              >
                Proyectos
              </Link>
              <span className="text-muted-foreground hidden text-xs sm:inline">
                {session.user.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground rounded-full border px-3.5 py-1.5"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
