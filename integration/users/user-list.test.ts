import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { getUserList, getUserStats } from '@/lib/users/list';
import { hashPassword } from '@/lib/credentials';
import prisma from '@/lib/prisma';
import type { User } from '@/generated/prisma/client';

const SEARCH_TERM = 'Zyxlisted';
const DOCUMENT_IDS = ['54321094', '54321107', '54321113', '54321129'];

let passwordHash: string;
let createdUserIds: number[] = [];

async function createUser(firstName: string, overrides: Partial<User> = {}) {
  const index = createdUserIds.length;
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName: SEARCH_TERM,
      documentId: DOCUMENT_IDS[index],
      email: `integration-list-${index}@gurisesunidos.test`,
      role: 'coordinator',
      status: 'active',
      passwordHash,
      ...overrides,
    },
  });
  createdUserIds.push(user.id);
  return user;
}

async function listedNames(filters: Parameters<typeof getUserList>[0] = {}) {
  const users = await getUserList({ search: SEARCH_TERM, ...filters });
  return users.map((user) => user.firstName);
}

beforeAll(async () => {
  passwordHash = await hashPassword('ListPassword1');
});

afterEach(async () => {
  const ids = createdUserIds;
  createdUserIds = [];
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
});

describe('getUserList (integration)', () => {
  test('returns only the public fields and leaves deleted users out', async () => {
    const user = await createUser('Ana');
    await createUser('Bruno', { deletedAt: new Date() });

    expect(await getUserList({ search: SEARCH_TERM })).toEqual([
      {
        id: user.id,
        firstName: 'Ana',
        lastName: SEARCH_TERM,
        email: user.email,
        role: 'coordinator',
        status: 'active',
        lastAccess: null,
      },
    ]);
  });

  test('matches every search term against names and email ignoring case', async () => {
    await createUser('Ana');
    await createUser('Bruno');

    expect(await listedNames({ search: `  ana   ${SEARCH_TERM.toUpperCase()} ` })).toEqual(['Ana']);
    expect(await listedNames({ search: 'integration-list-1' })).toEqual(['Bruno']);
    expect(await listedNames({ search: `ana bruno ${SEARCH_TERM}` })).toEqual([]);
  });

  test('filters by role and status', async () => {
    await createUser('Ana', { role: 'admin' });
    await createUser('Bruno', { status: 'disabled' });
    await createUser('Carla', { status: 'pendingInvitation' });

    expect(await listedNames({ role: 'admin' })).toEqual(['Ana']);
    expect(await listedNames({ status: 'disabled' })).toEqual(['Bruno']);
    expect(await listedNames({ role: 'coordinator', status: 'pendingInvitation' })).toEqual([
      'Carla',
    ]);
  });

  test('sorts by name by default and by the requested column', async () => {
    await createUser('Carla', { role: 'admin', status: 'disabled' });
    await createUser('Ana', { lastAccess: new Date('2026-01-01') });
    await createUser('Bruno', { status: 'pendingInvitation', lastAccess: new Date('2026-06-01') });

    expect(await listedNames()).toEqual(['Ana', 'Bruno', 'Carla']);
    expect(await listedNames({ sortBy: 'role' })).toEqual(['Carla', 'Ana', 'Bruno']);
    expect(await listedNames({ sortBy: 'status' })).toEqual(['Ana', 'Bruno', 'Carla']);
    expect(await listedNames({ sortBy: 'lastAccess' })).toEqual(['Bruno', 'Ana', 'Carla']);
  });
});

describe('getUserStats (integration)', () => {
  test('counts users by role and pending invitations, ignoring deleted ones', async () => {
    const before = await getUserStats();

    await createUser('Ana', { role: 'admin' });
    await createUser('Bruno', { status: 'pendingInvitation' });
    await createUser('Carla', { status: 'disabled' });
    await createUser('Diego', { role: 'admin', deletedAt: new Date() });

    expect(await getUserStats()).toEqual({
      total: before.total + 3,
      admins: before.admins + 1,
      coordinators: before.coordinators + 2,
      pendingInvitations: before.pendingInvitations + 1,
    });
  });
});
