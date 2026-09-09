import { ProjectStatus, Intensity } from '@/generated/prisma/enums';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Activo',
  inProgress: 'En progreso',
  completed: 'Completado',
  archived: 'Archivado',
};

export const INTENSITY_LABEL: Record<Intensity, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export type BeneficiaryCounts = {
  directChildrenAdolescents: number;
  indirectChildrenAdolescents: number;
  youth18To29: number;
  families: number;
  coordinatedInstitutions: number;
  communityLeaders: number;
  basicServiceStaff: number;
};

export const BENEFICIARY_FIELDS: { key: keyof BeneficiaryCounts; label: string }[] = [
  { key: 'directChildrenAdolescents', label: 'NNA directos' },
  { key: 'indirectChildrenAdolescents', label: 'NNA indirectos' },
  { key: 'youth18To29', label: 'Jóvenes (18 a 29)' },
  { key: 'families', label: 'Familias' },
  { key: 'coordinatedInstitutions', label: 'Instituciones coordinadas' },
  { key: 'communityLeaders', label: 'Referentes comunitarios' },
  { key: 'basicServiceStaff', label: 'Personal de servicios básicos' },
];

export function sumBeneficiaries(counts: BeneficiaryCounts) {
  return BENEFICIARY_FIELDS.reduce((sum, field) => sum + counts[field.key], 0);
}
