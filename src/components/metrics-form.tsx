'use client';

import { useState, useTransition } from 'react';
import { saveMetricSettings } from '@/app/actions/metrics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatNumber } from '@/lib/format';
import { METRIC_DEFINITIONS } from '@/lib/metric-definitions';
import type { MetricSetting, MetricValues } from '@/lib/metrics';

export function MetricsForm({
  year,
  values,
  initialMetrics,
  canSave,
}: {
  year: string;
  values: MetricValues;
  initialMetrics: MetricSetting[];
  canSave: boolean;
}) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const visibleMetrics = metrics.filter((metric) => metric.showPublicly);

  function saveChanges() {
    setMessage('');
    startTransition(async () => {
      try {
        const result = await saveMetricSettings(
          metrics.map(({ key, showPublicly }) => ({ key, showPublicly }))
        );
        setMessage(result.message);
      } catch {
        setMessage('No se pudieron guardar los cambios. Intentá de nuevo.');
      }
    });
  }

  function setVisibility(key: string, showPublicly: boolean) {
    setMessage('');
    setMetrics((current) =>
      current.map((metric) => (metric.key === key ? { ...metric, showPublicly } : metric))
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[1185px] items-start gap-y-6 xl:grid-cols-[minmax(0,760fr)_minmax(0,425fr)]">
      <section
        aria-label="Selección de métricas"
        className="flex min-w-0 flex-col gap-5 bg-[#FAFAFB] px-6 pt-6 pb-8"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.map((metric) => (
            <article
              key={metric.key}
              className="bg-card flex min-w-0 flex-col gap-3 rounded-[14px] border border-[#E5E5E7] p-5"
            >
              <h2 className="text-lg font-semibold">
                <label htmlFor={`${metric.key}-value`}>{metric.name}</label>
              </h2>
              <Input
                id={`${metric.key}-value`}
                value={values[metric.key]}
                readOnly
                aria-describedby={`${metric.key}-description`}
                className="text-muted-foreground h-10 text-base"
              />
              <p
                id={`${metric.key}-description`}
                className="text-muted-foreground flex-1 text-sm leading-relaxed"
              >
                {metric.description}
              </p>
              <div className="flex items-center gap-3 border-t pt-4">
                <Switch
                  id={`${metric.key}-visibility`}
                  checked={metric.showPublicly}
                  disabled={isPending || !canSave}
                  onCheckedChange={(checked) => setVisibility(metric.key, checked)}
                  aria-label={`Mostrar ${metric.name} en el sitio público`}
                />
                <label htmlFor={`${metric.key}-visibility`} className="cursor-pointer text-sm">
                  Mostrar en el sitio público
                </label>
              </div>
            </article>
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            variant="ghost"
            className="h-9 w-fit flex-col gap-2.5 rounded-lg px-4 py-2"
            disabled={isPending || !canSave}
            onClick={() => {
              setMetrics((current) =>
                current.map((metric) => ({
                  ...metric,
                  showPublicly:
                    METRIC_DEFINITIONS.find((definition) => definition.key === metric.key)
                      ?.showPublicly ?? false,
                }))
              );
              setMessage('');
            }}
          >
            <span className="flex w-fit items-center gap-2.5 leading-5">Restablecer valores</span>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isPending || !canSave}
              onClick={saveChanges}
              className="h-9 w-fit flex-col gap-2.5 rounded-lg bg-[#1A1A1A] px-4 py-2 shadow-[0_1px_2px_0_rgb(0_0_0/10%)]"
              aria-describedby="metrics-save-status"
            >
              {isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
        <p
          id="metrics-save-status"
          role="status"
          className="text-muted-foreground text-sm empty:hidden"
        >
          {canSave ? message : 'Solo los administradores pueden guardar cambios.'}
        </p>
      </section>
      <aside
        aria-label="Vista previa del sitio público"
        className="bg-card flex w-full flex-col overflow-hidden border border-[#E5E5E7] xl:mt-6"
      >
        <div className="flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b border-[#E5E5E7] bg-[#FAFAFB] px-5 py-3 text-sm">
          <h2 className="font-medium">Vista previa</h2>
          <span className="text-muted-foreground">Actualización automática</span>
        </div>
        <div className="flex w-full flex-col gap-3 bg-[#F5F5F5] px-6 py-8">
          <div
            className="flex w-full flex-col gap-3.5 rounded-[14px] bg-[#0E3A2E] p-5"
            aria-live="polite"
            aria-atomic="true"
          >
            <h3 className="w-fit font-sans text-xs leading-4 font-bold tracking-[0.06em] text-[#F5970C] uppercase">
              Impacto {year}
            </h3>
            {visibleMetrics.length > 0 ? (
              <dl className="flex flex-col gap-3.5">
                {visibleMetrics.map((metric) => (
                  <div key={metric.key} className="flex w-full items-center gap-2.5">
                    <dt className="order-2 text-sm text-white/70">{metric.name}</dt>
                    <dd className="order-1 text-4xl font-bold text-[#ffa500]">
                      {formatNumber(values[metric.key])}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-white/70">No hay métricas seleccionadas para mostrar.</p>
            )}
          </div>
          <p className="text-muted-foreground text-center text-xs leading-relaxed">
            Estas cifras se actualizan automáticamente en el sitio público.
          </p>
          <div className="text-center">
            <a
              href={`/metrics-test?year=${year}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-fit flex-col items-center justify-center gap-2.5 rounded-lg px-4 py-2 text-sm leading-5 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Ver sitio público →
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
