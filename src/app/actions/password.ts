'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { hashPassword, verifyPassword } from '@/lib/credentials';
import { passwordSchema } from '@/lib/validation/password';
import { logAudit } from '@/lib/audit-log';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormState = {
  errors?: Record<string, string[]>;
  formError?: string;
  success?: boolean;
};

export async function changePassword(
  _prevState: ChangePasswordFormState,
  formData: FormData
): Promise<ChangePasswordFormState> {
  const session = await auth();

  if (!session?.user?.email) {
    return { formError: 'Tu sesión ya no es válida. Iniciá sesión de nuevo.' };
  }

  const rawFormData = Object.fromEntries(formData);
  const parsed = changePasswordSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });

  if (!user || user.deletedAt || user.status !== 'active') {
    return { formError: 'Tu sesión ya no es válida. Iniciá sesión de nuevo.' };
  }

  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);

  if (!isCurrentPasswordValid) {
    return { formError: 'La contraseña actual es incorrecta' };
  }

  const newPasswordHash = await hashPassword(newPassword);

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            passwordHash: newPasswordHash,
            passwordChangedAt: new Date(),
            mustChangePassword: false,
          },
        });

        await logAudit(tx, {
          authorId: user.id,
          action: 'passwordChange',
          entity: 'user',
          entityId: user.id,
        });
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
  } catch (error) {
    console.error('Failed to change password', error);
    return { formError: 'No se pudo cambiar la contraseña. Intentá de nuevo.' };
  }

  return { success: true };
}

const resetPasswordSchema = z.object({
  userId: z.coerce.number({ error: 'Elegí una cuenta' }).int().positive('Elegí una cuenta'),
  newPassword: passwordSchema,
});

export type ResetPasswordFormState = {
  errors?: Record<string, string[]>;
  formError?: string;
  success?: boolean;
};

export async function resetPassword(
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return { formError: 'No tenés permisos para realizar esta acción.' };
  }

  const rawFormData = Object.fromEntries(formData);
  const parsed = resetPasswordSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { userId, newPassword } = parsed.data;

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!targetUser || targetUser.deletedAt) {
    return { formError: 'La cuenta seleccionada no existe.' };
  }

  const newPasswordHash = await hashPassword(newPassword);
  const adminId = Number(session.user.id);

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: { id: targetUser.id },
          data: {
            passwordHash: newPasswordHash,
            passwordChangedAt: new Date(),
            mustChangePassword: true,
          },
        });

        await logAudit(tx, {
          authorId: adminId,
          action: 'passwordReset',
          entity: 'user',
          entityId: targetUser.id,
        });
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
  } catch (error) {
    console.error('Failed to reset password', error);
    return { formError: 'No se pudo restablecer la contraseña. Intentá de nuevo.' };
  }

  return { success: true };
}
