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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-ink-3 font-mono text-xs tracking-widest uppercase">
        Proyectos / Nuevo proyecto
      </p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">Nuevo proyecto</h1>

      <ProjectForm coordinators={coordinators} departments={departments} />
    </div>
  );
}
