import { beforeEach, describe, expect, test, vi } from 'vitest';
import { makeUser } from '../../fixtures/user';

const {
  authMock,
  logAuditMock,
  transactionMock,
  findUniqueMock,
  hashPasswordMock,
  verifyPasswordMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  logAuditMock: vi.fn(),
  transactionMock: vi.fn(),
  findUniqueMock: vi.fn(),
  hashPasswordMock: vi.fn(),
  verifyPasswordMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('@/lib/audit-log', () => ({ logAudit: logAuditMock }));
vi.mock('@/lib/prisma', () => ({
  default: {
    user: { findUnique: findUniqueMock },
    $transaction: transactionMock,
  },
}));
vi.mock('@/lib/credentials', () => ({
  hashPassword: hashPasswordMock,
  verifyPassword: verifyPasswordMock,
}));

import { changePassword, resetPassword } from '@/app/actions/password';

function buildFormData(fields: Record<string, string | undefined>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      formData.append(key, value);
    }
  }
  return formData;
}

function setupTransaction() {
  const userUpdate = vi.fn().mockResolvedValue({});
  transactionMock.mockImplementation(async (callback) =>
    callback({ user: { update: userUpdate } })
  );
  return { userUpdate };
}

beforeEach(() => {
  authMock.mockReset();
  logAuditMock.mockReset();
  transactionMock.mockReset();
  findUniqueMock.mockReset();
  hashPasswordMock.mockReset();
  verifyPasswordMock.mockReset();
});

describe('changePassword', () => {
  const VALID_FIELDS = {
    currentPassword: 'old-password',
    newPassword: 'NewPassword1',
    confirmNewPassword: 'NewPassword1',
  };

  test('rejects when there is no valid session', async () => {
    authMock.mockResolvedValue(null);

    const result = await changePassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('Tu sesión ya no es válida. Iniciá sesión de nuevo.');
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('returns field errors when the new password does not meet the policy', async () => {
    authMock.mockResolvedValue({ user: { id: '7', email: 'user@example.com' } });

    const result = await changePassword(
      {},
      buildFormData({ ...VALID_FIELDS, newPassword: 'weak', confirmNewPassword: 'weak' })
    );

    expect(result.errors?.newPassword).toBeDefined();
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('returns a field error when the new password and confirmation do not match', async () => {
    authMock.mockResolvedValue({ user: { id: '7', email: 'user@example.com' } });

    const result = await changePassword(
      {},
      buildFormData({ ...VALID_FIELDS, confirmNewPassword: 'SomethingElse1' })
    );

    expect(result.errors?.confirmNewPassword).toEqual(['Las contraseñas no coinciden']);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('returns a form error when the user record cannot be found', async () => {
    authMock.mockResolvedValue({ user: { id: '7', email: 'user@example.com' } });
    findUniqueMock.mockResolvedValue(null);

    const result = await changePassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('Tu sesión ya no es válida. Iniciá sesión de nuevo.');
    expect(verifyPasswordMock).not.toHaveBeenCalled();
  });

  test('returns a form error when the current password is incorrect', async () => {
    authMock.mockResolvedValue({ user: { id: '7', email: 'user@example.com' } });
    findUniqueMock.mockResolvedValue(makeUser({ id: 7 }));
    verifyPasswordMock.mockResolvedValue(false);

    const result = await changePassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('La contraseña actual es incorrecta');
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('hashes the new password, updates the user, and logs the audit trail', async () => {
    authMock.mockResolvedValue({ user: { id: '7', email: 'user@example.com' } });
    findUniqueMock.mockResolvedValue(makeUser({ id: 7 }));
    verifyPasswordMock.mockResolvedValue(true);
    hashPasswordMock.mockResolvedValue('new-hash');
    const { userUpdate } = setupTransaction();

    const result = await changePassword({}, buildFormData(VALID_FIELDS));

    expect(verifyPasswordMock).toHaveBeenCalledWith('old-password', expect.any(String));
    expect(hashPasswordMock).toHaveBeenCalledWith(VALID_FIELDS.newPassword);
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        passwordHash: 'new-hash',
        passwordChangedAt: expect.any(Date),
        mustChangePassword: false,
      },
    });
    expect(logAuditMock).toHaveBeenCalledWith(expect.anything(), {
      authorId: 7,
      action: 'passwordChange',
      entity: 'user',
      entityId: 7,
    });
    expect(result).toEqual({ success: true });
  });

  test('returns a form error when the transaction fails', async () => {
    authMock.mockResolvedValue({ user: { id: '7', email: 'user@example.com' } });
    findUniqueMock.mockResolvedValue(makeUser({ id: 7 }));
    verifyPasswordMock.mockResolvedValue(true);
    hashPasswordMock.mockResolvedValue('new-hash');
    transactionMock.mockRejectedValue(new Error('db down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await changePassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('No se pudo cambiar la contraseña. Intentá de nuevo.');
  });
});

describe('resetPassword', () => {
  const VALID_FIELDS = {
    userId: '9',
    newPassword: 'NewPassword1',
  };

  test('rejects when the session user is not an admin', async () => {
    authMock.mockResolvedValue({ user: { id: '1', role: 'coordinator' } });

    const result = await resetPassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('No tenés permisos para realizar esta acción.');
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('rejects when there is no session', async () => {
    authMock.mockResolvedValue(null);

    const result = await resetPassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('No tenés permisos para realizar esta acción.');
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('returns field errors when the new password does not meet the policy', async () => {
    authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });

    const result = await resetPassword({}, buildFormData({ ...VALID_FIELDS, newPassword: 'weak' }));

    expect(result.errors?.newPassword).toBeDefined();
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('returns a form error when the target account does not exist', async () => {
    authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });
    findUniqueMock.mockResolvedValue(null);

    const result = await resetPassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('La cuenta seleccionada no existe.');
  });

  test('returns a form error when the target account is soft-deleted', async () => {
    authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });
    findUniqueMock.mockResolvedValue(makeUser({ id: 9, deletedAt: new Date('2026-01-01') }));

    const result = await resetPassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('La cuenta seleccionada no existe.');
  });

  test('hashes the new password, forces a change on next login, and logs the admin as the author', async () => {
    authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });
    findUniqueMock.mockResolvedValue(makeUser({ id: 9 }));
    hashPasswordMock.mockResolvedValue('new-hash');
    const { userUpdate } = setupTransaction();

    const result = await resetPassword({}, buildFormData(VALID_FIELDS));

    expect(hashPasswordMock).toHaveBeenCalledWith(VALID_FIELDS.newPassword);
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: 9 },
      data: {
        passwordHash: 'new-hash',
        passwordChangedAt: expect.any(Date),
        mustChangePassword: true,
      },
    });
    expect(logAuditMock).toHaveBeenCalledWith(expect.anything(), {
      authorId: 1,
      action: 'passwordReset',
      entity: 'user',
      entityId: 9,
    });
    expect(result).toEqual({ success: true });
  });

  test('returns a form error when the transaction fails', async () => {
    authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });
    findUniqueMock.mockResolvedValue(makeUser({ id: 9 }));
    hashPasswordMock.mockResolvedValue('new-hash');
    transactionMock.mockRejectedValue(new Error('db down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await resetPassword({}, buildFormData(VALID_FIELDS));

    expect(result.formError).toBe('No se pudo restablecer la contraseña. Intentá de nuevo.');
  });
});
