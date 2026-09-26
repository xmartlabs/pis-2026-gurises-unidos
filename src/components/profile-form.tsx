'use client';

import { useActionState, useState } from 'react';
import { z } from 'zod';
import type { UserRole, UserStatus } from '@/generated/prisma/enums';
import { updateProfile } from '@/app/actions/profile';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { FormActions } from '@/components/ui/forms/form-actions';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { Input } from '@/components/ui/input';
import { ROLE_LABELS, STATUS_CLASSNAMES, STATUS_LABELS } from '@/lib/users/constants';
import { formatDate } from '@/lib/users/format';
import {
  profileFormSchema,
  type ProfileFormState,
  type ProfileFormValues,
} from '@/lib/validation/profile';

const INITIAL_STATE: ProfileFormState = {};

type Profile = ProfileFormValues & {
  documentId: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastAccess: Date | null;
  updatedAt: Date | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [formKey, setFormKey] = useState(0);

  return (
    <ProfileFormContent
      key={formKey}
      profile={profile}
      onCancel={() => setFormKey((current) => current + 1)}
    />
  );
}

function ProfileFormContent({ profile, onCancel }: { profile: Profile; onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(updateProfile, INITIAL_STATE);
  const [values, setValues] = useState<ProfileFormValues>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>({});

  function updateValue(field: keyof ProfileFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function fieldMessages(field: keyof ProfileFormValues) {
    return clientErrors[field] ?? state.errors?.[field];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const result = profileFormSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget))
    );

    if (!result.success) {
      event.preventDefault();
      setClientErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setClientErrors({});
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex min-w-0 flex-1 flex-col pt-6"
    >
      <div className="mx-auto w-full px-4 pb-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_425px]">
          <div className="flex min-w-0 flex-col gap-5">
            {state.formError && (
              <p
                role="alert"
                className="border-destructive bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
              >
                {state.formError}
              </p>
            )}

            {state.success && (
              <p
                role="status"
                className="border-status-active bg-status-active/10 text-status-active-foreground rounded-lg border px-4 py-3 text-sm"
              >
                Tus datos se actualizaron correctamente.
              </p>
            )}

            <Card className="gap-4 pt-5 pb-5">
              <CardHeader className="px-6">
                <CardTitle className="leading-6 font-semibold">Datos personales</CardTitle>
                <CardDescription>
                  Actualizá la información que utilizamos para identificarte en el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextInputField
                    id="profile-first-name"
                    name="firstName"
                    label="Nombre"
                    value={values.firstName}
                    onValueChange={(value) => updateValue('firstName', value)}
                    messages={fieldMessages('firstName')}
                    required
                    maxLength={100}
                    autoComplete="given-name"
                  />
                  <TextInputField
                    id="profile-last-name"
                    name="lastName"
                    label="Apellido"
                    value={values.lastName}
                    onValueChange={(value) => updateValue('lastName', value)}
                    messages={fieldMessages('lastName')}
                    required
                    maxLength={100}
                    autoComplete="family-name"
                  />
                  <Field className="min-w-0 gap-1.5">
                    <FieldLabel
                      htmlFor="profile-document-id"
                      className="text-foreground text-xs leading-4 font-medium"
                    >
                      Documento (Cédula)
                    </FieldLabel>
                    <Input
                      id="profile-document-id"
                      value={profile.documentId}
                      readOnly
                      className="border-input bg-muted h-9 min-w-0 rounded-lg px-3 text-base shadow-none md:text-sm"
                    />
                    <FieldDescription className="text-xs leading-4">
                      El documento no se puede modificar desde tu perfil.
                    </FieldDescription>
                  </Field>
                  <TextInputField
                    id="profile-email"
                    name="email"
                    type="email"
                    label="Correo electrónico"
                    value={values.email}
                    onValueChange={(value) => updateValue('email', value)}
                    messages={fieldMessages('email')}
                    required
                    maxLength={254}
                    autoComplete="email"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Card className="gap-4 pt-5 pb-5">
              <CardHeader className="px-6">
                <CardTitle className="leading-6 font-semibold">Cuenta</CardTitle>
                <CardDescription>
                  El rol y el estado solamente pueden ser modificados por un administrador.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <dl className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-medium">Rol</dt>
                    <dd>{ROLE_LABELS[profile.role]}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-medium">Estado</dt>
                    <dd>
                      <Badge className={STATUS_CLASSNAMES[profile.status]}>
                        {STATUS_LABELS[profile.status]}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="gap-4 pt-5 pb-5">
              <CardHeader className="px-6">
                <CardTitle className="leading-6 font-semibold">Información</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <dl className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4 text-xs leading-4">
                    <dt className="font-medium">Fecha de creación</dt>
                    <dd className="text-right">{formatDate(profile.createdAt)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-xs leading-4">
                    <dt className="font-medium">Último acceso</dt>
                    <dd className="text-right">{formatDate(profile.lastAccess)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-xs leading-4">
                    <dt className="font-medium">Última modificación</dt>
                    <dd className="text-right">{formatDate(profile.updatedAt)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FormActions
        className="mt-auto shrink-0"
        onCancel={onCancel}
        submitLabel="Guardar cambios"
        pending={pending}
      />
    </form>
  );
}
