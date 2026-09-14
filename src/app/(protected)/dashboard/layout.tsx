import { auth } from '@/auth';
import { Topbar } from '@/components/topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <>
      <Topbar user={session?.user} />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </>
  );
}
