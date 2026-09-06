import Link from 'next/link';
import { PrismaClient } from '@/generated/prisma/client';
import { ProjectStatus } from '@/generated/prisma/enums';
import { formatNumber } from '@/lib/format';

const prisma = new PrismaClient();

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Activo',
  inProgress: 'En progreso',
  completed: 'Completado',
  archived: 'Archivado',
};

const INTENSITY_LABEL = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

function sumBeneficiaries(record: {
  directChildrenAdolescents: number;
  indirectChildrenAdolescents: number;
  youth18To29: number;
  families: number;
  coordinatedInstitutions: number;
  communityLeaders: number;
  basicServiceStaff: number;
}) {
  return (
    record.directChildrenAdolescents +
    record.indirectChildrenAdolescents +
    record.youth18To29 +
    record.families +
    record.coordinatedInstitutions +
    record.communityLeaders +
    record.basicServiceStaff
  );
}

export default async function ProjectsPage() {
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
          <h1 className="font-display text-3xl font-semibold tracking-tight">Proyectos activos</h1>
          <p className="text-ink-2 mt-2 text-sm">{total} proyectos</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="bg-deep text-on-deep rounded-full px-4 py-2 text-sm hover:opacity-90"
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
                className="border-line bg-surface hover:border-ink-3 flex h-full flex-col rounded-xl border p-5"
              >
                <h2 className="font-display text-lg leading-tight font-semibold">{project.name}</h2>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-3">Territorio</dt>
                    <dd className="text-ink-2">{project.department.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-3">Coordinador/a</dt>
                    <dd className="text-ink-2">
                      {project.leadCoordinator.firstName} {project.leadCoordinator.lastName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-3">Intensidad</dt>
                    <dd className="text-ink-2">{INTENSITY_LABEL[project.intensity]}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-3">Estado</dt>
                    <dd className="text-ink-2">{STATUS_LABEL[project.status]}</dd>
                  </div>
                </dl>

                <div className="border-line mt-4 flex items-end justify-between border-t pt-3">
                  <span className="text-ink-3 text-xs">
                    {latestBeneficiaries
                      ? `Beneficiarios ${latestBeneficiaries.year}`
                      : 'Sin datos'}
                  </span>
                  <span className="font-display text-xl font-semibold">
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
