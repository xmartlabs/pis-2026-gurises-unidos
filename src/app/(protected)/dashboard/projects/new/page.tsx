import { createProject } from '@/app/actions/projects';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/auth/require-user';
import { ProjectForm } from '@/components/projects/form/project-form';

export default async function NewProjectPage() {
  await requireUser();

  const [coordinators, departments, topics] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'coordinator', status: 'active', deletedAt: null },
      orderBy: { firstName: 'asc' },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.topic.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  return (
    <ProjectForm
      topics={topics}
      currentYear={new Date().getFullYear()}
      coordinators={coordinators}
      departments={departments}
      submitAction={createProject}
    />
  );
}
