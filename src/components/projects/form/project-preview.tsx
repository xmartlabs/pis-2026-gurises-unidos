'use client';

import { cn } from 'cn';
import Image from 'next/image';
import { MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { STATUS_OPTIONS } from '@/lib/project-display';
import type { ProjectFormValues } from './project-form-values';

export function ProjectPreview({
  variant = 'default',
  values,
  topicLabel,
  locationLabel,
  beneficiaryTotal,
}: {
  variant?: 'default' | 'detailed';
  values: ProjectFormValues;
  topicLabel: string;
  locationLabel: string;
  beneficiaryTotal: number;
}) {
  const statusLabel =
    STATUS_OPTIONS.find((option) => option.value === values.status)?.label ?? 'Activo';

  return (
    <aside
      aria-label="Vista previa de la tarjeta pública"
      className={
        variant === 'detailed' ? 'bg-background min-w-0 border-x border-b' : 'bg-muted/30 min-w-0 lg:sticky lg:top-15'
      }
    >
      <div
        className={cn(
          'flex min-h-12 flex-wrap items-center justify-between gap-2 border-b px-4 py-3',
          variant === 'detailed' ? 'bg-surface-page sm:px-5' : 'sm:px-6'
        )}
      >
        <p
          className={cn(
            'text-muted-foreground text-xs leading-4',
            variant === 'detailed' && 'font-semibold'
          )}
        >
          Vista previa de la tarjeta pública
        </p>
        <p
          className={cn(
            'text-xs leading-4',
            variant === 'detailed' ? 'text-text-muted' : 'text-muted-foreground'
          )}
        >
          Actualización automática
        </p>
      </div>
      <div
        className={cn(
          'flex flex-col items-center gap-3 px-4 py-8 sm:px-6',
          variant === 'detailed' ? 'bg-muted' : 'bg-muted/60'
        )}
      >
        <Card className="bg-card ring-border w-full max-w-[377px] gap-0 overflow-hidden rounded-xl py-0 shadow-none ring-1">
          <div
            className={cn(
              'relative flex h-[140px] shrink-0 items-center justify-center overflow-hidden',
              variant === 'default' && 'bg-muted'
            )}
            style={{
              backgroundImage:
                variant === 'detailed'
                  ? 'linear-gradient(154deg, #e7f0e9 7.14%, #f9f1e2 46.43%, #f5e8db 78.57%)'
                  : undefined,
            }}
          >
            {values.coverPhotoUrl ? (
              <Image
                src={values.coverPhotoUrl}
                alt="Foto de portada del proyecto"
                fill
                unoptimized
                className="object-cover"
              />
            ) : variant === 'default' ? (
              <span className="text-muted-foreground/60 text-xs leading-4">Foto de portada</span>
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className="bg-primary text-primary-foreground h-[22px] rounded-full px-2.5 text-xs">
                {statusLabel}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-muted text-secondary-foreground h-[22px] rounded-full px-2.5 text-xs"
              >
                {topicLabel}
              </Badge>
            </div>
            <h3 className="text-foreground truncate text-base leading-6 font-semibold">
              {values.name || 'Nombre del proyecto'}
            </h3>
            <p className="text-muted-foreground truncate text-xs leading-4">
              {values.generalObjective || 'El tagline aparecerá aquí cuando lo completes.'}
            </p>
            <div className="text-muted-foreground flex items-center gap-4 pt-1 text-xs leading-4">
              <span className="flex min-w-0 items-center gap-1">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <Users aria-hidden="true" className="size-3.5 shrink-0" />
                {beneficiaryTotal || '—'}
              </span>
            </div>
          </div>
        </Card>
        <p
          className={cn(
            'text-center text-xs leading-4',
            variant === 'detailed' ? 'text-text-muted' : 'text-muted-foreground'
          )}
        >
          Así se verá en el listado público
        </p>
        {variant === 'detailed' && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled
            className="rounded-[10px] px-4 font-medium disabled:opacity-100"
          >
            Ver vista pública →
          </Button>
        )}
      </div>
    </aside>
  );
}
