'use client';

import { useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  ROLE_FILTER_LABELS,
  STATUS_FILTER_LABELS,
  SORT_LABELS,
  SORT_VALUE_LABELS,
  type SortBy,
} from '@/lib/users/constants';
import { formatUserCount } from '@/lib/users/format';
import type { UserListFilters } from '@/lib/users';

const SEARCH_DEBOUNCE_MS = 300;

export function UsersListToolbar({
  filters,
  filteredCount,
}: {
  filters: UserListFilters;
  filteredCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(filters.search ?? '');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const roleFilter = filters.role ?? 'all';
  const statusFilter = filters.status ?? 'all';
  const sortBy = (filters.sortBy ?? 'name') as SortBy;

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(
      () => updateParams({ q: value.trim() || null }),
      SEARCH_DEBOUNCE_MS
    );
  }

  function clearFilters() {
    updateParams({ role: null, status: null, sort: null });
  }

  const roleSelect = (
    <Select value={roleFilter} onValueChange={(value) => updateParams({ role: value })}>
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
    <Select value={statusFilter} onValueChange={(value) => updateParams({ status: value })}>
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
    <Select value={sortBy} onValueChange={(value) => updateParams({ sort: value })}>
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
    <Select value={sortBy} onValueChange={(value) => updateParams({ sort: value })}>
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

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full items-center gap-2 xl:w-auto">
        <InputGroup className="h-9 min-w-0 flex-1 rounded-md sm:w-80 sm:flex-none">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
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
        {formatUserCount(filteredCount)}
      </span>
    </div>
  );
}
