import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { updateUserStatus } from '@/app/actions/users';
import { hashPassword } from '@/lib/credentials';
import prisma from '@/lib/prisma';
import type { User } from '@/generated/prisma/client';
import { loadSeedData, type SeedData } from '../fixtures';
import { signInAs } from '../session';

const DOCUMENT_IDS = ['54321066', '54321072', '54321088'];

let seed: SeedData;
let passwordHash: string;
let createdUserIds: number[] = [];

async function createUser(overrides: Partial<User> = {}) {
  const index = createdUserIds.length;
  const user = await prisma.user.create({
    data: {
      firstName: 'Status',
      lastName: 'Integration',
      documentId: DOCUMENT_IDS[index],
      email: `integration-status-${index}@gurisesunidos.test`,
      role: 'coordinator',
      status: 'active',
      passwordHash,
      ...overrides,
    },
  });
  createdUserIds.push(user.id);
  return user;
}

async function loadStatus(id: number) {
  const { status } = await prisma.user.findUniqueOrThrow({ where: { id } });
  return status;
}

function auditLogsFor(id: number) {
  return prisma.auditLog.findMany({
    where: { entity: 'user', entityId: id },
    orderBy: { id: 'asc' },
  });
}

beforeAll(async () => {
  seed = await loadSeedData();
  passwordHash = await hashPassword('StatusPassword1');
});

afterEach(async () => {
  const ids = createdUserIds;
  createdUserIds = [];
  await prisma.$transaction([
    prisma.auditLog.deleteMany({
      where: { OR: [{ entity: 'user', entityId: { in: ids } }, { authorId: { in: ids } }] },
    }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
});

describe('updateUserStatus (integration)', () => {
  test('disables an active coordinator and audits the change', async () => {
    const user = await createUser();
    signInAs(seed.adminId);

    const result = await updateUserStatus(user.id, 'disabled');

    expect(result).toEqual({ success: true });
    expect(await loadStatus(user.id)).toBe('disabled');
    expect(await auditLogsFor(user.id)).toEqual([
      expect.objectContaining({
        action: 'update',
        entityId: user.id,
        authorId: seed.adminId,
        details: { changes: [{ field: 'status', from: 'active', to: 'disabled' }] },
      }),
    ]);
  });

  test('enables a disabled user', async () => {
    const user = await createUser({ status: 'disabled' });
    signInAs(seed.adminId);

    const result = await updateUserStatus(user.id, 'active');

    expect(result).toEqual({ success: true });
    expect(await loadStatus(user.id)).toBe('active');
    expect(await auditLogsFor(user.id)).toEqual([
      expect.objectContaining({
        details: { changes: [{ field: 'status', from: 'disabled', to: 'active' }] },
      }),
    ]);
  });

  test('disables an admin while another active admin remains', async () => {
    const user = await createUser({ role: 'admin' });
    signInAs(seed.adminId);

    const result = await updateUserStatus(user.id, 'disabled');

    expect(result).toEqual({ success: true });
    expect(await loadStatus(user.id)).toBe('disabled');
  });

  test.each([
    { status: 'disabled', target: 'disabled', error: 'El usuario ya está deshabilitado.' },
    {
      status: 'disabled',
      target: 'pendingInvitation',
      error: 'No se puede deshabilitar a un usuario con invitación pendiente.',
    },
    { status: 'active', target: 'active', error: 'El usuario ya está habilitado.' },
    { status: 'active', target: 'pendingInvitation', error: 'El usuario ya está habilitado.' },
  ] as const)('rejects changing a $target user to $status', async ({ status, target, error }) => {
    const user = await createUser({ status: target });
    signInAs(seed.adminId);

    const result = await updateUserStatus(user.id, status);

    expect(result).toEqual({ error });
    expect(await loadStatus(user.id)).toBe(target);
    expect(await auditLogsFor(user.id)).toEqual([]);
  });

  test('rejects a deleted user', async () => {
    const user = await createUser({ deletedAt: new Date() });
    signInAs(seed.adminId);

    const result = await updateUserStatus(user.id, 'disabled');

    expect(result).toEqual({ error: 'El usuario no existe.' });
    expect(await loadStatus(user.id)).toBe('active');
  });

  test('rejects a user that does not exist', async () => {
    signInAs(seed.adminId);

    const result = await updateUserStatus(999_999_999, 'disabled');

    expect(result).toEqual({ error: 'El usuario no existe.' });
  });

  test('rejects an invalid id or status', async () => {
    const user = await createUser();
    signInAs(seed.adminId);

    expect(await updateUserStatus(0, 'disabled')).toEqual({ error: 'El usuario no es válido.' });
    expect(await updateUserStatus(user.id, 'pendingInvitation' as unknown as 'active')).toEqual({
      error: 'El usuario no es válido.',
    });
    expect(await loadStatus(user.id)).toBe('active');
  });

  test('rejects changing your own status', async () => {
    signInAs(seed.adminId);

    const result = await updateUserStatus(seed.adminId, 'disabled');

    expect(result).toEqual({ error: 'No podés cambiar tu propio estado.' });
    expect(await loadStatus(seed.adminId)).toBe('active');
  });

  test('rejects a coordinator', async () => {
    const user = await createUser();
    signInAs(seed.coordinatorId);

    const result = await updateUserStatus(user.id, 'disabled');

    expect(result).toEqual({ error: 'No tenés permisos para realizar esta acción.' });
    expect(await loadStatus(user.id)).toBe('active');
  });

  test('uses the role stored in the database instead of the session', async () => {
    const user = await createUser();
    signInAs(seed.coordinatorId, 'admin');

    const result = await updateUserStatus(user.id, 'disabled');

    expect(result).toEqual({ error: 'No tenés permisos para realizar esta acción.' });
    expect(await loadStatus(user.id)).toBe('active');
  });

  test('redirects to login when the session user is disabled', async () => {
    const user = await createUser();
    signInAs(seed.disabledCoordinatorId);

    await expect(updateUserStatus(user.id, 'disabled')).rejects.toThrow(/^NEXT_REDIRECT:\/login$/);
    expect(await loadStatus(user.id)).toBe('active');
  });

  test('redirects to login when nobody is signed in', async () => {
    const user = await createUser();

    await expect(updateUserStatus(user.id, 'disabled')).rejects.toThrow(/^NEXT_REDIRECT:\/login$/);
    expect(await loadStatus(user.id)).toBe('active');
  });
});
