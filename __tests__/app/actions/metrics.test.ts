import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authMock, transactionMock, upsertMock, auditMock, revalidateMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  transactionMock: vi.fn(),
  upsertMock: vi.fn(),
  auditMock: vi.fn(),
  revalidateMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('@/lib/prisma', () => ({ default: { $transaction: transactionMock } }));
vi.mock('@/lib/audit-log', () => ({ logAudit: auditMock }));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));

import { saveMetricSettings } from '@/app/actions/metrics';
import { METRIC_DEFINITIONS } from '@/lib/metric-definitions';

const SETTINGS = METRIC_DEFINITIONS.map(({ key }, index) => ({ key, showPublicly: index === 0 }));

describe('saveMetricSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authMock.mockResolvedValue({ user: { id: '1', role: 'admin' } });
    upsertMock.mockResolvedValue({ id: 1 });
    transactionMock.mockImplementation(async (callback) =>
      callback({ metric: { upsert: upsertMock } })
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
      SETTINGS.slice(1),
      SETTINGS.map(() => SETTINGS[0]),
      SETTINGS.map((metric) => ({ ...metric, showPublicly: 'true' })),
      SETTINGS.map((metric) => ({ ...metric, key: 'unknown' })),
    ].map((input) => ({ input }))
  )('rejects incomplete or invalid selections', async ({ input }) => {
    expect((await saveMetricSettings(input)).success).toBe(false);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('persists enabled and disabled metrics and refreshes both pages', async () => {
    expect((await saveMetricSettings(SETTINGS)).success).toBe(true);
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
    expect(revalidateMock).toHaveBeenCalledWith('/metrics-test');
  });

  it('reports a database failure without reporting success', async () => {
    transactionMock.mockRejectedValue(new Error('Database unavailable'));
    expect((await saveMetricSettings(SETTINGS)).success).toBe(false);
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
