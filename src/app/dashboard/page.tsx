import { redirect } from "next/navigation"
import { Sparkline } from "@/components/charts/Sparkline"
import { StackedBar } from "@/components/charts/StackedBar"
import { formatNumber } from "@/lib/format"
import { getSession } from "@/lib/session"
import {
  BENEFICIARY_CATEGORIES,
  PROJECTS,
  REACH_YEARS,
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

const INTERNAL_KEYS = ["nna_indirect", "youth", "other_adults"]

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const totals = getTotals()
  const internal = INTERNAL_KEYS.map((key) => totals.find((item) => item.key === key)!)
  const series = BENEFICIARY_CATEGORIES.map((category, index) => ({
    label: category.label,
    color: SERIES_COLORS[index],
  }))
  const sorted_projects = [...PROJECTS].sort(
    (a, b) => getProjectReach(b) - getProjectReach(a),
  )

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="font-mono text-xs tracking-widest text-ink-3 uppercase">
        Panel interno · {session}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        Métricas ampliadas
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
        Las categorías que no se publican en el dashboard público, la composición del
        alcance por proyecto y la serie 2019–2025 de cada uno.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {internal.map((item) => (
          <div key={item.key} className="rounded-xl border border-line bg-surface p-5">
            <dt className="text-sm text-ink-2">{item.label}</dt>
            <dd className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {formatNumber(item.total)}
            </dd>
            <p className="mt-3 text-xs leading-relaxed text-ink-3">{item.definition}</p>
          </div>
        ))}
      </dl>

      <article className="mt-10 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Composición del alcance
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          Doce proyectos de mayor alcance, apilados por categoría.
        </p>
        <ul className="mt-5 mb-6 flex flex-wrap gap-x-5 gap-y-2 text-xs">
          {series.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-ink-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: item.color }}
              />
              {item.label}
            </li>
          ))}
        </ul>
        <StackedBar
          series={series}
          rows={getTopProjects(12).map((project) => ({
            label: project.name,
            values: BENEFICIARY_CATEGORIES.map(
              (category) => project.beneficiaries[category.key],
            ),
          }))}
        />
      </article>

      <article className="mt-10 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Todos los proyectos
        </h2>
        <p className="mt-1 mb-5 text-sm text-ink-2">
          {PROJECTS.length} proyectos · tendencia {REACH_YEARS[0]}–
          {REACH_YEARS[REACH_YEARS.length - 1]}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-[11px] text-ink-3 uppercase">
                <th className="py-2 pr-4 font-normal">Proyecto</th>
                <th className="py-2 pr-4 font-normal">Territorio</th>
                <th className="py-2 pr-4 font-normal">Intensidad</th>
                <th className="py-2 pr-4 text-right font-normal">NNA</th>
                <th className="py-2 pr-4 text-right font-normal">Familias</th>
                <th className="py-2 pr-4 text-right font-normal">Total</th>
                <th className="py-2 font-normal">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {sorted_projects.map((project) => (
                <tr key={project.slug} className="border-b border-line/60">
                  <td className="py-2.5 pr-4">{project.name}</td>
                  <td className="py-2.5 pr-4 text-ink-2">{project.territory}</td>
                  <td className="py-2.5 pr-4 text-ink-2">{project.intensity}</td>
                  <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                    {formatNumber(project.beneficiaries.nna)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                    {formatNumber(project.beneficiaries.families)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                    {formatNumber(getProjectReach(project))}
                  </td>
                  <td className="py-2.5">
                    <Sparkline values={project.history} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}
