import {
  ZONE_OPTIONS,
  PREVIEW_LOCATION_FALLBACK,
  type BeneficiaryCategoryOption,
} from '@/lib/project-display';
import type { ProjectFormValues } from './project-form-values';

export function getPreviewLabels(
  values: ProjectFormValues,
  departments: { id: number; name: string }[],
  isEditing: boolean,
  categories: BeneficiaryCategoryOption[]
) {
  const departmentLabel = departments.find(
    (department) => String(department.id) === values.departmentId
  )?.name;
  const zoneLabel = ZONE_OPTIONS.find((option) => option.value === values.zone)?.label;
  const locationLabel =
    (isEditing && values.localityNeighborhood.trim()) ||
    departmentLabel ||
    zoneLabel ||
    PREVIEW_LOCATION_FALLBACK;
  const coverageLabel = [departmentLabel, values.localityNeighborhood.trim()]
    .filter(Boolean)
    .join(' • ');
  const beneficiaryTotal = categories.reduce(
    (total, { key }) => total + Math.max(0, Number(values[key]) || 0),
    0
  );

  return { locationLabel, coverageLabel, beneficiaryTotal };
}
