import { z } from 'zod';
import { MAX_INT32 } from './ids';
import { projectSchema } from './project';
import { beneficiaryYear, buildBeneficiaryCountsShape } from './project-beneficiary';

const baseProjectFormSchema = projectSchema.safeExtend({
  year: beneficiaryYear,
  topicId: z.coerce
    .number({ error: 'Elegí una temática válida' })
    .int('Elegí una temática válida')
    .positive('Elegí una temática válida')
    .max(MAX_INT32),
});

export function buildProjectFormSchema(keys: readonly string[]) {
  const schema = baseProjectFormSchema.safeExtend(
    buildBeneficiaryCountsShape(keys)
  ) as unknown as typeof baseProjectFormSchema;
  return schema
    .refine((data) => data.year >= data.startYear, {
      message: 'El año de beneficiarios no puede ser anterior al año de inicio',
      path: ['year'],
    })
    .refine(
      (data) => data.status !== 'closed' || data.endYear === null || data.year <= data.endYear,
      {
        message: 'El año de beneficiarios no puede ser posterior al año de cierre',
        path: ['year'],
      }
    );
}

export type ProjectFormData = z.infer<typeof baseProjectFormSchema>;

export function splitProjectFormData(data: ProjectFormData, keys: readonly string[]) {
  const { year, ...rest } = data;
  const fields: Record<string, unknown> = rest;
  const counts = Object.fromEntries(keys.map((key) => [key, fields[key] as number]));
  for (const key of keys) delete fields[key];

  return { projectData: rest, beneficiaryData: { year, counts } };
}

export function readProjectFormData(formData: FormData) {
  const topicValues = formData.getAll('topicId');

  return {
    ...Object.fromEntries(formData),
    topicId: topicValues.length > 1 ? 'invalid' : topicValues[0],
  };
}
