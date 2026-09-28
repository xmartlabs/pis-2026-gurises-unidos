import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

const { isMobileMock } = vi.hoisted(() => ({ isMobileMock: vi.fn() }));

vi.mock('@/app/actions/auth', () => ({ logout: vi.fn() }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: isMobileMock }));

import { AppSidebarFooter } from '@/components/layout/app-sidebar/footer';
import { SidebarProvider } from '@/components/ui/sidebar';

const USER = { id: '1', role: 'admin' as const, name: 'Ana García', email: 'ana@example.com' };

function renderFooter() {
  render(
    <SidebarProvider>
      <AppSidebarFooter user={USER} />
    </SidebarProvider>
  );
}

beforeEach(() => {
  isMobileMock.mockReturnValue(false);
});

test('links to the profile from the user menu on desktop', async () => {
  renderFooter();

  fireEvent.click(screen.getByRole('button', { name: /Ana García/ }));

  const profileLink = await screen.findByRole('menuitem', { name: 'Mi perfil' });
  expect(profileLink.getAttribute('href')).toBe('/management/profile');
});

test('links to the profile directly on mobile', () => {
  isMobileMock.mockReturnValue(true);

  renderFooter();

  expect(screen.getByRole('link', { name: 'Mi perfil' }).getAttribute('href')).toBe(
    '/management/profile'
  );
});
