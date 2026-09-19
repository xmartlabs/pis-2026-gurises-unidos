import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

vi.mock('@/app/actions/auth', () => ({ logout: vi.fn() }));
vi.mock('@/components/ui/sidebar', () => ({ SidebarTrigger: () => null }));

import { Topbar } from '@/components/topbar';

test('links authenticated users to their profile from the user menu', async () => {
  render(<Topbar user={{ name: 'Ana García', email: 'ana@example.com' }} />);

  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de usuario' }));

  const profileLink = await screen.findByRole('menuitem', { name: 'Mi perfil' });
  expect(profileLink.getAttribute('href')).toBe('/dashboard/profile');
});
