import { describe, expect, test } from 'vitest';
import { prismaMock } from '../../mocks/prisma';
import { listProjectFilterOptions, listProjects } from '@/lib/projects/list';
import {
  PROJECT_LIST_MAX_PAGE_SIZE,
  PROJECT_LIST_PAGE_SIZE,
  parseProjectFilters,
  type RawProjectFilters,
} from '@/lib/validation/project-filters';

const CARLOS = { id: 3, firstName: 'Carlos', lastName: 'Coordinator' };
const DIANA = { id: 4, firstName: 'Diana', lastName: 'Coordinator' };
const MONTEVIDEO = { id: 1, name: 'Montevideo' };
const CANELONES = { id: 2, name: 'Canelones' };

const PROJECTS = [
  {
    id: 1,
    name: 'Centro comunitario',
    status: 'active',
    intensity: 'high',
    startYear: 2018,
    zone: 'city',
    localityNeighborhood: 'Cerro',
    leadCoordinator: CARLOS,
    department: MONTEVIDEO,
    projectBeneficiaries: [
      {
        year: 2025,
        directChildrenAdolescents: 10,
        indirectChildrenAdolescents: 5,
        youth18To29: 3,
        families: 2,
        coordinatedInstitutions: 1,
        communityLeaders: 4,
        basicServiceStaff: 6,
      },
    ],
  },
  {
    id: 2,
    name: 'Escuela rural',
    status: 'completed',
    intensity: 'low',
    startYear: 2021,
    zone: 'rural',
    localityNeighborhood: null,
    leadCoordinator: DIANA,
    department: CANELONES,
    projectBeneficiaries: [],
  },
];

async function listWith(raw: RawProjectFilters, rows = PROJECTS) {
  prismaMock.project.count.mockResolvedValue(rows.length);
  prismaMock.project.findMany.mockResolvedValue(rows);

  return listProjects(parseProjectFilters(raw));
}

function findManyArgs() {
  return prismaMock.project.findMany.mock.calls[0][0];
}

describe('AC1: listado paginado con los datos de cada proyecto', () => {
  test('exposes name, status, lead coordinator, start year, territory, intensity and beneficiaries', async () => {
    const { items } = await listWith({});

    expect(items[0]).toEqual({
      id: 1,
      name: 'Centro comunitario',
      status: 'active',
      intensity: 'high',
      startYear: 2018,
      zone: 'city',
      localityNeighborhood: 'Cerro',
      leadCoordinator: CARLOS,
      department: MONTEVIDEO,
      beneficiaries: { year: 2025, total: 31 },
    });
    expect(items[1].beneficiaries).toBeNull();
  });

  test('lists projects alphabetically by name', async () => {
    await listWith({});

    expect(findManyArgs().orderBy).toEqual([{ name: 'asc' }, { id: 'asc' }]);
  });

  test('requests the first page with the default page size', async () => {
    const result = await listWith({});

    expect(result).toMatchObject({ page: 1, pageSize: PROJECT_LIST_PAGE_SIZE, totalPages: 1 });
    expect(findManyArgs()).toMatchObject({ skip: 0, take: PROJECT_LIST_PAGE_SIZE });
  });

  test('computes the page window and total pages for a later page', async () => {
    prismaMock.project.count.mockResolvedValue(53);
    prismaMock.project.findMany.mockResolvedValue([]);

    const result = await listProjects(parseProjectFilters({ page: '3', pageSize: '20' }));

    expect(result).toMatchObject({ total: 53, page: 3, pageSize: 20, totalPages: 3 });
    expect(findManyArgs()).toMatchObject({ skip: 40, take: 20 });
  });

  test('falls back to the last page when the requested page is past the end', async () => {
    prismaMock.project.count.mockResolvedValue(53);
    prismaMock.project.findMany.mockResolvedValue([]);

    const result = await listProjects(parseProjectFilters({ page: '10', pageSize: '20' }));

    expect(result.page).toBe(3);
    expect(findManyArgs()).toMatchObject({ skip: 40, take: 20 });
  });

  test('ignores invalid page values and caps the page size', async () => {
    const result = await listWith({ page: '-2', pageSize: '5000' });

    expect(result).toMatchObject({ page: 1, pageSize: PROJECT_LIST_PAGE_SIZE });

    const capped = await listWith({ pageSize: String(PROJECT_LIST_MAX_PAGE_SIZE + 1) });

    expect(capped.pageSize).toBe(PROJECT_LIST_PAGE_SIZE);
  });
});

describe('AC2: filtros', () => {
  test('by status', async () => {
    await listWith({ status: 'completed' });

    expect(findManyArgs().where).toEqual({ status: 'completed' });
  });

  test('by lead coordinator', async () => {
    await listWith({ leadCoordinatorId: '4' });

    expect(findManyArgs().where).toEqual({ leadCoordinatorId: 4 });
  });

  test('by start year range', async () => {
    await listWith({ startYearFrom: '2019', startYearTo: '2022' });

    expect(findManyArgs().where).toEqual({ startYear: { gte: 2019, lte: 2022 } });
  });

  test('by start year range with only one bound', async () => {
    await listWith({ startYearTo: '2020' });

    expect(findManyArgs().where).toEqual({ startYear: { gte: undefined, lte: 2020 } });
  });

  test('by intensity', async () => {
    await listWith({ intensity: 'high' });

    expect(findManyArgs().where).toEqual({ intensity: 'high' });
  });

  test('by department', async () => {
    await listWith({ departmentId: '2' });

    expect(findManyArgs().where).toEqual({ departmentId: 2 });
  });

  test('by name, case-insensitive', async () => {
    await listWith({ search: 'CENTRO' });

    expect(findManyArgs().where).toEqual({
      name: { contains: 'CENTRO', mode: 'insensitive' },
    });
  });

  test('combines several filters with AND', async () => {
    await listWith({ status: 'active', leadCoordinatorId: '3', startYearFrom: '2015' });

    expect(findManyArgs().where).toEqual({
      status: 'active',
      leadCoordinatorId: 3,
      startYear: { gte: 2015, lte: undefined },
    });
  });

  test('applies the same filters to the total count', async () => {
    await listWith({ status: 'active', departmentId: '1' });

    expect(prismaMock.project.count).toHaveBeenCalledWith({
      where: { status: 'active', departmentId: 1 },
    });
  });

  test('ignores filters with invalid values', async () => {
    await listWith({
      status: 'deleted',
      intensity: 'extreme',
      leadCoordinatorId: 'abc',
      departmentId: '0',
      startYearFrom: '1500',
      startYearTo: '3000',
    });

    expect(findManyArgs().where).toEqual({});
  });

  test('resets to the first page when the page is beyond the filtered results', async () => {
    prismaMock.project.count.mockResolvedValue(1);
    prismaMock.project.findMany.mockResolvedValue([PROJECTS[1]]);

    const result = await listProjects(parseProjectFilters({ status: 'completed', page: '4' }));

    expect(result).toMatchObject({ page: 1, total: 1, totalPages: 1 });
    expect(result.items.map((item) => item.name)).toEqual(['Escuela rural']);
  });
});

describe('AC3: sin proyectos', () => {
  test('returns an empty page with a single page when there are no projects', async () => {
    const result = await listWith({}, []);

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: PROJECT_LIST_PAGE_SIZE,
      totalPages: 1,
    });
  });

  test('returns an empty page when no project matches the filters', async () => {
    const result = await listWith({ status: 'archived', leadCoordinatorId: '3' }, []);

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(prismaMock.project.findMany).not.toHaveBeenCalled();
  });
});

describe('parseProjectFilters', () => {
  test('returns defaults when no params are given', () => {
    expect(parseProjectFilters({})).toEqual({ page: 1, pageSize: PROJECT_LIST_PAGE_SIZE });
  });

  test('treats an empty or blank search as absent', () => {
    expect(parseProjectFilters({ search: '' }).search).toBeUndefined();
    expect(parseProjectFilters({ search: '   ' }).search).toBeUndefined();
  });

  test('swaps an inverted year range', () => {
    const filters = parseProjectFilters({ startYearFrom: '2022', startYearTo: '2018' });

    expect(filters.startYearFrom).toBe(2018);
    expect(filters.startYearTo).toBe(2022);
  });

  test('uses the first value of repeated params', () => {
    expect(parseProjectFilters({ status: ['completed', 'active'] }).status).toBe('completed');
  });
});

describe('listProjectFilterOptions', () => {
  test('returns coordinators and departments that lead or host projects', async () => {
    prismaMock.user.findMany.mockResolvedValue([CARLOS]);
    prismaMock.department.findMany.mockResolvedValue([MONTEVIDEO]);

    expect(await listProjectFilterOptions()).toEqual({
      coordinators: [CARLOS],
      departments: [MONTEVIDEO],
    });
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null, ledProjects: { some: {} } } })
    );
    expect(prismaMock.department.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projects: { some: {} } } })
    );
  });
});
