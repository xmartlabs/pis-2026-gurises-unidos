import type { Metadata } from 'next';
import { MetricsYearSelect } from '@/components/metrics-year-select';
import { getMetricSettings, getMetricValues, getMetricYears } from '@/lib/metrics';
import { formatNumber } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Prueba de métricas públicas',
  robots: { index: false, follow: false },
};

export default async function MetricsTestPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const currentYear = Number(
    new Intl.DateTimeFormat('es-UY', {
      year: 'numeric',
      timeZone: 'America/Montevideo',
    }).format(new Date())
  );
  const years = await getMetricYears(currentYear);
  const requestedYear = (await searchParams).year;
  const parsedYear =
    typeof requestedYear === 'string' && /^\d{4}$/.test(requestedYear)
      ? Number(requestedYear)
      : NaN;
  const year = years.includes(parsedYear) ? parsedYear : currentYear - 1;
  const [settings, values] = await Promise.all([getMetricSettings(), getMetricValues(year)]);
  const visibleMetrics = settings.filter((metric) => metric.showPublicly);

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-muted-foreground text-sm">Página pública de prueba</p>
        <h1 className="text-3xl font-bold">Impacto {year}</h1>
        <p className="text-muted-foreground">
          Se muestran las métricas publicadas. Recargá esta página después de guardar cambios en el
          panel.
        </p>
      </header>
      <MetricsYearSelect year={year} years={years} />
      {visibleMetrics.length ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          {visibleMetrics.map((metric) => (
            <div key={metric.key} className="rounded-2xl bg-[#103d30] p-6">
              <dt className="text-white/80">{metric.name}</dt>
              <dd className="mt-2 text-4xl font-bold text-[#ffa500]">
                {formatNumber(values[metric.key])}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="rounded-xl border p-6">No hay métricas publicadas para mostrar.</p>
      )}
    </section>
  );
}
