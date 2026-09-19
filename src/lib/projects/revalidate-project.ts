import { revalidatePath } from 'next/cache';

export function revalidateProject(projectId: number) {
  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/edit`);
}
