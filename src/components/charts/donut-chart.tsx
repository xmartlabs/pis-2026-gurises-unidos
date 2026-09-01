import { formatNumber } from "@/lib/format"

const SIZE = 200
const RADIUS = 78
const STROKE = 22
const GAP_DEGREES = 1.6

function polarPoint(angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180
  return [SIZE / 2 + RADIUS * Math.cos(radians), SIZE / 2 + RADIUS * Math.sin(radians)]
}

function arcPath(from: number, to: number) {
  const [x1, y1] = polarPoint(from)
  const [x2, y2] = polarPoint(to)
  const largeArc = to - from > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`
}

export function DonutChart({
  data,
  total,
  totalLabel,
}: {
  data: { label: string; value: number; color: string }[]
  total: number
  totalLabel: string
}) {
  const sum = data.reduce((acc, item) => acc + item.value, 0)
  const arcs = data.reduce<{ item: (typeof data)[number]; from: number; to: number }[]>(
    (acc, item) => {
      const start = acc.length === 0 ? 0 : acc[acc.length - 1].to
      const sweep = (item.value / sum) * 360
      acc.push({ item, from: start, to: start + sweep })
      return acc
    },
    [],
  )

  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Distribución del alcance por categoría de beneficiario"
        className="h-44 w-44 shrink-0"
      >
        {arcs.map((arc) => {
          const from = arc.from + GAP_DEGREES / 2
          const to = arc.to - GAP_DEGREES / 2

          return (
            <path
              key={arc.item.label}
              d={arcPath(from, Math.max(from + 0.2, to))}
              stroke={arc.item.color}
              strokeWidth={STROKE}
              fill="none"
            >
              <title>{`${arc.item.label}: ${formatNumber(arc.item.value)}`}</title>
            </path>
          )
        })}
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 2}
          textAnchor="middle"
          fontSize="26"
          fill="var(--ink)"
          fontWeight="600"
        >
          {formatNumber(total)}
        </text>
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 16}
          textAnchor="middle"
          fontSize="10"
          fill="var(--ink-3)"
          className="font-mono"
        >
          {totalLabel}
        </text>
      </svg>
      <ul className="flex min-w-52 flex-1 flex-col gap-2">
        {data.map((item) => (
          <li key={item.label} className="flex items-baseline gap-2.5 text-sm">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <span className="flex-1 text-ink-2">{item.label}</span>
            <span className="font-mono tabular-nums text-ink">
              {formatNumber(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
