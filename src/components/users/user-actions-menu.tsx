'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';
import { fullName, type User } from '@/lib/users/format';

export function UserActionsMenu({ user, canDelete }: { user: User; canDelete: boolean }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label={`Acciones para ${fullName(user)}`}>
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="max-h-104 w-56 rounded-md border">
          <DropdownMenuItem
            render={<Link href={`/management/users/${user.id}/edit`} />}
            className="text-popover-foreground font-sans text-sm leading-5 font-medium tracking-normal"
          >
            Editar
          </DropdownMenuItem>
          {/* <DropdownMenuItem className="text-popover-foreground font-sans text-sm leading-5 font-medium tracking-normal">
            Restablecer contraseña
          </DropdownMenuItem> */}
          {/* <DropdownMenuItem className="text-popover-foreground font-sans text-sm leading-5 font-medium tracking-normal">
            Desactivar
          </DropdownMenuItem> */}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="h-8 w-54 gap-2 rounded-sm px-2 py-1.5 font-sans text-sm leading-5 font-medium tracking-normal"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {canDelete && (
        <DeleteUserDialog
          user={user}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </>
  );
}
