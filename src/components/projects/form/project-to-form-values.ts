import type { Project, ProjectBeneficiary, ProjectTopic } from '@/generated/prisma/client';
import { BENEFICIARY_FIELDS } from '@/lib/project-display';
import { getDefaultValues } from './get-default-values';
import type { ProjectFormValues } from './project-form-values';

export function projectToFormValues(
  project: Project & { projectBeneficiaries: ProjectBeneficiary[]; projectTopics: ProjectTopic[] },
  currentYear: number
): ProjectFormValues {
  const beneficiary = project.projectBeneficiaries.find(({ year }) => year === currentYear);
  const defaults = getDefaultValues(currentYear);
  return {
    ...defaults,
    name: project.name,
    status: project.status,
    intensity: project.intensity,
    startYear: String(project.startYear),
    leadCoordinatorId: String(project.leadCoordinatorId),
    departmentId: String(project.departmentId),
    zone: project.zone,
    localityNeighborhood: project.localityNeighborhood ?? '',
    generalObjective: project.generalObjective ?? '',
    publicDescription: project.publicDescription ?? '',
    internalNotes: project.internalNotes ?? '',
    coverPhotoUrl: project.coverPhoto,
    topicIds: project.projectTopics.map(({ topicId }) => String(topicId)),
    ...Object.fromEntries(
      BENEFICIARY_FIELDS.map(({ key }) => [key, String(beneficiary?.[key] ?? 0)])
    ),
  };
}
