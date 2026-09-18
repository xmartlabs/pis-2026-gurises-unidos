'use server';

import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/auth';

export type LoginState = {
  error?: string;
  documentId?: string;
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const documentId = String(formData.get('documentId') ?? '');

  try {
    await signIn('credentials', {
      documentId,
      password: formData.get('password'),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid credentials', documentId };
    }
    throw error;
  }

  redirect('/dashboard/projects');
}

export async function logout() {
  await signOut({ redirectTo: '/' });
}
