import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  authMock,
  transactionMock,
  upsertMock,
  settingsUpsertMock,
  auditMock,
  revalidateMock,
  yearsMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  transactionMock: vi.fn(),
  upsertMock: vi.fn(),
  settingsUpsertMock: vi.fn(),
  auditMock: vi.fn(),
  revalidateMock: vi.fn(),
  yearsMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('@/lib/prisma', () => ({ default: { $transaction: transactionMock } }));
vi.mock('@/lib/audit-log', () => ({ logAudit: auditMock }));
vi.mock('@/lib/metrics/queries', () => ({ getMetricYears: yearsMock }));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));

import { saveMetricSettings } from '@/app/actions/metrics';
import { METRIC_DEFINITIONS } from '@/lib/metrics/constants';

const METRICS = METRIC_DEFINITIONS.map(({ key }, index) => ({ key, showPublicly: index === 0 }));
const SETTINGS = { year: 2025, metrics: METRICS };

describe('saveMetricSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });
    upsertMock.mockResolvedValue({ id: 1 });
    yearsMock.mockResolvedValue([2026, 2025, 2024]);
    transactionMock.mockImplementation(async (callback) =>
      callback({ metric: { upsert: upsertMock }, publicSettings: { upsert: settingsUpsertMock } })
    );
  });

  it.each([null, { user: { id: '2', role: 'coordinator' } }])(
    'rejects unauthorized users',
    async (session) => {
      authMock.mockResolvedValue(session);
      expect((await saveMetricSettings(SETTINGS)).success).toBe(false);
      expect(transactionMock).not.toHaveBeenCalled();
    }
  );

  it.each(
    [
      METRICS.slice(1),
      METRICS.map(() => METRICS[0]),
      METRICS.map((metric) => ({ ...metric, showPublicly: 'true' })),
      METRICS.map((metric) => ({ ...metric, key: 'unknown' })),
    ].map((metrics) => ({ input: { year: 2025, metrics } }))
  )('rejects incomplete or invalid selections', async ({ input }) => {
    expect((await saveMetricSettings(input)).success).toBe(false);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it.each([2030, 1999, 2025.5, '2025'])('rejects invalid reference year %s', async (year) => {
    expect((await saveMetricSettings({ ...SETTINGS, year })).success).toBe(false);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('persists enabled and disabled metrics and the reference year, and refreshes both pages', async () => {
    expect((await saveMetricSettings(SETTINGS)).success).toBe(true);
    expect(settingsUpsertMock).toHaveBeenCalledWith({
      where: { id: 1 },
      create: { id: 1, referenceYear: 2025, updatedBy: 1 },
      update: { referenceYear: 2025, updatedBy: 1 },
    });
    expect(upsertMock).toHaveBeenCalledTimes(6);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'children_reached' },
        update: { showPublicly: true, updatedBy: 1 },
      })
    );
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'families' },
        update: { showPublicly: false, updatedBy: 1 },
      })
    );
    expect(auditMock).toHaveBeenCalledTimes(6);
    expect(revalidateMock).toHaveBeenCalledWith('/management/metrics');
    expect(revalidateMock).toHaveBeenCalledWith('/');
    expect(revalidateMock).toHaveBeenCalledTimes(2);
  });

  it('reports a database failure without reporting success', async () => {
    transactionMock.mockRejectedValue(new Error('Database unavailable'));
    expect((await saveMetricSettings(SETTINGS)).success).toBe(false);
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
