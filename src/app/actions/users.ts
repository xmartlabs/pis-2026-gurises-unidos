// TO DO

'use server';

import { redirect } from 'next/navigation';
import type { UserFormState } from '@/lib/validation/user';

export async function createUser(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  if (formData.get('intent') === 'submit') {
    redirect('/users');
  }

  return {};
}
