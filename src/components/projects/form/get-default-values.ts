import type { ProjectFormValues } from './project-form-values';

export function getDefaultValues(currentYear: number): ProjectFormValues {
  return {
    year: String(currentYear),
    name: '',
    status: 'active',
    topicIds: [],
    intensity: 'high',
    startYear: String(currentYear),
    leadCoordinatorId: '',
    departmentId: '',
    zone: 'city',
    localityNeighborhood: '',
    generalObjective: '',
    publicDescription: '',
    internalNotes: '',
    directChildrenAdolescents: '0',
    indirectChildrenAdolescents: '0',
    youth18To29: '0',
    families: '0',
    coordinatedInstitutions: '0',
    communityLeaders: '0',
    basicServiceStaff: '0',
    coverPhotoUrl: null,
  };
}
