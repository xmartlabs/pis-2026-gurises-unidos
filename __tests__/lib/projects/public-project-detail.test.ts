import { afterEach, expect, test, vi } from 'vitest';
import { prismaMock } from '../../mocks/prisma';
import { FIRST_PROJECT_YEAR } from '@/lib/project-display';
import { getPublicProjectDetail } from '@/lib/projects/public-detail';

afterEach(() => {
  vi.useRealTimers();
});

test('loads only a non-deleted project for the public detail view', async () => {
  prismaMock.project.findFirst.mockResolvedValue({ id: 42, name: 'El Resorte' });

  await expect(getPublicProjectDetail(42)).resolves.toEqual({ id: 42, name: 'El Resorte' });
  expect(prismaMock.project.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({ where: { id: 42, deletedAt: null } })
  );
});

test('ignores beneficiary records outside the valid year range', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-28T12:00:00Z'));
  prismaMock.project.findFirst.mockResolvedValue(null);

  await getPublicProjectDetail(42);

  expect(prismaMock.project.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({
      select: expect.objectContaining({
        projectBeneficiaries: expect.objectContaining({
          where: { year: { gte: FIRST_PROJECT_YEAR, lte: 2026 } },
          orderBy: { year: 'desc' },
          take: 1,
        }),
      }),
    })
  );
});
