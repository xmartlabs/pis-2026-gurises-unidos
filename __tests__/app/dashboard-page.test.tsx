import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const { authMock, getDashboardOverviewMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  getDashboardOverviewMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ redirect: redirectMock }));
vi.mock('@/lib/dashboard/queries', () => ({ getDashboardOverview: getDashboardOverviewMock }));

import DashboardPage from '@/app/(protected)/dashboard/page';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-29T12:00:00.000Z'));
  authMock.mockReset();
  getDashboardOverviewMock.mockReset();
  redirectMock.mockClear();
  getDashboardOverviewMock.mockResolvedValue({
    heroKpi: { value: 110, label: 'niños alcanzados', delta: '+10.0% vs. año anterior' },
    secondaryKpis: [
      { value: 30, label: 'familias', delta: '−25.0% vs. año anterior' },
      { value: 45, label: 'funcionarios', delta: '0.0% vs. año anterior' },
      { value: 4, label: 'proyectos', delta: '−1 respecto a 2025' },
    ],
    projects: [
      { id: 7, name: 'Playground', status: 'active', intensity: 'high', beneficiaries: 42 },
    ],
    projectsTotal: 42,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

test('redirects to login without a session', async () => {
  authMock.mockResolvedValue(null);

  await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/login');
  expect(getDashboardOverviewMock).not.toHaveBeenCalled();
});

test('redirects users whose role is not allowed', async () => {
  authMock.mockResolvedValue({ user: { id: '1', role: 'viewer' } });

  await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/dashboard/projects');
  expect(getDashboardOverviewMock).not.toHaveBeenCalled();
});

test.each(['admin', 'coordinator'])(
  'renders the overview for the current year as %s',
  async (role) => {
    authMock.mockResolvedValue({ user: { id: '1', role } });

    render(await DashboardPage());

    expect(getDashboardOverviewMock).toHaveBeenCalledWith(2026);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(screen.getByText('niños alcanzados')).toBeDefined();
    expect(screen.getByText('−1 respecto a 2025')).toBeDefined();
    expect(screen.getAllByText('Playground').length).toBeGreaterThan(0);
    expect(screen.getByText('Total 2026')).toBeDefined();
  }
);

test('shows the metrics shortcut only to admins', async () => {
  authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });
  const { unmount } = render(await DashboardPage());

  expect(screen.getByText('Cargar métricas').closest('a')?.getAttribute('href')).toBe(
    '/management/metrics'
  );
  unmount();

  authMock.mockResolvedValue({ user: { id: '2', role: 'coordinator' } });
  render(await DashboardPage());

  expect(screen.queryByText('Cargar métricas')).toBeNull();
});

test('disables the actions that are not available yet', async () => {
  authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });

  render(await DashboardPage());

  expect(screen.getByRole('button', { name: 'Exportar reporte' }).hasAttribute('disabled')).toBe(
    true
  );
  expect(screen.getByRole('button', { name: 'Publicar dashboard' }).hasAttribute('disabled')).toBe(
    true
  );
});
