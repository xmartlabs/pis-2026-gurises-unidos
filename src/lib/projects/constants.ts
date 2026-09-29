import type { ProjectStatus } from '@/generated/prisma/enums';

export const STATUS_BADGE_VARIANT: Record<ProjectStatus, 'active' | 'pending' | 'neutral'> = {
  active: 'active',
  paused: 'pending',
  closed: 'neutral',
};

export const STATUS_FILTERS = [
  { value: 'all', label: 'Todos', title: 'Proyectos' },
  { value: 'active', label: 'Activos', title: 'Proyectos activos' },
  { value: 'paused', label: 'Pausados', title: 'Proyectos pausados' },
  { value: 'closed', label: 'Cerrados', title: 'Proyectos cerrados' },
] as const;

export type StatusFilterValue = (typeof STATUS_FILTERS)[number]['value'];
