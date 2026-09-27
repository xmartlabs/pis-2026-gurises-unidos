import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { LoginForm } from '@/components/login-form';

vi.mock('@/app/actions/auth', () => ({
  login: vi.fn(async () => ({})),
}));

test('shows the session expiration message when requested', () => {
  render(<LoginForm sessionExpired />);

  expect(screen.getByRole('status').textContent).toBe(
    'Tu sesión se cerró por inactividad. Iniciá sesión nuevamente para continuar.'
  );
});

test('does not show the session expiration message by default', () => {
  render(<LoginForm />);

  expect(screen.queryByRole('status')).toBeNull();
});
