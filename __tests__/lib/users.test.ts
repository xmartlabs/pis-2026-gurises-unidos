import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getUserList } from '@/lib/users';
import prisma from '@/lib/prisma';
import { makeUser } from '../fixtures/user';

beforeEach(() => {
  vi.mocked(prisma.user.findMany).mockResolvedValue([]);
});

describe('getUserList', () => {
  test('with no filters, excludes soft-deleted users and sorts by name', async () => {
    await getUserList();

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastAccess: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  });

  test('filters by role', async () => {
    await getUserList({ role: 'coordinator' });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, role: 'coordinator' },
      })
    );
  });

  test('filters by status, including disabled users', async () => {
    await getUserList({ status: 'disabled' });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, status: 'disabled' },
      })
    );
  });

  test('searches by name or email across firstName, lastName, and email', async () => {
    await getUserList({ search: 'ana' });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          OR: [
            { firstName: { contains: 'ana', mode: 'insensitive' } },
            { lastName: { contains: 'ana', mode: 'insensitive' } },
            { email: { contains: 'ana', mode: 'insensitive' } },
          ],
        },
      })
    );
  });

  test('trims the search term before using it', async () => {
    await getUserList({ search: '  ana  ' });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { firstName: { contains: 'ana', mode: 'insensitive' } },
            { lastName: { contains: 'ana', mode: 'insensitive' } },
            { email: { contains: 'ana', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });

  test('ignores a search term that is only whitespace', async () => {
    await getUserList({ search: '   ' });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } })
    );
  });

  test('combines search, role, and status filters', async () => {
    await getUserList({ search: 'ana', role: 'admin', status: 'active' });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          role: 'admin',
          status: 'active',
          OR: expect.any(Array),
        }),
      })
    );
  });

  test.each([
    ['role', [{ role: 'asc' }]],
    ['status', [{ status: 'asc' }]],
    ['lastAccess', [{ lastAccess: { sort: 'desc', nulls: 'last' } }]],
  ] as const)('sorts by %s when requested', async (sortBy, expectedOrderBy) => {
    await getUserList({ sortBy });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: expectedOrderBy })
    );
  });

  test('falls back to sorting by name when sortBy is not recognized', async () => {
    await getUserList({ sortBy: 'not-a-real-column' });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }] })
    );
  });

  test('returns an empty list when there are no matches', async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    await expect(getUserList({ search: 'nadie' })).resolves.toEqual([]);
  });

  test('returns whatever prisma resolves', async () => {
    const users = [makeUser({ id: 1, firstName: 'Ana', lastName: 'Admin' })];
    vi.mocked(prisma.user.findMany).mockResolvedValue(users);

    await expect(getUserList()).resolves.toEqual(users);
  });
});
