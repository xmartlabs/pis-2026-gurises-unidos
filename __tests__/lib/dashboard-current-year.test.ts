import { expect, test } from 'vitest';
import { getCurrentYear } from '@/lib/dashboard/current-year';

test('uses the Montevideo calendar year instead of UTC', () => {
  expect(getCurrentYear(new Date('2027-01-01T02:59:00.000Z'))).toBe(2026);
  expect(getCurrentYear(new Date('2027-01-01T03:00:00.000Z'))).toBe(2027);
});
