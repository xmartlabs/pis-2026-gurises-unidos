import { LONG_TEXT_LIMIT } from '@/lib/validation/project';
import { TextareaField } from '@/components/ui/forms/textarea-field';
import { FormSection } from '@/components/ui/forms/form-section';
import type { SectionProps } from './section-props';

export function InternalNotesSection({
  variant,
  isEditing,
  values,
  state,
  updateField,
}: Pick<SectionProps, 'variant' | 'isEditing' | 'values' | 'state' | 'updateField'>) {
  return (
    <FormSection
      variant={variant}
      title="Notas internas"
      description="Comentarios para el equipo. No se muestran en la vista pública."
      separator={!isEditing}
      descriptionClassName={isEditing ? 'text-muted-foreground text-sm leading-5' : undefined}
      contentClassName={isEditing ? 'pt-4' : 'pt-3'}
    >
      <TextareaField
        variant={variant}
        id="internalNotes"
        name="internalNotes"
        label="Notas internas"
        value={values.internalNotes}
        onValueChange={(value) => updateField('internalNotes', value)}
        maxLength={LONG_TEXT_LIMIT}
        messages={state.errors?.internalNotes}
        placeholder="Escribí un comentario para el equipo…"
      />
    </FormSection>
  );
}
