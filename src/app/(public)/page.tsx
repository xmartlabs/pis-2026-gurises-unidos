import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectCarousel } from '@/components/project-carousel';
import { formatNumber } from '@/lib/format';
import { ANNUAL_REACH, PROJECTS, getProjectReach, getTotals } from '@/lib/projects';
import { Redirect } from 'next';
import { redirect } from 'next/navigation';
import { getMetricSettings, getMetricValues } from '@/lib/metrics/queries';
import { listProjects, type ProjectListItem } from '@/lib/projects/list';
import {
  BENEFICIARY_FIELDS,
  sumBeneficiaries,
  type BeneficiaryCounts,
} from '@/lib/project-display';
import { PROJECT_LIST_MAX_PAGE_SIZE, parseProjectFilters } from '@/lib/validation/project-filters';

const HEADLINE_KEYS = ['nna', 'families', 'teachers', 'institutions'];

/*
export default function Home() {
  const totals = getTotals();
  const totalReach = ANNUAL_REACH[ANNUAL_REACH.length - 1].reach;
  const headline = HEADLINE_KEYS.map((key) => totals.find((item) => item.key === key)!);
  const carouselProjects = PROJECTS.map((project) => ({
    ...project,
    reach: getProjectReach(project),
  }));

  return (
    <main>
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
    </main>
  );
}
*/

const LEVELS = [
  {
    number: '01',
    title: 'Individual',
    description: 'Niños, niñas, adolescentes y jóvenes: acompañamiento directo y personalizado.',
  },
  {
    number: '02',
    title: 'Familiar',
    description: 'La familia como unidad: fortalecimiento de vínculos y entornos protectores.',
  },
  {
    number: '03',
    title: 'Institucional',
    description: 'Escuelas, centros de salud e instituciones que rodean a cada gurí.',
  },
  {
    number: '04',
    title: 'Comunitario',
    description: 'Territorios y comunidades donde se teje la red de protección.',
  },
];

const MAX_DEPARTMENT_BUBBLES = 4;
const MAX_FEATURED_PROJECTS = 3;

const PARTNERS = [
  'INAU',
  'INEFOP',
  'ANEP',
  'Ministerio del Interior',
  'Fundación Telefónica',
  'Fundación UPM',
  'Reaching U',
  'PepsiCo',
  'BASF',
  'OSF',
  'UNFPA',
];

function formatIncrement(current: number, previous: number, previousYear: number) {
  if (previous === 0) return null;
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change > 0 ? '+' : ''}${change}% vs. ${previousYear}`;
}

async function getYearProjects(year: number) {
  const filters = parseProjectFilters({
    beneficiaryYear: String(year),
    pageSize: String(PROJECT_LIST_MAX_PAGE_SIZE),
  });
  const firstPage = await listProjects(filters);
  const otherPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      listProjects({ ...filters, page: index + 2 })
    )
  );
  return [firstPage, ...otherPages].flatMap((page) => page.items);
}

function getFeaturedProjects(projects: ProjectListItem[]) {
  return projects
    .map((project) => ({
      territory: project.department.name,
      name: project.name,
      description: project.publicDescription ?? '',
      reach: project.beneficiaries.reduce((sum, record) => sum + record.total, 0),
    }))
    .sort((a, b) => b.reach - a.reach)
    .slice(0, MAX_FEATURED_PROJECTS);
}

function getDepartmentBeneficiaries(projects: ProjectListItem[]) {
  const totalsByDepartment = new Map<string, BeneficiaryCounts>();
  for (const project of projects) {
    const totals =
      totalsByDepartment.get(project.department.name) ??
      (Object.fromEntries(BENEFICIARY_FIELDS.map(({ key }) => [key, 0])) as BeneficiaryCounts);
    for (const record of project.beneficiaries) {
      for (const { key } of BENEFICIARY_FIELDS) totals[key] += record[key];
    }
    totalsByDepartment.set(project.department.name, totals);
  }

  return [...totalsByDepartment]
    .map(([department, totals]) => ({ department, ...totals }))
    .sort((a, b) => a.department.localeCompare(b.department));
}

export default async function Home() {
  const year = new Date().getFullYear() - 1;
  const [values, previousValues, settings, projects] = await Promise.all([
    getMetricValues(year),
    getMetricValues(year - 1),
    getMetricSettings(),
    getYearProjects(year),
  ]);
  const departmentBeneficiaries = getDepartmentBeneficiaries(projects);
  const featuredProjects = getFeaturedProjects(projects);
  const departmentBubbles = [...departmentBeneficiaries]
    .sort((a, b) => sumBeneficiaries(b) - sumBeneficiaries(a))
    .slice(0, MAX_DEPARTMENT_BUBBLES)
    .map(({ department }) => department);
  const hiddenDepartments = departmentBeneficiaries.length - MAX_DEPARTMENT_BUBBLES;
  if (hiddenDepartments > 0) departmentBubbles.push(`+ ${hiddenDepartments} más`);
  const stats = settings
    .filter((metric) => metric.showPublicly && metric.key !== 'departments')
    .map((metric) => ({
      key: metric.key,
      value: formatNumber(values[metric.key]),
      description: metric.name,
      increment: formatIncrement(values[metric.key], previousValues[metric.key], year - 1),
    }));

  return (
    <>
      <section className="w-full">
        <div className="mx-auto flex min-h-115.5 w-full max-w-360 flex-col gap-9 px-4 pt-13 pb-12 sm:px-6 lg:px-16">
          <div className="flex w-full max-w-124 flex-col gap-3 lg:h-48.5">
            <span className="bg-card text-primary flex h-6.5 w-42.5 items-center justify-center rounded-[20px] px-3 py-1.25 text-xs leading-4 font-medium tracking-normal">
              Informe de impacto · {year}
            </span>
            <h2 className="text-foreground w-full max-w-122 text-3xl leading-9 font-bold tracking-normal lg:h-24 lg:text-5xl lg:leading-12">
              Transformando vidas en Uruguay
            </h2>
            <p className="text-foreground w-full text-base leading-6 font-normal tracking-normal lg:h-12">
              Trabajamos con niños, niñas, adolescentes, familias y comunidades en todo el
              territorio uruguayo.
            </p>
          </div>
          <div className="lg:bg-card grid w-full grid-cols-2 gap-3 lg:min-h-33 lg:max-w-328 lg:grid-cols-4 lg:gap-0 lg:rounded-xl">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="bg-card flex min-h-33 flex-col gap-1 rounded-xl px-4 py-6 lg:min-h-33 lg:max-w-[327.25px] lg:bg-transparent lg:px-8"
              >
                <span className="text-primary w-full text-4xl leading-10 font-black tracking-normal">
                  {stat.value}
                </span>
                <span className="text-foreground w-full text-sm leading-5 font-normal tracking-normal">
                  {stat.description}
                </span>
                {stat.increment && (
                  <span className="text-primary w-full text-xs leading-4 font-normal tracking-normal">
                    {stat.increment}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="mx-auto flex min-h-71 w-full max-w-360 flex-col gap-4 px-4 pt-18 pb-18 sm:px-6 lg:px-14">
          <div className="flex w-full max-w-75.75 flex-col gap-1 lg:h-15">
            <h2 className="text-foreground text-2xl leading-8 font-bold tracking-normal sm:text-3xl sm:leading-9">
              Nuestros proyectos
            </h2>
            <p className="text-muted-foreground text-sm leading-5 font-normal tracking-normal">
              Distribuidos en {values.departments} departamentos del Uruguay
            </p>
          </div>
          <div className="grid w-full max-w-328 grid-cols-1 gap-4 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.name} variant="public-dark" {...project} />
            ))}
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="mx-auto flex w-full max-w-360 flex-col gap-7 px-4 pt-12 pb-12 sm:px-6 lg:px-16">
          <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:gap-16">
            <div className="flex w-full max-w-105 flex-col gap-3.5 text-center lg:text-left">
              <div className="flex flex-col gap-1">
                <h2 className="text-foreground text-2xl leading-8 font-bold tracking-normal sm:text-3xl sm:leading-9">
                  Presencia en todo Uruguay
                </h2>
                <p className="text-foreground text-sm leading-5 font-normal tracking-normal">
                  Nuestros proyectos llegan a {values.departments} departamentos, priorizando
                  comunidades en situación de vulnerabilidad.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {departmentBubbles.map((department) => (
                  <span
                    key={department}
                    className="bg-card text-foreground flex h-6.5 items-center rounded-[14px] px-2.5 py-1.25 text-xs leading-4 font-normal tracking-normal"
                  >
                    {department}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-card flex h-50 w-full max-w-125 items-center justify-center rounded-xl px-5 py-15">
              <p className="text-muted-foreground text-center text-sm leading-5 font-normal tracking-normal">
                Mapa de Uruguay
                <br />
                {values.departments} departamentos cubiertos
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="mx-auto flex min-h-77 w-full max-w-360 flex-col gap-7 px-4 pt-12 pb-14 sm:px-6 lg:px-14">
          <div className="flex min-h-14 w-full max-w-93.75 flex-col gap-1">
            <h2 className="text-foreground text-2xl leading-8 font-bold tracking-normal">
              Cómo trabajamos
            </h2>
            <p className="text-muted-foreground text-sm leading-5 font-normal tracking-normal">
              Acompañamos en cuatro niveles que se potencian entre sí
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((level) => (
              <div
                key={level.number}
                className="border-primary flex flex-col gap-2 border-t-2 pt-4"
              >
                <span className="text-primary text-xs font-medium">{level.number}</span>
                <h3 className="text-foreground text-lg leading-7 font-semibold">{level.title}</h3>
                <p className="text-muted-foreground text-sm leading-5">{level.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="mx-auto flex min-h-70 w-full max-w-360 flex-col gap-12 px-4 pt-10 pb-10 sm:px-6 lg:px-16">
          <h2 className="text-foreground text-primary text-center text-xs leading-4 font-bold tracking-normal">
            NUESTRA MISIÓN
          </h2>
          <p className="text-foreground text-center text-xl leading-7 font-normal tracking-normal sm:text-3xl sm:leading-9">
            Hace 35 años defendemos los derechos de la niñez y la adolescencia en Uruguay,
            transformando realidades junto a las comunidades.
          </p>
        </div>
      </section>
      <section className="w-full">
        <div className="mx-auto flex min-h-53.5 w-full max-w-360 flex-col gap-5 px-4 pt-12 pb-14 sm:px-6 lg:px-14">
          <div className="flex w-full max-w-126.5 flex-col gap-1">
            <h2 className="text-foreground text-xl leading-7 font-bold tracking-normal">
              Quienes nos acompañan
            </h2>
            <p className="text-muted-foreground text-sm leading-5 font-normal tracking-normal">
              Organismos públicos, fundaciones y aliados que hacen posible nuestro trabajo
            </p>
          </div>
          <div className="flex w-full max-w-332 flex-wrap gap-3">
            {PARTNERS.map((partner) => (
              <span
                key={partner}
                className="bg-card text-foreground flex h-9.5 items-center rounded-full px-4 py-2.25 text-sm leading-5 font-normal tracking-normal"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="mx-auto flex min-h-78 w-full max-w-360 flex-col gap-4 px-4 pt-18 pb-20 sm:px-6 lg:px-14">
          <h2 className="text-foreground text-center text-2xl leading-8 font-bold tracking-normal sm:text-3xl sm:leading-9">
            Sé parte de esta transformación
          </h2>
          <p className="text-muted-foreground text-center leading-6 font-normal tracking-normal">
            Conocé en qué proyectos podés colaborar y cómo tu apoyo se convierte en impacto real
            para miles de gurises.
          </p>
          <div className="mx-auto flex h-11 w-39.25 flex-col pt-2">
            <Button className="h-9 w-full gap-2.5 bg-white px-4 py-2 text-black hover:bg-white/90">
              Quiero colaborar
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
