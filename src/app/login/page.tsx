import { login } from "@/app/actions/auth"

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-20">
      <p className="font-mono text-xs tracking-widest text-ink-3 uppercase">
        Panel interno
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        Iniciar sesión
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        Prototipo de navegación: cualquier correo y contraseña abren el panel. No hay
        autenticación real todavía.
      </p>

      {params.error ? (
        <p className="mt-6 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink">
          Escribí un correo para continuar.
        </p>
      ) : null}

      <form action={login} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          Correo
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="nombre@gurisesunidos.org.uy"
            className="rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none focus-visible:border-ink-3 focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Contraseña
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink outline-none focus-visible:border-ink-3 focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-full bg-deep px-6 py-3 text-sm text-on-deep hover:opacity-90"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
