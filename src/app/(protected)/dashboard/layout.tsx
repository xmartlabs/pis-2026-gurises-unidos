import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      {/* Sidebar here */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
