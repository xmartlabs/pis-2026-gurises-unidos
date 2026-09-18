import { vi } from 'vitest';

export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  project: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  department: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

function resetMockValue(value: unknown) {
  if (
    typeof value === 'function' &&
    'mockReset' in value &&
    typeof value.mockReset === 'function'
  ) {
    value.mockReset();
    return;
  }

  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      resetMockValue(nested);
    }
  }
}

export function resetPrismaMock() {
  resetMockValue(prismaMock);
}
