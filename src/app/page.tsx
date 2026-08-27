import Link from "next/link"
import { AreaChart } from "@/components/charts/AreaChart"
import { BarChart } from "@/components/charts/BarChart"
import { DonutChart } from "@/components/charts/DonutChart"
import { ReachGrid } from "@/components/charts/ReachGrid"
import { ProjectCarousel } from "@/components/ProjectCarousel"
import { formatNumber } from "@/lib/format"
import {
  ANNUAL_REACH,
  PROJECTS,
  getProjectReach,
  getTopProjects,
  getTotals,
} from "@/lib/projects"

const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
]

const HEADLINE_KEYS = ["nna", "families", "teachers", "institutions"]

export default function Home() {
  const totals = getTotals()
  const total_reach = ANNUAL_REACH[ANNUAL_REACH.length - 1].reach
  const headline = HEADLINE_KEYS.map(
    (key) => totals.find((item) => item.key === key)!,
  )
  const carousel_projects = PROJECTS.map((project) => ({
    ...project,
    reach: getProjectReach(project),
  }))

  return (
    <div>
      <section className="bg-deep text-on-deep">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs tracking-widest text-accent-soft uppercase">
            {PROJECTS.length} proyectos · cierre 2025
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {formatNumber(total_reach)} personas
            <span className="block text-accent-soft">alcanzadas en 2025.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-on-deep/80">
            Desde 1989 defendemos los derechos de niñas, niños y adolescentes en
            Uruguay. Cada celda de la grilla es un proyecto y una categoría de
            beneficiario: el mismo dato que hoy vive en una planilla, leído de una vez.
          </p>
          <div className="mt-10 text-on-deep/90">
            <ReachGrid />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Indicadores principales
        </h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headline.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <dt className="text-sm text-ink-2">{item.label}</dt>
              <dd className="mt-2 font-display text-4xl font-semibold tracking-tight">
                {formatNumber(item.total)}
              </dd>
              <p className="mt-3 text-xs leading-relaxed text-ink-3">
                {item.definition}
              </p>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <ProjectCarousel projects={carousel_projects} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-14 lg:grid-cols-2">
        <article className="min-w-0 rounded-xl border border-line bg-surface p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Los diez proyectos de mayor alcance
          </h2>
          <p className="mt-1 mb-6 text-sm text-ink-2">
            Personas alcanzadas en 2025, sumando todas las categorías.
          </p>
          <BarChart
            data={getTopProjects(10).map((project) => ({
              label: project.name,
              value: getProjectReach(project),
            }))}
          />
        </article>

        <article className="min-w-0 rounded-xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Quiénes son las personas alcanzadas
          </h2>
          <p className="mt-1 mb-6 text-sm text-ink-2">
            Distribución por categoría de beneficiario.
          </p>
          <DonutChart
            total={totals.reduce((sum, item) => sum + item.total, 0)}
            totalLabel="personas"
            data={totals.map((item, index) => ({
              label: item.label,
              value: item.total,
              color: SERIES_COLORS[index],
            }))}
          />
        </article>

        <article className="min-w-0 rounded-xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Cómo creció el alcance
          </h2>
          <p className="mt-1 mb-6 text-sm text-ink-2">
            Total de personas alcanzadas por año.
          </p>
          <AreaChart data={ANNUAL_REACH} />
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-line bg-surface p-8">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Hay más métricas del otro lado
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-2">
              El panel interno abre la composición por categoría, la serie de cada
              proyecto y las categorías que no se publican.
            </p>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-deep px-6 py-3 text-sm text-on-deep hover:opacity-90"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>
    </div>
  )
}
