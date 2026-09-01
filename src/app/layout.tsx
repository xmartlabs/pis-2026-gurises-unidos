import type { Metadata } from "next"
import { Bricolage_Grotesque, Geist, IBM_Plex_Mono } from "next/font/google"
import { Header } from "@/components/header"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
})

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Gurises Unidos — Alcance",
  description:
    "Alcance poblacional de los proyectos de Gurises Unidos: niñas, niños, adolescentes, familias e instituciones.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${bricolage.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line px-6 py-8 text-center font-mono text-[11px] text-ink-3">
          Prototipo de navegación · datos de ejemplo · Proyecto de Ingeniería de Software 2026
        </footer>
      </body>
    </html>
  )
}
