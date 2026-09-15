import type { z } from 'zod';
import type { projectFormSchema } from '@/lib/validation/project-form';

export type ProjectFormValues = {
  [K in keyof Omit<z.infer<typeof projectFormSchema>, 'year'>]: string;
} & {
  topic: string;
  coverPhoto: File | null;
  coverPhotoUrl: string | null;
};
