import { INTENSITY_OPTIONS, STATUS_OPTIONS } from '@/lib/project-display';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { SelectField } from '@/components/ui/forms/select-field';
import { FormSection } from '@/components/ui/forms/form-section';
import type { SectionProps } from './section-props';

export function BasicInfoSection({
  variant,
  values,
  state,
  updateField,
  yearOptions,
  coordinatorOptions,
  topics,
}: Pick<
  SectionProps,
  'variant' | 'values' | 'state' | 'updateField' | 'yearOptions' | 'coordinatorOptions' | 'topics'
>) {
  return (
    <FormSection variant={variant} title="Información básica">
      <TextInputField
        variant={variant}
        maxLength={100}
        id="name"
        name="name"
        label="Nombre del proyecto"
        value={values.name}
        onValueChange={(value) => updateField('name', value)}
        placeholder="Ej: Espacio joven Malvín Norte"
        description="Nombre de fantasía — puede cambiarse después"
        messages={state.errors?.name}
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="status"
          name="status"
          label="Estado"
          value={values.status}
          options={STATUS_OPTIONS}
          messages={state.errors?.status}
          onValueChange={(value) => updateField('status', value)}
          required
        />
        <SelectField
          id="topicId"
          name="topicId"
          label="Temática"
          value={values.topicId || 'none'}
          options={[
            { value: 'none', label: 'Sin temática' },
            ...topics.map((topic) => ({
              value: String(topic.id),
              label: topic.name,
            })),
          ]}
          onValueChange={(value) => updateField('topicId', value === 'none' ? '' : value)}
          messages={state.errors?.topicId}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="intensity"
          name="intensity"
          label="Intensidad"
          value={values.intensity}
          options={INTENSITY_OPTIONS}
          messages={state.errors?.intensity}
          onValueChange={(value) => updateField('intensity', value)}
          required
        />
        <SelectField
          id="startYear"
          name="startYear"
          label="Año de inicio"
          value={values.startYear}
          options={yearOptions}
          onValueChange={(value) => updateField('startYear', value)}
          messages={state.errors?.startYear}
          required
        />
      </div>
      <SelectField
        id="leadCoordinatorId"
        name="leadCoordinatorId"
        label="Coordinador responsable"
        value={values.leadCoordinatorId}
        placeholder="Seleccionar coordinador..."
        options={coordinatorOptions}
        onValueChange={(value) => updateField('leadCoordinatorId', value)}
        messages={state.errors?.leadCoordinatorId}
        required
      />
    </FormSection>
  );
}
