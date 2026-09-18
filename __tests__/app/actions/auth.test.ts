import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthError, CredentialsSignin } from 'next-auth';
import { redirect } from 'next/navigation';
import { login, logout } from '@/app/actions/auth';
import { signIn, signOut } from '@/auth';

vi.mock('next-auth', () => import('@auth/core/errors'));

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

function makeFormData(documentId: string, password: string, remember = false) {
  const formData = new FormData();
  formData.set('documentId', documentId);
  formData.set('password', password);
  if (remember) {
    formData.set('rememberCheck', 'on');
  }
  return formData;
}

describe('login', () => {
  beforeEach(() => {
    vi.mocked(signIn).mockReset();
    vi.mocked(redirect).mockReset();
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
  });

  test('signs in with the normalized document id and redirects to the dashboard', async () => {
    vi.mocked(signIn).mockResolvedValue(undefined);

    await expect(login({}, makeFormData('1.111.111-1', 'password'))).rejects.toThrow(
      'NEXT_REDIRECT'
    );

    expect(signIn).toHaveBeenCalledWith('credentials', {
      documentId: '11111111',
      password: 'password',
      remember: 'false',
      redirect: false,
    });
    expect(redirect).toHaveBeenCalledWith('/dashboard/projects');
  });

  test('passes remember: "true" when the checkbox is checked', async () => {
    vi.mocked(signIn).mockResolvedValue(undefined);

    await expect(login({}, makeFormData('1.111.111-1', 'password', true))).rejects.toThrow(
      'NEXT_REDIRECT'
    );

    expect(signIn).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({ remember: 'true' })
    );
  });

  test.each([
    ['AuthError', () => new AuthError()],
    ['CredentialsSignin', () => new CredentialsSignin()],
  ])('returns invalid credentials with the raw document id on %s', async (_name, makeError) => {
    vi.mocked(signIn).mockRejectedValue(makeError());

    await expect(login({}, makeFormData('1.111.111-1', 'wrong'))).resolves.toEqual({
      formError: 'Invalid credentials',
      documentId: '1.111.111-1',
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  test('rethrows errors that are not AuthError', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('network'));

    await expect(login({}, makeFormData('11111111', 'password'))).rejects.toThrow('network');
    expect(redirect).not.toHaveBeenCalled();
  });

  test('ignores previous login state', async () => {
    vi.mocked(signIn).mockRejectedValue(new AuthError());

    await expect(
      login({ formError: 'old', documentId: 'old' }, makeFormData('1.111.111-1', 'wrong'))
    ).resolves.toEqual({
      formError: 'Invalid credentials',
      documentId: '1.111.111-1',
    });
  });

  test('rejects a document id that fails the Uruguayan checksum without calling signIn', async () => {
    const result = await login({}, makeFormData('41234567', 'password'));

    expect(result.errors?.documentId).toBeDefined();
    expect(signIn).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  test('returns validation errors when fields are missing, without calling signIn', async () => {
    const result = await login({}, new FormData());

    expect(result.errors?.documentId).toBeDefined();
    expect(result.errors?.password).toBeDefined();
    expect(signIn).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('logout', () => {
  beforeEach(() => {
    vi.mocked(signOut).mockReset();
  });

  test('calls signOut with redirectTo: /login', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);

    await logout();

    expect(signOut).toHaveBeenCalledWith({ redirectTo: '/login' });
  });
});
