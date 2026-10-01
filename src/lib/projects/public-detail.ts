import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

const PUBLIC_PROJECT_SELECT = {
  id: true,
  name: true,
  status: true,
  startYear: true,
  endYear: true,
  localityNeighborhood: true,
  generalObjective: true,
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
  return prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    select: PUBLIC_PROJECT_SELECT,
  });
}
