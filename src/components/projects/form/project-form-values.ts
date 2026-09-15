import type { z } from 'zod';
import type { projectFormSchema } from '@/lib/validation/project-form';

export type ProjectFormValues = {
  [K in keyof z.infer<typeof projectFormSchema>]: string;
} & {
  topic: string;
  coverPhoto: File | null;
  coverPhotoUrl: string | null;
};
