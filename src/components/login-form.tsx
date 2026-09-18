'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { login } from '@/app/actions/auth';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});
  const [showPassword, setShowPassword] = useState(false);
  const [serverErrorDismissed, setServerErrorDismissed] = useState(false);
  const [prevState, setPrevState] = useState(state);

  if (state !== prevState) {
    setPrevState(state);
    setServerErrorDismissed(false);
  }

  const documentIdError = !serverErrorDismissed ? state.errors?.documentId?.[0] : undefined;
  const showCredentialsError = state.formError && !serverErrorDismissed;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4.5">
        <Field className="gap-1.5">
          <FieldLabel
            htmlFor="documentId"
            className="text-sm leading-5 font-medium tracking-normal text-primary"
          >
            Cédula
          </FieldLabel>
          <Input
            key={state.documentId}
            id="documentId"
            type="text"
            name="documentId"
            defaultValue={state.documentId}
            required
            autoComplete="username"
            onChange={() => setServerErrorDismissed(true)}
            placeholder="Ej. 4.123.456-7"
            aria-invalid={showCredentialsError || documentIdError ? 'true' : 'false'}
            className="rounded-md px-3 py-1 shadow-xs/10 placeholder:text-muted-foreground focus-visible:border-2 focus-visible:border-primary-bg focus-visible:ring-0 aria-invalid:ring-0"
          />
          {documentIdError && (
            <FieldDescription className="py-1 font-sans text-xs leading-4 font-normal tracking-normal text-destructive">
              {documentIdError}
            </FieldDescription>
          )}
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <InputGroup className="rounded-md border shadow-xs/10 has-[[data-slot=input-group-control]:focus-visible]:border-2 has-[[data-slot=input-group-control]:focus-visible]:border-primary-bg has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot][aria-invalid=true]]:ring-0">
            <InputGroupInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="Tu contraseña"
              className="px-3 py-1 placeholder:text-muted-foreground"
              onChange={() => setServerErrorDismissed(true)}
              aria-invalid={showCredentialsError ? 'true' : 'false'}
            />
            <InputGroupAddon align="inline-end">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="px-2 py-1"
                type="button"
              >
                {showPassword ? (
                  <EyeIcon
                    strokeWidth={1}
                    className="h-6 w-6 text-primary md:text-muted-foreground lg:h-4.5 lg:w-4.5"
                  />
                ) : (
                  <EyeOffIcon
                    strokeWidth={1}
                    className="h-6 w-6 text-primary lg:h-4.5 lg:w-4.5 lg:text-muted-foreground"
                  />
                )}
              </button>
            </InputGroupAddon>
          </InputGroup>

          {showCredentialsError && (
            <FieldDescription className="py-1 font-sans text-xs leading-4 font-normal tracking-normal text-destructive">
              Credenciales incorrectas
            </FieldDescription>
          )}
        </Field>
      </div>
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:gap-0">
        <FieldGroup className="gap-3">
          <Field orientation="horizontal" className="cursor-pointer">
            <Checkbox
              id="rememberCheck"
              name="rememberCheck"
              className="h-4 w-4 rounded-sm bg-background shadow-xs/10"
            />
            <FieldLabel
              htmlFor="rememberCheck"
              className="text-sm leading-5 font-medium tracking-normal text-primary"
            >
              Recordarme
            </FieldLabel>
          </Field>
        </FieldGroup>
        <Link
          href="/reset-password"
          aria-disabled="true"
          tabIndex={-1}
          onClick={(e) => e.preventDefault()}
          className="hidden shrink-0 font-sans text-sm leading-5 font-medium tracking-normal text-primary lg:flex hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-9 w-full shadow-xs/10"
      >
        Ingresar
      </Button>
    </form>
  );
}
