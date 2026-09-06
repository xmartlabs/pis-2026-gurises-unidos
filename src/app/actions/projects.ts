'use server';

import { redirect } from 'next/navigation';
import { PrismaClient } from '@/generated/prisma/client';
import { projectSchema, type ProjectFormState } from '@/lib/validation/project';

const prisma = new PrismaClient();

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const project = await prisma.project.create({ data: parsed.data });
  redirect(`/dashboard/projects/${project.id}`);
}
