import { ProjectStatus, Intensity } from '@/generated/prisma/enums';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Activo',
  inProgress: 'En progreso',
  completed: 'Finalizado',
  archived: 'Archivado',
};

export const INTENSITY_LABEL: Record<Intensity, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export const STATUS_OPTIONS = [
  { value: 'active', label: STATUS_LABEL.active },
  { value: 'completed', label: STATUS_LABEL.completed },
  { value: 'archived', label: STATUS_LABEL.archived },
] as const;

export const INTENSITY_OPTIONS = [
  { value: 'high', label: INTENSITY_LABEL.high },
  { value: 'medium', label: INTENSITY_LABEL.medium },
  { value: 'low', label: INTENSITY_LABEL.low },
] as const;

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

export const TOPIC_OPTIONS = [
  { value: 'education', label: 'Educación' },
  { value: 'health', label: 'Salud' },
  { value: 'protection', label: 'Protección' },
  { value: 'community', label: 'Comunidad' },
  { value: 'employment', label: 'Empleo' },
] as const;

export const ZONE_OPTIONS = [
  { value: 'city', label: 'Montevideo' },
  { value: 'inland', label: 'Interior' },
  { value: 'border', label: 'Frontera' },
  { value: 'rural', label: 'Rural' },
] as const;

export const FIRST_PROJECT_YEAR = 1989;
export const PREVIEW_TOPIC_FALLBACK = 'Educación';
export const PREVIEW_LOCATION_FALLBACK = 'Montevideo';

export function sumBeneficiaries(counts: BeneficiaryCounts) {
  return BENEFICIARY_FIELDS.reduce((sum, field) => sum + counts[field.key], 0);
}
