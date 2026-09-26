'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import {
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_CLASSNAMES,
  ROLE_FILTER_LABELS,
  STATUS_FILTER_LABELS,
  SORT_LABELS,
  SORT_VALUE_LABELS,
  type SortBy,
} from '@/lib/users/constants';
import {
  fullName,
  formatDate,
  formatUserCount,
  matchesFilters,
  compareUsers,
  type User,
} from '@/lib/users/format';

function UserActionsMenu({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Acciones para ${fullName(user)}`}>
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="max-h-104 w-56 rounded-md border">
        <DropdownMenuItem
          render={<Link href={`/management/users/${user.id}/edit`} />}
          className="text-popover-foreground font-sans text-sm leading-5 font-medium tracking-normal"
        >
          Editar
        </DropdownMenuItem>
        {/* <DropdownMenuItem className="text-popover-foreground font-sans text-sm leading-5 font-medium tracking-normal">
          Restablecer contraseña
        </DropdownMenuItem> */}
        {/* <DropdownMenuItem className="text-popover-foreground font-sans text-sm leading-5 font-medium tracking-normal">
          Desactivar
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        {/* <DropdownMenuItem
          variant="destructive"
          className="h-8 w-54 gap-2 rounded-sm px-2 py-1.5 font-sans text-sm leading-5 font-medium tracking-normal"
        >
          Eliminar
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UsersTable({ users }: { users: User[] }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');

  const filteredUsers = users
    .filter((user) => matchesFilters(user, { search, roleFilter, statusFilter }))
    .sort((a, b) => compareUsers(a, b, sortBy));

  const roleSelect = (
    <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value ?? 'all')}>
      <SelectTrigger>
        <SelectValue>{(value: string) => ROLE_FILTER_LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los roles</SelectItem>
        <SelectItem value="admin">Administrador</SelectItem>
        <SelectItem value="coordinator">Coordinador</SelectItem>
      </SelectContent>
    </Select>
  );

  const statusSelect = (
    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? 'all')}>
      <SelectTrigger>
        <SelectValue>{(value: string) => STATUS_FILTER_LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los estados</SelectItem>
        <SelectItem value="active">Activo</SelectItem>
        <SelectItem value="pendingInvitation">Invitación pendiente</SelectItem>
        <SelectItem value="disabled">Deshabilitado</SelectItem>
      </SelectContent>
    </Select>
  );

  const sortSelect = (
    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
      <SelectTrigger>
        <SelectValue>{(value: SortBy) => SORT_LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name">Nombre</SelectItem>
        <SelectItem value="role">Rol</SelectItem>
        <SelectItem value="status">Estado</SelectItem>
        <SelectItem value="lastAccess">Último acceso</SelectItem>
      </SelectContent>
    </Select>
  );

  const mobileSortSelect = (
    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
      <SelectTrigger>
        <SelectValue>{(value: SortBy) => SORT_VALUE_LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name">Nombre</SelectItem>
        <SelectItem value="role">Rol</SelectItem>
        <SelectItem value="status">Estado</SelectItem>
        <SelectItem value="lastAccess">Último acceso</SelectItem>
      </SelectContent>
    </Select>
  );

  function clearFilters() {
    setRoleFilter('all');
    setStatusFilter('all');
    setSortBy('name');
  }

  return (
    <>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 xl:w-auto">
          <InputGroup className="h-9 min-w-0 flex-1 rounded-md sm:w-80 sm:flex-none">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <div className="hidden gap-2 xl:flex">
            {roleSelect}
            {statusSelect}
            {sortSelect}
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" className="shrink-0 xl:hidden">
                  Filtros
                </Button>
              }
            />
            <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl">
              <div className="bg-muted mx-auto mt-2 h-1.5 w-10 rounded-full" />

              <div className="flex items-center justify-between px-4 pt-2">
                <SheetTitle className="text-lg">Filtros</SheetTitle>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-muted-foreground text-sm"
                >
                  Limpiar
                </button>
              </div>

              <div className="flex flex-col gap-4 px-4 pb-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-foreground text-sm font-medium">Rol</span>
                  {roleSelect}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-foreground text-sm font-medium">Estado</span>
                  {statusSelect}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-foreground text-sm font-medium">Ordenar por</span>
                  {mobileSortSelect}
                </div>
              </div>

              <div className="p-4 pt-2">
                <SheetClose render={<Button className="w-full">Aplicar filtros</Button>} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <span className="hidden text-sm leading-5 font-normal tracking-normal md:inline">
          {formatUserCount(filteredUsers.length)}
        </span>
      </div>

      <div className="flex max-h-130 flex-col gap-3 overflow-y-auto xl:hidden">
        {filteredUsers.length === 0 && (
          <p className="text-muted-foreground rounded-[14px] border py-12 text-center">
            No se encontraron usuarios
          </p>
        )}
        {filteredUsers.map((user) => (
          <Card key={user.id} className="shrink-0 gap-3 py-4">
            <CardContent className="flex items-start justify-between gap-3 px-4">
              <div className="min-w-0">
                <p className="text-foreground truncate font-medium">{fullName(user)}</p>
                <p className="text-muted-foreground truncate text-sm">{user.email}</p>
                <p className="text-foreground mt-1 text-sm">{ROLE_LABELS[user.role]}</p>
              </div>
              <UserActionsMenu user={user} />
            </CardContent>
            <CardContent className="flex items-center justify-between gap-3 px-4">
              <Badge className={STATUS_CLASSNAMES[user.status]}>{STATUS_LABELS[user.status]}</Badge>
              <span className="text-muted-foreground text-sm">{formatDate(user.lastAccess)}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden w-full overflow-auto rounded-[14px] border xl:max-h-130 xl:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground h-10 w-56 px-4 py-2.5">Nombre</TableHead>
              <TableHead className="text-muted-foreground h-10 w-32 px-4 py-2.5">
                Correo electrónico
              </TableHead>
              <TableHead className="text-muted-foreground h-10 w-38 px-4 py-2.5">Rol</TableHead>
              <TableHead className="text-muted-foreground h-10 w-38 px-4 py-2.5">Estado</TableHead>
              <TableHead className="text-muted-foreground h-10 w-45 px-4 py-2.5">
                Último acceso
              </TableHead>
              <TableHead className="text-muted-foreground h-10 w-26 px-4 py-2.5 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="text-muted-foreground h-120 text-center">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-foreground h-15 truncate px-4 py-3 font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell className="text-muted-foreground h-15 truncate px-4 py-3">
                  {user.email}
                </TableCell>
                <TableCell className="text-foreground h-15 px-4 py-3">
                  {ROLE_LABELS[user.role]}
                </TableCell>
                <TableCell className="h-15 px-4 py-3">
                  <Badge className={STATUS_CLASSNAMES[user.status]}>
                    {STATUS_LABELS[user.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground h-15 px-4 py-3">
                  {formatDate(user.lastAccess)}
                </TableCell>
                <TableCell className="h-15 px-4 py-3 text-right">
                  <UserActionsMenu user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
