"use server"

import { redirect } from "next/navigation"
import { createSession, destroySession } from "@/lib/session"

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()

  if (!email) {
    redirect("/login?error=1")
  }

  await createSession(email)
  redirect("/")
}

export async function logout() {
  await destroySession()
  redirect("/")
}
