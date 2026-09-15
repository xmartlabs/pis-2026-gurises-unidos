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

export function UsersTable({ users, actionsEnabled = true }: { users: User[]; actionsEnabled?: boolean }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');

  const filteredUsers = users
    .filter((user) => matchesFilters(user, { search, roleFilter, statusFilter }))
    .sort((a, b) => compareUsers(a, b, sortBy));

  return (
    <>
      <div className="flex h-9 w-284.25 justify-between">
        <div className="flex h-9 w-221 gap-2">
          <InputGroup className="h-9 w-80 rounded-md">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

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
        </div>

        <span className="h-5 font-sans text-sm leading-5 font-normal tracking-normal">
          {formatUserCount(filteredUsers.length)}
        </span>
      </div>

      <div className="h-130 w-284.25 overflow-y-auto rounded-[14px] border">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
