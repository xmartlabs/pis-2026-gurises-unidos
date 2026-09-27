import { cn } from 'cn';
import { formatNumber } from '@/lib/format';
import type { DashboardKpi } from '@/lib/dashboard/mock-data';

export function KpiCard({ kpi, className }: { kpi: DashboardKpi; className?: string }) {
  return (
    <div className={cn('bg-card border-border rounded-[14px] border p-6', className)}>
      <p className="text-foreground text-3xl font-bold">{formatNumber(kpi.value)}</p>
      <p className="text-foreground mt-1 text-sm font-medium">{kpi.label}</p>
      <p className="text-muted-foreground mt-1 text-sm">{kpi.delta}</p>
    </div>
  );
}
