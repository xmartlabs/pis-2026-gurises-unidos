import type { z } from 'zod';
import { projectSchema } from './project';
import { projectBeneficiarySchema } from './project-beneficiary';

export const projectFormSchema = projectSchema.extend(projectBeneficiarySchema.shape);

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
