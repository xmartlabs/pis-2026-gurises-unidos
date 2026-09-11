'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { logout } from '@/app/actions/auth';

const YEARS = ['2026', '2025', '2024'];

interface TopbarProps {
  breadcrumb?: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function Topbar({ breadcrumb = 'Vista general', user }: TopbarProps) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';
  const [year, setYear] = useState('2026');

  const yearToggle = (
    <div className="bg-muted flex items-center gap-1 rounded-full p-1 text-sm">
      {YEARS.map((y) => (
        <button
          key={y}
          type="button"
          onClick={() => setYear(y)}
          className={
            y === year
              ? 'bg-background text-foreground rounded-full px-3 py-1 font-medium shadow-sm'
              : 'text-muted-foreground hover:text-foreground rounded-full px-3 py-1'
          }
        >
          {y}
        </button>
      ))}
    </div>
  );

  const countrySelect = (
    <Select defaultValue="all">
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Todo el país" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todo el país</SelectItem>
      </SelectContent>
    </Select>
  );

  const searchInput = (
    <div className="relative w-full sm:w-56">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input placeholder="Buscar proyectos..." className="pl-9" />
    </div>
  );

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled className="text-muted-foreground text-xs">
          {user?.email ?? ''}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>Cerrar sesión</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="border-border bg-background flex h-[60px] items-center justify-between gap-4 border-b px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <span className="font-medium sm:hidden">Gurises Unidos</span>
        <div className="hidden items-baseline gap-2 text-sm sm:flex">
          <Link href="/dashboard/projects" className="font-medium hover:underline">
            Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{breadcrumb}</span>
        </div>
      </div>

      {/* Desktop: search, year toggle, country select */}
      <div className="hidden items-center gap-4 sm:flex">
        {searchInput}
        {yearToggle}
        {countrySelect}
        {userMenu}
      </div>

      {/* Mobile: avatar */}
      <div className="sm:hidden">{userMenu}</div>
    </header>
  );
}
