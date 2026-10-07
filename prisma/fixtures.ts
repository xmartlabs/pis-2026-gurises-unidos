import { BENEFICIARY_FIELDS, type BeneficiaryCounts } from '../src/lib/project-display';

export const ADMIN = {
  firstName: 'Ana',
  lastName: 'Admin',
  documentId: '11111111',
  email: 'admin@gurisesunidos.test',
  role: 'admin',
  status: 'active',
} as const;

export const TABLES = [
  'ProjectCoordinator',
  'ProjectBeneficiaryValue',
  'ProjectBeneficiary',
  'BeneficiaryCategory',
  'AuditLog',
  'Report',
  'Metric',
  'PublicSettings',
  'Project',
  'User',
  'Topic',
  'Department',
];

export const BENEFICIARY_CATEGORIES = BENEFICIARY_FIELDS.map(({ key, label }, index) => ({
  key,
  name: label,
  sortOrder: index + 1,
  isSystem: true,
}));

export function beneficiaryValues(counts: Partial<BeneficiaryCounts>) {
  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ value, category: { connect: { key } } }));
}

export function formCategoryValuesWhere(projectId: number, year: number) {
  return {
    beneficiary: { projectId, year },
    category: { key: { in: BENEFICIARY_FIELDS.map(({ key }) => key) } },
  };
}
