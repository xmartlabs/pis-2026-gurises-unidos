'use client';

import { useState, useTransition } from 'react';
import { saveMetricSettings } from '@/app/actions/metrics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatNumber } from '@/lib/format';
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
  const [savedMetrics, setSavedMetrics] = useState(initialMetrics);
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
        if (result.success) setSavedMetrics(metrics);
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
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
      <section aria-label="Selección de métricas" className="min-w-0 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.map((metric) => (
            <article
              key={metric.key}
              className="bg-card flex flex-col gap-4 rounded-2xl border p-5"
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            disabled={isPending || !canSave}
            onClick={() => {
              setMetrics(savedMetrics);
              setMessage('');
            }}
          >
            Restablecer valores
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isPending || !canSave}
              onClick={saveChanges}
              aria-describedby="metrics-save-status"
            >
              {isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
        <p id="metrics-save-status" role="status" className="text-muted-foreground text-sm">
          {canSave ? message : 'Solo los administradores pueden guardar cambios.'}
        </p>
      </section>
      <aside
        aria-label="Vista previa del sitio público"
        className="overflow-hidden rounded-xl border xl:sticky xl:top-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4 text-sm">
          <h2 className="font-medium">Vista previa</h2>
          <span className="text-muted-foreground">Actualización automática</span>
        </div>
        <div className="bg-muted/40 space-y-4 p-5 lg:p-6">
          <div className="rounded-2xl bg-[#103d30] p-6" aria-live="polite" aria-atomic="true">
            <h3 className="text-sm font-semibold tracking-wider text-[#ffa500] uppercase">
              Impacto {year}
            </h3>
            {visibleMetrics.length > 0 ? (
              <dl className="mt-5 space-y-5">
                {visibleMetrics.map((metric) => (
                  <div key={metric.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <dt className="order-2 text-sm text-white/70">{metric.name}</dt>
                    <dd className="order-1 text-4xl font-bold text-[#ffa500]">
                      {formatNumber(values[metric.key])}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-5 text-sm text-white/70">
                No hay métricas seleccionadas para mostrar.
              </p>
            )}
          </div>
          <p className="text-muted-foreground text-center text-xs leading-relaxed">
            Guardá los cambios para actualizar la página pública de prueba.
          </p>
          <div className="text-center">
            <a
              href={`/metrics-test?year=${year}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline underline-offset-4"
            >
              Ver página pública de prueba →
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
