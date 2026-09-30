import type { ProjectListItem } from '@/lib/projects/list';
import { BENEFICIARY_FIELDS, type BeneficiaryCounts } from '@/lib/project-display';

export function getDepartmentBeneficiaries(projects: ProjectListItem[]) {
  const totalsByDepartment = new Map<string, BeneficiaryCounts>();
  for (const project of projects) {
    const totals =
      totalsByDepartment.get(project.department.name) ??
      (Object.fromEntries(BENEFICIARY_FIELDS.map(({ key }) => [key, 0])) as BeneficiaryCounts);
    for (const record of project.beneficiaries) {
      for (const { key } of BENEFICIARY_FIELDS) totals[key] += record[key];
    }
    totalsByDepartment.set(project.department.name, totals);
  }

  return [...totalsByDepartment]
    .map(([department, totals]) => ({ department, ...totals }))
    .sort((a, b) => a.department.localeCompare(b.department));
}
