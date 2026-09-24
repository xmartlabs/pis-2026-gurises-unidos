import { MetricsForm } from '@/components/metrics-form';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMetricValues, getMetricYears } from '@/lib/metrics';
import { MetricsYearSelect } from '@/components/metrics-year-select';

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

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
  const values = await getMetricValues(year);

  return (
    <div className="bg-primary-foreground flex flex-1 flex-col gap-8 p-6 lg:p-8">
      <header className="space-y-2">
        <p className="text-muted-foreground text-sm">Gestión de métricas</p>
        <h1 className="text-3xl font-bold tracking-tight">Indicadores institucionales {year}</h1>
        <p className="text-muted-foreground">
          Seleccioná las cifras que querés mostrar en el sitio público de Gurises Unidos.
        </p>
      </header>
      <MetricsYearSelect year={year} years={years} />
      <MetricsForm year={String(year)} values={values} />
    </div>
  );
}
