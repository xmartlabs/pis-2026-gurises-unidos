'use client';

import { AppBreadcrumb } from '@/components/breadcrumb';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { logout } from '@/app/actions/auth';
import { getInitials } from '@/lib/utils';
import Image from 'next/image';
import logo from '@/assets/logo.png';

interface TopbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto max-w-72">
        <DropdownMenuItem
          disabled
          className="text-muted-foreground text-xs break-all whitespace-normal"
        >
          {user?.email ?? ''}
        </DropdownMenuItem>
        <form action={logout}>
          <DropdownMenuItem nativeButton render={<button type="submit" className="w-full" />}>
            Cerrar sesión
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <Image
          className="size-8 shrink-0 rounded-md md:hidden"
          src={logo}
          alt="Gurises Unidos"
          width={32}
          height={32}
        />
        <span className="text-sm font-semibold md:hidden">Gurises Unidos</span>
        <AppBreadcrumb />
      </div>

      {/* TODO: re-enable search, year toggle, and country select once real filtering is implemented */}
      {/* <div className="hidden items-center gap-4 md:flex">
        {searchInput}
        {yearToggle}
        {countrySelect}
      </div> */}

      <div className="flex items-center gap-4">{userMenu}</div>
    </header>
  );
}
