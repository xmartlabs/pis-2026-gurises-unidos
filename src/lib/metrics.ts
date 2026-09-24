import prisma from '@/lib/prisma';

export async function getMetricYears(currentYear: number) {
  const [beneficiaries, projects] = await Promise.all([
    prisma.projectBeneficiary.findMany({ select: { year: true }, distinct: ['year'] }),
    prisma.project.findMany({ select: { startYear: true }, distinct: ['startYear'] }),
  ]);

  return [
    ...new Set([
      currentYear - 1,
      currentYear,
      ...beneficiaries.map(({ year }) => year),
      ...projects.map(({ startYear }) => startYear),
    ]),
  ]
    .filter((year) => year <= currentYear)
    .sort((a, b) => b - a);
}

export async function getMetricValues(year: number) {
  const [beneficiaries, activeProjects, departments] = await Promise.all([
    prisma.projectBeneficiary.aggregate({
      where: { year },
      _sum: {
        directChildrenAdolescents: true,
        indirectChildrenAdolescents: true,
        families: true,
        basicServiceStaff: true,
        coordinatedInstitutions: true,
      },
    }),
    prisma.project.count({ where: { startYear: year, status: 'active' } }),
    prisma.project.findMany({
      where: { startYear: year },
      select: { departmentId: true },
      distinct: ['departmentId'],
    }),
  ]);

  return {
    children_reached:
      (beneficiaries._sum.directChildrenAdolescents ?? 0) +
      (beneficiaries._sum.indirectChildrenAdolescents ?? 0),
    families: beneficiaries._sum.families ?? 0,
    teachers: beneficiaries._sum.basicServiceStaff ?? 0,
    institutions: beneficiaries._sum.coordinatedInstitutions ?? 0,
    departments: departments.length,
    active_projects: activeProjects,
  };
}

export type MetricValues = Awaited<ReturnType<typeof getMetricValues>>;
