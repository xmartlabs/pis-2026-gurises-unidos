import { auth } from '@/auth';
import { Topbar } from '@/components/topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className="flex min-h-svh flex-col">
      <Topbar userInitials={initials} userEmail={session?.user?.email ?? ''} />
      <main className="flex-1">{children}</main>
    </div>
  );
}