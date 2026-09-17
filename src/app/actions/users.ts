'use server';

import { redirect } from 'next/navigation';
import { Prisma } from '@/generated/prisma/client';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { userFormSchema, type UserFormState } from '@/lib/validation/user';
import { logAudit } from '@/lib/audit-log';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function createUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard/projects');
  }

  if (formData.get('intent') === 'submit') {
    const result = userFormSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      return { errors: z.flattenError(result.error).fieldErrors };
    }

    const userData = result.data;
    const passwordHash = await bcrypt.hash(userData.password, 10);

    try {
      await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            documentId: userData.documentId,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            passwordHash,
            createdBy: Number(session.user.id),
          },
        });
        await logAudit(tx, {
          authorId: Number(session.user.id),
          action: 'creation',
          entity: 'user',
          entityId: createdUser.id,
        });
      });
    } catch (error) {
      const isPrismaError = error instanceof Prisma.PrismaClientKnownRequestError;

      if (isPrismaError) {
        const isDuplicateError = error.code === 'P2002';

        if (isDuplicateError) {
          const target = error.meta?.target;
          const fields = Array.isArray(target) ? target.map(String) : [String(target ?? '')];

          if (fields.some((field) => field.includes('documentId'))) {
            return { formError: 'Ya existe un usuario con ese documento.' };
          }

          if (fields.some((field) => field.includes('email'))) {
            return { formError: 'Ya existe un usuario con ese correo electrónico.' };
          }
        }
      }
      return { formError: 'No se pudo crear el usuario. Intentá de nuevo.' };
    }

    redirect('/users/management');
  }

  return {};
}
