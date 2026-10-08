import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { FIRST_PROJECT_YEAR } from '@/lib/project-display';
import { BENEFICIARY_VALUES_SELECT, toBeneficiaryCounts } from '@/lib/projects/beneficiary-values';

const PUBLIC_PROJECT_SELECT = {
  id: true,
  name: true,
  status: true,
  startYear: true,
  endYear: true,
  localityNeighborhood: true,
  publicDescription: true,
  coverPhoto: true,
  department: {
    select: { name: true },
  },
  projectBeneficiaries: {
    orderBy: { year: 'desc' },
    take: 1,
    select: { year: true, ...BENEFICIARY_VALUES_SELECT },
  },
} satisfies Prisma.ProjectSelect;

export async function getPublicProjectDetail(projectId: number) {
  const currentYear = new Date().getFullYear();

  const project = await prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    select: {
      ...PUBLIC_PROJECT_SELECT,
      projectBeneficiaries: {
        ...PUBLIC_PROJECT_SELECT.projectBeneficiaries,
        where: { year: { gte: FIRST_PROJECT_YEAR, lte: currentYear } },
      },
    },
  });

  if (project === null) return null;

  return {
    ...project,
    projectBeneficiaries: project.projectBeneficiaries.map(({ year, values }) => ({
      year,
      ...toBeneficiaryCounts(values),
    })),
  };
}
