'use client';

import Link from 'next/link';
import { useActionState, useRef, useState } from 'react';
import { cn } from 'cn';

import { createUser } from '@/app/actions/users';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Check, Copy } from 'lucide-react';

import { userEditFormSchema, userFormSchema, type UserFormState } from '@/lib/validation/user';
import { generateTemporaryPassword } from '@/lib/users';

const initialState: UserFormState = {};

const COPIED_FEEDBACK_MS = 2000;

type UserFormProps = {
  mode?: 'create' | 'edit';
  initialValues?: {
    firstName: string;
    lastName: string;
    documentId: string;
    email: string;
    role: 'admin' | 'coordinator';
    status: 'active' | 'pendingInvitation' | 'disabled';
    information: {
      createdAt: string;
      lastAccess: string;
      createdBy: string;
      updatedAt: string;
    };
  };
};

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'coordinator', label: 'Coordinador' },
];

const INFO_ROWS = [
  { key: 'createdAt', label: 'Fecha de creación' },
  { key: 'lastAccess', label: 'Último acceso' },
  { key: 'createdBy', label: 'Creado por' },
  { key: 'updatedAt', label: 'Última modificación' },
] as const;

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Activo',
    className: 'bg-status-active text-status-active-foreground',
  },
  {
    value: 'pendingInvitation',
    label: 'Invitación pendiente',
    className: 'bg-status-pending text-status-pending-foreground',
  },
  {
    value: 'disabled',
    label: 'Deshabilitado',
    variant: 'secondary' as const,
  },
];

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-destructive text-xs leading-4">{messages[0]}</p>;
}

export function UserForm({ mode = 'create', initialValues }: UserFormProps) {
  const isEditing = mode === 'edit';
  const [state, formAction, pending] = useActionState(createUser, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [formErrorDismissed, setFormErrorDismissed] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  function handleGeneratePassword() {
    const generated = generateTemporaryPassword();
    if (passwordRef.current) passwordRef.current.value = generated;
    if (passwordConfirmRef.current) passwordConfirmRef.current.value = generated;
  }

  async function handleCopyPassword() {
    const password = passwordRef.current?.value;
    if (!password) return;

    await navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), COPIED_FEEDBACK_MS);
  }

  function defaultFor(field: 'firstName' | 'lastName' | 'documentId' | 'email' | 'role') {
    return state.values?.[field] ?? initialValues?.[field];
  }

  function fieldMessages(field: string) {
    return clientErrors[field] ? [clientErrors[field]] : state.errors?.[field];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setFormErrorDismissed(true);

    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData);
    const result = isEditing
      ? userEditFormSchema.safeParse(formValues)
      : userFormSchema.safeParse(formValues);

    if (!result.success) {
      event.preventDefault();
      const errors: Record<string, string> = {};

      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        errors[field] ??= issue.message;
      }

      setClientErrors(errors);
      return;
    }

    setClientErrors({});
    setFormErrorDismissed(false);

    if (isEditing) event.preventDefault();
  }

  return (
    <form
      action={isEditing ? undefined : formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex min-w-0 flex-1 flex-col pt-6"
    >
      <div className={cn('mx-auto w-full px-6 pb-6', !isEditing && 'max-w-[1185px]')}>
        <div
          className={cn(
            'grid grid-cols-1 gap-6',
            isEditing && 'xl:grid-cols-[minmax(0,1fr)_425px]'
          )}
        >
          <div className="flex min-w-0 flex-col gap-5">
            {state.formError && !formErrorDismissed && (
              <p className="border-destructive bg-destructive/10 text-destructive hidden rounded-lg border px-4 py-3 text-sm md:block">
                {state.formError}
              </p>
            )}

            <Card className="gap-4 pt-5 pb-5">
              <CardHeader className="px-6">
                <CardTitle className="leading-6 font-semibold">Datos personales</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <FieldGroup className="gap-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="firstName" className="text-xs leading-4">
                        Nombre
                      </FieldLabel>
                      <Input
                        key={state.values?.firstName}
                        id="firstName"
                        name="firstName"
                        defaultValue={defaultFor('firstName')}
                        placeholder={isEditing ? 'Nombre' : 'Ej. Ana'}
                        required
                        maxLength={100}
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('firstName')} />
                    </Field>
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="lastName" className="text-xs leading-4">
                        Apellido
                      </FieldLabel>
                      <Input
                        key={state.values?.lastName}
                        id="lastName"
                        name="lastName"
                        defaultValue={defaultFor('lastName')}
                        placeholder={isEditing ? 'Apellido' : 'Ej. García'}
                        maxLength={100}
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('lastName')} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="documentId" className="text-xs leading-4">
                        Documento (Cédula)
                      </FieldLabel>
                      <Input
                        key={state.values?.documentId}
                        id="documentId"
                        name="documentId"
                        defaultValue={defaultFor('documentId')}
                        placeholder="1.234.567-8"
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('documentId')} />
                    </Field>
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="email" className="text-xs leading-4">
                        Correo electrónico
                      </FieldLabel>
                      <Input
                        key={state.values?.email}
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={defaultFor('email')}
                        placeholder="nombre@gurises-unidos.org.uy"
                        maxLength={254}
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('email')} />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="gap-4 pt-5 pb-5">
              <CardHeader className="px-6">
                <CardTitle className="leading-6 font-semibold">Permisos</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <Field className="gap-1.25">
                  <FieldLabel htmlFor="role" className="text-xs leading-4">
                    Rol
                  </FieldLabel>
                  <NativeSelect
                    id="role"
                    name="role"
                    defaultValue={defaultFor('role') ?? 'coordinator'}
                    className="[&_select]:text-muted-foreground w-full max-w-81 [&_select]:h-9 [&_select]:rounded-md [&_select]:pt-2 [&_select]:pb-2 [&_select]:pl-3 [&_select]:shadow-[0_1px_2px_0_rgb(0_0_0/0.1)]"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <NativeSelectOption key={role.value} value={role.value}>
                        {role.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldDescription className="text-xs leading-4">
                    Los administradores pueden gestionar usuarios y configurar el sistema.
                  </FieldDescription>
                  <FieldError messages={state.errors?.role} />
                </Field>
              </CardContent>
            </Card>

            {isEditing && (
              <Card className="gap-4 pt-5 pb-5">
                <CardHeader className="px-6">
                  <CardTitle className="leading-6 font-semibold">Estado</CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <RadioGroup
                    name="status"
                    defaultValue={initialValues?.status ?? 'active'}
                    className="gap-3.5"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <Label
                        key={status.value}
                        htmlFor={`status-${status.value}`}
                        className="w-fit gap-2.5 font-normal"
                      >
                        <RadioGroupItem
                          value={status.value}
                          id={`status-${status.value}`}
                          className="border-input bg-background data-checked:border-input data-checked:bg-background data-checked:[&_[data-slot=radio-group-indicator]>span]:bg-foreground size-4 border shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] [&_[data-slot=radio-group-indicator]>span]:size-[6.67px]"
                        />
                        <Badge variant={status.variant} className={cn('px-2.5', status.className)}>
                          {status.label}
                        </Badge>
                      </Label>
                    ))}
                  </RadioGroup>
                  <FieldError messages={state.errors?.status} />
                </CardContent>
              </Card>
            )}

            <Card className="gap-4 pt-5 pb-5">
              <CardHeader className="px-6">
                <CardTitle className="leading-6 font-semibold">Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <FieldGroup className="gap-4">
                  {isEditing ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-fit px-4"
                      disabled
                    >
                      Restablecer contraseña (próximamente)
                    </Button>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field className="gap-1.25">
                        <FieldLabel htmlFor="password" className="text-xs leading-4">
                          Contraseña temporal
                        </FieldLabel>
                        <InputGroup className="h-9 rounded-md shadow-[0_1px_2px_0_rgb(0_0_0/0.1)]">
                          <InputGroupInput
                            ref={passwordRef}
                            id="password"
                            name="password"
                            type="text"
                            placeholder="Se genera automáticamente"
                            required
                            minLength={8}
                            maxLength={72}
                            className="pl-3 md:text-base md:leading-6"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              size="icon-xs"
                              aria-label="Copy password"
                              onClick={handleCopyPassword}
                            >
                              {passwordCopied ? (
                                <Check className="size-3" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        <FieldError messages={fieldMessages('password')} />
                      </Field>
                      <Field className="gap-1.25">
                        <FieldLabel htmlFor="passwordConfirm" className="text-xs leading-4">
                          Confirmar contraseña
                        </FieldLabel>
                        <Input
                          ref={passwordConfirmRef}
                          id="passwordConfirm"
                          name="passwordConfirm"
                          type="text"
                          placeholder="Repetí la contraseña"
                          required
                          minLength={8}
                          maxLength={72}
                          className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                        />
                        <FieldError messages={fieldMessages('passwordConfirm')} />
                      </Field>
                    </div>
                  )}
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="h-auto min-h-9 w-fit max-w-full px-4 py-1.5 whitespace-normal"
                      onClick={handleGeneratePassword}
                    >
                      Generar contraseña automáticamente
                    </Button>
                  )}
                  <FieldDescription className="text-xs leading-4">
                    {isEditing
                      ? 'Se enviará una nueva contraseña temporal para que la persona vuelva a ingresar.'
                      : 'El administrador comparte esta contraseña con la persona. El ingreso al sistema es por cédula.'}
                  </FieldDescription>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          {isEditing && (
            <div className="min-w-0">
              <Card className="gap-4 pt-5 pb-5">
                <CardHeader className="px-6">
                  <CardTitle className="leading-6 font-semibold">Información</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 px-6">
                  <dl className="flex flex-col gap-4">
                    {INFO_ROWS.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between text-xs leading-4 font-medium"
                      >
                        <dt className="text-foreground">{row.label}</dt>
                        <dd className="text-foreground">
                          {initialValues?.information[row.key] ?? '—'}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="bg-background sticky bottom-0 z-10 mt-auto grid shrink-0 grid-cols-2 gap-x-2 gap-y-3 border-t px-6 py-4 md:flex md:flex-wrap md:items-center md:justify-between">
        {state.formError && !formErrorDismissed && (
          <p className="border-destructive bg-destructive/10 text-destructive col-span-2 rounded-lg border px-4 py-3 text-sm md:hidden">
            {state.formError}
          </p>
        )}
        <Link
          href="/management/users"
          aria-disabled={pending}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'lg' }),
            'col-span-1 h-auto min-h-9 w-full px-4 md:order-1 md:mr-auto md:h-9 md:w-auto',
            pending && 'pointer-events-none opacity-50'
          )}
        >
          Cancelar
        </Link>
        <Button
          hidden
          type={isEditing ? 'button' : 'submit'}
          name="intent"
          value="draft"
          variant="outline"
          size="lg"
          className="h-auto min-h-9 w-full min-w-0 px-4 py-1.5 whitespace-normal md:order-2 md:h-9 md:w-auto md:py-0 md:whitespace-nowrap"
          disabled={pending}
        >
          Guardar borrador
        </Button>
        <Button
          type={isEditing ? 'button' : 'submit'}
          name="intent"
          value="submit"
          size="lg"
          className="col-span-1 w-full px-4 md:order-3 md:w-auto"
          disabled={pending || isEditing}
        >
          {isEditing ? 'Guardar usuario (próximamente)' : 'Guardar usuario'}
        </Button>
      </div>
    </form>
  );
}
