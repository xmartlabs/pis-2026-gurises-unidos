import { FieldError } from '@/components/ui/field';
import { INTENSITY_OPTIONS, STATUS_OPTIONS } from '@/lib/project-display';
import { SHORT_TEXT_LIMIT } from '@/lib/validation/project';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { SelectField } from '@/components/ui/forms/select-field';
import { FormSection } from '@/components/ui/forms/form-section';
import type { SectionProps } from './section-props';

export function BasicInfoSection({
  variant,
  isEditing,
  values,
  state,
  updateField,
  yearOptions,
  coordinatorOptions,
  topics,
}: Pick<
  SectionProps,
  | 'variant'
  | 'isEditing'
  | 'values'
  | 'state'
  | 'updateField'
  | 'yearOptions'
  | 'coordinatorOptions'
  | 'topics'
>) {
  return (
    <FormSection variant={variant} title="Información básica">
      <TextInputField
        variant={variant}
        maxLength={SHORT_TEXT_LIMIT}
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
          options={
            isEditing
              ? STATUS_OPTIONS
              : STATUS_OPTIONS.filter((option) => option.value !== 'inProgress')
          }
          messages={state.errors?.status}
          onValueChange={(value) => updateField('status', value)}
          required
        />
        <fieldset className="min-w-0 space-y-2" aria-describedby="topic-errors">
          <legend className="text-xs font-medium">Temáticas</legend>
          {topics.map((topic) => (
            <label key={topic.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="topicIds"
                value={String(topic.id)}
                checked={values.topicIds.includes(String(topic.id))}
                onChange={(event) =>
                  updateField(
                    'topicIds',
                    event.currentTarget.checked
                      ? [...values.topicIds, String(topic.id)]
                      : values.topicIds.filter((id) => id !== String(topic.id))
                  )
                }
              />
              {topic.name}
            </label>
          ))}
          {topics.length === 0 && (
            <p className="text-muted-foreground text-sm">No hay temáticas disponibles.</p>
          )}
          <FieldError id="topic-errors">{state.errors?.topicIds?.[0]}</FieldError>
        </fieldset>
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
