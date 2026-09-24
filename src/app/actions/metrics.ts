'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { METRIC_DEFINITIONS } from '@/lib/metric-definitions';

const METRIC_SETTINGS_SCHEMA = z
  .array(
    z.object({
      key: z.string().refine((key) => METRIC_DEFINITIONS.some((metric) => metric.key === key)),
      showPublicly: z.boolean(),
    })
  )
  .length(METRIC_DEFINITIONS.length)
  .refine(
    (metrics) => new Set(metrics.map((metric) => metric.key)).size === METRIC_DEFINITIONS.length
  );

export async function saveMetricSettings(input: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, message: 'No tenés permisos para guardar las métricas.' };
  }

  const result = METRIC_SETTINGS_SCHEMA.safeParse(input);
  if (!result.success) {
    return { success: false, message: 'La selección de métricas no es válida.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const [index, definition] of METRIC_DEFINITIONS.entries()) {
        const showPublicly = result.data.find(
          (metric) => metric.key === definition.key
        )!.showPublicly;
        const metric = await tx.metric.upsert({
          where: { key: definition.key },
          create: {
            key: definition.key,
            name: definition.name,
            sortOrder: index,
            showPublicly,
            updatedBy: Number(session.user.id),
          },
          update: { showPublicly, updatedBy: Number(session.user.id) },
        });
        await logAudit(tx, {
          authorId: Number(session.user.id),
          action: 'update',
          entity: 'metric',
          entityId: metric.id,
        });
      }
    });
  } catch {
    return { success: false, message: 'No se pudieron guardar los cambios. Intentá de nuevo.' };
  }

  revalidatePath('/dashboard/metrics');
  revalidatePath('/metrics-test');
  return { success: true, message: 'Cambios guardados. Ya podés comprobar la página de prueba.' };
}
