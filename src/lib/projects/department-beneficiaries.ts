import prisma from '@/lib/prisma';
import {
  BENEFICIARY_FIELDS,
  sumBeneficiaries,
  type BeneficiaryCounts,
} from '@/lib/project-display';
import { BENEFICIARY_VALUES_SELECT, toBeneficiaryCounts } from '@/lib/projects/beneficiary-values';

export async function getDepartmentBeneficiaries(year: number) {
  const records = await prisma.projectBeneficiary.findMany({
    where: { year },
    select: {
      ...BENEFICIARY_VALUES_SELECT,
      project: { select: { department: { select: { name: true } } } },
    },
  });

  const totalsByDepartment = new Map<string, BeneficiaryCounts>();
  for (const { values, project } of records) {
    const department = project.department.name;
    const counts = toBeneficiaryCounts(values);
    const totals =
      totalsByDepartment.get(department) ??
      (Object.fromEntries(BENEFICIARY_FIELDS.map(({ key }) => [key, 0])) as BeneficiaryCounts);
    for (const { key } of BENEFICIARY_FIELDS) totals[key] += counts[key];
    totalsByDepartment.set(department, totals);
  }

  return [...totalsByDepartment]
    .map(([department, totals]) => ({ department, ...totals }))
    .sort((a, b) => sumBeneficiaries(b) - sumBeneficiaries(a));
}
