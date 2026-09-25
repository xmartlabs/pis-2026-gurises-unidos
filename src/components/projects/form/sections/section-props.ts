import type { ProjectFormValues } from '../project-form-values';
import type { ProjectFormState } from '@/lib/validation/project';

export type SectionProps = {
  variant: 'default' | 'detailed';
  isEditing: boolean;
  values: ProjectFormValues;
  state: ProjectFormState;
  updateField: <K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) => void;
  yearOptions: { value: string; label: string }[];
  coordinatorOptions: { value: string; label: string }[];
  departmentOptions: { value: string; label: string }[];
  topics: { id: number; name: string }[];
  coverageLabel: string;
  selectYear: (year: string) => void;
};
