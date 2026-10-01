'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { Session } from 'next-auth';
import logo from '@/assets/logo.png';
import { AppBreadcrumb } from '@/components/breadcrumb';
import { useTopbar } from '@/components/layout/topbar-context';
import { ProjectYearSelector } from '@/components/projects/detail/project-year-selector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getInitials } from '@/lib/utils';
import { getAvatarColorClassName } from '@/lib/users/avatar';

function ProfileAvatar({ user, className }: { user: Session['user']; className: string }) {
  return (
    <Link href="/management/profile" className={className} aria-label="Abrir mi perfil">
      <Avatar>
        {user.image && <AvatarImage src={user.image} alt="" />}
        <AvatarFallback className={getAvatarColorClassName(user.avatarColorIndex)}>
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}

export function Topbar({ user }: { user: Session['user'] }) {
  const { projectConfig } = useTopbar();

  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-15 items-center justify-between gap-4 border-b px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <Image
          className="size-8 shrink-0 rounded-md md:hidden"
          src={logo}
          alt="Gurises Unidos"
          width={32}
          height={32}
        />
        <span className="text-sm font-semibold md:hidden">Gurises Unidos</span>
        <AppBreadcrumb currentLabel={projectConfig?.projectName} />
      </div>
      <div className="hidden shrink-0 items-center gap-2 md:flex">
        {projectConfig && (
          <>
            <ProjectYearSelector year={projectConfig.selectedYear} years={projectConfig.years} />
            <div className="border-border text-muted-foreground flex h-9 min-w-35 items-center justify-between gap-3 rounded-lg border px-3 text-sm">
              <span>Todo el país</span>
              <ChevronDown className="size-4" aria-hidden="true" />
            </div>
            <Button type="button" variant="outline" size="lg" onClick={() => window.print()}>
              Exportar
            </Button>
          </>
        )}
        <ProfileAvatar user={user} className="ml-1 hidden md:block" />
      </div>
      <ProfileAvatar user={user} className="md:hidden" />
    </header>
  );
}
