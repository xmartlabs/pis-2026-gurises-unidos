'use client';

import { logout } from '@/app/actions/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import type { Session } from 'next-auth';
import { getInitials } from '@/lib/utils';

interface Props {
  user: Session['user'];
}

function SidebarUser({ user }: Props) {
  return (
    <>
      <Avatar className="rounded-md after:rounded-sm">
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <span className="grid min-w-0 flex-1 text-left leading-tight">
        <span className="truncate leading-5 font-medium">{user.name ?? 'Usuario'}</span>
        <span className="text-muted-foreground truncate text-xs leading-4">{user.email}</span>
      </span>
    </>
  );
}

function LogoutButton() {
  return (
    <form action={logout}>
      <SidebarMenuButton
        type="submit"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10 gap-3 [&_svg]:size-5"
      >
        <LogOut />
        <span>Cerrar sesión</span>
      </SidebarMenuButton>
    </form>
  );
}

export function AppSidebarFooter({ user }: Props) {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <SidebarUser user={user} />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    );
  }

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<SidebarMenuButton size="lg" tooltip={user.name ?? 'Usuario'} />}
            >
              <SidebarUser user={user} />
              <ChevronsUpDown className="ml-auto" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" sideOffset={8} className="min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <span className="grid gap-0.5">
                    <span className="font-medium">{user.name ?? 'Usuario'}</span>
                    <span className="text-muted-foreground text-xs">{user.email}</span>
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <form action={logout}>
                <DropdownMenuItem
                  variant="destructive"
                  nativeButton
                  render={<button type="submit" className="w-full" />}
                >
                  <LogOut />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
