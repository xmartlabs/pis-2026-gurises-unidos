import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { ProjectsCardList } from '@/components/projects/projects-card-listing';
import type { ProjectListItem, ProjectListPage } from '@/lib/projects/list';
import type { StatusFilterValue } from '@/lib/projects/constants';

const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  replace: vi.fn(),
  loadProjectsPage: vi.fn(),
  observers: [] as { callback: IntersectionObserverCallback; disconnected: boolean }[],
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams,
  usePathname: () => '/dashboard/projects',
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock('@/app/actions/projects', () => ({ loadProjectsPage: mocks.loadProjectsPage }));

class IntersectionObserverMock {
  private readonly entry: { callback: IntersectionObserverCallback; disconnected: boolean };

  constructor(callback: IntersectionObserverCallback) {
    this.entry = { callback, disconnected: false };
    mocks.observers.push(this.entry);
  }

  observe() {}

  disconnect() {
    this.entry.disconnected = true;
  }
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

async function revealSentinel() {
  const active = mocks.observers.filter((observer) => !observer.disconnected);
  await act(async () => {
    for (const { callback } of active) {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    }
  });
}

const BENEFICIARIES_2025 = {
  year: 2025,
  directChildrenAdolescents: 10,
  indirectChildrenAdolescents: 0,
  youth18To29: 0,
  families: 2,
  coordinatedInstitutions: 0,
  communityLeaders: 0,
  basicServiceStaff: 0,
  total: 12,
};

function buildProject(
  id: number,
  name: string,
  status: ProjectListItem['status'] = 'active',
  beneficiaries: ProjectListItem['beneficiaries'] = []
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
    beneficiaries,
  };
}

function buildPage(items: ProjectListItem[], page: number, totalPages: number): ProjectListPage {
  return { items, total: items.length, page, pageSize: 20, totalPages };
}

function renderList({
  projects = [buildProject(1, 'Active project')],
  total = projects.length,
  page = 1,
  totalPages = 1,
  status = 'active',
  beneficiaryYear = 2025,
}: {
  projects?: ProjectListItem[];
  total?: number;
  page?: number;
  totalPages?: number;
  status?: StatusFilterValue;
  beneficiaryYear?: number;
} = {}) {
  render(
    <ProjectsCardList
      projects={projects}
      total={total}
      page={page}
      totalPages={totalPages}
      years={[2025, 2024]}
      status={status}
      beneficiaryYear={beneficiaryYear}
    />
  );
}

beforeEach(() => {
  mocks.searchParams = new URLSearchParams();
  mocks.replace.mockClear();
  mocks.loadProjectsPage.mockReset();
  mocks.observers.length = 0;
});

test('marks the status received from the server as selected', () => {
  renderList({ status: 'paused' });

  expect(screen.getByRole('tab', { name: 'Pausados' }).getAttribute('aria-selected')).toBe('true');
});

test('stores the selected status in the URL keeping the other filters', () => {
  mocks.searchParams = new URLSearchParams('beneficiaryYear=2025');

  renderList();
  fireEvent.click(screen.getByRole('tab', { name: 'Cerrados' }));

  expect(mocks.replace).toHaveBeenCalledWith(
    '/dashboard/projects?beneficiaryYear=2025&status=closed',
    { scroll: false }
  );
});

test('stores the all status explicitly so the default is not applied again', () => {
  renderList();
  fireEvent.click(screen.getByRole('tab', { name: 'Todos' }));

  expect(mocks.replace).toHaveBeenCalledWith('/dashboard/projects?status=all', {
    scroll: false,
  });
});

test('renders one card per beneficiary year and one for projects without data', () => {
  renderList({
    projects: [
      buildProject(1, 'Project with years', 'active', [
        BENEFICIARIES_2025,
        { ...BENEFICIARIES_2025, year: 2024 },
      ]),
      buildProject(2, 'Project without data'),
    ],
    status: 'all',
  });

  expect(screen.getAllByText('Project with years')).toHaveLength(2);
  expect(screen.getAllByText('Project without data')).toHaveLength(1);
  expect(screen.getByText('Sin beneficiarios')).toBeTruthy();
});

test('shows the total number of projects matching the filters', () => {
  renderList({ total: 45, totalPages: 3 });

  expect(screen.getAllByText('45 proyectos')).toHaveLength(2);
});

test('loads the next page with the current filters when the end of the list is reached', async () => {
  mocks.loadProjectsPage.mockResolvedValue(
    buildPage([buildProject(2, 'Second page project')], 2, 2)
  );

  renderList({ totalPages: 2, status: 'paused', beneficiaryYear: 2024 });
  await revealSentinel();

  expect(mocks.loadProjectsPage).toHaveBeenCalledWith(
    { status: 'paused', beneficiaryYear: '2024' },
    2
  );
  expect(screen.getByText('Active project')).toBeTruthy();
  expect(screen.getByText('Second page project')).toBeTruthy();
});

test('requests all years when no beneficiary year is selected', async () => {
  mocks.loadProjectsPage.mockResolvedValue(buildPage([], 2, 2));

  render(
    <ProjectsCardList
      projects={[buildProject(1, 'Active project')]}
      total={30}
      page={1}
      totalPages={2}
      years={[2025]}
      status="all"
      beneficiaryYear={undefined}
    />
  );
  await revealSentinel();

  expect(mocks.loadProjectsPage).toHaveBeenCalledWith({ status: 'all', beneficiaryYear: 'all' }, 2);
});

test('skips projects that were already loaded', async () => {
  mocks.loadProjectsPage.mockResolvedValue(
    buildPage([buildProject(1, 'Active project'), buildProject(2, 'New project')], 2, 2)
  );

  renderList({ totalPages: 2 });
  await revealSentinel();

  expect(screen.getAllByText('Active project')).toHaveLength(1);
  expect(screen.getByText('New project')).toBeTruthy();
});

test('stops loading once the last page is reached', async () => {
  mocks.loadProjectsPage.mockResolvedValue(buildPage([buildProject(2, 'Last project')], 2, 2));

  renderList({ totalPages: 2 });
  await revealSentinel();
  await revealSentinel();

  expect(mocks.loadProjectsPage).toHaveBeenCalledTimes(1);
});

test('does not observe the end of the list when everything is loaded', async () => {
  renderList({ totalPages: 1 });
  await revealSentinel();

  expect(mocks.loadProjectsPage).not.toHaveBeenCalled();
});

test('offers a retry when loading the next page fails', async () => {
  mocks.loadProjectsPage
    .mockRejectedValueOnce(new Error('network'))
    .mockResolvedValueOnce(buildPage([buildProject(2, 'Recovered project')], 2, 2));

  renderList({ totalPages: 2 });
  await revealSentinel();

  expect(screen.getByText('No se pudieron cargar más proyectos.')).toBeTruthy();

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  });

  expect(mocks.loadProjectsPage).toHaveBeenCalledTimes(2);
  expect(screen.getByText('Recovered project')).toBeTruthy();
  expect(screen.queryByText('No se pudieron cargar más proyectos.')).toBeNull();
});
