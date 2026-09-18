import { z } from 'zod';
import { MAX_INT32 } from './ids';

export const SHORT_TEXT_LIMIT = 200;
export const LONG_TEXT_LIMIT = 5000;

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(SHORT_TEXT_LIMIT, 'Máx. 200 caracteres'),
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
    .max(SHORT_TEXT_LIMIT, 'El texto supera el largo máximo')
    .optional()
    .transform((value) => value || null),
  generalObjective: z
    .string()
    .trim()
    .max(LONG_TEXT_LIMIT, 'El texto supera el largo máximo')
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
    .max(LONG_TEXT_LIMIT, 'El texto supera el largo máximo')
    .optional()
    .transform((value) => value || null),
});

export type ProjectFormState = { errors?: Record<string, string[]>; formError?: string };
