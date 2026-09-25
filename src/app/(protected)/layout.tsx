import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Topbar } from '@/components/topbar';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={session.user} />
      <SidebarInset className="min-w-0">
        <Topbar user={session.user} />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
