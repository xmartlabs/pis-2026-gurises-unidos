import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { TopicsManagement } from '@/components/topics-management';
import { ErrorScreen } from '@/components/error-screen';
import { getTopics } from '@/lib/topics';

export default async function TopicsPage() {
  const session = await auth();
    
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    return <ErrorScreen code={403} />;
  }

  const topics = await getTopics();

  return (
    <div className="bg-primary-foreground flex w-full flex-1 flex-col">
      <div className="flex w-full flex-1 flex-col">
        <header className="mx-auto flex w-full max-w-[1185px] flex-col gap-1.5 px-6 pt-6 pb-2.5">
          <p className="text-muted-foreground text-sm leading-5 font-normal tracking-normal">
            Administración
          </p>

          <h1 className="text-popover-foreground text-3xl leading-9 font-bold tracking-normal">
            Temáticas
          </h1>

          <p className="text-muted-foreground text-sm leading-4.5 font-normal tracking-normal">
            Etiquetas para clasificar los proyectos. Se usan en los filtros del dashboard y la vista
            pública.
          </p>
        </header>

        <div className="bg-surface-page mx-auto flex w-full max-w-[1185px] flex-col gap-5 px-6 pt-6 pb-8">
          <TopicsManagement topics={topics} />
        </div>
      </div>
    </div>
  );
}
