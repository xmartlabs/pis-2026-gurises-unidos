import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { UserForm } from '@/components/user-form';
import {Link} from "next/link";

export default async function NewUserPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard/projects');
  }

  return (
    <div className="bg-primary-foreground flex w-full flex-1 flex-col">
      <div className="flex w-full flex-1 flex-col">
        <header className="flex h-30 w-full flex-col gap-1.5 px-6 pt-6 pb-2.5">
          <p className="text-muted-foreground h-5 text-sm leading-5 font-normal tracking-normal">
            Administración
          </p>
          <Link href="/users/new">
            <h1 className="text-popover-foreground h-9 text-3xl leading-9 font-bold tracking-normal">
              Nuevo usuario
            </h1>
          </Link>

          <p className="text-muted-foreground h-4.5 text-sm leading-4.5 font-normal tracking-normal">
            Administrá el acceso de las personas que utilizan el sistema.
          </p>
        </header>

        <div className="flex flex-1 flex-col">
          <UserForm />
        </div>
      </div>
    </div>
  );
}
