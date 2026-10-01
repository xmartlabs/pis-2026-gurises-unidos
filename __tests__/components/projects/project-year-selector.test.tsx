import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { ProjectYearSelector } from '@/components/projects/detail/project-year-selector';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/projects/42',
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockReset();
});

test('stores the selected project year in the URL', () => {
  render(<ProjectYearSelector year={2026} years={[2026, 2025, 2024]} />);

  fireEvent.click(screen.getByRole('tab', { name: '2025' }));

  expect(pushMock).toHaveBeenCalledWith('/dashboard/projects/42?year=2025', { scroll: false });
});

test('marks the current project year as selected', () => {
  render(<ProjectYearSelector year={2025} years={[2026, 2025, 2024]} />);

  expect(screen.getByRole('tab', { name: '2025' }).getAttribute('aria-selected')).toBe('true');
});
