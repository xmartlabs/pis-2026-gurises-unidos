import type { AuditAction, AuditEntity } from '@/generated/prisma/enums';
import { FormSection } from '@/components/ui/forms/form-section';
import { z } from 'zod';
import { BENEFICIARY_FIELDS } from '@/lib/project-display';
import type { Prisma } from '@/generated/prisma/client';

type ProjectHistoryProps = {
  entries: {
    id: number;
    action: AuditAction;
    entity: AuditEntity;
    details: Prisma.JsonValue | null;
    occurredAt: Date;
    author: { firstName: string; lastName: string };
  }[];
};

const PROJECT_ACTION_LABELS: Partial<Record<AuditAction, string>> = {
  creation: 'creó el proyecto',
  update: 'actualizó el proyecto',
  deletion: 'eliminó el proyecto',
};

const BENEFICIARY_ACTION_LABEL = 'actualizó el número de beneficiarios';

const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  BENEFICIARY_FIELDS.map(({ key, label }) => [key, label])
);

const beneficiaryDetailsSchema = z.object({
  year: z.number(),
  changes: z
    .array(
      z.object({
        field: z.string(),
        from: z.number(),
        to: z.number(),
      })
    )
    .optional(),
});

function describeEntry(
  entry: ProjectHistoryProps['entries'][number]
): { label: string; changes: { field: string; from: number; to: number }[] } | null {
  if (entry.entity === 'project') {
    const label = PROJECT_ACTION_LABELS[entry.action];
    return label ? { label, changes: [] } : null;
  }
  if (entry.entity !== 'beneficiary') return null;
  const details = beneficiaryDetailsSchema.safeParse(entry.details);
  if (!details.success || !details.data.changes?.length) return null;
  return {
    label: `${BENEFICIARY_ACTION_LABEL} de ${details.data.year}`,
    changes: details.data.changes,
  };
}

export function ProjectHistory({ entries }: ProjectHistoryProps) {
  const described = entries.flatMap((entry) => {
    const description = describeEntry(entry);
    return description ? [{ entry, ...description }] : [];
  });
  return (
    <FormSection
      variant="detailed"
      title="Historial"
      description="Últimas modificaciones"
      descriptionSpacing="relaxed"
    >
      {described.length === 0 ? (
        <p className="text-muted-foreground text-sm">Todavía no hay modificaciones registradas.</p>
      ) : (
        <ol className="ml-1 space-y-[18px] border-l-2 pl-[18px]">
          {described.map(({ entry, label, changes }) => (
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
                {entry.author.firstName} {entry.author.lastName} {label}
              </p>
              {changes.length > 0 && (
                <ul className="text-muted-foreground mt-1 space-y-0.5">
                  {changes.map((change) => (
                    <li key={change.field}>
                      {FIELD_LABELS[change.field] ?? change.field}: {change.from} → {change.to}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </FormSection>
  );
}
