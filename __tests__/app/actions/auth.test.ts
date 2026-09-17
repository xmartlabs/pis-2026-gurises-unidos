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

function makeFormData(documentId: string, password: string) {
  const formData = new FormData();
  formData.set('documentId', documentId);
  formData.set('password', password);
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

  test('signs in with credentials and redirects to the dashboard', async () => {
    vi.mocked(signIn).mockResolvedValue(undefined);

    await expect(login({}, makeFormData('4.123.456-7', 'password'))).rejects.toThrow(
      'NEXT_REDIRECT'
    );

    expect(signIn).toHaveBeenCalledWith('credentials', {
      documentId: '4.123.456-7',
      password: 'password',
      remember: false,
      redirect: false,
    });
    expect(redirect).toHaveBeenCalledWith('/dashboard/projects');
  });

  test.each([
    ['AuthError', () => new AuthError()],
    ['CredentialsSignin', () => new CredentialsSignin()],
  ])('returns invalid credentials with the raw document id on %s', async (_name, makeError) => {
    vi.mocked(signIn).mockRejectedValue(makeError());

    await expect(login({}, makeFormData('4.123.456-7', 'wrong'))).resolves.toEqual({
      error: 'Invalid credentials',
      documentId: '4.123.456-7',
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  test('rethrows errors that are not AuthError', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('network'));

    await expect(login({}, makeFormData('41234567', 'password'))).rejects.toThrow('network');
    expect(redirect).not.toHaveBeenCalled();
  });

  test('ignores previous login state', async () => {
    vi.mocked(signIn).mockRejectedValue(new AuthError());

    await expect(
      login({ error: 'old', documentId: 'old' }, makeFormData('4.123.456-7', 'wrong'))
    ).resolves.toEqual({
      error: 'Invalid credentials',
      documentId: '4.123.456-7',
    });
  });

  test('forwards empty documentId and a null password when fields are missing', async () => {
    vi.mocked(signIn).mockRejectedValue(new AuthError());

    await expect(login({}, new FormData())).resolves.toEqual({
      error: 'Invalid credentials',
      documentId: '',
    });
    expect(signIn).toHaveBeenCalledWith('credentials', {
      documentId: '',
      password: null,
      remember: false,
      redirect: false,
    });
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
