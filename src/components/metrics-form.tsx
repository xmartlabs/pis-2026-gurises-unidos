'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatNumber } from '@/lib/format';
import type { MetricValues } from '@/lib/metrics';

const INITIAL_METRICS: {
  key: keyof MetricValues;
  name: string;
  description: string;
  showPublicly: boolean;
}[] = [
  {
    key: 'children_reached',
    name: 'NNA alcanzados',
    description: 'Niños, niñas y adolescentes alcanzados con acciones directas e indirectas.',
    showPublicly: true,
  },
  {
    key: 'families',
    name: 'Familias acompañadas',
    description: 'Familias con acompañamiento directo durante el año.',
    showPublicly: true,
  },
  {
    key: 'teachers',
    name: 'Docentes capacitados',
    description: 'Funcionarios de servicios básicos formados por la organización.',
    showPublicly: false,
  },
  {
    key: 'institutions',
    name: 'Instituciones vinculadas',
    description: 'Organizaciones coordinadas en el territorio.',
    showPublicly: false,
  },
  {
    key: 'departments',
    name: 'Departamentos',
    description: 'Departamentos con presencia de la organización.',
    showPublicly: false,
  },
  {
    key: 'active_projects',
    name: 'Proyectos activos',
    description: 'Proyectos en ejecución durante el año.',
    showPublicly: true,
  },
];

export function MetricsForm({ year, values }: { year: string; values: MetricValues }) {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const visibleMetrics = metrics.filter((metric) => metric.showPublicly);

  function setVisibility(key: string, showPublicly: boolean) {
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
          <Button variant="ghost" onClick={() => setMetrics(INITIAL_METRICS)}>
            Restablecer valores
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button disabled aria-describedby="metrics-demo-notice">
              Guardar cambios
            </Button>
          </div>
        </div>
        <p id="metrics-demo-notice" className="text-muted-foreground text-sm"></p>
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
            Estas cifras se actualizan automáticamente en el sitio público.
          </p>
          <div className="text-center">
            <Button variant="ghost" disabled>
              Ver sitio público →
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
