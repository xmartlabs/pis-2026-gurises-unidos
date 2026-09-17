'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { login } from '@/app/actions/auth';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Checkbox } from '@/components/ui/checkbox';
import { normalizeDocumentId } from '@/lib/utils';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});
  const [showPassword, setShowPassword] = useState(false);
  const [valid, setValid] = useState(true);

  function validateDocumentFormat(documentId: string) {
    documentId = normalizeDocumentId(documentId);

    const isValidFormat = /^\d{7,8}$/.test(documentId);
    setValid(isValidFormat);
    return isValidFormat;
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const documentId = formData.get('documentId') as string;

    const isValidFormat = validateDocumentFormat(documentId);
    if (!isValidFormat) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4.5">
        <Field className="gap-1.5">
          <FieldLabel
            htmlFor="documentId"
            className="text-sm leading-5 font-medium tracking-normal text-[#0A0A0A]"
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
            placeholder="Ej. 4.123.456-7"
            aria-invalid={state.error || !valid ? 'true' : 'false'}
            className="shadow-blur-2 rounded-md border-[#E5E5E7] px-3 py-1 shadow-xs/10 shadow-[#0000001A] placeholder:text-[#A1A1AA] focus-visible:border-2 focus-visible:border-[#1A1A1A] focus-visible:ring-0 aria-invalid:border-[#FF4342] aria-invalid:ring-0"
          />
          {!valid && (
            <FieldDescription className="py-1 font-sans text-xs leading-4 font-normal tracking-normal text-[#FF4342]">
              La cédula debe tener 7 u 8 dígitos
            </FieldDescription>
          )}
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <InputGroup className="shadow-blur-2 rounded-md border border-[#E5E5E7] shadow-xs/10 shadow-[#0000001A] has-[[data-slot=input-group-control]:focus-visible]:border-2 has-[[data-slot=input-group-control]:focus-visible]:border-[#1A1A1A] has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot][aria-invalid=true]]:border-[#FF4342] has-[[data-slot][aria-invalid=true]]:ring-0">
            <InputGroupInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="Tu contraseña"
              className="px-3 py-1 placeholder:text-[#A1A1AA]"
              aria-invalid={state.error ? 'true' : 'false'}
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
                    className="h-6 w-6 text-[#0A0A0A] md:text-[#737373] lg:h-4.5 lg:w-4.5"
                  />
                ) : (
                  <EyeOffIcon
                    strokeWidth={1}
                    className="h-6 w-6 text-[#0A0A0A] lg:h-4.5 lg:w-4.5 lg:text-[#737373]"
                  />
                )}
              </button>
            </InputGroupAddon>
          </InputGroup>

          {state.error && (
            <FieldDescription className="py-1 font-sans text-xs leading-4 font-normal tracking-normal text-[#FF4342]">
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
              className="shadow-blur-2 h-4 w-4 rounded-sm border-[#E5E5E5] bg-[#FFFFFF] shadow-xs/10 shadow-[#0000001A]"
            />
            <FieldLabel
              htmlFor="rememberCheck"
              className="text-sm leading-5 font-medium tracking-normal text-[#0A0A0A]"
            >
              Recordarme
            </FieldLabel>
          </Field>
        </FieldGroup>
        <Link
          href="/resetPassword"
          className="hidden shrink-0 cursor-pointer font-sans text-sm leading-5 font-medium tracking-normal text-[#0A0A0A] hover:underline lg:flex"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="shadow-blur-2 h-9 w-full gap-2.5 rounded-lg bg-[#1A1A1A] px-4 py-2 shadow-xs/10 shadow-[#000000]"
      >
        <p className="font-sans text-sm leading-5 font-medium tracking-normal text-[#FFFFFF]">
          Ingresar
        </p>
      </button>
    </form>
  );
}
