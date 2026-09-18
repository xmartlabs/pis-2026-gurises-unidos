import { Prisma } from '@/generated/prisma/client';
import type { ProjectFormState } from '@/lib/validation/project';

export function mapProjectDbError(error: unknown): ProjectFormState | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;
  if (error.code === 'P2025') return { formError: 'El proyecto no existe o fue eliminado.' };
  if (error.code === 'P2003') {
    const constraint = String(error.meta?.field_name ?? error.meta?.constraint ?? '');
    if (constraint.includes('leadCoordinatorId') || constraint.includes('departmentId'))
      return { formError: 'El coordinador o el departamento seleccionado no existe.' };
    if (constraint.includes('topicId'))
      return { errors: { topicIds: ['Elegí temáticas válidas'] } };
    return { formError: 'Tu sesión ya no es válida. Iniciá sesión de nuevo.' };
  }
  return null;
}
