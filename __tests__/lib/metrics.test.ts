import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/prisma';
import { getMetricSettings, getMetricValues, getMetricYears } from '@/lib/metrics';

vi.mock('@/lib/prisma', () => ({
  default: {
    metric: { findMany: vi.fn() },
    projectBeneficiary: { aggregate: vi.fn(), findMany: vi.fn() },
    project: { count: vi.fn(), findMany: vi.fn() },
  },
}));

describe('getMetricValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([2026, 2027])('uses the selected year %i for both data sources', async (year) => {
    vi.mocked(prisma.projectBeneficiary.aggregate).mockResolvedValue({
      _sum: {
        directChildrenAdolescents: 100,
        indirectChildrenAdolescents: 40,
        families: 20,
        basicServiceStaff: 12,
        coordinatedInstitutions: 5,
      },
    } as Awaited<ReturnType<typeof prisma.projectBeneficiary.aggregate>>);
    vi.mocked(prisma.project.count).mockResolvedValue(3);
    vi.mocked(prisma.project.findMany).mockResolvedValue([
      { departmentId: 1 },
      { departmentId: 2 },
    ] as Awaited<ReturnType<typeof prisma.project.findMany>>);

    expect(await getMetricValues(year)).toEqual({
      children_reached: 140,
      families: 20,
      teachers: 12,
      institutions: 5,
      departments: 2,
      active_projects: 3,
    });
    expect(prisma.projectBeneficiary.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { year } })
    );
    expect(prisma.project.count).toHaveBeenCalledWith({
      where: { startYear: year, status: 'active' },
    });
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { startYear: year }, distinct: ['departmentId'] })
    );
  });

  it('returns zeros when the year has no data', async () => {
    vi.mocked(prisma.projectBeneficiary.aggregate).mockResolvedValue({
      _sum: {
        directChildrenAdolescents: null,
        indirectChildrenAdolescents: null,
        families: null,
        basicServiceStaff: null,
        coordinatedInstitutions: null,
      },
    } as Awaited<ReturnType<typeof prisma.projectBeneficiary.aggregate>>);
    vi.mocked(prisma.project.count).mockResolvedValue(0);
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);

    expect(Object.values(await getMetricValues(2027))).toEqual([0, 0, 0, 0, 0, 0]);
  });
});

describe('getMetricSettings', () => {
  it('loads saved visibility and hides metrics without a saved setting', async () => {
    vi.mocked(prisma.metric.findMany).mockResolvedValue([
      { key: 'children_reached', showPublicly: true },
      { key: 'families', showPublicly: false },
    ] as Awaited<ReturnType<typeof prisma.metric.findMany>>);
    const settings = await getMetricSettings();
    expect(settings.filter((metric) => metric.showPublicly).map((metric) => metric.key)).toEqual([
      'children_reached',
    ]);
    expect(settings).toHaveLength(6);
  });
});

describe('getMetricYears', () => {
  it('includes the previous and current years even without records', async () => {
    vi.mocked(prisma.projectBeneficiary.findMany).mockResolvedValue([]);
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);

    expect(await getMetricYears(2026)).toEqual([2026, 2025]);
    expect(await getMetricYears(2027)).toEqual([2027, 2026]);
  });

  it('combines historical years without duplicates or future years', async () => {
    vi.mocked(prisma.projectBeneficiary.findMany).mockResolvedValue([
      { year: 2024 },
      { year: 2025 },
      { year: 2027 },
    ] as Awaited<ReturnType<typeof prisma.projectBeneficiary.findMany>>);
    vi.mocked(prisma.project.findMany).mockResolvedValue([
      { startYear: 2024 },
      { startYear: 2022 },
    ] as Awaited<ReturnType<typeof prisma.project.findMany>>);

    expect(await getMetricYears(2026)).toEqual([2026, 2025, 2024, 2022]);
  });
});
