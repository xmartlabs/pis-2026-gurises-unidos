import type { z } from 'zod';
import type { projectFormSchema } from '@/lib/validation/project-form';

export type ProjectFormValues = {
  [K in Exclude<keyof z.infer<typeof projectFormSchema>, 'topicIds'>]: string;
} & { topicIds: string[]; coverPhotoUrl: string | null };
