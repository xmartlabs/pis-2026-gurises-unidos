import type { ComponentProps } from 'react';
import type { Project, ProjectBeneficiary } from '@/generated/prisma/client';
import { ProjectForm } from '@/components/project-form';

type EditProjectFormProps = Omit<ComponentProps<typeof ProjectForm>, 'initialValues' | 'mode'> & {
  project: Project & { projectBeneficiaries: ProjectBeneficiary[] };
};

export function EditProjectForm({ project, ...props }: EditProjectFormProps) {
  const beneficiaries = project.projectBeneficiaries[0];

  return (
    <ProjectForm
      {...props}
      mode="edit"
      initialValues={{
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
        year: String(beneficiaries?.year ?? new Date().getFullYear()),
        directChildrenAdolescents: String(beneficiaries?.directChildrenAdolescents ?? 0),
        indirectChildrenAdolescents: String(beneficiaries?.indirectChildrenAdolescents ?? 0),
        youth18To29: String(beneficiaries?.youth18To29 ?? 0),
        families: String(beneficiaries?.families ?? 0),
        coordinatedInstitutions: String(beneficiaries?.coordinatedInstitutions ?? 0),
        communityLeaders: String(beneficiaries?.communityLeaders ?? 0),
        basicServiceStaff: String(beneficiaries?.basicServiceStaff ?? 0),
      }}
    />
  );
}
