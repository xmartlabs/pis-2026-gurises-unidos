'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/auth/require-user';
import { canEditProject } from '@/lib/projects/permissions';
import { mapProjectDbError } from '@/lib/projects/map-project-db-error';
import { revalidateProject } from '@/lib/projects/revalidate-project';
import { parseId } from '@/lib/validation/ids';
import { logAudit } from '@/lib/audit-log';
import type { ProjectFormState } from '@/lib/validation/project';
import {
  projectFormSchema,
  readProjectFormData,
  splitProjectFormData,
} from '@/lib/validation/project-form';
import type { Prisma } from '@/generated/prisma/client';

async function validateRelations(
  tx: Prisma.TransactionClient,
  coordinatorId: number,
  topicIds: number[],
  currentCoordinatorId?: number
): Promise<ProjectFormState | null> {
  const coordinator = await tx.user.findFirst({
    where: {
      id: coordinatorId,
      ...(coordinatorId === currentCoordinatorId
        ? {}
        : { role: 'coordinator', status: 'active', deletedAt: null }),
    },
    select: { id: true },
  });
  if (!coordinator) return { errors: { leadCoordinatorId: ['Elegí un coordinador válido'] } };
  const count = await tx.topic.count({ where: { id: { in: topicIds } } });
  if (count !== topicIds.length) return { errors: { topicIds: ['Elegí temáticas válidas'] } };
  return null;
}

function changedFields<T extends object>(data: T, previous: T) {
  return (Object.keys(data) as (keyof T & string)[]).filter((key) => data[key] !== previous[key]);
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const user = await requireUser();
  const parsed = projectFormSchema.safeParse(readProjectFormData(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { projectData, beneficiaryData, topicIds } = splitProjectFormData(parsed.data);
  let projectId: number;
  try {
    const result = await prisma.$transaction(
      async (tx): Promise<{ error: ProjectFormState } | { projectId: number }> => {
        const error = await validateRelations(tx, projectData.leadCoordinatorId, topicIds);
        if (error) return { error };
        const project = await tx.project.create({
          data: {
            ...projectData,
            createdBy: user.id,
            projectTopics: { create: topicIds.map((topicId) => ({ topicId })) },
          },
        });
        await logAudit(tx, {
          authorId: user.id,
          action: 'creation',
          entity: 'project',
          entityId: project.id,
        });
        const beneficiary = await tx.projectBeneficiary.create({
          data: { ...beneficiaryData, projectId: project.id, authorId: user.id },
        });
        await logAudit(tx, {
          authorId: user.id,
          action: 'creation',
          entity: 'beneficiary',
          entityId: beneficiary.id,
        });
        return { projectId: project.id };
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
    if ('error' in result) return result.error;
    projectId = result.projectId;
  } catch (error) {
    const mapped = mapProjectDbError(error);
    if (mapped) return mapped;
    console.error('Failed to create project', error);
    return { formError: 'No se pudo crear el proyecto. Intentá de nuevo.' };
  }
  revalidateProject();
  redirect(`/dashboard/projects/${projectId}`);
}

export async function updateProject(
  projectId: number,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const user = await requireUser();
  if (!parseId(projectId)) return { formError: 'El proyecto no es válido.' };
  const parsed = projectFormSchema.safeParse(readProjectFormData(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { projectData, beneficiaryData, topicIds } = splitProjectFormData(parsed.data);
  try {
    const error = await prisma.$transaction(
      async (tx): Promise<ProjectFormState | null> => {
        const previous = await tx.project.findUnique({
          where: { id: projectId },
          include: { projectTopics: true },
        });
        if (!previous) return { formError: 'El proyecto no existe o fue eliminado.' };
        if (!canEditProject(user, previous))
          return { formError: 'No tenés permiso para editar este proyecto.' };
        const relationError = await validateRelations(
          tx,
          projectData.leadCoordinatorId,
          topicIds,
          previous.leadCoordinatorId
        );
        if (relationError) return relationError;
        const fields = changedFields(projectData, previous);
        const previousTopics = previous.projectTopics
          .map(({ topicId }) => topicId)
          .sort((a, b) => a - b);
        const topicsChanged = JSON.stringify(previousTopics) !== JSON.stringify(topicIds);
        if (fields.length || topicsChanged) {
          await tx.project.update({
            where: { id: projectId },
            data: {
              ...projectData,
              ...(topicsChanged
                ? {
                    projectTopics: {
                      deleteMany: {},
                      create: topicIds.map((topicId) => ({ topicId })),
                    },
                  }
                : {}),
            },
          });
          await logAudit(tx, {
            authorId: user.id,
            action: 'update',
            entity: 'project',
            entityId: projectId,
            details: { changedFields: [...fields, ...(topicsChanged ? ['topicIds'] : [])] },
          });
        }
        const where = { projectId_year: { projectId, year: beneficiaryData.year } };
        const existing = await tx.projectBeneficiary.findUnique({ where });
        const beneficiaryFields = existing
          ? changedFields(beneficiaryData, existing)
          : Object.keys(beneficiaryData);
        if (!existing || beneficiaryFields.length) {
          const beneficiary = await tx.projectBeneficiary.upsert({
            where,
            create: { ...beneficiaryData, projectId, authorId: user.id },
            update: { ...beneficiaryData, authorId: user.id, recordedAt: new Date() },
          });
          await logAudit(tx, {
            authorId: user.id,
            action: existing ? 'update' : 'creation',
            entity: 'beneficiary',
            entityId: beneficiary.id,
            details: { year: beneficiaryData.year, changedFields: beneficiaryFields },
          });
        }
        return null;
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
    if (error) return error;
  } catch (error) {
    const mapped = mapProjectDbError(error);
    if (mapped) return mapped;
    console.error('Failed to update project', error);
    return { formError: 'No se pudo actualizar el proyecto. Intentá de nuevo.' };
  }
  revalidateProject();
  redirect(`/dashboard/projects/${projectId}`);
}
