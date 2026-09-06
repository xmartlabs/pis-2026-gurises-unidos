import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  status: z.enum(['active', 'inProgress', 'completed', 'archived']),
  intensity: z.enum(['high', 'medium', 'low']),
  startYear: z.coerce.number().int().min(1989, 'Año inválido'),
  leadCoordinatorId: z.coerce
    .number({ error: 'Elegí un coordinador' })
    .int()
    .positive('Elegí un coordinador'),
  departmentId: z.coerce
    .number({ error: 'Elegí un departamento' })
    .int()
    .positive('Elegí un departamento'),
  zone: z.enum(['city', 'inland', 'border', 'rural']),
  localityNeighborhood: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  generalObjective: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  publicDescription: z
    .string()
    .trim()
    .max(300, 'Máx. 300 caracteres')
    .optional()
    .transform((value) => value || null),
  internalNotes: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
});

export type ProjectFormState = { errors?: Record<string, string[]> };
