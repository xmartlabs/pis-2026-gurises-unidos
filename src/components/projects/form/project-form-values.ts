import type { BeneficiaryCounts } from '@/lib/project-display';

export type ProjectFormValues = {
  name: string;
  status: string;
  topic: string;
  intensity: string;
  startYear: string;
  leadCoordinatorId: string;
  departmentId: string;
  zone: string;
  localityNeighborhood: string;
  generalObjective: string;
  publicDescription: string;
  internalNotes: string;
  coverPhoto: File | null;
  coverPhotoUrl: string | null;
} & Record<keyof BeneficiaryCounts, string>;
