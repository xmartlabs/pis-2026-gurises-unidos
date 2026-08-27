const WIDTH = 88
const HEIGHT = 22

export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * (WIDTH - 4) + 2,
    HEIGHT - 3 - (value / max) * (HEIGHT - 7),
  ])
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ")
  const last = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-6 w-22" aria-hidden="true">
      <path
        d={line}
        fill="none"
        stroke="var(--ramp-250)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill="var(--series-1)" />
    </svg>
  )
}
