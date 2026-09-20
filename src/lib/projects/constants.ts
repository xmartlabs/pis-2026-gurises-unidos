import type { ProjectStatus } from '@/generated/prisma/enums';

export type ProjectStatusDisplay = 'active' | 'paused' | 'closed';

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  {
    displayStatus: ProjectStatusDisplay;
    label: string;
    badgeVariant: 'active' | 'pending' | 'neutral';
  }
> = {
  active: { displayStatus: 'active', label: 'Activo', badgeVariant: 'active' },
  inProgress: { displayStatus: 'active', label: 'Activo', badgeVariant: 'active' },
  archived: { displayStatus: 'paused', label: 'Pausado', badgeVariant: 'pending' },
  completed: { displayStatus: 'closed', label: 'Cerrado', badgeVariant: 'neutral' },
};

export const STATUS_FILTERS = [
  { value: 'all', label: 'Todos', title: 'Proyectos' },
  { value: 'active', label: 'Activos', title: 'Proyectos activos' },
  { value: 'paused', label: 'Pausados', title: 'Proyectos pausados' },
  { value: 'closed', label: 'Cerrados', title: 'Proyectos cerrados' },
] as const;

export type StatusFilterValue = (typeof STATUS_FILTERS)[number]['value'];
