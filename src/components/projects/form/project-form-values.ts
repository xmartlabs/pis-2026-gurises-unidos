import type { BeneficiaryFieldName } from '@/lib/project-display';
import type { ProjectFormData } from '@/lib/validation/project-form';

export type ProjectFormValues = {
  [K in keyof ProjectFormData]: string;
} & { coverPhotoUrl: string | null } & { [K in BeneficiaryFieldName]?: string };
