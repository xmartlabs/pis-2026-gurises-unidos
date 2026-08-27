import { formatNumber } from "@/lib/format";

const ROW_H = 34;
const BAR_H = 20;
const LABEL_W = 210;
const TRACK_W = 400;
const SEGMENT_GAP = 2;

export function StackedBar({
  rows,
  series,
}: {
  rows: { label: string; values: number[] }[];
  series: { label: string; color: string }[];
}) {
  const max = Math.max(
    ...rows.map((row) => row.values.reduce((a, b) => a + b, 0)),
  );
  const height = rows.length * ROW_H;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${LABEL_W + TRACK_W} ${height}`}
        role="img"
        aria-label="Composición del alcance por proyecto y categoría"
        className="w-full min-w-[560px]"
      >
        {rows.map((row, index) => {
          const y = index * ROW_H;
          let cursor = LABEL_W;

          return (
            <g key={row.label}>
              <text
                x={LABEL_W - 12}
                y={y + BAR_H - 5}
                textAnchor="end"
                fontSize="11"
                fill="var(--ink-2)"
              >
                {row.label}
              </text>
              {row.values.map((value, series_index) => {
                const raw_w = (value / max) * TRACK_W;
                const x = cursor;
                cursor += raw_w;
                if (raw_w < 0.5) {
                  return null;
                }
                return (
                  <rect
                    key={series[series_index].label}
                    x={x}
                    y={y}
                    width={Math.max(1, raw_w - SEGMENT_GAP)}
                    height={BAR_H}
                    rx={series_index === row.values.length - 1 ? 4 : 0}
                    fill={series[series_index].color}
                  >
                    <title>{`${row.label} · ${series[series_index].label}: ${formatNumber(value)}`}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
