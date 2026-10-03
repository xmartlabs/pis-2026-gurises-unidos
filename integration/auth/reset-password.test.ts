import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { resetPassword } from '@/app/actions/password';
import { hashPassword, verifyPassword } from '@/lib/credentials';
import prisma from '@/lib/prisma';
import type { User } from '@/generated/prisma/client';
import { loadSeedData, type SeedData } from '../fixtures';
import { signInAs } from '../session';

const OLD_PASSWORD = 'OldPassword1';
const NEW_PASSWORD = 'NewPassword2';
const DOCUMENT_IDS = ['54321016', '54321022', '54321038'];

let seed: SeedData;
let oldPasswordHash: string;
let createdUserIds: number[] = [];

async function createUser(overrides: Partial<User> = {}) {
  const index = createdUserIds.length;
  const user = await prisma.user.create({
    data: {
      firstName: 'Reset',
      lastName: 'Integration',
      documentId: DOCUMENT_IDS[index],
      email: `integration-reset-${index}@gurisesunidos.test`,
      role: 'coordinator',
      status: 'active',
      passwordHash: oldPasswordHash,
      ...overrides,
    },
  });
  createdUserIds.push(user.id);
  return user;
}

function buildFormData(userId: number | string, newPassword = NEW_PASSWORD) {
  const formData = new FormData();
  formData.set('userId', String(userId));
  formData.set('newPassword', newPassword);
  return formData;
}

function loadUser(id: number) {
  return prisma.user.findUniqueOrThrow({ where: { id } });
}

function auditLogsFor(id: number) {
  return prisma.auditLog.findMany({
    where: { entity: 'user', entityId: id },
    orderBy: { id: 'asc' },
  });
}

async function expectUnchanged(id: number) {
  const user = await loadUser(id);
  expect(user.passwordHash).toBe(oldPasswordHash);
  expect(user.passwordChangedAt).toBeNull();
  expect(user.mustChangePassword).toBe(false);
  expect(await auditLogsFor(id)).toEqual([]);
}

beforeAll(async () => {
  seed = await loadSeedData();
  oldPasswordHash = await hashPassword(OLD_PASSWORD);
});

afterEach(async () => {
  const ids = createdUserIds;
  createdUserIds = [];
  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { entity: 'user', entityId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
});

describe('resetPassword (integration)', () => {
  test('replaces the password, forces a change on next login and audits the reset', async () => {
    const user = await createUser();
    signInAs(seed.adminId, 'admin');
    const before = Date.now();

    const result = await resetPassword({}, buildFormData(user.id));

    expect(result).toEqual({ success: true });
    const updated = await loadUser(user.id);
    expect(await verifyPassword(NEW_PASSWORD, updated.passwordHash)).toBe(true);
    expect(await verifyPassword(OLD_PASSWORD, updated.passwordHash)).toBe(false);
    expect(updated.mustChangePassword).toBe(true);
    expect(updated.passwordChangedAt?.getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(await auditLogsFor(user.id)).toEqual([
      expect.objectContaining({
        entity: 'user',
        action: 'passwordReset',
        entityId: user.id,
        authorId: seed.adminId,
      }),
    ]);
  });

  test('resets the password of another admin', async () => {
    const user = await createUser({ role: 'admin' });
    signInAs(seed.adminId, 'admin');

    const result = await resetPassword({}, buildFormData(user.id));

    expect(result).toEqual({ success: true });
    expect((await loadUser(user.id)).mustChangePassword).toBe(true);
  });

  test('rejects a coordinator without touching the target', async () => {
    const user = await createUser();
    signInAs(seed.coordinatorId, 'coordinator');

    const result = await resetPassword({}, buildFormData(user.id));

    expect(result).toEqual({ formError: 'No tenés permisos para realizar esta acción.' });
    await expectUnchanged(user.id);
  });

  test('rejects the request when nobody is signed in', async () => {
    const user = await createUser();

    const result = await resetPassword({}, buildFormData(user.id));

    expect(result).toEqual({ formError: 'No tenés permisos para realizar esta acción.' });
    await expectUnchanged(user.id);
  });

  test('rejects a deleted user', async () => {
    const user = await createUser({ deletedAt: new Date() });
    signInAs(seed.adminId, 'admin');

    const result = await resetPassword({}, buildFormData(user.id));

    expect(result).toEqual({ formError: 'La cuenta seleccionada no existe.' });
    await expectUnchanged(user.id);
  });

  test('rejects a user that does not exist', async () => {
    signInAs(seed.adminId, 'admin');
    const auditCount = await prisma.auditLog.count();

    const result = await resetPassword({}, buildFormData(999_999_999));

    expect(result).toEqual({ formError: 'La cuenta seleccionada no existe.' });
    expect(await prisma.auditLog.count()).toBe(auditCount);
  });

  test('returns field errors for an invalid account and a weak password', async () => {
    const user = await createUser();
    signInAs(seed.adminId, 'admin');

    const result = await resetPassword({}, buildFormData('abc', 'weak'));

    expect(result.errors?.userId).toEqual(['Elegí una cuenta']);
    expect(result.errors?.newPassword).toEqual([
      'La contraseña debe tener al menos 8 caracteres',
      'La contraseña debe tener al menos una mayúscula',
      'La contraseña debe tener al menos un número',
    ]);
    await expectUnchanged(user.id);
  });
});
