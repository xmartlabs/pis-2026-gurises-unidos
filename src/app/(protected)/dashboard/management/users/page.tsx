import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UsersTable } from './users-table';

export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [users, total, admins, coordinators, pendingInvitations] =
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

  if (total === 1) {
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
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Todavía no hay usuarios registrados</EmptyTitle>
              <EmptyDescription>Cuando agregues personas al sistema, vas a verlas listadas acá con su rol y estado.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>Crear primer usuario</Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>

    );
  }

  else return (
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

        <div className="flex h-190 w-296.25 flex-col gap-5 pt-6 pr-6 pb-8 pl-6">

          <div className="grid h-27 w-284.25 grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{total}</CardTitle>
                <CardDescription>Total de usuarios</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{admins}</CardTitle>
                <CardDescription>Administradores</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{coordinators}</CardTitle>
                <CardDescription>Coordinadores</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{pendingInvitations}</CardTitle>
                <CardDescription>Invitaciones pendientes</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <UsersTable users={users} />
        </div>
      </div>
  );
}