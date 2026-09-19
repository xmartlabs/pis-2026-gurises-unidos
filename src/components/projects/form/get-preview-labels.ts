import { BENEFICIARY_FIELDS, ZONE_OPTIONS, PREVIEW_LOCATION_FALLBACK } from '@/lib/project-display';
import type { ProjectFormValues } from './project-form-values';

export function getPreviewLabels(
  values: ProjectFormValues,
  departments: { id: number; name: string }[],
  topics: { id: number; name: string }[],
  isEditing: boolean
) {
  const topicLabel =
    topics
      .filter((topic) => values.topicIds.includes(String(topic.id)))
      .map((topic) => topic.name)
      .join(', ') || 'Sin temática';
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
  const beneficiaryTotal = BENEFICIARY_FIELDS.reduce(
    (total, field) => total + Math.max(0, Number(values[field.key]) || 0),
    0
  );

  return { topicLabel, locationLabel, coverageLabel, beneficiaryTotal };
}
