import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { formatNumber } from '@/lib/format';
import { STATUS_LABEL, INTENSITY_LABEL, BENEFICIARY_FIELDS } from '@/lib/project-display';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h1>

      <div className="text-muted-foreground mt-3 space-y-1 text-sm">
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
        <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed">
          {description}
        </p>
      )}

      {beneficiaries ? (
        <>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border bg-card rounded-xl border p-5">
              <dt className="text-muted-foreground text-sm">NNA directos</dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(beneficiaries.directChildrenAdolescents)}
              </dd>
            </div>
            <div className="border-border bg-card rounded-xl border p-5">
              <dt className="text-muted-foreground text-sm">NNA indirectos</dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(beneficiaries.indirectChildrenAdolescents)}
              </dd>
            </div>
            <div className="border-border bg-card rounded-xl border p-5">
              <dt className="text-muted-foreground text-sm">Familias acompañadas</dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(beneficiaries.families)}
              </dd>
            </div>
            <div className="border-border bg-card rounded-xl border p-5">
              <dt className="text-muted-foreground text-sm">Instituciones coordinadas</dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight">
                {formatNumber(beneficiaries.coordinatedInstitutions)}
              </dd>
            </div>
          </dl>

          <article className="border-border bg-card mt-10 rounded-xl border p-6">
            <h2 className="text-xl font-semibold tracking-tight">Distribución de beneficiarios</h2>
            <p className="text-muted-foreground mt-1 text-sm">Año {beneficiaries.year}</p>
            <ul className="mt-5 space-y-3">
              {BENEFICIARY_FIELDS.map((row) => {
                const value = beneficiaries[row.key];
                const max = Math.max(...BENEFICIARY_FIELDS.map((r) => beneficiaries[r.key]), 1);
                return (
                  <li key={row.key}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {formatNumber(value)}
                      </span>
                    </div>
                    <div className="bg-muted mt-1 h-1.5 rounded-full">
                      <div
                        className="bg-primary h-1.5 rounded-full"
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
        <p className="border-border bg-card text-muted-foreground mt-10 rounded-xl border p-6 text-sm">
          Todavía no hay datos de beneficiarios cargados para este proyecto.
        </p>
      )}
    </div>
  );
}
