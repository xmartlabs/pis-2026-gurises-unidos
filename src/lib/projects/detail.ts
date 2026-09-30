import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/auth/require-user';
import { BENEFICIARY_FIELDS, FIRST_PROJECT_YEAR } from '@/lib/project-display';
import {
  calculatePercentage,
  compareMetric,
  getChildrenReached,
} from '@/lib/projects/detail-metrics';
import { canEditProject } from '@/lib/projects/permissions';
import { parseProjectDetailInput } from '@/lib/validation/project-detail';

const BENEFICIARY_SELECT = {
  directChildrenAdolescents: true,
  indirectChildrenAdolescents: true,
  youth18To29: true,
  families: true,
  coordinatedInstitutions: true,
  communityLeaders: true,
  basicServiceStaff: true,
} satisfies Prisma.ProjectBeneficiarySelect;

export async function getProjectDetail(rawProjectId: unknown, rawYear?: unknown) {
  const user = await requireUser();

  const currentYear = new Date().getFullYear();
  const parsed = parseProjectDetailInput(rawProjectId, rawYear, currentYear);

  if (!parsed.success) {
    return {
      status: 'invalidInput' as const,
      field: parsed.field,
    };
  }

  const { projectId, year } = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      status: true,
      intensity: true,
      startYear: true,
      leadCoordinatorId: true,
      generalObjective: true,
      publicDescription: true,
      coverPhoto: true,
      zone: true,
      localityNeighborhood: true,
      leadCoordinator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      topic: {
        select: {
          id: true,
          name: true,
        },
      },
      projectBeneficiaries: {
        where: {
          year: {
            gte: FIRST_PROJECT_YEAR,
            lte: currentYear,
          },
        },
        orderBy: { year: 'desc' },
        select: { year: true },
      },
    },
  });

  if (project === null) {
    return { status: 'notFound' as const };
  }

  const selectedYear = year ?? project.projectBeneficiaries[0]?.year ?? currentYear;
  const comparisonYear = selectedYear - 1;

  const availableYears = [
    ...new Set([currentYear, ...project.projectBeneficiaries.map((record) => record.year)]),
  ].sort((a, b) => b - a);

  const [current, previous, national, activeProjectCount] = await Promise.all([
    prisma.projectBeneficiary.findUnique({
      where: {
        projectId_year: {
          projectId,
          year: selectedYear,
        },
      },
      select: BENEFICIARY_SELECT,
    }),
    prisma.projectBeneficiary.findUnique({
      where: {
        projectId_year: {
          projectId,
          year: comparisonYear,
        },
      },
      select: BENEFICIARY_SELECT,
    }),
    prisma.projectBeneficiary.aggregate({
      where: { year: selectedYear },
      _sum: {
        directChildrenAdolescents: true,
        indirectChildrenAdolescents: true,
      },
    }),
    prisma.project.count({ where: { status: 'active' } }),
  ]);

  const childrenReached = compareMetric(getChildrenReached(current), getChildrenReached(previous));

  const families = compareMetric(current?.families ?? null, previous?.families ?? null);

  const institutions = compareMetric(
    current?.coordinatedInstitutions ?? null,
    previous?.coordinatedInstitutions ?? null
  );

  const nationalChildrenReached =
    (national._sum.directChildrenAdolescents ?? 0) +
    (national._sum.indirectChildrenAdolescents ?? 0);

  const { projectBeneficiaries: recordedYears, ...projectData } = project;
  const hasData = current !== null;

  return {
    status: 'success' as const,
    data: {
      project: projectData,
      selectedYear,
      comparisonYear,
      availableYears,
      hasData,
      hasHistoricalData: recordedYears.length > 0,
      canEdit: canEditProject(user, project),
      metrics: {
        childrenReached,
        families,
        institutions,
        annualGrowth: childrenReached.percentageChange,
      },
      distribution: BENEFICIARY_FIELDS.map(({ key }) => ({
        key,
        value: current?.[key] ?? null,
      })),
      institutionalContribution: {
        nationalReach: {
          projectValue: childrenReached.value,
          nationalValue: nationalChildrenReached,
          percentage: calculatePercentage(childrenReached.value, nationalChildrenReached),
        },
        activeProjects: {
          projectCount: project.status === 'active' ? 1 : 0,
          totalCount: activeProjectCount,
        },
        territories: {
          count: 1,
          items: [
            {
              department: project.department,
              zone: project.zone,
              localityNeighborhood: project.localityNeighborhood,
            },
          ],
        },
      },
    },
  };
}

export type ProjectDetailResult = Awaited<ReturnType<typeof getProjectDetail>>;

export type ProjectDetail = Extract<ProjectDetailResult, { status: 'success' }>['data'];
