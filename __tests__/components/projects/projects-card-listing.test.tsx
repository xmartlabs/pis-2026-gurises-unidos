import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { ProjectsCardList } from '@/components/projects/projects-card-listing';
import type { ProjectListItem } from '@/lib/projects/list';

const searchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams.current,
  usePathname: () => '/dashboard/projects',
  useRouter: () => ({ replace: vi.fn() }),
}));

function buildProject(
  id: number,
  name: string,
  status: ProjectListItem['status']
): ProjectListItem {
  return {
    id,
    name,
    status,
    intensity: 'medium',
    startYear: 2025,
    zone: 'city',
    localityNeighborhood: null,
    publicDescription: null,
    leadCoordinator: { id: 1, firstName: 'Carlos', lastName: 'Coordinator' },
    department: { id: 1, name: 'Montevideo' },
    beneficiaries: [],
  };
}

const PROJECTS = [
  buildProject(1, 'Active project', 'active'),
  buildProject(2, 'Paused project', 'paused'),
  buildProject(3, 'Closed project', 'closed'),
];

function renderList() {
  render(
    <ProjectsCardList
      projects={PROJECTS}
      total={PROJECTS.length}
      years={[]}
      beneficiaryYear={undefined}
    />
  );
}

beforeEach(() => {
  searchParams.current = new URLSearchParams();
});

test('restores the status filter from the URL', () => {
  searchParams.current = new URLSearchParams('status=paused');

  renderList();

  expect(screen.getByRole('tab', { name: 'Pausados' }).getAttribute('aria-selected')).toBe('true');
  expect(screen.getByText('Paused project')).toBeTruthy();
  expect(screen.queryByText('Active project')).toBeNull();
  expect(screen.queryByText('Closed project')).toBeNull();
});

test('stores the selected status filter in the URL', () => {
  const replaceState = vi.spyOn(window.history, 'replaceState');

  renderList();
  fireEvent.click(screen.getByRole('tab', { name: 'Cerrados' }));

  expect(replaceState).toHaveBeenCalledWith(null, '', '?status=closed');
});
