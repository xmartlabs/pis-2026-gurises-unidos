import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';

export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [users, total2222, admins, coordinators, pendingInvitations] =
  await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastAccess: true,
      },
      orderBy: [
        { id : 'asc' },
      ],
    }),

    prisma.user.count(),

    prisma.user.count({
      where: {
        role: 'admin',
      },
    }),

    prisma.user.count({
      where: {
        role: 'coordinator',
      },
    }),

    prisma.user.count({
      where: {
        status: 'pendingInvitation',
      },
    }),
  ]);

  /* valor 0 para debugging */
  const total = 0;
  if (total === 0) {
    return (
      <div className="mx-auto max-w-296.25">
        <div className="flex h-30.5 w-full items-start justify-between gap-1.5 pt-6 pr-6 pb-2.5 pl-6">
          <div className="flex flex-col">
            <span className="h-5 w-24.5 text-sm tracking-normal text-muted-foreground">
              Administración
            </span>
            <span className="h-9 w-31.75 text-3xl font-semibold tracking-tight">
              Usuarios
            </span>
            <span className="h-5 w-87.25 text-sm tracking-normal text-muted-foreground">
              Administrá las personas que tienen acceso al sistema.
            </span>
          </div>

          <Button size="lg" className="h-9 w-35.5 gap-2.5 px-4 py-2">
            + Nuevo usuario
          </Button>
        </div>

        <div className="flex h-83 w-296.25 gap-5 pt-6 pr-6 pb-8 pl-6">
          <span className="h-9 w-31.75 text-3xl font-semibold tracking-tight">
              Usuarios
          </span>
        </div>
      </div>

    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-muted-foreground text-xs tracking-widest uppercase">
        Gestión / Usuarios
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Usuarios</h1>
    </div>
  );
}