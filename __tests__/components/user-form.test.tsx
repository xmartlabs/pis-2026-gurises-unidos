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

test('prefills the user edit form and information', () => {
  render(
    <UserForm
      mode="edit"
      initialValues={{
        firstName: 'Ana',
        lastName: 'García',
        documentId: '77777777',
        email: 'ana@example.com',
        role: 'admin',
        status: 'disabled',
        information: {
          createdAt: '01/01/2026',
          lastAccess: '05/03/2026',
          createdBy: 'Mario Pérez',
          updatedAt: '18/09/2026',
        },
      }}
    />
  );

  expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Ana');
  expect((screen.getByLabelText('Apellido') as HTMLInputElement).value).toBe('García');
  expect((screen.getByLabelText('Documento (Cédula)') as HTMLInputElement).value).toBe('77777777');
  expect((screen.getByLabelText('Correo electrónico') as HTMLInputElement).value).toBe(
    'ana@example.com'
  );
  expect((screen.getByLabelText('Rol') as HTMLSelectElement).value).toBe('admin');
  expect(screen.getByRole('radio', { name: 'Deshabilitado' }).getAttribute('aria-checked')).toBe(
    'true'
  );
  expect(screen.getByText('01/01/2026')).toBeDefined();
  expect(screen.getByText('05/03/2026')).toBeDefined();
  expect(screen.getByText('Mario Pérez')).toBeDefined();
  expect(screen.getByText('18/09/2026')).toBeDefined();
});
