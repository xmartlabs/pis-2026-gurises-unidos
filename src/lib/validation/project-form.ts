import { z } from 'zod';
import { MAX_INT32 } from './ids';
import { projectSchema } from './project';
import { projectBeneficiarySchema } from './project-beneficiary';

export const projectFormSchema = projectSchema.extend({
  ...projectBeneficiarySchema.shape,
  topicIds: z
    .array(z.coerce.number().int().positive().max(MAX_INT32))
    .default([])
    .transform((ids) => [...new Set(ids)].sort((a, b) => a - b)),
});

export function splitProjectFormData(data: z.infer<typeof projectFormSchema>) {
  const {
    topicIds,
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

  return { projectData, beneficiaryData, topicIds };
}

export function readProjectFormData(formData: FormData) {
  return { ...Object.fromEntries(formData), topicIds: formData.getAll('topicIds') };
}
