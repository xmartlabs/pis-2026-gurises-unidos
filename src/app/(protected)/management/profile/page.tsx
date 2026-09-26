import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProfileForm } from '@/components/profile-form';
import prisma from '@/lib/prisma';

export default async function ProfilePage() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    redirect('/login');
  }

  const profile = await prisma.user.findFirst({
    where: {
      id: userId,
      status: 'active',
      deletedAt: null,
    },
    select: {
      firstName: true,
      lastName: true,
      documentId: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      lastAccess: true,
      updatedAt: true,
    },
  });

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="bg-primary-foreground flex w-full flex-1 flex-col">
      <header className="flex w-full flex-col gap-1.5 px-4 pt-6 pb-2.5 sm:px-6">
        <p className="text-muted-foreground text-sm leading-5">Cuenta</p>
        <h1 className="text-popover-foreground text-3xl leading-9 font-bold">Mi perfil</h1>
        <p className="text-muted-foreground text-sm leading-5">
          Consultá y actualizá tus datos personales.
        </p>
      </header>

      <ProfileForm profile={profile} />
    </div>
  );
}
