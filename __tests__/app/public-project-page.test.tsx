import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

const { getPublicProjectDetailMock, notFoundMock } = vi.hoisted(() => ({
  getPublicProjectDetailMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/projects/public-detail', () => ({
  getPublicProjectDetail: getPublicProjectDetailMock,
}));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));

import PublicProjectPage from '@/app/(public)/projects/[id]/page';

const PROJECT = {
  id: 42,
  name: 'El Resorte',
  status: 'active',
  startYear: 2024,
  endYear: 2026,
  localityNeighborhood: null,
  generalObjective: 'Support adolescents and families.',
  publicDescription: 'Community support project.',
  coverPhoto: null,
  department: { name: 'Montevideo' },
  projectBeneficiaries: [
    {
      year: 2026,
      directChildrenAdolescents: 300,
      indirectChildrenAdolescents: 42,
      families: 60,
      coordinatedInstitutions: 5,
    },
  ],
};

beforeEach(() => {
  getPublicProjectDetailMock.mockReset();
  notFoundMock.mockReset();
  notFoundMock.mockImplementation(() => {
    throw new Error('NEXT_NOT_FOUND');
  });
  getPublicProjectDetailMock.mockResolvedValue(PROJECT);
});

test('renders the public project information and latest reach', async () => {
  render(await PublicProjectPage({ params: Promise.resolve({ id: '42' }) }));

  expect(getPublicProjectDetailMock).toHaveBeenCalledWith(42);
  expect(screen.getByRole('heading', { level: 1, name: 'El Resorte' })).toBeDefined();
  expect(screen.getByText('Community support project.')).toBeDefined();
  expect(screen.getByText('342')).toBeDefined();
  expect(screen.getByText('60')).toBeDefined();
  expect(screen.getByText('5')).toBeDefined();
});

test('returns not found when the public project does not exist', async () => {
  getPublicProjectDetailMock.mockResolvedValue(null);

  await expect(PublicProjectPage({ params: Promise.resolve({ id: '42' }) })).rejects.toThrow(
    'NEXT_NOT_FOUND'
  );
});
