'use client';

import { useState, useTransition } from 'react';
import { deleteUser } from '@/app/actions/users';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { fullName, type User } from '@/lib/users/format';

type DeleteUserDialogProps = {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    if (!nextOpen) setError(undefined);
    onOpenChange(nextOpen);
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteUser(user.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar a {fullName(user)}?</AlertDialogTitle>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-destructive text-center text-sm">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={handleConfirm}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
