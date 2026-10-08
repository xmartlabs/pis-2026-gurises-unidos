import { formatNumber } from '@/lib/format';
import type { ProjectDetail } from '@/lib/projects/detail';

const DISTRIBUTION_ROWS = [
  { key: 'directChildrenAdolescents', label: 'NNA directos', color: 'bg-beneficiary-children' },
  { key: 'families', label: 'Familias', color: 'bg-beneficiary-families' },
  { key: 'basicServiceStaff', label: 'Docentes y educadores', color: 'bg-beneficiary-staff' },
  { key: 'coordinatedInstitutions', label: 'Instituciones', color: 'bg-beneficiary-institutions' },
] as const;

export function BeneficiaryDistribution({
  data,
  year,
}: {
  data: ProjectDetail['distribution'];
  year: number;
}) {
  const values = new Map(data.map(({ key, value }) => [key, value]));
  const maximum = Math.max(...DISTRIBUTION_ROWS.map(({ key }) => values.get(key) ?? 0), 1);

  return (
    <section className="border-border bg-card rounded-[14px] border p-4 sm:p-5">
      <h2 className="text-base font-semibold sm:text-sm">Distribución de beneficiarios</h2>
      <p className="text-muted-foreground mt-4 text-xs">Conteo por categoría · {year}</p>

      <ul className="mt-4 space-y-3.5 sm:space-y-4">
        {DISTRIBUTION_ROWS.map(({ key, label, color }) => {
          const value = values.get(key) ?? null;

          return (
            <li key={key}>
              <div className="text-muted-foreground flex items-baseline justify-between text-xs">
                <span>{label}</span>
                <span className="text-foreground font-medium tabular-nums">
                  {value === null ? '—' : formatNumber(value)}
                </span>
              </div>
              <div
                role="meter"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={maximum}
                aria-valuenow={value ?? undefined}
                className="bg-muted mt-1.5 hidden h-1.5 overflow-hidden rounded-full sm:block"
              >
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${((value ?? 0) / maximum) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
