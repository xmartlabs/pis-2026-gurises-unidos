'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { auth } from '@/auth';
import { projectSchema, type ProjectFormState } from '@/lib/validation/project';
import { projectBeneficiarySchema } from '@/lib/validation/projectBeneficiary';

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const rawFormData = Object.fromEntries(formData);
  const parsedProject = projectSchema.safeParse(rawFormData);
  const parsedBeneficiary = projectBeneficiarySchema.safeParse(rawFormData);

  if (!parsedProject.success || !parsedBeneficiary.success) {
    return {
      errors: {
        ...(parsedProject.success ? {} : parsedProject.error.flatten().fieldErrors),
        ...(parsedBeneficiary.success ? {} : parsedBeneficiary.error.flatten().fieldErrors),
      },
    };
  }

  const authorId = Number(session.user.id);

  let project;
  try {
    project = await prisma.$transaction(
      async (tx) => {
        const createdProject = await tx.project.create({
          data: { ...parsedProject.data, createdBy: authorId },
        });

        await tx.auditLog.create({
          data: { authorId, action: 'creation', entity: 'project', entityId: createdProject.id },
        });

        const createdBeneficiary = await tx.projectBeneficiary.create({
          data: { ...parsedBeneficiary.data, projectId: createdProject.id, authorId },
        });

        await tx.auditLog.create({
          data: { authorId, action: 'creation', entity: 'beneficiary', entityId: createdBeneficiary.id },
        });

        return createdProject;
      }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return { formError: 'El coordinador o el departamento seleccionado no existe.' };
      }
      if (error.code === 'P2002') {
        return { formError: 'Ya existen datos de beneficiarios para ese año.' };
      }
    }
    console.error('Failed to create project', error);
    return { formError: 'No se pudo crear el proyecto. Intentá de nuevo.' };
  }

  redirect(`/dashboard/projects/${project.id}`);
}
