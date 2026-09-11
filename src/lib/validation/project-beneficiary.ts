import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);

const beneficiaryCount = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: 'Valor inválido' })
    .int('Valor inválido')
    .min(0, 'No puede ser negativo')
    .default(0)
);

export const projectBeneficiarySchema = z.object({
  year: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'Año inválido' })
      .int('Año inválido')
      .min(1989, 'Año inválido')
      .max(new Date().getFullYear(), 'Año inválido')
      .default(new Date().getFullYear())
  ),
  directChildrenAdolescents: beneficiaryCount,
  indirectChildrenAdolescents: beneficiaryCount,
  youth18To29: beneficiaryCount,
  families: beneficiaryCount,
  coordinatedInstitutions: beneficiaryCount,
  communityLeaders: beneficiaryCount,
  basicServiceStaff: beneficiaryCount,
});
