import { BENEFICIARY_FIELDS } from '@/lib/project-display';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { SelectField } from '@/components/ui/forms/select-field';
import { FormSection } from '@/components/ui/forms/form-section';
import type { SectionProps } from './section-props';

export function BeneficiariesSection({
  variant,
  isEditing,
  values,
  state,
  updateField,
  yearOptions,
  selectYear,
}: Pick<
  SectionProps,
  'variant' | 'isEditing' | 'values' | 'state' | 'updateField' | 'yearOptions' | 'selectYear'
>) {
  return (
    <FormSection
      variant={variant}
      title="Beneficiarios principales"
      descriptionSpacing={isEditing ? 'relaxed' : 'compact'}
      description="Estas categorías son el núcleo del impacto. Completá lo que aplica."
      contentClassName="grid grid-cols-1 content-start gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <SelectField
          id="year"
          name="year"
          label="Año de beneficiarios"
          value={values.year}
          options={yearOptions}
          onValueChange={selectYear}
          messages={state.errors?.year}
          required
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Se guardan únicamente los beneficiarios del año seleccionado. Los cambios de otros años no
          se guardarán al salir.
        </p>
      </div>
      {BENEFICIARY_FIELDS.map((field, index) => (
        <TextInputField
          variant={variant}
          key={field.key}
          id={field.key}
          name={field.key}
          label={field.label}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={values[field.key]}
          messages={state.errors?.[field.key]}
          onValueChange={(value) => {
            if (/^[0-9]*$/.test(value)) {
              updateField(field.key, value);
            }
          }}
          className={index === BENEFICIARY_FIELDS.length - 1 ? 'sm:col-span-2' : undefined}
        />
      ))}
    </FormSection>
  );
}
