import type { ReactNode } from 'react';
import { cn } from 'cn';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function FormSection({
  title,
  description,
  className,
  contentClassName,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        'bg-background ring-border gap-0 overflow-visible rounded-2xl py-0 shadow-none ring-1',
        className
      )}
    >
      <div className="px-4 pt-5 sm:px-6">
        <h2 className="text-foreground text-base leading-6 font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-xs leading-4">{description}</p>
        )}
      </div>
      <div className="px-4 sm:px-6">
        <Separator className="mt-4" />
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-4 px-4 pt-4 pb-5 sm:px-6',
          contentClassName
        )}
      >
        {children}
      </div>
    </Card>
  );
}
