'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
    <form action={formAction} aria-busy={pending} className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Editar proyecto</h1>
        <p className="text-muted-foreground">{initialName}</p>
      </header>

      {state.formError && (
        <p role="alert" className="text-destructive text-sm">
          {state.formError}
        </p>
      )}

      <Field data-invalid={Boolean(state.errors?.name?.length)}>
        <FieldLabel htmlFor="name">Nombre del proyecto</FieldLabel>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          aria-invalid={Boolean(state.errors?.name?.length)}
          aria-describedby={state.errors?.name?.length ? 'name-error' : undefined}
          required
        />
        <FieldError id="name-error" errors={state.errors?.name?.map((message) => ({ message }))} />
      </Field>

      <footer className="flex items-center justify-between gap-3">
        <Button nativeButton={false} variant="outline" render={<Link href={cancelHref} />}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Validando...' : 'Validar formulario'}
        </Button>
      </footer>
    </form>
  );
}
