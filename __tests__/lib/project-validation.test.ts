import { afterEach, expect, it, vi } from 'vitest';
import { projectSchema } from '@/lib/validation/project';
import { projectBeneficiarySchema } from '@/lib/validation/project-beneficiary';
import { projectFormSchema } from '@/lib/validation/project-form';
import { parseId, MAX_INT32 } from '@/lib/validation/ids';

afterEach(() => vi.useRealTimers());

it.each([
  null,
  undefined,
  true,
  false,
  '',
  ' ',
  '1.1',
  '1e2',
  '0x10',
  '01',
  -1,
  0,
  Infinity,
  MAX_INT32 + 1,
])('rejects invalid ids: %s', (value) => {
  expect(parseId(value)).toBeNull();
});
it('accepts integer ids at the boundary', () => {
  expect(parseId(String(MAX_INT32))).toBe(MAX_INT32);
});
it('validates years and defaults after midnight without reimporting the module', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 11, 31, 23, 59));
  expect(projectSchema.shape.startYear.safeParse(2027).success).toBe(false);
  expect(projectBeneficiarySchema.parse({}).year).toBe(2026);
  vi.setSystemTime(new Date(2027, 0, 1, 0, 1));
  expect(projectSchema.shape.startYear.safeParse(2027).success).toBe(true);
  expect(projectBeneficiarySchema.parse({}).year).toBe(2027);
});
it.each([
  'directChildrenAdolescents',
  'indirectChildrenAdolescents',
  'youth18To29',
  'families',
  'coordinatedInstitutions',
  'communityLeaders',
  'basicServiceStaff',
] as const)('bounds %s to a Postgres integer', (field) => {
  expect(projectBeneficiarySchema.shape[field].safeParse(MAX_INT32).success).toBe(true);
  expect(projectBeneficiarySchema.shape[field].safeParse(MAX_INT32 + 1).success).toBe(false);
});
it.each([
  ['name', 200],
  ['localityNeighborhood', 200],
  ['generalObjective', 5000],
  ['internalNotes', 5000],
  ['publicDescription', 300],
] as const)('bounds %s text', (field, limit) => {
  expect(projectSchema.shape[field].safeParse('a'.repeat(limit)).success).toBe(true);
  expect(projectSchema.shape[field].safeParse('a'.repeat(limit + 1)).success).toBe(false);
});
it('rejects invalid topic ids and normalizes duplicate ids', () => {
  expect(projectFormSchema.shape.topicIds.safeParse(['invalid']).success).toBe(false);
  expect(projectFormSchema.shape.topicIds.safeParse(['0']).success).toBe(false);
  expect(projectFormSchema.shape.topicIds.parse(['2', '1', '2'])).toEqual([1, 2]);
});
