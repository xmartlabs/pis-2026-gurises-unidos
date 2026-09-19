'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { logout } from '@/app/actions/auth';
import { getInitials } from '@/lib/utils';
import Image from 'next/image';
import { UserRound } from 'lucide-react';
import logo from '@/assets/logo.png';

interface TopbarProps {
  breadcrumb?: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function Topbar({ breadcrumb = 'Vista general', user }: TopbarProps) {
  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Abrir menú de usuario">
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled className="text-muted-foreground text-xs">
          {user?.email ?? ''}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
          <UserRound />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>Cerrar sesión</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="border-border bg-background flex h-[60px] items-center justify-between gap-4 border-b px-4 md:px-6">
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
        <div className="hidden items-baseline gap-2 text-sm md:flex">
          <Link href="/dashboard/projects" className="font-medium hover:underline">
            Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{breadcrumb}</span>
        </div>
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
