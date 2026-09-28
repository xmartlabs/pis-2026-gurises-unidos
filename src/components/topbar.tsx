'use client';

import { AppBreadcrumb } from '@/components/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Image from 'next/image';
import logo from '@/assets/logo.png';

interface TopbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function Topbar() {
  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-15 items-center justify-between gap-4 border-b px-4 md:px-6">
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
    </header>
  );
}
