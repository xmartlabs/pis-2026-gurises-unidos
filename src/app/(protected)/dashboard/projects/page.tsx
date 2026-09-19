import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { ProjectsCardList } from '@/components/projects-card-listing';
import { ProjectsCardListSkeleton } from '@/components/projects-card-listing-skeleton';

async function Projects() {
  const projects = await prisma.project.findMany({
    include: {
      leadCoordinator: { select: { firstName: true, lastName: true } },
      department: true,
      projectBeneficiaries: { orderBy: { year: 'desc' } },
    },
    orderBy: { name: 'asc' },
  });

  return <ProjectsCardList projects={projects} />;
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
