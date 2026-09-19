import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProjectsCardList } from '@/components/projects-card-listing';
import { ProjectsCardListSkeleton } from '@/components/projects-card-listing-skeleton';
import { listProjects } from '@/lib/projects/list';
import { PROJECT_LIST_MAX_PAGE_SIZE, parseProjectFilters } from '@/lib/validation/project-filters';

async function Projects() {
  const filters = parseProjectFilters({ pageSize: String(PROJECT_LIST_MAX_PAGE_SIZE) });
  const { items } = await listProjects(filters);

  return <ProjectsCardList projects={items} />;
}

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <Suspense fallback={<ProjectsCardListSkeleton />}>
      <Projects />
    </Suspense>
  );
}
