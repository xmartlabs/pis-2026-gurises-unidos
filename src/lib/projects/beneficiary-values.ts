import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { BENEFICIARY_FIELDS, type BeneficiaryCounts } from '@/lib/project-display';

export const BENEFICIARY_VALUES_SELECT = {
  values: { select: { value: true, category: { select: { key: true } } } },
} satisfies Prisma.ProjectBeneficiarySelect;

type BeneficiaryValueRow = { value: number; category: { key: string } };

export function toBeneficiaryCounts(values: BeneficiaryValueRow[]): BeneficiaryCounts {
  const counts = Object.fromEntries(BENEFICIARY_FIELDS.map(({ key }) => [key, 0]));
  for (const { value, category } of values) {
    if (category.key in counts) counts[category.key] = value;
  }
  return counts as BeneficiaryCounts;
}

export function toBeneficiaryValuesCreate(counts: BeneficiaryCounts) {
  return BENEFICIARY_FIELDS.filter(({ key }) => counts[key] > 0).map(({ key }) => ({
    value: counts[key],
    category: { connect: { key } },
  }));
}

export async function sumBeneficiaryValues(
  where: Prisma.ProjectBeneficiaryWhereInput,
  keys: (keyof BeneficiaryCounts)[]
) {
  const { _sum } = await prisma.projectBeneficiaryValue.aggregate({
    where: { beneficiary: where, category: { key: { in: keys } } },
    _sum: { value: true },
  });
  return _sum.value ?? 0;
}

export async function sumBeneficiaryCounts(where: Prisma.ProjectBeneficiaryWhereInput) {
  const [sums, categories] = await Promise.all([
    prisma.projectBeneficiaryValue.groupBy({
      by: ['categoryId'],
      where: { beneficiary: where },
      _sum: { value: true },
    }),
    prisma.beneficiaryCategory.findMany({ select: { id: true, key: true } }),
  ]);
  const keyById = new Map(categories.map(({ id, key }) => [id, key]));
  return toBeneficiaryCounts(
    sums.map(({ categoryId, _sum }) => ({
      value: _sum.value ?? 0,
      category: { key: keyById.get(categoryId) ?? '' },
    }))
  );
}
