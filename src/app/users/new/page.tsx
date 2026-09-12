import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { UserForm } from '@/components/user-form';

export default async function NewUserPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-full w-full bg-[#fafafb]">
      <header className="border-border border-b px-6 py-4">
        <p className="text-muted-foreground text-sm">Administración</p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Nuevo usuario</h1>

        <p className="text-muted-foreground mt-1 text-sm">
          Administrá el acceso de las personas que utilizan el sistema.
        </p>
      </header>

      <main className="px-6">
        <UserForm />
      </main>
    </div>
  );
}
