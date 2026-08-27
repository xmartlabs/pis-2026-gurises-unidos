import Link from "next/link"
import { logout } from "@/app/actions/auth"
import { getSession } from "@/lib/session"

export async function Header() {
  const session = await getSession()

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          Gurises Unidos
          <span className="ml-2 font-mono text-[11px] font-normal text-ink-3">
            alcance
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link href="/" className="hidden text-ink-2 hover:text-ink sm:inline">
            Alcance público
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-ink-2 hover:text-ink">
                Panel interno
              </Link>
              <span className="hidden font-mono text-xs text-ink-3 sm:inline">
                {session}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-line px-3.5 py-1.5 text-ink-2 hover:border-ink-3 hover:text-ink"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-deep px-4 py-1.5 text-on-deep hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
