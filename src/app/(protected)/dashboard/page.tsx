import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardQuickActions } from '@/components/dashboard/quick-actions';
import { HeroKpiCard } from '@/components/dashboard/hero-kpi-card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ProjectsOverviewTable } from '@/components/dashboard/projects-overview-table';
import {
  DASHBOARD_PROJECTS,
  DASHBOARD_PROJECTS_TOTAL,
  DASHBOARD_YEAR,
  HERO_KPI,
  SECONDARY_KPIS,
} from '@/lib/dashboard/mock-data';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="bg-surface-page flex flex-1 flex-col gap-4 p-4 lg:px-6 lg:py-5">
      <DashboardQuickActions />

      <HeroKpiCard kpi={HERO_KPI} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {SECONDARY_KPIS.map((kpi, index) => (
          <KpiCard
            key={kpi.label}
            kpi={kpi}
            className={index === 2 ? 'col-span-2 md:col-span-1' : undefined}
          />
        ))}
      </div>

      <ProjectsOverviewTable
        projects={DASHBOARD_PROJECTS}
        total={DASHBOARD_PROJECTS_TOTAL}
        year={DASHBOARD_YEAR}
      />
    </div>
  );
}
