import { formatNumber } from "@/lib/format"

const WIDTH = 520
const HEIGHT = 200
const PAD_X = 34
const PAD_TOP = 24
const PAD_BOTTOM = 28

export function AreaChart({
  data,
}: {
  data: { year: number; reach: number }[]
}) {
  const max = Math.ceil(Math.max(...data.map((item) => item.reach)) / 5000) * 5000
  const inner_w = WIDTH - PAD_X * 2
  const inner_h = HEIGHT - PAD_TOP - PAD_BOTTOM

  const points = data.map((item, index) => [
    PAD_X + (index / (data.length - 1)) * inner_w,
    PAD_TOP + inner_h - (item.reach / max) * inner_h,
  ])
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ")
  const area = `${line} L ${points[points.length - 1][0]} ${PAD_TOP + inner_h} L ${points[0][0]} ${PAD_TOP + inner_h} Z`
  const last = points[points.length - 1]
  const ticks = [0, max / 2, max]

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Evolución del alcance total por año"
      className="w-full"
    >
      {ticks.map((tick) => {
        const y = PAD_TOP + inner_h - (tick / max) * inner_h
        return (
          <g key={tick}>
            <line
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={y}
              y2={y}
              stroke="var(--line)"
              strokeWidth="1"
            />
            <text x={4} y={y + 4} fontSize="10" fill="var(--ink-3)" className="font-mono">
              {tick === 0 ? "0" : `${tick / 1000}k`}
            </text>
          </g>
        )
      })}
      <path d={area} fill="var(--series-1)" opacity="0.1" />
      <path
        d={line}
        fill="none"
        stroke="var(--series-1)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map(([x, y], index) => (
        <g key={data[index].year}>
          <circle cx={x} cy={y} r="4.5" fill="var(--series-1)" stroke="var(--surface)" strokeWidth="2">
            <title>{`${data[index].year}: ${formatNumber(data[index].reach)} personas`}</title>
          </circle>
          <text
            x={x}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--ink-3)"
            className="font-mono"
          >
            {data[index].year}
          </text>
        </g>
      ))}
      <text
        x={last[0]}
        y={last[1] - 14}
        textAnchor="end"
        fontSize="13"
        fontWeight="600"
        fill="var(--ink)"
        className="font-mono"
      >
        {formatNumber(data[data.length - 1].reach)}
      </text>
    </svg>
  )
}
