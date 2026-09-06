'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { auth } from '@/auth';
import { projectSchema, type ProjectFormState } from '@/lib/validation/project';

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let project;
  try {
    project = await prisma.project.create({
      data: { ...parsed.data, createdBy: Number(session.user.id) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return { formError: 'El coordinador o el departamento seleccionado no existe.' };
    }
    console.error('Failed to create project', error);
    return { formError: 'No se pudo crear el proyecto. Intentá de nuevo.' };
  }

  redirect(`/dashboard/projects/${project.id}`);
}
