'use client';

import { useActionState, useState } from 'react';
import { login } from '@/app/actions/auth';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
// TODO: re-enable once the reset-password page exists
// import Link from 'next/link';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});
  const [showPassword, setShowPassword] = useState(false);
  const [serverErrorDismissed, setServerErrorDismissed] = useState(false);
  const [prevState, setPrevState] = useState(state);
  const [documentId, setDocumentId] = useState(state.documentId ?? '');
  const [password, setPassword] = useState('');

  if (state !== prevState) {
    setPrevState(state);
    setServerErrorDismissed(false);
  }

  const documentIdError = !serverErrorDismissed ? state.errors?.documentId?.[0] : undefined;
  const showCredentialsError = state.formError && !serverErrorDismissed;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4.5">
        <TextInputField
          id="documentId"
          name="documentId"
          label="Cédula"
          type="text"
          value={documentId}
          onValueChange={(value) => {
            setDocumentId(value);
            setServerErrorDismissed(true);
          }}
          required
          autoComplete="username"
          placeholder="Ej. 4.123.456-7"
          messages={documentIdError ? [documentIdError] : undefined}
        />
        <TextInputField
          id="password"
          name="password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onValueChange={(value) => {
            setPassword(value);
            setServerErrorDismissed(true);
          }}
          required
          placeholder="Tu contraseña"
          messages={showCredentialsError ? ['Credenciales incorrectas'] : undefined}
          trailingAction={
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="px-2 py-1"
              type="button"
            >
              {showPassword ? (
                <EyeIcon
                  strokeWidth={1}
                  className="text-primary md:text-muted-foreground h-6 w-6 lg:h-4.5 lg:w-4.5"
                />
              ) : (
                <EyeOffIcon
                  strokeWidth={1}
                  className="text-primary lg:text-muted-foreground h-6 w-6 lg:h-4.5 lg:w-4.5"
                />
              )}
            </button>
          }
        />
      </div>
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:gap-0">
        <FieldGroup className="gap-3">
          <Field orientation="horizontal" className="cursor-pointer">
            <Checkbox
              id="rememberCheck"
              name="rememberCheck"
              className="bg-background h-4 w-4 rounded-sm shadow-xs/10"
            />
            <FieldLabel
              htmlFor="rememberCheck"
              className="text-primary text-sm leading-5 font-medium tracking-normal"
            >
              Recordarme
            </FieldLabel>
          </Field>
        </FieldGroup>
        {/* TODO: re-enable once the reset-password page exists
        <Link
          href="/reset-password"
          className="hidden shrink-0 font-sans text-sm leading-5 font-medium tracking-normal text-primary lg:flex hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        */}
      </div>
      <Button type="submit" disabled={pending} className="h-9 w-full shadow-xs/10">
        Ingresar
      </Button>
    </form>
  );
}
