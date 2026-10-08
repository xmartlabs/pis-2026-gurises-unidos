import prisma from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

const CATEGORY_ORDER = [
  { sortOrder: 'asc' },
  { id: 'asc' },
] satisfies Prisma.BeneficiaryCategoryOrderByWithRelationInput[];

export function getActiveBeneficiaryCategories(
  client: Prisma.TransactionClient | typeof prisma = prisma
) {
  return client.beneficiaryCategory.findMany({
    where: { isActive: true },
    orderBy: CATEGORY_ORDER,
    select: { key: true, name: true },
  });
}

export async function getBeneficiaryCategoryLabels() {
  const categories = await prisma.beneficiaryCategory.findMany({
    select: { key: true, name: true },
  });
  return Object.fromEntries(categories.map(({ key, name }) => [key, name]));
}

export async function getBeneficiaryCategoriesWithUsage() {
  const [categories, values] = await Promise.all([
    prisma.beneficiaryCategory.findMany({
      where: { isActive: true },
      orderBy: CATEGORY_ORDER,
      select: { id: true, name: true, isSystem: true },
    }),
    prisma.projectBeneficiaryValue.findMany({
      where: { value: { gt: 0 }, beneficiary: { project: { deletedAt: null } } },
      select: { categoryId: true, beneficiary: { select: { projectId: true } } },
    }),
  ]);
  const projectsByCategory = new Map<number, Set<number>>();
  for (const { categoryId, beneficiary } of values) {
    const projects = projectsByCategory.get(categoryId) ?? new Set();
    projects.add(beneficiary.projectId);
    projectsByCategory.set(categoryId, projects);
  }
  return categories.map((category) => ({
    ...category,
    projectCount: projectsByCategory.get(category.id)?.size ?? 0,
  }));
}
