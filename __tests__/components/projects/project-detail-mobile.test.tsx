import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { BeneficiaryDistribution } from '@/components/projects/detail/beneficiary-distribution';
import { InstitutionalContribution } from '@/components/projects/detail/institutional-contribution';
import { ProjectMetrics } from '@/components/projects/detail/project-metrics';
import { ProjectPublicCard } from '@/components/projects/detail/project-public-card';
import { ProjectRecentActivity } from '@/components/projects/detail/project-recent-activity';

const BENEFICIARIES = [
  { key: 'directChildrenAdolescents' as const, value: 80 },
  { key: 'indirectChildrenAdolescents' as const, value: 20 },
  { key: 'youth18To29' as const, value: 10 },
  { key: 'families' as const, value: 25 },
  { key: 'coordinatedInstitutions' as const, value: 5 },
  { key: 'communityLeaders' as const, value: 12 },
  { key: 'basicServiceStaff' as const, value: 18 },
];

test('uses a two-column metric grid on mobile', () => {
  const { container } = render(
    <ProjectMetrics
      metrics={{
        childrenReached: {
          value: 100,
          previousValue: 82,
          absoluteChange: 18,
          percentageChange: 22,
          trend: 'increased',
        },
        families: {
          value: 25,
          previousValue: 20,
          absoluteChange: 5,
          percentageChange: 25,
          trend: 'increased',
        },
        institutions: {
          value: 5,
          previousValue: 5,
          absoluteChange: 0,
          percentageChange: 0,
          trend: 'stable',
        },
        annualGrowth: 21.4,
      }}
      comparisonYear={2025}
    />
  );

  expect(container.querySelector('dl')?.classList.contains('grid-cols-2')).toBe(true);
});

test('shows distribution values without bar tracks on mobile', () => {
  render(<BeneficiaryDistribution data={BENEFICIARIES} year={2026} />);

  expect(screen.getByRole('meter', { name: 'NNA directos' }).className).toContain('hidden h-1.5');
  expect(screen.getByRole('meter', { name: 'NNA directos' }).className).toContain('sm:block');
});

test('keeps the public card horizontal and separates contribution rows on mobile', () => {
  const { container } = render(
    <>
      <ProjectPublicCard
        name="El Resorte"
        description="Community support project."
        coverPhoto={null}
      />
      <InstitutionalContribution
        data={{
          nationalReach: { projectValue: 342, nationalValue: 4286, percentage: 8 },
          activeProjects: { projectCount: 1, totalCount: 27 },
          territories: {
            count: 1,
            items: [
              {
                department: { id: 1, name: 'Montevideo' },
                zone: 'city',
                localityNeighborhood: null,
              },
            ],
          },
        }}
      />
    </>
  );

  expect(
    screen
      .getByRole('heading', { name: 'Tarjeta pública' })
      .closest('section')
      ?.className.includes('grid-cols-[7rem_minmax(0,1fr)]')
  ).toBe(true);
  expect(screen.getByText('del alcance nacional').closest('div')?.className).toContain('border-b');
  expect(container.textContent).toContain('342 de 4.286 NNA totales');
});

test('uses activity cards and limits the mobile list to four entries', () => {
  const { container } = render(<ProjectRecentActivity />);
  const mobileList = container.querySelector('ul');

  expect(mobileList?.className).toContain('md:hidden');
  expect(mobileList?.querySelectorAll('li')).toHaveLength(4);
  expect(mobileList?.textContent).toContain('Taller de convivencia grupal');
  expect(mobileList?.textContent).toContain('32 beneficiarios');
  expect(mobileList?.textContent).not.toContain('Articulación con escuela pública');
});
