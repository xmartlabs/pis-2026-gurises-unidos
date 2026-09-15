import { projectSchema } from './project';
import { projectBeneficiarySchema } from './project-beneficiary';

export const projectFormSchema = projectSchema.extend(projectBeneficiarySchema.shape);
