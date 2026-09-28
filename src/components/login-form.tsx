'use client';

import { startTransition, useActionState, useState, type SubmitEvent } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/app/actions/auth';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { loginSchema } from '@/lib/validation/auth';

type LoginFormValues = {
  documentId: string;
  password: string;
};

export function LoginForm({ sessionExpired = false }: { sessionExpired?: boolean }) {
  const [state, formAction, pending] = useActionState(login, {});
  const [showPassword, setShowPassword] = useState(false);
  // TODO: Remove both serverErrorDismissed and prevState once the toast component is implemented
  const [serverErrorDismissed, setServerErrorDismissed] = useState(false);
  const [prevState, setPrevState] = useState(state);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as Resolver<LoginFormValues>,
    defaultValues: { documentId: '', password: '' },
  });
  const { handleSubmit } = form;

  if (state !== prevState) {
    setPrevState(state);
    setServerErrorDismissed(false);
  }

  function dismissServerError() {
    setServerErrorDismissed(true);
  }

  const showCredentialsError = state.formError && !serverErrorDismissed;

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const submitter = event.nativeEvent.submitter;
    return handleSubmit(() => {
      startTransition(() => {
        formAction(submitter ? new FormData(formElement, submitter) : new FormData(formElement));
      });
    })(event);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        {sessionExpired && !state.formError && (
          <p
            role="status"
            className="border-border bg-muted text-foreground rounded-lg border px-4 py-3 text-sm"
          >
            Tu sesión se cerró por inactividad. Iniciá sesión nuevamente para continuar.
          </p>
        )}
        <div className="flex flex-col gap-4.5">
          <TextInputField
            id="documentId"
            name="documentId"
            label="Cédula"
            type="text"
            autoComplete="username"
            placeholder="Ej. 4.123.456-7"
            onChange={dismissServerError}
          />
          <TextInputField
            id="password"
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contraseña"
            onChange={dismissServerError}
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
    </FormProvider>
  );
}
