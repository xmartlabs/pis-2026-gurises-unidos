import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

const { printMock, pushMock } = vi.hoisted(() => ({
  printMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/projects/42',
  useRouter: () => ({ push: pushMock }),
}));
vi.mock('@/components/ui/sidebar', () => ({
  SidebarTrigger: () => <button type="button">Abrir menú</button>,
}));

import { ProjectTopbarRegistration, TopbarProvider } from '@/components/layout/topbar-context';
import { ProjectRecentActivity } from '@/components/projects/detail/project-recent-activity';
import { Topbar } from '@/components/topbar';

const USER = {
  id: '1',
  role: 'admin' as const,
  name: 'Ana García',
  email: 'ana@example.com',
  avatarColorIndex: 0,
};

beforeEach(() => {
  printMock.mockReset();
  pushMock.mockReset();
  window.print = printMock;
});

test('shows the Figma project controls and project breadcrumb in the desktop topbar', async () => {
  render(
    <TopbarProvider>
      <Topbar user={USER} />
      <ProjectTopbarRegistration
        projectName="El Resorte"
        selectedYear={2026}
        years={[2026, 2025, 2024]}
      />
    </TopbarProvider>
  );

  await waitFor(() => expect(screen.getByText('El Resorte')).toBeDefined());
  expect(screen.getByRole('tab', { name: '2026' })).toBeDefined();
  expect(screen.getByText('Todo el país')).toBeDefined();

  fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

  expect(printMock).toHaveBeenCalledOnce();
});

test('uses the full recent activity table on desktop', () => {
  render(<ProjectRecentActivity />);

  const table = screen.getByRole('table');
  expect(table.parentElement?.className).toContain('md:block');
  expect(within(table).getAllByRole('row')).toHaveLength(6);
  expect(within(table).getByText('Articulación con escuela pública')).toBeDefined();
  expect(within(table).getAllByText('Carlos Méndez')).toHaveLength(2);
});
