'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { auth } from '@/auth';
import { projectSchema, type ProjectFormState } from '@/lib/validation/project';
import { projectBeneficiarySchema } from '@/lib/validation/project-beneficiary';
import { logAudit } from '@/lib/audit-log';

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const rawFormData = Object.fromEntries(formData);
  const parsed = projectSchema.extend(projectBeneficiarySchema.shape).safeParse(rawFormData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    year,
    directChildrenAdolescents,
    indirectChildrenAdolescents,
    youth18To29,
    families,
    coordinatedInstitutions,
    communityLeaders,
    basicServiceStaff,
    ...projectData
  } = parsed.data;
  const beneficiaryData = {
    year,
    directChildrenAdolescents,
    indirectChildrenAdolescents,
    youth18To29,
    families,
    coordinatedInstitutions,
    communityLeaders,
    basicServiceStaff,
  };

  const authorId = Number(session.user.id);

  let project;
  try {
    project = await prisma.$transaction(
      async (tx) => {
        const createdProject = await tx.project.create({
          data: { ...projectData, createdBy: authorId },
        });

        await logAudit(tx, {
          authorId,
          action: 'creation',
          entity: 'project',
          entityId: createdProject.id,
        });

        const createdBeneficiary = await tx.projectBeneficiary.create({
          data: { ...beneficiaryData, projectId: createdProject.id, authorId },
        });

        await logAudit(tx, {
          authorId,
          action: 'creation',
          entity: 'beneficiary',
          entityId: createdBeneficiary.id,
        });

        return createdProject;
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      const constraint = String(error.meta?.field_name ?? error.meta?.constraint ?? '');

      if (constraint.includes('leadCoordinatorId') || constraint.includes('departmentId')) {
        return { formError: 'El coordinador o el departamento seleccionado no existe.' };
      }

      return { formError: 'Tu sesión ya no es válida. Iniciá sesión de nuevo.' };
    }

    console.error('Failed to create project', error);
    return { formError: 'No se pudo crear el proyecto. Intentá de nuevo.' };
  }

  redirect(`/dashboard/projects/${project.id}`);
}
