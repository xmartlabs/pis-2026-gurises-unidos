import { z } from 'zod';
import { MAX_INT32 } from './ids';

const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);

const beneficiaryCount = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: 'Valor inválido' })
    .int('Valor inválido')
    .min(0, 'No puede ser negativo')
    .max(MAX_INT32, 'Máx. 2147483647')
    .default(0)
);

export const projectBeneficiarySchema = z.object({
  year: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'Año inválido' })
      .int('Año inválido')
      .min(1989, 'Año inválido')
      .refine((year) => year <= new Date().getFullYear(), 'Año inválido')
      .default(() => new Date().getFullYear())
  ),
  directChildrenAdolescents: beneficiaryCount,
  indirectChildrenAdolescents: beneficiaryCount,
  youth18To29: beneficiaryCount,
  families: beneficiaryCount,
  coordinatedInstitutions: beneficiaryCount,
  communityLeaders: beneficiaryCount,
  basicServiceStaff: beneficiaryCount,
});
