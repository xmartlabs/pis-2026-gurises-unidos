import type { Intensity, ProjectStatus } from '@/generated/prisma/enums';

export type DashboardKpi = {
  value: number;
  label: string;
  delta: string;
};

export type DashboardProjectRow = {
  id: number;
  name: string;
  status: ProjectStatus;
  intensity: Intensity;
  beneficiaries: number;
};

export const DASHBOARD_YEAR = 2026;

// TODO: reemplazar por datos reales del backend (KPIs + proyectos)
export const HERO_KPI: DashboardKpi = {
  value: 6315,
  label: 'niños, niñas y adolescentes alcanzados en 2026',
  delta: '+8.2% vs. año anterior',
};

export const SECONDARY_KPIS: DashboardKpi[] = [
  { value: 800, label: 'familias acompañadas en 2026', delta: '+4.1% vs. año anterior' },
  { value: 4498, label: 'docentes y educadores capacitados', delta: '+12.5% vs. año anterior' },
  { value: 27, label: 'proyectos activos en territorio', delta: '−1 respecto a 2025' },
];

export const DASHBOARD_PROJECTS: DashboardProjectRow[] = [
  { id: 1, name: 'Playground', status: 'active', intensity: 'high', beneficiaries: 1200 },
  { id: 2, name: 'Apoyo Escolar', status: 'active', intensity: 'high', beneficiaries: 890 },
  { id: 3, name: 'Escuela Fútbol', status: 'active', intensity: 'medium', beneficiaries: 450 },
  { id: 4, name: 'Arte Joven', status: 'active', intensity: 'low', beneficiaries: 320 },
  { id: 5, name: 'Jardines', status: 'active', intensity: 'medium', beneficiaries: 210 },
  { id: 6, name: 'Talleres', status: 'archived', intensity: 'medium', beneficiaries: 380 },
  { id: 7, name: 'Formación', status: 'active', intensity: 'high', beneficiaries: 940 },
];

export const DASHBOARD_PROJECTS_TOTAL = DASHBOARD_PROJECTS.reduce(
  (sum, project) => sum + project.beneficiaries,
  0
);
