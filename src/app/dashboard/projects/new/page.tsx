import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { ProjectForm } from '@/components/project-form';

export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [coordinators, departments] = await Promise.all([
    prisma.user.findMany({ where: { role: 'coordinator' }, orderBy: { firstName: 'asc' } }),
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return <ProjectForm coordinators={coordinators} departments={departments} />;
}
