import { MetricsForm } from '@/components/metrics-form';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMetricSettings, getMetricValues, getMetricYears } from '@/lib/metrics';
import { MetricsYearSelect } from '@/components/metrics-year-select';

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard/projects');

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
  const [values, initialMetrics] = await Promise.all([getMetricValues(year), getMetricSettings()]);

  return (
    <main className="bg-primary-foreground flex flex-1 flex-col px-6">
      <header className="mx-auto flex w-full max-w-[1185px] flex-col gap-1.5 px-6 pt-6 pb-2.5">
        <p className="text-muted-foreground w-fit font-sans text-sm leading-5 font-normal tracking-normal">
          Gestión de métricas
        </p>
        <h1 className="text-foreground w-fit font-sans text-3xl leading-9 font-bold tracking-normal">
          Indicadores institucionales {year}
        </h1>
        <p className="text-muted-foreground w-fit font-sans text-sm leading-5 font-normal tracking-normal">
          Estas cifras se publican automáticamente en el sitio público de Gurises Unidos.
        </p>
      </header>
      <div className="mx-auto flex w-full max-w-[1185px] flex-1 flex-col gap-4 pt-1.5 pb-6">
        <div className="px-6">
          <MetricsYearSelect year={year} years={years} />
        </div>
        <MetricsForm
          year={String(year)}
          values={values}
          initialMetrics={initialMetrics}
          canSave={session.user.role === 'admin'}
        />
      </div>
    </main>
  );
}
