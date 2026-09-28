'use client';

import { cn } from 'cn';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type FormActionsProps = {
  variant?: 'default' | 'detailed';
  onCancel?: () => void;
  submitLabel: string;
  pending: boolean;
  secondaryAction?: ReactNode;
};

export function FormActions(props: FormActionsProps) {
  const { variant = 'default', onCancel, submitLabel, pending, secondaryAction } = props;
  return (
    <footer className="bg-background sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 sm:px-6">
      <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
        Cancelar
      </Button>
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
