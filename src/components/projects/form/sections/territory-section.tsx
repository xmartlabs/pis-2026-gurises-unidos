import { MapPin } from 'lucide-react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ZONE_OPTIONS } from '@/lib/project-display';
import { SHORT_TEXT_LIMIT } from '@/lib/validation/project';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { SelectField } from '@/components/ui/forms/select-field';
import { FormSection } from '@/components/ui/forms/form-section';
import type { SectionProps } from './section-props';

export function TerritorySection({
  variant,
  isEditing,
  values,
  state,
  updateField,
  departmentOptions,
  coverageLabel,
}: Pick<
  SectionProps,
  | 'variant'
  | 'isEditing'
  | 'values'
  | 'state'
  | 'updateField'
  | 'departmentOptions'
  | 'coverageLabel'
>) {
  return (
    <FormSection
      variant={variant}
      title="Territorio"
      description="¿En qué zonas opera este proyecto?"
      descriptionSpacing={isEditing ? 'relaxed' : 'compact'}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="departmentId"
          name="departmentId"
          label="Departamento"
          value={values.departmentId}
          placeholder="Seleccionar..."
          options={departmentOptions}
          onValueChange={(value) => updateField('departmentId', value)}
          messages={state.errors?.departmentId}
          required
        />
        <TextInputField
          variant={variant}
          maxLength={SHORT_TEXT_LIMIT}
          id="localityNeighborhood"
          name="localityNeighborhood"
          label="Localidad / Barrio"
          value={values.localityNeighborhood}
          onValueChange={(value) => updateField('localityNeighborhood', value)}
          messages={state.errors?.localityNeighborhood}
          placeholder="Ej: Malvín Norte"
        />
      </div>
      <Field className="min-w-0 gap-1.5">
        <FieldLabel id="zone-label" className="text-foreground text-xs leading-4 font-medium">
          Zona
        </FieldLabel>
        <RadioGroup
          name="zone"
          aria-labelledby="zone-label"
          aria-invalid={Boolean(state.errors?.zone)}
          value={values.zone}
          onValueChange={(value) => updateField('zone', value)}
          className="flex flex-wrap gap-2"
        >
          {ZONE_OPTIONS.map((option) => (
            <Label
              key={option.value}
              className="bg-muted text-secondary-foreground has-data-checked:bg-primary has-data-checked:text-primary-foreground has-[:focus-visible]:ring-ring relative h-[22px] cursor-pointer rounded-full px-2.5 text-xs leading-4 font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2"
            >
              <RadioGroupItem
                value={option.value}
                aria-label={option.label}
                className="absolute inset-0 size-full border-0 opacity-0"
              />
              <span>{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
        <FieldError className="text-xs leading-4">{state.errors?.zone?.[0]}</FieldError>
      </Field>
      {isEditing && (
        <div className="bg-muted rounded-[10px] px-3.5 py-3">
          <p className="text-muted-foreground text-sm leading-5">Cobertura</p>
          <p className="mt-1 flex items-center gap-1 text-sm leading-5">
            <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
            {coverageLabel || 'Seleccioná un departamento'}
          </p>
        </div>
      )}
    </FormSection>
  );
}
