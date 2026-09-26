'use client';

import { cn } from 'cn';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type FormActionsProps = {
  variant?: 'default' | 'detailed';
  className?: string;
  submitLabel: string;
  pending: boolean;
  secondaryAction?: ReactNode;
} & ({ cancelHref: string; onCancel?: never } | { cancelHref?: never; onCancel: () => void });

export function FormActions(props: FormActionsProps) {
  const { variant = 'default', className, submitLabel, pending, secondaryAction } = props;
  const cancelClassName = variant === 'detailed' ? 'rounded-[10px] px-4' : 'px-3';

  return (
    <footer
      className={cn(
        'bg-background sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 sm:px-6',
        className
      )}
    >
      {'onCancel' in props ? (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={props.onCancel}
          className={cancelClassName}
        >
          Cancelar
        </Button>
      ) : (
        <Button
          nativeButton={false}
          variant="ghost"
          size="lg"
          render={<Link href={props.cancelHref} />}
          className={cancelClassName}
        >
          Cancelar
        </Button>
      )}
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        {secondaryAction}
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className={cn(
            'flex-1 sm:min-w-36',
            variant === 'detailed' && 'rounded-[10px] px-4 shadow-sm'
          )}
        >
          {pending ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </footer>
  );
}
