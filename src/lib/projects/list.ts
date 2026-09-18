import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { sumBeneficiaries } from '@/lib/project-display';
import type { ProjectFilters } from '@/lib/validation/project-filters';

const PROJECT_LIST_SELECT = {
  id: true,
  name: true,
  status: true,
  intensity: true,
  startYear: true,
  zone: true,
  localityNeighborhood: true,
  leadCoordinator: { select: { id: true, firstName: true, lastName: true } },
  department: { select: { id: true, name: true } },
  projectBeneficiaries: {
    orderBy: { year: 'desc' },
    take: 1,
    select: {
      year: true,
      directChildrenAdolescents: true,
      indirectChildrenAdolescents: true,
      youth18To29: true,
      families: true,
      coordinatedInstitutions: true,
      communityLeaders: true,
      basicServiceStaff: true,
    },
  },
} satisfies Prisma.ProjectSelect;

type ProjectListRow = Prisma.ProjectGetPayload<{ select: typeof PROJECT_LIST_SELECT }>;

export type ProjectListItem = Omit<ProjectListRow, 'projectBeneficiaries'> & {
  beneficiaries: { year: number; total: number } | null;
};

export type ProjectListPage = {
  items: ProjectListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function buildProjectWhere(filters: ProjectFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.intensity) {
    where.intensity = filters.intensity;
  }
  if (filters.leadCoordinatorId) {
    where.leadCoordinatorId = filters.leadCoordinatorId;
  }
  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }
  if (filters.startYearFrom !== undefined || filters.startYearTo !== undefined) {
    where.startYear = { gte: filters.startYearFrom, lte: filters.startYearTo };
  }

  return where;
}

function toListItem({ projectBeneficiaries, ...project }: ProjectListRow): ProjectListItem {
  const latest = projectBeneficiaries[0];

  return {
    ...project,
    beneficiaries: latest ? { year: latest.year, total: sumBeneficiaries(latest) } : null,
  };
}

export async function listProjects(filters: ProjectFilters): Promise<ProjectListPage> {
  const where = buildProjectWhere(filters);
  const total = await prisma.project.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);

  const rows =
    total === 0
      ? []
      : await prisma.project.findMany({
          where,
          select: PROJECT_LIST_SELECT,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          skip: (page - 1) * filters.pageSize,
          take: filters.pageSize,
        });

  return {
    items: rows.map(toListItem),
    total,
    page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

export async function listProjectFilterOptions() {
  const [coordinators, departments] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null, ledProjects: { some: {} } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
    prisma.department.findMany({
      where: { projects: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return { coordinators, departments };
}
