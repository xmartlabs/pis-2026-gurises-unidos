import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { UsersTable } from '@/components/users/users-table';

test('links the edit action to the selected user', () => {
  render(
    <UsersTable
      users={[
        {
          id: 42,
          firstName: 'Ana',
          lastName: 'García',
          email: 'ana@example.com',
          role: 'coordinator',
          status: 'active',
          lastAccess: null,
        },
      ]}
    />
  );

  fireEvent.click(screen.getAllByRole('button', { name: 'Acciones para Ana García' })[0]);

  expect(screen.getByRole('menuitem', { name: 'Editar' }).getAttribute('href')).toBe(
    '/dashboard/management/users/42/edit'
  );
});
