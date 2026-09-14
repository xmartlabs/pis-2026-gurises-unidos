import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { updateProject } from '@/app/actions/projects';
import { EditProjectForm } from '@/components/edit-project-form';
import prisma from '@/lib/prisma';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId)) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });

  if (!project) {
    notFound();
  }

  const submitAction = updateProject.bind(null, project.id);

  return (
    <EditProjectForm
      key={project.id}
      initialName={project.name}
      cancelHref={`/dashboard/projects/${project.id}`}
      submitAction={submitAction}
    />
  );
}
