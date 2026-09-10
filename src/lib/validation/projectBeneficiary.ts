import { z } from 'zod';

export const projectBeneficiarySchema = z.object({
  year: z.coerce
    .number({ error: 'Año inválido' })
    .int()
    .min(1989, 'Año inválido')
    .max(new Date().getFullYear(), 'Año inválido')
    .default(new Date().getFullYear()),
  directChildrenAdolescents: z.coerce
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .default(0),
  indirectChildrenAdolescents: z.coerce
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .default(0),
  youth18To29: z.coerce
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .default(0),
  families: z.coerce
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .default(0),
  coordinatedInstitutions: z.coerce
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .default(0),
  communityLeaders: z.coerce
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .default(0),
  basicServiceStaff: z.coerce
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .default(0),
});

export type ProjectBeneficiaryFormState = { errors?: Record<string, string[]>; formError?: string };
