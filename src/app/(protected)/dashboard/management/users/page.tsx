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

const USERS_MANAGEMENT_FINALIZED = false;

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
      <div className="mx-auto w-full max-w-296.25">
        <div className="flex w-full flex-col items-start justify-between gap-3 px-4 pt-6 pb-2.5 sm:flex-row sm:px-6">
          <div className="flex flex-col">
            <span className="text-sm tracking-normal text-muted-foreground">
              Administración
            </span>
            <span className="text-3xl font-semibold tracking-tight">
              Usuarios
            </span>
            <span className="text-sm tracking-normal text-muted-foreground">
              Administrá las personas que tienen acceso al sistema.
            </span>
          </div>

          {USERS_MANAGEMENT_FINALIZED && (
            <Button size="lg" className="h-9 gap-2.5 px-4 py-2">
              + Nuevo usuario
            </Button>
          )}
        </div>

        <div className="flex w-full flex-col gap-5 px-4 pt-6 pb-8 sm:px-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Todavía no hay usuarios registrados</EmptyTitle>
              <EmptyDescription>Cuando agregues personas al sistema, vas a verlas listadas acá con su rol y estado.</EmptyDescription>
            </EmptyHeader>
            {USERS_MANAGEMENT_FINALIZED && (
              <EmptyContent>
                <Button>Crear primer usuario</Button>
              </EmptyContent>
            )}
          </Empty>
        </div>
      </div>

    );
  }

  else return (
      <div className="mx-auto w-full max-w-296.25">
        <div className="flex w-full flex-col items-start justify-between gap-3 px-4 pt-6 pb-2.5 sm:flex-row sm:px-6">
          <div className="flex flex-col">
            <span className="text-sm tracking-normal text-muted-foreground">
              Administración
            </span>
            <span className="text-3xl font-semibold tracking-tight">
              Usuarios
            </span>
            <span className="text-sm tracking-normal text-muted-foreground">
              Administrá las personas que tienen acceso al sistema.
            </span>
          </div>

          {USERS_MANAGEMENT_FINALIZED && (
            <Button size="lg" className="h-9 gap-2.5 px-4 py-2">
              + Nuevo usuario
            </Button>
          )}
        </div>

        <div className="flex w-full flex-col gap-5 px-4 pt-6 pb-8 sm:px-6">

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

          <UsersTable users={users} actionsEnabled={USERS_MANAGEMENT_FINALIZED} />
        </div>
      </div>
  );
}