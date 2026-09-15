'use client';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastAccess: Date | null;
};

type SortBy = 'name' | 'role' | 'status' | 'lastAccess';

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

const ROLE_FILTER_LABELS: Record<string, string> = {
  all: 'Todos los roles',
  admin: 'Administrador',
  coordinator: 'Coordinador',
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Todos los estados',
  active: 'Activo',
  pendingInvitation: 'Invitación pendiente',
  disabled: 'Deshabilitado',
};

const SORT_LABELS: Record<SortBy, string> = {
  name: 'Ordenar: Nombre',
  role: 'Ordenar: Rol',
  status: 'Ordenar: Estado',
  lastAccess: 'Ordenar: Último acceso',
};

function fullName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}

function formatLastAccess(lastAccess: Date | null) {
  if (!lastAccess) return 'Nunca';
  return new Date(lastAccess).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatUserCount(count: number) {
  if (count === 0) return 'No hay resultados';
  if (count === 1) return '1 usuario';
  return `${count} usuarios`;
}

function matchesFilters(
  user: User,
  { search, roleFilter, statusFilter }: { search: string; roleFilter: string; statusFilter: string }
) {
  const term = search.trim().toLowerCase();
  const matchesSearch =
    !term ||
    fullName(user).toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term);
  const matchesRole = roleFilter === 'all' || user.role === roleFilter;
  const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

  return matchesSearch && matchesRole && matchesStatus;
}

function compareUsers(a: User, b: User, sortBy: SortBy) {
  switch (sortBy) {
    case 'role':
      return a.role.localeCompare(b.role);
    case 'status':
      return a.status.localeCompare(b.status);
    case 'lastAccess':
      return (b.lastAccess?.getTime() ?? 0) - (a.lastAccess?.getTime() ?? 0);
    case 'name':
      return fullName(a).localeCompare(fullName(b));
  }
}

function UserActionsMenu({ actionsEnabled }: { actionsEnabled: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" disabled={!actionsEnabled}>
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 max-h-104 rounded-md border">
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
  );
}

export function UsersTable({ users, actionsEnabled = true }: { users: User[]; actionsEnabled?: boolean }) {
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

  return (
    <>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 md:w-auto">
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

          <div className="hidden gap-2 md:flex">
            {roleSelect}
            {statusSelect}
            {sortSelect}
          </div>

          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" className="shrink-0 md:hidden">
                  Filtros
                </Button>
              }
            />
            <PopoverContent align="end" className="flex w-64 flex-col gap-2">
              {roleSelect}
              {statusSelect}
              {sortSelect}
            </PopoverContent>
          </Popover>
        </div>

        <span className="hidden text-sm leading-5 font-normal tracking-normal md:inline">
          {formatUserCount(filteredUsers.length)}
        </span>
      </div>

      <div className="flex max-h-130 flex-col gap-3 overflow-y-auto md:hidden">
        {filteredUsers.length === 0 && (
          <p className="rounded-[14px] border py-12 text-center text-muted-foreground">
            No se encontraron usuarios
          </p>
        )}
        {filteredUsers.map((user) => (
          <Card key={user.id} className="gap-3 py-4">
            <CardContent className="flex items-start justify-between gap-3 px-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{fullName(user)}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                <p className="mt-1 text-sm text-foreground">{ROLE_LABELS[user.role]}</p>
              </div>
              <UserActionsMenu actionsEnabled={actionsEnabled} />
            </CardContent>
            <CardContent className="flex items-center justify-between gap-3 px-4">
              <Badge className={STATUS_CLASSNAMES[user.status]}>{STATUS_LABELS[user.status]}</Badge>
              <span className="text-sm text-muted-foreground">{formatLastAccess(user.lastAccess)}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden w-full overflow-auto rounded-[14px] border md:block md:max-h-130">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-(--surface-subtle,#F5F5F5)">
              <TableHead className="h-10 w-56 px-4 py-2.5 text-muted-foreground">Nombre</TableHead>
              <TableHead className="h-10 w-80 px-4 py-2.5 text-muted-foreground">
                Correo electrónico
              </TableHead>
              <TableHead className="h-10 w-38 px-4 py-2.5 text-muted-foreground">Rol</TableHead>
              <TableHead className="h-10 w-38 px-4 py-2.5 text-muted-foreground">Estado</TableHead>
              <TableHead className="h-10 w-45 px-4 py-2.5 text-muted-foreground">
                Último acceso
              </TableHead>
              <TableHead className="h-10 w-26 px-4 py-2.5 text-right text-muted-foreground" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-120 text-center text-muted-foreground">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="h-15 truncate px-4 py-3 font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell className="h-15 truncate px-4 py-3 text-muted-foreground">
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
                  {formatLastAccess(user.lastAccess)}
                </TableCell>
                <TableCell className="h-15 px-4 py-3 text-right">
                  <UserActionsMenu actionsEnabled={actionsEnabled} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
