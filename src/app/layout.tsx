import type { Metadata } from 'next';
import { Mulish } from 'next/font/google';
import { Header } from '@/components/header';
import './globals.css';

const mulish = Mulish({
  variable: '--font-mulish',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gurises Unidos — Alcance',
  description:
    'Alcance poblacional de los proyectos de Gurises Unidos: niñas, niños, adolescentes, familias e instituciones.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${mulish.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-border text-muted-foreground border-t px-6 py-8 text-center text-xs">
          Prototipo de navegación · datos de ejemplo · Proyecto de Ingeniería de Software 2026
        </footer>
      </body>
    </html>
  );
}
