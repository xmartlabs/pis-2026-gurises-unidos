import type { MetricValues } from '@/lib/metrics';

export const METRIC_DEFINITIONS: {
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
    name: 'Funcionarios de servicios básicos',
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
