import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/project-display';
import { STATUS_BADGE_VARIANT } from '@/lib/projects/constants';
import { getChildrenReached } from '@/lib/projects/detail-metrics';
import { getPublicProjectDetail } from '@/lib/projects/public-detail';
import { parseId } from '@/lib/validation/ids';

type PublicProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicProjectPage({ params }: PublicProjectPageProps) {
  const { id } = await params;
  const projectId = parseId(id);

  if (!projectId) {
    notFound();
  }

  const project = await getPublicProjectDetail(projectId);

  if (!project) {
    notFound();
  }

  const beneficiaries = project.projectBeneficiaries[0];
  const childrenReached = getChildrenReached(beneficiaries ?? null);
  const territory = [project.department.name, project.localityNeighborhood]
    .filter(Boolean)
    .join(' · ');
  const period = `${project.startYear}–${project.endYear ?? 'actualidad'}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-14">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={STATUS_BADGE_VARIANT[project.status]}>
              {STATUS_LABEL[project.status]}
            </Badge>
            <span className="text-muted-foreground text-sm">{territory}</span>
          </div>
          <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            {project.name}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7 sm:text-lg">
            {project.publicDescription ??
              'Conocé el trabajo y el alcance de este proyecto de Gurises Unidos.'}
          </p>
          <p className="text-muted-foreground mt-4 text-sm">Período: {period}</p>
        </div>

        <div className="bg-project-cover relative aspect-[4/3] overflow-hidden rounded-3xl">
          {project.coverPhoto && (
            <Image
              src={project.coverPhoto}
              alt={`Portada de ${project.name}`}
              fill
              priority
              className="object-cover"
            />
          )}
        </div>
      </section>

      {beneficiaries && (
        <section className="mt-12 border-t pt-10 sm:mt-16">
          <p className="text-muted-foreground text-sm">Alcance {beneficiaries.year}</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="bg-card rounded-2xl border p-5">
              <dt className="text-muted-foreground text-sm">NNA alcanzados</dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums">
                {formatNumber(childrenReached ?? 0)}
              </dd>
            </div>
            <div className="bg-card rounded-2xl border p-5">
              <dt className="text-muted-foreground text-sm">Familias acompañadas</dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums">
                {formatNumber(beneficiaries.families)}
              </dd>
            </div>
            <div className="bg-card rounded-2xl border p-5">
              <dt className="text-muted-foreground text-sm">Instituciones vinculadas</dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums">
                {formatNumber(beneficiaries.coordinatedInstitutions)}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
