'use client';

import { useActionState, useState } from 'react';
import { FormActions } from '@/components/ui/forms/form-actions';
import { FormSection } from '@/components/ui/forms/form-section';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import type { ProjectFormState } from '@/lib/validation/project';

type EditProjectFormProps = {
  initialName: string;
  cancelHref: string;
  submitAction: (previousState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
};

const INITIAL_STATE: ProjectFormState = {};

export function EditProjectForm({ initialName, cancelHref, submitAction }: EditProjectFormProps) {
  const [name, setName] = useState(initialName);
  const [state, formAction, pending] = useActionState(submitAction, INITIAL_STATE);

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className="bg-muted/30 text-foreground flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 pt-6 pb-8 sm:px-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Editar proyecto</h1>
          <p className="text-muted-foreground">{initialName}</p>
        </header>

        {state.formError && (
          <p
            role="alert"
            className="border-destructive bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
          >
            {state.formError}
          </p>
        )}

        <FormSection title="Información básica">
          <TextInputField
            id="name"
            name="name"
            label="Nombre del proyecto"
            value={name}
            onValueChange={setName}
            placeholder="Ej: Espacio joven Malvín Norte"
            description="Nombre de fantasía — puede cambiarse después"
            messages={state.errors?.name}
            required
          />
        </FormSection>
      </div>

      <FormActions
        cancelHref={cancelHref}
        submitLabel="Validar formulario"
        pendingLabel="Validando..."
        pending={pending}
      />
    </form>
  );
}
