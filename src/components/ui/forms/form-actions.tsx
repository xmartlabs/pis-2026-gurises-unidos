'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type FormActionsProps = {
  cancelHref: string;
  submitLabel: string;
  pending: boolean;
  secondaryAction?: ReactNode;
};

export function FormActions({
  cancelHref,
  submitLabel,
  pending,
  secondaryAction,
}: FormActionsProps) {
  return (
    <footer className="bg-background sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 sm:px-6">
      <Button
        nativeButton={false}
        variant="ghost"
        size="lg"
        render={<Link href={cancelHref} />}
        className="px-3"
      >
        Cancelar
      </Button>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        {secondaryAction}
        <Button type="submit" size="lg" disabled={pending} className="flex-1 sm:min-w-36">
          {pending ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </footer>
  );
}
