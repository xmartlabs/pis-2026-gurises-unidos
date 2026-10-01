import { expect, test } from 'vitest';
import { prismaMock } from '../../mocks/prisma';
import { getPublicProjectDetail } from '@/lib/projects/public-detail';

test('loads only a non-deleted project for the public detail view', async () => {
  prismaMock.project.findFirst.mockResolvedValue({ id: 42, name: 'El Resorte' });

  await expect(getPublicProjectDetail(42)).resolves.toEqual({ id: 42, name: 'El Resorte' });
  expect(prismaMock.project.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({ where: { id: 42, deletedAt: null } })
  );
});
