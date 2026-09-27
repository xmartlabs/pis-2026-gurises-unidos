import type { Prisma } from '@/generated/prisma/client';
import { UserRole, UserStatus } from '@/generated/prisma/enums';
import prisma from './prisma';

const PASSWORD_LENGTH = 8;
const UPPERCASE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE_CHARACTERS = 'abcdefghijkmnopqrstuvwxyz';
const DIGIT_CHARACTERS = '23456789';
const PASSWORD_CHARACTERS = `${UPPERCASE_CHARACTERS}${LOWERCASE_CHARACTERS}${DIGIT_CHARACTERS}`;

export function generateTemporaryPassword() {
  const passwordCharacters = [
    getRandomCharacter(UPPERCASE_CHARACTERS),
    getRandomCharacter(LOWERCASE_CHARACTERS),
    getRandomCharacter(DIGIT_CHARACTERS),
    ...Array.from({ length: PASSWORD_LENGTH - 3 }, () => getRandomCharacter(PASSWORD_CHARACTERS)),
  ];

  for (let index = 1; index < passwordCharacters.length; index += 1) {
    const randomIndex = getRandomIndex(index + 1);

    [passwordCharacters[index], passwordCharacters[randomIndex]] = [
      passwordCharacters[randomIndex],
      passwordCharacters[index],
    ];
  }

  return passwordCharacters.join('');
}

function getRandomCharacter(characters: string) {
  const randomIndex = getRandomIndex(characters.length);
  return characters[randomIndex];
}

function getRandomIndex(length: number) {
  return Math.floor(Math.random() * length);
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
  const searchTerms = search?.trim().split(/\s+/).filter(Boolean) ?? [];

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(searchTerms.length > 0
      ? {
          AND: searchTerms.map((term) => ({
            OR: [
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
            ],
          })),
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

type UserListSearchParams = Record<string, string | string[] | undefined>;

const NOT_DELETED_WHERE = { deletedAt: null };

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isUserRole(value?: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

function isUserStatus(value?: string): value is UserStatus {
  return Object.values(UserStatus).includes(value as UserStatus);
}

export function parseUserListFilters(searchParams: UserListSearchParams): UserListFilters {
  const role = firstValue(searchParams.role);
  const status = firstValue(searchParams.status);

  return {
    search: firstValue(searchParams.q),
    role: isUserRole(role) ? role : undefined,
    status: isUserStatus(status) ? status : undefined,
    sortBy: resolveSortBy(firstValue(searchParams.sort)),
  };
}

export async function getUserStats() {
  const [total, admins, coordinators, pendingInvitations] = await Promise.all([
    prisma.user.count({ where: NOT_DELETED_WHERE }),
    prisma.user.count({ where: { ...NOT_DELETED_WHERE, role: 'admin' } }),
    prisma.user.count({ where: { ...NOT_DELETED_WHERE, role: 'coordinator' } }),
    prisma.user.count({ where: { ...NOT_DELETED_WHERE, status: 'pendingInvitation' } }),
  ]);

  return { total, admins, coordinators, pendingInvitations };
}
