import { formatNumber } from '@/lib/format';
import type { DashboardKpi } from '@/lib/dashboard/mock-data';

export function HeroKpiCard({ kpi }: { kpi: DashboardKpi }) {
  return (
    <div className="bg-card border-border rounded-[14px] border p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-foreground text-4xl font-bold">+{formatNumber(kpi.value)}</p>
          <p className="text-muted-foreground text-sm">{kpi.label}</p>
        </div>
        <p className="text-muted-foreground shrink-0 text-sm">{kpi.delta}</p>
      </div>
    </div>
  );
}
