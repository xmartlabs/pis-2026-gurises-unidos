import { redirect } from 'next/navigation';
import { MoreHorizontal, Search, Users } from 'lucide-react';
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordinador',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  pendingInvitation: 'Invitación pendiente',
  disabled: 'Deshabilitado',
};

const STATUS_CLASSNAMES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pendingInvitation: 'bg-amber-100 text-amber-700',
  disabled: 'bg-muted text-muted-foreground',
};

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

          <div className="flex h-9 w-284.25 justify-between">
            <div className="flex h-9 w-221 gap-2">
              <InputGroup className="h-9 w-80 rounded-md">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput placeholder="Buscar por nombre o correo..." />
              </InputGroup>

              <Select defaultValue="Todos los roles">
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rol: Todos">Todos los roles</SelectItem>
                  <SelectItem value="Rol: Administrador">Administrador</SelectItem>
                  <SelectItem value="Rol: Coordinador">Coordinador</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="Todos los estados">
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estado: Todos">Todos los estados</SelectItem>
                  <SelectItem value="Estado: Activo">Activo</SelectItem>
                  <SelectItem value="Estado: Pendiente">Invitación pendiente</SelectItem>
                  <SelectItem value="Estado: Deshabilitado">Deshabilitado</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="Ordenar: Nombre">
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar: Nombre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orden: Nombre">Nombre</SelectItem>
                  <SelectItem value="Orden: Rol">Rol </SelectItem>
                  <SelectItem value="Orden: Estado">Estado</SelectItem>
                  <SelectItem value="Orden: Último acceso">Último acceso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="h-5 w-16.75 font-sans text-sm leading-5 font-normal tracking-normal">
              {total} usuarios (placeholder)
            </span>
          </div>

          <div className="h-130 w-284.25 overflow-hidden rounded-[14px] border">
            <Table>
              <TableHeader>
                <TableRow className="bg-(--surface-subtle,#F5F5F5)">
                  <TableHead className="h-10 px-4 py-2.5 text-muted-foreground">Nombre</TableHead>
                  <TableHead className="h-10 px-4 py-2.5 text-muted-foreground">
                    Correo electrónico
                  </TableHead>
                  <TableHead className="h-10 px-4 py-2.5 text-muted-foreground">Rol</TableHead>
                  <TableHead className="h-10 px-4 py-2.5 text-muted-foreground">Estado</TableHead>
                  <TableHead className="h-10 px-4 py-2.5 text-muted-foreground">
                    Último acceso
                  </TableHead>
                  <TableHead className="h-10 px-4 py-2.5 text-right text-muted-foreground" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="h-15 px-4 py-3 font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="h-15 px-4 py-3 text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="h-15 px-4 py-3 text-foreground">
                      {ROLE_LABELS[user.role]}
                    </TableCell>
                    <TableCell className="h-15 px-4 py-3">
                      <Badge className={STATUS_CLASSNAMES[user.status]}>
                        {STATUS_LABELS[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-15 px-4 py-3 text-muted-foreground">
                      {user.lastAccess
                        ? new Date(user.lastAccess).toLocaleDateString('es-UY', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'Nunca'}
                    </TableCell>
                    <TableCell className="h-15 px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          }
                        />
                        <DropdownMenuContent
                          align="end"
                          className="w-56 max-h-104 rounded-md border"
                        >
                          <DropdownMenuItem className="font-sans text-sm leading-5 font-medium tracking-normal text-popover-foreground">
                            Acciones
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-sans text-sm leading-5 font-medium tracking-normal text-popover-foreground">
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-sans text-sm leading-5 font-medium tracking-normal text-popover-foreground">
                            Restablecer contraseña
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-sans text-sm leading-5 font-medium tracking-normal text-popover-foreground">
                            Desactivar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            className="h-8 w-54 gap-2 rounded-sm px-2 py-1.5 font-sans text-sm leading-5 font-medium tracking-normal"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
  );
}