"use server"

import { redirect } from "next/navigation"
import { createSession, destroySession } from "@/lib/session"

export async function login(form_data: FormData) {
  const email = String(form_data.get("email") ?? "").trim()

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
