import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { FIRST_PROJECT_YEAR } from '@/lib/project-display';

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
    select: {
      year: true,
      directChildrenAdolescents: true,
      indirectChildrenAdolescents: true,
      families: true,
      coordinatedInstitutions: true,
    },
  },
} satisfies Prisma.ProjectSelect;

export type PublicProjectDetail = Prisma.ProjectGetPayload<{
  select: typeof PUBLIC_PROJECT_SELECT;
}>;

export function getPublicProjectDetail(projectId: number) {
  const currentYear = new Date().getFullYear();

  return prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    select: {
      ...PUBLIC_PROJECT_SELECT,
      projectBeneficiaries: {
        ...PUBLIC_PROJECT_SELECT.projectBeneficiaries,
        where: { year: { gte: FIRST_PROJECT_YEAR, lte: currentYear } },
      },
    },
  });
}
