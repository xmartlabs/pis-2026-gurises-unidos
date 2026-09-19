'use server';

import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { flattenError } from 'zod';
import { signIn, signOut } from '@/auth';
import { loginSchema, type LoginFormState } from '@/lib/validation/auth';

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const rawDocumentId = String(formData.get('documentId') ?? '');
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: flattenError(parsed.error).fieldErrors, documentId: rawDocumentId };
  }

  const { documentId, password } = parsed.data;

  try {
    await signIn('credentials', {
      documentId,
      password,
      remember: formData.get('rememberCheck') ? 'true' : 'false',
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { formError: 'Invalid credentials', documentId: rawDocumentId };
    }
    throw error;
  }

  redirect('/dashboard/projects');
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
