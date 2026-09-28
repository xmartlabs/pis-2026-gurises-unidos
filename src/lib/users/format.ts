import type { User as PrismaUser } from '@/generated/prisma/client';
import { ROLE_LABELS, STATUS_LABELS, type SortBy } from '@/lib/users/constants';

export type User = Pick<
  PrismaUser,
  'id' | 'firstName' | 'lastName' | 'email' | 'role' | 'status' | 'lastAccess'
>;

export function fullName(user: Pick<PrismaUser, 'firstName' | 'lastName'>) {
  return `${user.firstName} ${user.lastName}`;
}

export function formatDate(date: Date | null) {
  if (!date) return 'Nunca';
  return new Date(date).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Montevideo',
  });
}

export function formatUserDate(date: Date | null) {
  if (!date) return '—';
  return formatDate(date);
}

export function formatUserCount(count: number) {
  if (count === 0) return 'No hay resultados';
  if (count === 1) return '1 usuario';
  return `${count} usuarios`;
}

export function matchesFilters(
  user: User,
  { search, roleFilter, statusFilter }: { search: string; roleFilter: string; statusFilter: string }
) {
  const term = search.trim().toLowerCase();
  const matchesSearch =
    !term || fullName(user).toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
  const matchesRole = roleFilter === 'all' || user.role === roleFilter;
  const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

  return matchesSearch && matchesRole && matchesStatus;
}

export function compareUsers(a: User, b: User, sortBy: SortBy) {
  switch (sortBy) {
    case 'role':
      return (
        ROLE_LABELS[a.role].localeCompare(ROLE_LABELS[b.role]) ||
        fullName(a).localeCompare(fullName(b))
      );
    case 'status':
      return (
        STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status]) ||
        fullName(a).localeCompare(fullName(b))
      );
    case 'lastAccess':
      return (b.lastAccess?.getTime() ?? 0) - (a.lastAccess?.getTime() ?? 0);
    case 'name':
      return fullName(a).localeCompare(fullName(b));
  }
}
