'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { profileFormSchema, type ProfileFormState } from '@/lib/validation/profile';
import { z } from 'zod';

const INVALID_SESSION_MESSAGE = 'Tu sesión ya no es válida. Iniciá sesión de nuevo.';

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return { formError: INVALID_SESSION_MESSAGE };
  }

  const result = profileFormSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: {
          id: userId,
          status: 'active',
          deletedAt: null,
        },
        data: result.data,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      await logAudit(tx, {
        authorId: userId,
        action: 'update',
        entity: 'user',
        entityId: user.id,
      });

      return user;
    });

    revalidatePath('/dashboard/profile');

    return {
      success: true,
      values: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
      },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { errors: { email: ['Ya existe un usuario con ese correo electrónico.'] } };
      }

      if (error.code === 'P2003' || error.code === 'P2025') {
        return { formError: INVALID_SESSION_MESSAGE };
      }
    }

    console.error('Failed to update profile', error);
    return { formError: 'No se pudo actualizar tu perfil. Intentá de nuevo.' };
  }
}
