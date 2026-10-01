import prisma from '@/lib/prisma';
import { METRIC_DEFINITIONS } from '@/lib/metrics/constants';

export async function getMetricSettings() {
  const savedMetrics = await prisma.metric.findMany({
    select: { key: true, showPublicly: true },
  });
  return METRIC_DEFINITIONS.map((metric) => ({
    ...metric,
    showPublicly:
      savedMetrics.find((saved) => saved.key === metric.key)?.showPublicly ?? metric.showPublicly,
  }));
}

export type MetricSetting = Awaited<ReturnType<typeof getMetricSettings>>[number];

export async function getMetricYears(currentYear: number) {
  const beneficiaries = await prisma.projectBeneficiary.findMany({
    where: { project: { deletedAt: null } },
    select: { year: true },
    distinct: ['year'],
  });

  return [...new Set([currentYear - 1, currentYear, ...beneficiaries.map(({ year }) => year)])]
    .filter((year) => year <= currentYear)
    .sort((a, b) => b - a);
}

export async function getMetricValues(year: number) {
  const [beneficiaries, projectRecords] = await Promise.all([
    prisma.projectBeneficiary.aggregate({
      where: { year, project: { deletedAt: null } },
      _sum: {
        directChildrenAdolescents: true,
        indirectChildrenAdolescents: true,
        families: true,
        basicServiceStaff: true,
        coordinatedInstitutions: true,
      },
    }),
    prisma.projectBeneficiary.findMany({
      where: { year, project: { deletedAt: null } },
      select: {
        projectId: true,
        project: { select: { departmentId: true } },
      },
    }),
  ]);

  return {
    children_reached:
      (beneficiaries._sum.directChildrenAdolescents ?? 0) +
      (beneficiaries._sum.indirectChildrenAdolescents ?? 0),
    families: beneficiaries._sum.families ?? 0,
    teachers: beneficiaries._sum.basicServiceStaff ?? 0,
    institutions: beneficiaries._sum.coordinatedInstitutions ?? 0,
    departments: new Set(projectRecords.map(({ project }) => project.departmentId)).size,
    active_projects: projectRecords.length,
  };
}

export type MetricValues = Awaited<ReturnType<typeof getMetricValues>>;
