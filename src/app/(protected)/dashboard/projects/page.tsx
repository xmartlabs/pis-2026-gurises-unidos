import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProjectsCardList } from '@/components/projects/projects-card-listing';
import { ProjectsCardListSkeleton } from '@/components/projects/projects-card-listing-skeleton';
import { listBeneficiaryYears, listProjects } from '@/lib/projects/list';
import {
  PROJECT_LIST_PAGE_SIZE,
  parseProjectFilters,
  type RawProjectFilters,
} from '@/lib/validation/project-filters';

const DEFAULT_STATUS = 'active';

type ProjectsPageProps = {
  searchParams: Promise<RawProjectFilters>;
};

async function Projects({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const years = await listBeneficiaryYears();
  const filters = parseProjectFilters({
    ...params,
    status: params.status ?? DEFAULT_STATUS,
    beneficiaryYear: params.beneficiaryYear ?? years[0]?.toString(),
    page: undefined,
    pageSize: String(PROJECT_LIST_PAGE_SIZE),
  });
  const { items, total, page, totalPages } = await listProjects(filters);

  return (
    <ProjectsCardList
      projects={items}
      total={total}
      page={page}
      totalPages={totalPages}
      years={years}
      status={filters.status ?? 'all'}
      beneficiaryYear={filters.beneficiaryYear}
      search={filters.search}
    />
  );
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <Suspense fallback={<ProjectsCardListSkeleton />}>
      <Projects searchParams={searchParams} />
    </Suspense>
  );
}
