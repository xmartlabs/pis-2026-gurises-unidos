// TO DO

'use server';

import { redirect } from 'next/navigation';
import { userFormSchema, type UserFormState } from '@/lib/validation/user';

export async function createUser(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  if (formData.get('intent') === 'submit') {
    const result = userFormSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      const errors: Record<string, string[]> = {};

      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        errors[field] = [...(errors[field] ?? []), issue.message];
      }

      return { errors };
    }

    redirect('/users');
  }

  return {};
}
