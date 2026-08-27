import { BENEFICIARY_CATEGORIES, PROJECTS } from "@/lib/projects";
import { formatNumber } from "@/lib/format";

const CELL_W = 12;
const CELL_H = 14;
const GAP = 2;
const LABEL_W = 128;
const STEPS = [
  "--ramp-700",
  "--ramp-550",
  "--ramp-400",
  "--ramp-250",
  "--ramp-100",
];

function stepFor(value: number, max: number) {
  const ratio = max === 0 ? 0 : value / max;
  const index = Math.min(STEPS.length - 1, Math.floor(ratio * STEPS.length));
  return STEPS[index];
}

export function ReachGrid() {
  const width = LABEL_W + PROJECTS.length * (CELL_W + GAP);
  const height = BENEFICIARY_CATEGORIES.length * (CELL_H + GAP);

  return (
    <figure className="w-full">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Alcance de cada proyecto por categoría de beneficiario"
          className="w-full min-w-[760px]"
        >
          {BENEFICIARY_CATEGORIES.map((category, row) => {
            const max = Math.max(
              ...PROJECTS.map((project) => project.beneficiaries[category.key]),
            );
            const y = row * (CELL_H + GAP);

            return (
              <g key={category.key}>
                <text
                  x={LABEL_W - 10}
                  y={y + CELL_H - 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="currentColor"
                  className="font-mono"
                >
                  {category.label}
                </text>
                {PROJECTS.map((project, column) => (
                  <rect
                    key={project.slug}
                    x={LABEL_W + column * (CELL_W + GAP)}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx="2"
                    fill={`var(${stepFor(project.beneficiaries[category.key], max)})`}
                  >
                    <title>{`${project.name} · ${category.label}: ${formatNumber(project.beneficiaries[category.key])}`}</title>
                  </rect>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 font-mono text-[11px] text-current/70">
        <span>menos</span>
        {STEPS.map((step) => (
          <span
            key={step}
            className="h-2.5 w-5 rounded-sm"
            style={{ background: `var(${step})` }}
          />
        ))}
        <span>más alcance</span>
      </figcaption>
    </figure>
  );
}
