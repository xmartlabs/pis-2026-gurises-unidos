import prisma from '@/lib/prisma';
import {
  BENEFICIARY_FIELDS,
  sumBeneficiaries,
  type BeneficiaryCounts,
} from '@/lib/project-display';

export async function getDepartmentBeneficiaries(year: number) {
  const records = await prisma.projectBeneficiary.findMany({
    where: { year },
    select: {
      ...Object.fromEntries(BENEFICIARY_FIELDS.map(({ key }) => [key, true])),
      project: { select: { department: { select: { name: true } } } },
    },
  });

  const totalsByDepartment = new Map<string, BeneficiaryCounts>();
  for (const record of records as (BeneficiaryCounts & {
    project: { department: { name: string } };
  })[]) {
    const department = record.project.department.name;
    const totals =
      totalsByDepartment.get(department) ??
      (Object.fromEntries(BENEFICIARY_FIELDS.map(({ key }) => [key, 0])) as BeneficiaryCounts);
    for (const { key } of BENEFICIARY_FIELDS) totals[key] += record[key];
    totalsByDepartment.set(department, totals);
  }

  return [...totalsByDepartment]
    .map(([department, totals]) => ({ department, ...totals }))
    .sort((a, b) => sumBeneficiaries(b) - sumBeneficiaries(a));
}
