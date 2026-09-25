import { z } from 'zod';
import { MAX_INT32 } from './ids';

export const projectSchema = z.object({
  name: z.string().trim().max(100, 'Máx. 100 caracteres').min(1, 'El nombre es obligatorio'),
  status: z.enum(['active', 'inProgress', 'completed', 'archived']),
  intensity: z.enum(['high', 'medium', 'low']),
  startYear: z.coerce
    .number()
    .int()
    .min(1989, 'Año inválido')
    .refine((year) => year <= new Date().getFullYear(), 'Año inválido'),
  leadCoordinatorId: z.coerce
    .number({ error: 'Elegí un coordinador' })
    .int()
    .positive('Elegí un coordinador')
    .max(MAX_INT32),
  departmentId: z.coerce
    .number({ error: 'Elegí un departamento' })
    .int()
    .positive('Elegí un departamento')
    .max(MAX_INT32),
  zone: z.enum(['city', 'inland', 'border', 'rural']),
  localityNeighborhood: z
    .string()
    .trim()
    .max(100, 'Máx. 100 caracteres')
    .optional()
    .transform((value) => value || null),
  generalObjective: z
    .string()
    .trim()
    .max(500, 'Máx. 500 caracteres')
    .optional()
    .transform((value) => value || null),
  publicDescription: z
    .string()
    .trim()
    .max(1000, 'Máx. 1000 caracteres')
    .optional()
    .transform((value) => value || null),
  internalNotes: z
    .string()
    .trim()
    .max(1000, 'Máx. 1000 caracteres')
    .optional()
    .transform((value) => value || null),
});

export type ProjectFormState = { errors?: Record<string, string[]>; formError?: string };
