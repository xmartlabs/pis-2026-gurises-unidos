import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { LONG_TEXT_LIMIT } from '@/lib/validation/project';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { TextareaField } from '@/components/ui/forms/textarea-field';
import { FormSection } from '@/components/ui/forms/form-section';
import type { SectionProps } from './section-props';

export function PublicInfoSection({
  variant,
  values,
  state,
  updateField,
}: Pick<SectionProps, 'variant' | 'values' | 'state' | 'updateField'>) {
  return (
    <FormSection
      variant={variant}
      title="Información pública"
      description="Aparece en la vista pública para donantes y aliados."
    >
      <TextInputField
        variant={variant}
        maxLength={LONG_TEXT_LIMIT}
        id="generalObjective"
        name="generalObjective"
        label="Objetivo general"
        value={values.generalObjective}
        onValueChange={(value) => updateField('generalObjective', value)}
        placeholder="Ej: Acompañando a jóvenes en situación de vulnerabilidad"
        messages={state.errors?.generalObjective}
        description="Aparece como subtítulo en la vista pública"
      />
      <TextareaField
        variant={variant}
        id="publicDescription"
        name="publicDescription"
        label="Descripción pública"
        value={values.publicDescription}
        onValueChange={(value) => updateField('publicDescription', value)}
        maxLength={300}
        description="Máx. 300 caracteres"
        messages={state.errors?.publicDescription}
      />
      <Field>
        <FieldLabel htmlFor="coverPhoto">Foto de portada</FieldLabel>
        <input
          id="coverPhoto"
          type="file"
          disabled
          aria-describedby="cover-photo-description"
          className="text-muted-foreground text-sm"
        />
        <FieldDescription id="cover-photo-description">
          La carga de portada está pendiente. La imagen existente se conserva y se muestra en la
          vista previa.
        </FieldDescription>
      </Field>
    </FormSection>
  );
}
