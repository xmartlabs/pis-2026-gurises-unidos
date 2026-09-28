'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { INTENSITY_OPTIONS, STATUS_OPTIONS } from '@/lib/project-display';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { SelectField } from '@/components/ui/forms/select-field';
import { FormSection } from '@/components/ui/forms/form-section';
import type { ProjectFormValues } from '../project-form-values';
import type { SectionProps } from './section-props';

export function BasicInfoSection({
  variant,
  yearOptions,
  coordinatorOptions,
  topics,
}: Pick<SectionProps, 'variant' | 'yearOptions' | 'coordinatorOptions' | 'topics'>) {
  const { setValue } = useFormContext<ProjectFormValues>();
  const status = useWatch<ProjectFormValues, 'status'>({ name: 'status' });

  return (
    <FormSection variant={variant} title="Información básica">
      <TextInputField
        variant={variant}
        maxLength={100}
        id="name"
        name="name"
        label="Nombre del proyecto"
        placeholder="Ej: Espacio joven Malvín Norte"
        description="Nombre de fantasía — puede cambiarse después"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="status"
          name="status"
          label="Estado"
          options={STATUS_OPTIONS}
          onValueChange={(value) => {
            if (value !== 'closed') setValue('endYear', '');
          }}
        />
        <SelectField
          id="topicId"
          name="topicId"
          label="Temática"
          placeholder="Sin temática"
          clearLabel="Sin temática"
          options={topics.map((topic) => ({
            value: String(topic.id),
            label: topic.name,
          }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="intensity"
          name="intensity"
          label="Intensidad"
          options={INTENSITY_OPTIONS}
        />
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            id="startYear"
            name="startYear"
            label="Año de inicio"
            options={yearOptions}
          />
          <SelectField
            id="endYear"
            name="endYear"
            label="Año de fin"
            placeholder="Seleccionar..."
            clearLabel="Sin año de fin"
            options={yearOptions}
            disabled={status !== 'closed'}
            required={status === 'closed'}
          />
        </div>
      </div>
      <SelectField
        id="leadCoordinatorId"
        name="leadCoordinatorId"
        label="Coordinador responsable"
        placeholder="Seleccionar coordinador..."
        options={coordinatorOptions}
      />
    </FormSection>
  );
}
