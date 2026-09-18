import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { formatNumber } from '@/lib/format';
import { STATUS_LABEL, INTENSITY_LABEL, sumBeneficiaries } from '@/lib/project-display';

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      include: {
        leadCoordinator: true,
        department: true,
        projectBeneficiaries: { orderBy: { year: 'desc' }, take: 1 },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.project.count(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Proyectos activos</h1>
          <p className="text-muted-foreground mt-2 text-sm">{total} proyectos</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm hover:opacity-90"
        >
          + Nuevo proyecto
        </Link>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const latestBeneficiaries = project.projectBeneficiaries[0];
          return (
            <li key={project.id}>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="border-border bg-card hover:border-muted-foreground flex h-full flex-col rounded-xl border p-5"
              >
                <h2 className="text-lg leading-tight font-semibold">{project.name}</h2>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Territorio</dt>
                    <dd>{project.department.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Coordinador/a</dt>
                    <dd>
                      {project.leadCoordinator.firstName} {project.leadCoordinator.lastName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Intensidad</dt>
                    <dd>{INTENSITY_LABEL[project.intensity]}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Estado</dt>
                    <dd>{STATUS_LABEL[project.status]}</dd>
                  </div>
                </dl>

                <div className="border-border mt-4 flex items-end justify-between border-t pt-3">
                  <span className="text-muted-foreground text-xs">
                    {latestBeneficiaries
                      ? `Beneficiarios ${latestBeneficiaries.year}`
                      : 'Sin datos'}
                  </span>
                  <span className="text-xl font-semibold">
                    {latestBeneficiaries
                      ? formatNumber(sumBeneficiaries(latestBeneficiaries))
                      : '—'}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
