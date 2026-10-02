import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn() }));

vi.mock('next/navigation', () => ({ usePathname: pathnameMock }));

import { AppBreadcrumb } from '@/components/breadcrumb';

beforeEach(() => {
  pathnameMock.mockReset();
});

test('links the dashboard root crumb', () => {
  pathnameMock.mockReturnValue('/dashboard/projects');

  render(<AppBreadcrumb />);

  expect(screen.getByText('Dashboard').closest('a')?.getAttribute('href')).toBe('/dashboard');
});

test.each(['/management/users', '/management/metrics', '/management/users/5/edit'])(
  'does not link the root crumb of %s because it has no page',
  (pathname) => {
    pathnameMock.mockReturnValue(pathname);

    render(<AppBreadcrumb />);

    expect(screen.getByText('Administración').closest('a')).toBeNull();
  }
);
