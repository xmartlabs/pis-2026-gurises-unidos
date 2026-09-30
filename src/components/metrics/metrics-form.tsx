'use client';

import { useState, useTransition } from 'react';
import { saveMetricSettings } from '@/app/actions/metrics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatNumber } from '@/lib/format';
import { METRIC_DEFINITIONS } from '@/lib/metrics/constants';
import type { MetricSetting, MetricValues } from '@/lib/metrics/queries';
import { notify } from '@/lib/notify';

export function MetricsForm({
  year,
  values,
  initialMetrics,
}: {
  year: string;
  values: MetricValues;
  initialMetrics: MetricSetting[];
}) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isPending, startTransition] = useTransition();
  const visibleMetrics = metrics.filter((metric) => metric.showPublicly);

  function saveChanges() {
    startTransition(async () => {
      try {
        const result = await saveMetricSettings(
          metrics.map(({ key, showPublicly }) => ({ key, showPublicly }))
        );
        if (!result.success) {
          notify.error({ title: result.message });
          return;
        }
        notify.success({ title: result.message });
      } catch {
        notify.error({ title: 'No se pudieron guardar los cambios. Intentá de nuevo.' });
      }
    });
  }

  function setVisibility(key: string, showPublicly: boolean) {
    setMetrics((current) =>
      current.map((metric) => (metric.key === key ? { ...metric, showPublicly } : metric))
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[1185px] items-start gap-y-6 xl:grid-cols-[minmax(0,760fr)_minmax(0,425fr)]">
      <section
        aria-label="Selección de métricas"
        className="bg-surface-page flex min-w-0 flex-col gap-5 px-6 pt-6 pb-8"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.map((metric) => (
            <article
              key={metric.key}
              className="bg-card border-border-default flex min-w-0 flex-col gap-3 rounded-[14px] border p-5"
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
                  disabled={isPending}
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
            disabled={isPending}
            onClick={() => {
              setMetrics((current) =>
                current.map((metric) => ({
                  ...metric,
                  showPublicly:
                    METRIC_DEFINITIONS.find((definition) => definition.key === metric.key)
                      ?.showPublicly ?? false,
                }))
              );
            }}
          >
            <span className="flex w-fit items-center gap-2.5 leading-5">Restablecer valores</span>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isPending}
              onClick={saveChanges}
              className="h-9 w-fit flex-col gap-2.5 rounded-lg px-4 py-2 shadow-[0_1px_2px_0_rgb(0_0_0/10%)]"
            >
              {isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </section>
      <aside
        aria-label="Vista previa del sitio público"
        className="bg-card border-border-default flex w-full flex-col overflow-hidden border xl:mt-6"
      >
        <div className="bg-surface-page border-border-default flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b px-5 py-3 text-sm">
          <h2 className="font-medium">Vista previa</h2>
          <span className="text-muted-foreground">Actualización automática</span>
        </div>
        <div className="bg-surface-subtle flex w-full flex-col gap-3 px-6 py-8">
          <div
            className="bg-surface-brand-deep flex w-full flex-col gap-3.5 rounded-[14px] p-5"
            aria-live="polite"
            aria-atomic="true"
          >
            <h3 className="text-text-accent w-fit font-sans text-xs leading-4 font-bold tracking-[0.06em] uppercase">
              Impacto {year}
            </h3>
            {visibleMetrics.length > 0 ? (
              <dl className="flex flex-col gap-3.5">
                {visibleMetrics.map((metric) => (
                  <div key={metric.key} className="flex w-full items-center gap-2.5">
                    <dt className="order-2 text-sm text-white/70">{metric.name}</dt>
                    <dd className="text-text-accent order-1 text-4xl font-bold">
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
            <Button type="button" variant="link" size="lg">
              Ver sitio público →
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
