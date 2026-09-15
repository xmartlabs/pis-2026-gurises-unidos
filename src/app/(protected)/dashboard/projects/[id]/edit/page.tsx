import { ProjectHistory } from '@/components/projects/form/project-history';
import { STATUS_LABEL, INTENSITY_LABEL } from '@/lib/project-display';
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

  if (!Number.isInteger(projectId) || projectId <= 0 || projectId > 2_147_483_647) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { projectBeneficiaries: { orderBy: { year: 'desc' }, take: 1 } },
  });

  if (!project) {
    notFound();
  }

  const [coordinators, departments, history] = await Promise.all([
    prisma.user.findMany({
      where: { OR: [{ role: 'coordinator' }, { id: project.leadCoordinatorId }] },
      orderBy: { firstName: 'asc' },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.auditLog.findMany({
      where: { entity: 'project', entityId: project.id },
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: 10,
      select: {
        id: true,
        action: true,
        occurredAt: true,
        author: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const submitAction = updateProject.bind(null, project.id);

  return (
    <div className="bg-surface-page flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex flex-col items-start gap-1.5 px-4 pt-6 pb-2.5 sm:px-6">
        <p className="text-muted-foreground text-sm">Editar proyecto</p>
        <h1 className="text-3xl leading-9 font-bold">{project.name}</h1>
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm leading-5">
          <span
            className={
              project.status === 'active'
                ? 'bg-status-success size-2 rounded-full'
                : 'bg-text-muted size-2 rounded-full'
            }
          />
          <span className={project.status === 'active' ? 'text-status-success' : undefined}>
            {STATUS_LABEL[project.status]}
          </span>
          <span className="text-text-muted">•</span>
          <span>{INTENSITY_LABEL[project.intensity]} intensidad</span>
        </div>
      </div>
      <EditProjectForm
        key={project.id}
        project={project}
        coordinators={coordinators}
        departments={departments}
        cancelHref={`/dashboard/projects/${project.id}`}
        submitAction={submitAction}
      >
        <ProjectHistory entries={history} />
      </EditProjectForm>
    </div>
  );
}
