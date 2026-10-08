import type { ProjectFormData } from '@/lib/validation/project-form';

export type ProjectFormValues = {
  [K in keyof ProjectFormData]: string;
} & { coverPhotoUrl: string | null } & Record<string, string | null>;
