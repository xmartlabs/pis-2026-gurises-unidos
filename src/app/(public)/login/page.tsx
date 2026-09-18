import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-20">
      <p className="text-muted-foreground text-xs tracking-widest uppercase">Panel interno</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Iniciar sesión</h1>
      <LoginForm />
    </main>
  );
}
