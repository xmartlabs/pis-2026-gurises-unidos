import { formatNumber } from "@/lib/format";

const ROW_H = 30;
const BAR_H = 18;
const LABEL_W = 250;
const VALUE_W = 58;
const TRACK_W = 300;

export function BarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((item) => item.value));
  const width = LABEL_W + TRACK_W + VALUE_W;
  const height = data.length * ROW_H;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Alcance total por proyecto"
        className="w-full min-w-[520px]"
      >
        {data.map((item, index) => {
          const y = index * ROW_H;
          const bar_w = Math.max(3, (item.value / max) * TRACK_W);

          return (
            <g key={item.label}>
              <text
                x={LABEL_W - 12}
                y={y + BAR_H - 4}
                textAnchor="end"
                fontSize="12"
                fill="var(--ink-2)"
              >
                {item.label}
              </text>
              <rect
                x={LABEL_W}
                y={y}
                width={bar_w}
                height={BAR_H}
                rx="4"
                fill="var(--series-1)"
              >
                <title>{`${item.label}: ${formatNumber(item.value)} personas`}</title>
              </rect>
              <rect
                x={LABEL_W}
                y={y}
                width="4"
                height={BAR_H}
                fill="var(--series-1)"
              />
              <text
                x={LABEL_W + bar_w + 10}
                y={y + BAR_H - 4}
                fontSize="12"
                fill="var(--ink)"
                className="font-mono"
              >
                {formatNumber(item.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
