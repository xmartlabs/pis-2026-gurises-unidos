import { z } from 'zod';
import { MAX_INT32 } from './ids';
import { projectSchema } from './project';
import { projectBeneficiarySchema } from './project-beneficiary';

export const projectFormSchema = projectSchema
  .extend({
    ...projectBeneficiarySchema.shape,
    topicId: z.preprocess(
      (value) => (value === '' || value === 'none' || value === undefined ? null : value),
      z.coerce
        .number({ error: 'Elegí una temática válida' })
        .int('Elegí una temática válida')
        .positive('Elegí una temática válida')
        .max(MAX_INT32)
        .nullable()
    ),
  })
  .refine((data) => data.year >= data.startYear, {
    message: 'El año de beneficiarios no puede ser anterior al año de inicio',
    path: ['year'],
  });

export function splitProjectFormData(data: z.infer<typeof projectFormSchema>) {
  const {
    year,
    directChildrenAdolescents,
    indirectChildrenAdolescents,
    youth18To29,
    families,
    coordinatedInstitutions,
    communityLeaders,
    basicServiceStaff,
    ...projectData
  } = data;
  const beneficiaryData = {
    year,
    directChildrenAdolescents,
    indirectChildrenAdolescents,
    youth18To29,
    families,
    coordinatedInstitutions,
    communityLeaders,
    basicServiceStaff,
  };

  return { projectData, beneficiaryData };
}

export function readProjectFormData(formData: FormData) {
  const topicValues = formData.getAll('topicId');

  return {
    ...Object.fromEntries(formData),
    topicId: topicValues.length > 1 ? 'invalid' : topicValues[0],
  };
}
