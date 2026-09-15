'use client';

import Link from 'next/link';
import { useActionState, useRef, useState } from 'react';
import { cn } from 'cn';

import { createUser } from '@/app/actions/users';
import type { UserFormState } from '@/lib/validation/user';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const initialState: UserFormState = {};

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'coordinator', label: 'Coordinador' },
];

const INFO_ROWS = [
  { label: 'Fecha de creación' },
  { label: 'Último acceso' },
  { label: 'Creado por' },
  { label: 'Última modificación' },
];

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-destructive text-xs leading-4">{messages[0]}</p>;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUruguayanDocumentId(rawValue: string) {
  const digits = rawValue.replace(/\D/g, '');
  if (digits.length !== 8) return false;

  const weights = [2, 9, 8, 7, 6, 3, 4];
  const sum = weights.reduce((total, weight, index) => total + Number(digits[index]) * weight, 0);
  const checkDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);

  return checkDigit === Number(digits[7]);
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Activo',
    className: 'bg-[#E1FAEC] text-[#16A34B]',
  },
  {
    value: 'pendingInvitation',
    label: 'Invitación pendiente',
    className: 'bg-[#FFF8E0] text-[#A96104]',
  },
  {
    value: 'disabled',
    label: 'Deshabilitado',
    variant: 'secondary' as const,
  },
];

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  function handleGeneratePassword() {
    const generated = generateTemporaryPassword();
    if (passwordRef.current) passwordRef.current.value = generated;
    if (passwordConfirmRef.current) passwordConfirmRef.current.value = generated;
  }

  function fieldMessages(field: string) {
    return clientErrors[field] ? [clientErrors[field]] : state.errors?.[field];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const documentId = String(formData.get('documentId') ?? '');
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    const showError = (field: string, message: string) => {
      event.preventDefault();
      setClientErrors({ [field]: message });
    };

    if (!firstName) {
      return showError('firstName', 'El nombre es obligatorio.');
    }

    if (!lastName) {
      return showError('lastName', 'El apellido es obligatorio.');
    }

    if (!documentId) {
      return showError('documentId', 'El documento es obligatorio.');
    }

    if (!isValidUruguayanDocumentId(documentId)) {
      return showError('documentId', 'Ingresá una cédula uruguaya válida (8 dígitos).');
    }

    if (!email) {
      return showError('email', 'El correo es obligatorio.');
    }

    if (!isValidEmail(email)) {
      return showError('email', 'Ingresá un correo electrónico válido.');
    }

    if (!password) {
      return showError('password', 'La contraseña es obligatoria.');
    }

    if (password.length < 8) {
      return showError('password', 'La contraseña debe tener al menos 8 caracteres.');
    }

    if (!passwordConfirm) {
      return showError('passwordConfirm', 'Confirmá la contraseña.');
    }

    if (password !== passwordConfirm) {
      return showError('passwordConfirm', 'Las contraseñas no coinciden.');
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
      <div className="w-full max-w-[1185px] px-6 pb-6">
        {state.formError && (
          <p className="border-destructive bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
            {state.formError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 min-[70rem]:group-has-[[data-slot=sidebar][data-state=collapsed]]/sidebar-wrapper:grid-cols-[minmax(0,1fr)_425px] min-[83rem]:grid-cols-[minmax(0,1fr)_425px]">
          {/* Columna principal */}
          <div className="flex min-w-0 flex-col gap-5">
            <Card className="gap-4 pt-5 pb-5 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle className="leading-6 font-semibold">Datos personales</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <div className="grid grid-cols-1 gap-4 min-[34rem]:max-md:grid-cols-2 md:group-has-[[data-slot=sidebar][data-state=collapsed]]/sidebar-wrapper:grid-cols-2 min-[50rem]:grid-cols-2">
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="firstName" className="text-xs leading-4">
                        Nombre
                      </FieldLabel>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Ej. Ana"
                        required
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('firstName')} />
                    </Field>
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="lastName" className="text-xs leading-4">
                        Apellido
                      </FieldLabel>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Ej. García"
                        required
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('lastName')} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-4 min-[34rem]:max-md:grid-cols-2 md:group-has-[[data-slot=sidebar][data-state=collapsed]]/sidebar-wrapper:grid-cols-2 min-[50rem]:grid-cols-2">
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="documentId" className="text-xs leading-4">
                        Documento (Cédula)
                      </FieldLabel>
                      <Input
                        id="documentId"
                        name="documentId"
                        placeholder="1.234.567-8"
                        required
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('documentId')} />
                    </Field>
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="email" className="text-xs leading-4">
                        Correo electrónico
                      </FieldLabel>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nombre@gurises-unidos.org.uy"
                        required
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('email')} />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="gap-4 pt-5 pb-5 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle className="leading-6 font-semibold">Permisos</CardTitle>
              </CardHeader>
              <CardContent>
                <Field className="gap-1.25">
                  <FieldLabel htmlFor="role" className="text-xs leading-4">
                    Rol
                  </FieldLabel>
                  <NativeSelect
                    id="role"
                    name="role"
                    defaultValue="admin"
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

            <Card className="gap-4 pt-5 pb-5 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle className="leading-6 font-semibold">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup name="status" defaultValue="active" className="gap-3.5">
                  {STATUS_OPTIONS.map((status) => (
                    <Label
                      key={status.value}
                      htmlFor={`status-${status.value}`}
                      className="w-fit gap-2.5 font-normal"
                    >
                      <RadioGroupItem
                        value={status.value}
                        id={`status-${status.value}`}
                        className="size-4 border border-[#e5e5e5] bg-white shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] data-checked:border-[#e5e5e5] data-checked:bg-white [&_[data-slot=radio-group-indicator]>span]:size-[6.67px] data-checked:[&_[data-slot=radio-group-indicator]>span]:bg-[#1a1a1a]"
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

            <Card className="gap-4 pt-5 pb-5 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle className="leading-6 font-semibold">Seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <div className="grid grid-cols-1 gap-4 min-[34rem]:max-md:grid-cols-2 md:group-has-[[data-slot=sidebar][data-state=collapsed]]/sidebar-wrapper:grid-cols-2 min-[50rem]:grid-cols-2">
                    <Field className="gap-1.25">
                      <FieldLabel htmlFor="password" className="text-xs leading-4">
                        Contraseña temporal
                      </FieldLabel>
                      <Input
                        ref={passwordRef}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Se genera automáticamente"
                        required
                        minLength={8}
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
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
                        type="password"
                        placeholder="Repetí la contraseña"
                        required
                        minLength={8}
                        className="h-9 rounded-md px-3 shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] md:text-base md:leading-6"
                      />
                      <FieldError messages={fieldMessages('passwordConfirm')} />
                    </Field>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-auto min-h-9 w-fit max-w-full px-4 py-1.5 whitespace-normal"
                    onClick={handleGeneratePassword}
                  >
                    Generar contraseña automáticamente
                  </Button>
                  <FieldDescription className="text-xs leading-4">
                    El administrador comparte esta contraseña con la persona. El ingreso al sistema
                    es por cédula.
                  </FieldDescription>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="min-w-0">
            <Card className="gap-4 pt-5 pb-5 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle className="leading-6 font-semibold">Información</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <CardDescription className="text-xs leading-4">
                  Se completarán una vez creado el usuario.
                </CardDescription>
                <dl className="flex flex-col gap-4">
                  {INFO_ROWS.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between text-xs leading-4 font-medium"
                    >
                      <dt className="text-foreground">{row.label}</dt>
                      <dd className="text-foreground">—</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="bg-background sticky bottom-0 z-10 mt-auto grid shrink-0 grid-cols-2 gap-x-2 gap-y-3 border-t px-6 py-4 md:flex md:flex-wrap md:items-center md:justify-between">
        <Button
          type="submit"
          name="intent"
          value="submit"
          size="lg"
          className="col-span-2 w-full px-4 md:order-3 md:w-auto"
          disabled={pending}
        >
          Guardar usuario
        </Button>
        <Link
          href="/users"
          aria-disabled={pending}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'lg' }), 
            'col-span-2 h-auto min-h-9 w-full px-4 md:order-1 md:mr-auto md:h-9 md:w-auto',
            pending && 'pointer-events-none opacity-50'
          )}
        >
          Cancelar
        </Link>
        <Button
          hidden
          type="submit"
          name="intent"
          value="draft"
          variant="outline"
          size="lg"
          className="h-auto min-h-9 w-full min-w-0 px-4 py-1.5 whitespace-normal md:order-2 md:h-9 md:w-auto md:py-0 md:whitespace-nowrap"
          disabled={pending}
        >
          Guardar borrador
        </Button>
      </div>
    </form>
  );
}
