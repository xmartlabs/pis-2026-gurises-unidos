'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import type { Session } from 'next-auth';
import {
  ChartNoAxesColumn,
  ChevronDown,
  HomeIcon,
  type LucideIcon,
  Newspaper,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import logo from '@/assets/logo.png';
import { AppSidebarFooter } from './footer';
import { isPathActive } from './utils';

interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

type SubNavigationItem = Omit<NavigationItem, 'icon'>;

interface NavigationItemProps {
  item: NavigationItem;
  pathname: string;
}

interface Props {
  user: Session['user'];
}

const DASHBOARD_ITEMS = [
  {
    title: 'Proyectos',
    href: '/dashboard/projects',
  },
  {
    title: 'Métricas',
    href: '#', // TODO: Add route when Metrics page is implemented
  },
  {
    title: 'Beneficiarios',
    href: '#', // TODO: Add route when Beneficiaries page is implemented
  },
] satisfies readonly SubNavigationItem[];

const PRIMARY_ITEMS = [
  {
    title: 'Publicaciones',
    href: '#', // TODO: Add route when Publications page is implemented
    icon: Newspaper,
  },
  {
    title: 'Reportes',
    href: '#', // TODO: Add route when Reports page is implemented
    icon: ChartNoAxesColumn,
  },
] satisfies readonly NavigationItem[];

const ADMINISTRATION_ITEMS = [
  {
    title: 'Usuarios',
    href: '#', // TODO: Add route when Users page is implemented
    icon: Users,
  },
] satisfies readonly NavigationItem[];

function SidebarNavigationItem({ item, pathname }: NavigationItemProps) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isPathActive(pathname, item.href)}
        render={<Link href={item.href} />}
      >
        <Icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ user }: Props) {
  const pathname = usePathname();
  const [dashboardOpen, setDashboardOpen] = useState(true);

  const { isMobile, state: sidebarState, setOpen: setSidebarOpen } = useSidebar();

  function handleDashboardOpenChange(open: boolean) {
    if (!isMobile && sidebarState === 'collapsed') {
      setSidebarOpen(true);
      setDashboardOpen(true);
      return;
    }
    setDashboardOpen(open);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 items-center gap-2 overflow-hidden p-2 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!">
              <Image
                className="size-8 shrink-0 rounded-md"
                src={logo}
                alt="Gurises Unidos"
                width={32}
                height={32}
              />
              <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">Gurises Unidos</span>
                <span className="text-xs">ONG Uruguay</span>
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pb-0">
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-y-1">
              <SidebarMenuItem>
                <Collapsible open={dashboardOpen} onOpenChange={handleDashboardOpenChange}>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip="Dashboard"
                        isActive={isPathActive(pathname, '/dashboard')}
                      />
                    }
                  >
                    <HomeIcon />
                    <span>Dashboard</span>
                    <ChevronDown
                      className={`ml-auto transition-transform ${dashboardOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {DASHBOARD_ITEMS.map((item) => (
                        <SidebarMenuSubItem key={`${item.title}-${item.href}`}>
                          <SidebarMenuSubButton
                            isActive={isPathActive(pathname, item.href)}
                            render={<Link href={item.href} />}
                          >
                            <span>{item.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              {PRIMARY_ITEMS.map((item) => (
                <SidebarNavigationItem
                  key={`${item.title}-${item.href}`}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-0">
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMINISTRATION_ITEMS.map((item) => (
                <SidebarNavigationItem
                  key={`${item.title}-${item.href}`}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <AppSidebarFooter user={user} />
      <SidebarRail />
    </Sidebar>
  );
}
