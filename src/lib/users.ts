import type { Prisma } from '@/generated/prisma/client';
import { UserRole, UserStatus } from '@/generated/prisma/enums';
import prisma from './prisma';

export function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export type UserSortBy = 'name' | 'role' | 'status' | 'lastAccess';

export type UserListFilters = {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: string;
};

export type UserListItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastAccess: Date | null;
};

const ORDER_BY: Record<UserSortBy, Prisma.UserOrderByWithRelationInput[]> = {
  name: [{ firstName: 'asc' }, { lastName: 'asc' }],
  role: [{ role: 'asc' }],
  status: [{ status: 'asc' }],
  lastAccess: [{ lastAccess: { sort: 'desc', nulls: 'last' } }],
};

function resolveSortBy(sortBy?: string): UserSortBy {
  return sortBy === 'role' || sortBy === 'status' || sortBy === 'lastAccess' ? sortBy : 'name';
}

export async function getUserList(filters: UserListFilters = {}): Promise<UserListItem[]> {
  const { search, role, status, sortBy } = filters;
  const trimmedSearch = search?.trim();

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(trimmedSearch
      ? {
          OR: [
            { firstName: { contains: trimmedSearch, mode: 'insensitive' } },
            { lastName: { contains: trimmedSearch, mode: 'insensitive' } },
            { email: { contains: trimmedSearch, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      lastAccess: true,
    },
    orderBy: ORDER_BY[resolveSortBy(sortBy)],
  });
}
