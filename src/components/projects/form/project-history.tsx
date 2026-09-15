import type { AuditAction } from '@/generated/prisma/enums';
import { FormSection } from '@/components/ui/forms/form-section';

type ProjectHistoryProps = {
  entries: {
    id: number;
    action: AuditAction;
    occurredAt: Date;
    author: { firstName: string; lastName: string };
  }[];
};

const ACTION_LABELS: Record<AuditAction, string> = {
  creation: 'creó el proyecto',
  update: 'actualizó el proyecto',
  deletion: 'eliminó el proyecto',
};

export function ProjectHistory({ entries }: ProjectHistoryProps) {
  return (
    <FormSection
      variant="detailed"
      title="Historial"
      description="Últimas modificaciones"
      descriptionSpacing="relaxed"
    >
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">Todavía no hay modificaciones registradas.</p>
      ) : (
        <ol className="ml-1 space-y-[18px] border-l-2 pl-[18px]">
          {entries.map((entry) => (
            <li key={entry.id} className="relative text-sm leading-5">
              <span className="bg-history-marker absolute top-1.5 -left-6 size-2.5 rounded-full" />
              <time
                dateTime={entry.occurredAt.toISOString()}
                className="text-muted-foreground font-medium"
              >
                {entry.occurredAt.toLocaleDateString('es-UY', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'America/Montevideo',
                })}
              </time>
              <p className="mt-[3px]">
                {entry.author.firstName} {entry.author.lastName} {ACTION_LABELS[entry.action]}
              </p>
            </li>
          ))}
        </ol>
      )}
    </FormSection>
  );
}
