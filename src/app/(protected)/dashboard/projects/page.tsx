import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProjectsCardList } from '@/components/projects/projects-card-listing';
import { ProjectsCardListSkeleton } from '@/components/projects/projects-card-listing-skeleton';
import { listProjectFilterOptions, listProjects } from '@/lib/projects/list';
import {
  PROJECT_LIST_MAX_PAGE_SIZE,
  parseProjectFilters,
  type RawProjectFilters,
} from '@/lib/validation/project-filters';

type ProjectsPageProps = {
  searchParams: Promise<RawProjectFilters>;
};

async function Projects({ searchParams }: ProjectsPageProps) {
  const filters = parseProjectFilters({
    ...(await searchParams),
    page: undefined,
    pageSize: String(PROJECT_LIST_MAX_PAGE_SIZE),
  });
  const [{ items, total }, { years }] = await Promise.all([
    listProjects(filters),
    listProjectFilterOptions(),
  ]);

  return (
    <ProjectsCardList
      projects={items}
      total={total}
      years={years}
      beneficiaryYear={filters.beneficiaryYear}
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
