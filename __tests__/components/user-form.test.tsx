import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { UserForm } from '@/components/user-form';

vi.mock('@/app/actions/users', () => ({
  createUser: vi.fn(async () => ({})),
}));

test('shows required field errors when submitting an empty user edit form', () => {
  render(<UserForm mode="edit" />);

  fireEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }));

  expect(screen.getByText('El nombre es obligatorio.')).toBeDefined();
  expect(screen.getByText('El apellido es obligatorio.')).toBeDefined();
  expect(screen.getByText('El documento es obligatorio.')).toBeDefined();
  expect(screen.getByText('El correo es obligatorio.')).toBeDefined();
});
