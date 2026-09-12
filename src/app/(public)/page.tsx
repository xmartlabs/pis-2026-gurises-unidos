import Link from 'next/link';
import { ProjectCarousel } from '@/components/project-carousel';
import { formatNumber } from '@/lib/format';
import { ANNUAL_REACH, PROJECTS, getProjectReach, getTotals } from '@/lib/projects';

const HEADLINE_KEYS = ['nna', 'families', 'teachers', 'institutions'];

export default function Home() {
  const totals = getTotals();
  const totalReach = ANNUAL_REACH[ANNUAL_REACH.length - 1].reach;
  const headline = HEADLINE_KEYS.map((key) => totals.find((item) => item.key === key)!);
  const carouselProjects = PROJECTS.map((project) => ({
    ...project,
    reach: getProjectReach(project),
  }));

  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-primary-foreground/70 text-xs tracking-widest uppercase">
            {PROJECTS.length} proyectos · cierre 2025
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">
            {formatNumber(totalReach)} personas
            <span className="text-primary-foreground/70 block">alcanzadas en 2025.</span>
          </h1>
          <p className="text-primary-foreground/80 mt-6 max-w-xl text-base leading-relaxed">
            Desde 1989 defendemos los derechos de niñas, niños y adolescentes en Uruguay. El alcance
            de cada proyecto y cada categoría de beneficiario: el mismo dato que hoy vive en una
            planilla, leído de una vez.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-semibold tracking-tight">Indicadores principales</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headline.map((item) => (
            <div key={item.key} className="border-border bg-card rounded-xl border p-5">
              <dt className="text-muted-foreground text-sm">{item.label}</dt>
              <dd className="mt-2 text-4xl font-semibold tracking-tight">
                {formatNumber(item.total)}
              </dd>
              <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                {item.definition}
              </p>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <ProjectCarousel projects={carouselProjects} />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="border-border bg-card flex flex-wrap items-center justify-between gap-6 rounded-xl border p-8">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Hay más métricas del otro lado</h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              El panel interno permite gestionar los proyectos y los datos de alcance que no se
              publican.
            </p>
          </div>
          <Link
            href="/login"
            className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm hover:opacity-90"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>
    </div>
  );
}
