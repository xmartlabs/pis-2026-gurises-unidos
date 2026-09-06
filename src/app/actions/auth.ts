'use server';

import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/auth';

export type LoginState = {
  error?: string;
  email?: string;
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '');

  try {
    await signIn('credentials', {
      email,
      password: formData.get('password'),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid credentials', email };
    }
    throw error;
  }

  redirect('/dashboard');
}

export async function logout() {
  await signOut({ redirectTo: '/' });
}
