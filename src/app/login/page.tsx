import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-20">
      <p className="text-ink-3 font-mono text-xs tracking-widest uppercase">Panel interno</p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">Iniciar sesión</h1>
      <LoginForm />
    </div>
  );
}
