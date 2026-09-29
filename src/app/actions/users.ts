'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/auth/require-user';
import { parseId } from '@/lib/validation/ids';
import { PRESERVED_FIELDS, userFormSchema, type UserFormState } from '@/lib/validation/user';
import { logAudit } from '@/lib/audit-log';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function createUser(
  _prevState: UserFormState,
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
    const values = Object.fromEntries(
      PRESERVED_FIELDS.map((field) => [field, String(formData.get(field) ?? '')])
    );

    if (!result.success) {
      return { errors: z.flattenError(result.error).fieldErrors, values };
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
            status: 'active',
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
        const isForeignKeyError = error.code === 'P2003';

        if (isDuplicateError) {
          const target = error.meta?.target;
          const fields = Array.isArray(target) ? target.map(String) : [String(target ?? '')];

          if (fields.some((field) => field.includes('documentId'))) {
            return { formError: 'Ya existe un usuario con ese documento.', values };
          }

          if (fields.some((field) => field.includes('email'))) {
            return { formError: 'Ya existe un usuario con ese correo electrónico.', values };
          }
        }

        if (isForeignKeyError) {
          return {
            formError: 'Tu sesión ya no es válida. Cerrá sesión y volvé a ingresar.',
            values,
          };
        }
      }
      return { formError: 'No se pudo crear el usuario. Intentá de nuevo.', values };
    }

    redirect('/management/users');
  }

  return {};
}

export type DeleteUserResult = { error?: string; success?: boolean };

export async function deleteUser(userId: number): Promise<DeleteUserResult> {
  const actor = await requireUser();

  if (actor.role !== 'admin') {
    return { error: 'No tenés permisos para realizar esta acción.' };
  }

  const targetId = parseId(userId);

  if (!targetId) {
    return { error: 'El usuario no es válido.' };
  }

  if (targetId === actor.id) {
    return { error: 'No podés darte de baja a vos mismo.' };
  }

  try {
    const error = await prisma.$transaction(
      async (tx): Promise<string | null> => {
        const target = await tx.user.findUnique({
          where: { id: targetId },
          select: { role: true, deletedAt: true },
        });

        if (!target || target.deletedAt) {
          return 'El usuario no existe o ya fue dado de baja.';
        }

        if (target.role === 'admin') {
          const remainingAdmins = await tx.user.count({
            where: { role: 'admin', status: 'active', deletedAt: null, id: { not: targetId } },
          });

          if (remainingAdmins === 0) {
            return 'No se puede dar de baja al último administrador activo.';
          }
        }

        await tx.user.update({ where: { id: targetId }, data: { deletedAt: new Date() } });
        await logAudit(tx, {
          authorId: actor.id,
          action: 'deletion',
          entity: 'user',
          entityId: targetId,
        });

        return null;
      },
      // Serializable so two admins removing each other at once can't leave zero admins
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10_000,
        timeout: 30_000,
      }
    );

    if (error) {
      return { error };
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return { error: 'Otra operación modificó los usuarios al mismo tiempo. Intentá de nuevo.' };
    }

    console.error('Failed to delete user', error);
    return { error: 'No se pudo dar de baja al usuario. Intentá de nuevo.' };
  }

  revalidatePath('/management/users');
  return { success: true };
}
