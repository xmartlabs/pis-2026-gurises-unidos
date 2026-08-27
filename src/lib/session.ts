import "server-only"
import { cookies } from "next/headers"

const COOKIE_NAME = "session"

// ponytail: sesión falsa para el POC — guarda el email en texto plano, sin JWT ni cifrado.
// Reemplazar por auth real (verificación de credenciales + sesión firmada) cuando exista backend.
export async function createSession(email: string) {
  const cookie_store = await cookies()
  cookie_store.set(COOKIE_NAME, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  })
}

export async function getSession() {
  const cookie_store = await cookies()
  return cookie_store.get(COOKIE_NAME)?.value ?? null
}

export async function destroySession() {
  const cookie_store = await cookies()
  cookie_store.delete(COOKIE_NAME)
}
