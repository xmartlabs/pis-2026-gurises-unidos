import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { ProjectsCardList } from '@/components/projects-card-listing';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

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