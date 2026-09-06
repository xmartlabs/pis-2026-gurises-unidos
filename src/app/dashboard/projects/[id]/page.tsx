import { notFound } from 'next/navigation';
import { PrismaClient } from '@/generated/prisma/client';
import { ProjectStatus, Intensity } from '@/generated/prisma/enums';
import { formatNumber } from '@/lib/format';

const prisma = new PrismaClient();

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Activo',
  inProgress: 'En progreso',
  completed: 'Completado',
  archived: 'Archivado',
};

const INTENSITY_LABEL: Record<Intensity, string> = {
  high: 'Alta intensidad',
  medium: 'Media intensidad',
  low: 'Baja intensidad',
};

const BENEFICIARY_ROWS: { key: keyof BeneficiaryCounts; label: string }[] = [
  { key: 'directChildrenAdolescents', label: 'NNA directos' },
  { key: 'indirectChildrenAdolescents', label: 'NNA indirectos' },
  { key: 'youth18To29', label: 'Jóvenes (18 a 29)' },
  { key: 'families', label: 'Familias' },
  { key: 'coordinatedInstitutions', label: 'Instituciones coordinadas' },
  { key: 'communityLeaders', label: 'Referentes comunitarios' },
  { key: 'basicServiceStaff', label: 'Personal de servicios básicos' },
];

type BeneficiaryCounts = {
  directChildrenAdolescents: number;
  indirectChildrenAdolescents: number;
  youth18To29: number;
  families: number;
  coordinatedInstitutions: number;
  communityLeaders: number;
  basicServiceStaff: number;
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId)) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      leadCoordinator: true,
      department: true,
      projectBeneficiaries: { orderBy: { year: 'desc' }, take: 1 },
    },
  });

  if (!project) {
    notFound();
  }

  const beneficiaries = project.projectBeneficiaries[0];
  const description = project.generalObjective ?? project.publicDescription;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">{project.name}</h1>

      <div className="text-ink-2 mt-3 space-y-1 text-sm">
        <p>
          Territorio: {project.department.name}
          {project.localityNeighborhood ? ` — ${project.localityNeighborhood}` : ''}
        </p>
        <p>
          Coordinador/a: {project.leadCoordinator.firstName} {project.leadCoordinator.lastName}
        </p>
        <p>Desde {project.startYear}</p>
        <p>Estado: {STATUS_LABEL[project.status]}</p>
        <p>Intensidad: {INTENSITY_LABEL[project.intensity]}</p>
      </div>

      {description && (
        <p className="text-ink-2 mt-4 max-w-2xl text-sm leading-relaxed">{description}</p>
      )}

      {beneficiaries ? (
        <>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-line bg-surface rounded-xl border p-5">
              <dt className="text-ink-2 text-sm">NNA directos</dt>
              <dd className="font-display mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(beneficiaries.directChildrenAdolescents)}
              </dd>
            </div>
            <div className="border-line bg-surface rounded-xl border p-5">
              <dt className="text-ink-2 text-sm">NNA indirectos</dt>
              <dd className="font-display mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(beneficiaries.indirectChildrenAdolescents)}
              </dd>
            </div>
            <div className="border-line bg-surface rounded-xl border p-5">
              <dt className="text-ink-2 text-sm">Familias acompañadas</dt>
              <dd className="font-display mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(beneficiaries.families)}
              </dd>
            </div>
            <div className="border-line bg-surface rounded-xl border p-5">
              <dt className="text-ink-2 text-sm">Instituciones coordinadas</dt>
              <dd className="font-display mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(beneficiaries.coordinatedInstitutions)}
              </dd>
            </div>
          </dl>

          <article className="border-line bg-surface mt-10 rounded-xl border p-6">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Distribución de beneficiarios
            </h2>
            <p className="text-ink-2 mt-1 text-sm">Año {beneficiaries.year}</p>
            <ul className="mt-5 space-y-3">
              {BENEFICIARY_ROWS.map((row) => {
                const value = beneficiaries[row.key];
                const max = Math.max(...BENEFICIARY_ROWS.map((r) => beneficiaries[r.key]), 1);
                return (
                  <li key={row.key}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-ink-2">{row.label}</span>
                      <span className="text-ink-3 font-mono tabular-nums">
                        {formatNumber(value)}
                      </span>
                    </div>
                    <div className="bg-line mt-1 h-1.5 rounded-full">
                      <div
                        className="bg-accent h-1.5 rounded-full"
                        style={{ width: `${(value / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        </>
      ) : (
        <p className="border-line bg-surface text-ink-2 mt-10 rounded-xl border p-6 text-sm">
          Todavía no hay datos de beneficiarios cargados para este proyecto.
        </p>
      )}
    </div>
  );
}
