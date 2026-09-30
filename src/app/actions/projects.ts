'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/auth/require-user';
import { canEditProject } from '@/lib/projects/permissions';
import { mapProjectDbError } from '@/lib/projects/map-project-db-error';
import { revalidateProject } from '@/lib/projects/revalidate-project';
import {
  getRandomProjectPlaceholder,
  isProjectPlaceholder,
} from '@/lib/projects/project-placeholders';
import { parseId } from '@/lib/validation/ids';
import { logAudit } from '@/lib/audit-log';
import type { ProjectFormState } from '@/lib/validation/project';
import {
  projectFormSchema,
  readProjectFormData,
  splitProjectFormData,
} from '@/lib/validation/project-form';
import type { Prisma } from '@/generated/prisma/client';
import { BENEFICIARY_FIELDS } from '@/lib/project-display';
import { DUPLICATE_PROJECT_MESSAGE } from '@/lib/projects/map-project-db-error';

async function lockTopics(tx: Prisma.TransactionClient, topicIds: (number | null)[]) {
  const ids = [...new Set(topicIds.filter((id): id is number => id !== null))].sort(
    (a, b) => a - b
  );
  for (const id of ids) {
    await tx.$queryRaw`SELECT "id" FROM "Topic" WHERE "id" = ${id} FOR UPDATE`;
  }
}

async function validateRelations(
  tx: Prisma.TransactionClient,
  coordinatorId: number,
  topicId: number | null,
  currentCoordinatorId?: number,
  currentTopicId?: number | null
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
  if (topicId !== null) {
    const topic = await tx.topic.findFirst({
      where: {
        id: topicId,
        ...(topicId === currentTopicId ? {} : { isActive: true }),
      },
      select: { id: true },
    });

    if (!topic) {
      return { errors: { topicId: ['Elegí una temática válida'] } };
    }
  }
  return null;
}

async function validateUniqueName(
  tx: Prisma.TransactionClient,
  name: string,
  startYear: number,
  excludeId?: number
): Promise<ProjectFormState | null> {
  const duplicate = await tx.project.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      startYear,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return duplicate ? { errors: { name: [DUPLICATE_PROJECT_MESSAGE] } } : null;
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
  const { projectData, beneficiaryData } = splitProjectFormData(parsed.data);
  const submittedPlaceholder = formData.get('projectPlaceholder');
  const coverPhoto = isProjectPlaceholder(submittedPlaceholder)
    ? submittedPlaceholder
    : getRandomProjectPlaceholder();
  let projectId: number;
  try {
    const result = await prisma.$transaction(
      async (tx): Promise<{ error: ProjectFormState } | { projectId: number }> => {
        await lockTopics(tx, [projectData.topicId]);
        const error = await validateRelations(
          tx,
          projectData.leadCoordinatorId,
          projectData.topicId
        );
        if (error) return { error };
        const nameError = await validateUniqueName(tx, projectData.name, projectData.startYear);
        if (nameError) return { error: nameError };
        const project = await tx.project.create({
          data: {
            ...projectData,
            coverPhoto,
            createdBy: user.id,
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
          details: {
            year: beneficiaryData.year,
            values: Object.fromEntries(
              BENEFICIARY_FIELDS.map(({ key }) => [key, beneficiaryData[key]])
            ),
          },
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
  const { projectData, beneficiaryData } = splitProjectFormData(parsed.data);
  try {
    const error = await prisma.$transaction(
      async (tx): Promise<ProjectFormState | null> => {
        const previous = await tx.project.findUnique({
          where: { id: projectId },
        });
        if (!previous) return { formError: 'El proyecto no existe o fue eliminado.' };
        if (!canEditProject(user, previous))
          return { formError: 'No tenés permiso para editar este proyecto.' };
        await lockTopics(tx, [previous.topicId, projectData.topicId]);
        const relationError = await validateRelations(
          tx,
          projectData.leadCoordinatorId,
          projectData.topicId,
          previous.leadCoordinatorId,
          previous.topicId
        );
        if (relationError) return relationError;
        const nameError = await validateUniqueName(
          tx,
          projectData.name,
          projectData.startYear,
          projectId
        );
        if (nameError) return nameError;
        const fields = changedFields(projectData, previous);
        if (fields.length) {
          await tx.project.update({
            where: { id: projectId },
            data: projectData,
          });
          await logAudit(tx, {
            authorId: user.id,
            action: 'update',
            entity: 'project',
            entityId: projectId,
            details: { changedFields: fields },
          });
        }
        const where = { projectId_year: { projectId, year: beneficiaryData.year } };
        const existing = await tx.projectBeneficiary.findUnique({ where });
        const changes = BENEFICIARY_FIELDS.map(({ key }) => ({
          field: key,
          from: existing?.[key] ?? 0,
          to: beneficiaryData[key],
        })).filter(({ from, to }) => from !== to);
        if (!existing || changes.length) {
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
            details: { year: beneficiaryData.year, changes },
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

export async function deleteProject(projectId: number): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!parseId(projectId)) return { error: 'El proyecto no es válido.' };
  try {
    const error = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id: projectId, deletedAt: null },
        select: { id: true, leadCoordinatorId: true },
      });
      if (!project) return 'El proyecto no existe o ya fue eliminado.';
      if (!canEditProject(user, project)) return 'No tenés permiso para eliminar este proyecto.';
      await tx.project.update({
        where: { id: projectId },
        data: { deletedAt: new Date(), deletedBy: user.id },
      });
      await logAudit(tx, {
        authorId: user.id,
        action: 'deletion',
        entity: 'project',
        entityId: projectId,
      });
      return null;
    });
    if (error) return { error };
  } catch (error) {
    console.error('Failed to delete project', error);
    return { error: 'No se pudo eliminar el proyecto. Intentá de nuevo.' };
  }
  revalidateProject();
  redirect('/dashboard/projects');
}
