import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { UsersTable } from '@/components/users/users-table';
import type { User } from '@/lib/users/format';

const { deleteUserMock } = vi.hoisted(() => ({ deleteUserMock: vi.fn() }));

vi.mock('@/app/actions/users', () => ({ deleteUser: deleteUserMock }));

const USER: User = {
  id: 42,
  firstName: 'Ana',
  lastName: 'García',
  email: 'ana@example.com',
  role: 'coordinator',
  status: 'active',
  lastAccess: null,
};

const CURRENT_USER_ID = 7;

function openActionsMenu() {
  fireEvent.click(screen.getAllByRole('button', { name: 'Acciones para Ana García' })[0]);
}

function openDeleteDialog() {
  openActionsMenu();
  fireEvent.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
}

beforeEach(() => {
  deleteUserMock.mockReset();
});

test('links the edit action to the selected user', () => {
  render(<UsersTable users={[USER]} currentUserId={CURRENT_USER_ID} />);

  openActionsMenu();

  expect(screen.getByRole('menuitem', { name: 'Editar' }).getAttribute('href')).toBe(
    '/management/users/42/edit'
  );
});

test('hides the delete action on the current user row', () => {
  render(<UsersTable users={[USER]} currentUserId={USER.id} />);

  openActionsMenu();

  expect(screen.queryByRole('menuitem', { name: 'Eliminar' })).toBeNull();
});

test('asks for confirmation before deleting a user', async () => {
  render(<UsersTable users={[USER]} currentUserId={CURRENT_USER_ID} />);

  openDeleteDialog();

  expect(await screen.findByRole('alertdialog')).toBeTruthy();
  expect(screen.getByText('¿Eliminar a Ana García?')).toBeTruthy();
  expect(deleteUserMock).not.toHaveBeenCalled();
});

test('deletes the user and closes the dialog on confirm', async () => {
  deleteUserMock.mockResolvedValue({ success: true });
  render(<UsersTable users={[USER]} currentUserId={CURRENT_USER_ID} />);

  openDeleteDialog();
  fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));

  expect(deleteUserMock).toHaveBeenCalledWith(42);
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
});

test('keeps the dialog open and shows the error when deletion fails', async () => {
  deleteUserMock.mockResolvedValue({
    error: 'No se puede dar de baja al último administrador activo.',
  });
  render(<UsersTable users={[USER]} currentUserId={CURRENT_USER_ID} />);

  openDeleteDialog();
  fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));

  expect((await screen.findByRole('alert')).textContent).toBe(
    'No se puede dar de baja al último administrador activo.'
  );
  expect(screen.getByRole('alertdialog')).toBeTruthy();
});
