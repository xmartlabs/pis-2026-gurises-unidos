import { BENEFICIARY_FIELDS } from '../src/lib/project-display';

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
