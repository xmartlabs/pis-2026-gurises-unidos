'use client';

import { useActionState, useState } from 'react';
import { login } from '@/app/actions/auth';
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Checkbox } from '@/components/ui/checkbox';




export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});
  const [showPassword, setShowPassword] = useState(false)
  

  return(
    <form action={formAction} className="flex flex-col gap-6">
      <Field className="gap-1.5">
        <FieldLabel htmlFor="input-field-username" className="text-sm font-medium leading-5 tracking-normal text-[#0A0A0A]">
          Cédula
        </FieldLabel>
        <Input
          id="cedula"
          type="text"
          placeholder="Ej. 4.123.456-7"
          aria-invalid={state.error ? "true" : "false"}
          required
          className="px-3 py-1 shadow-xs/10 rounded-md shadow-[#0000001A] shadow-blur-2 focus-visible:border-2 focus-visible:border-[#1A1A1A] focus-visible:ring-0 aria-invalid:border-[#FF4342] aria-invalid:ring-0"
        />
        {state.error && (
          <FieldDescription className="text-xs text-[#FF4342] font-sans font-normal leading-4 tracking-normal">
            {state.error}
          </FieldDescription>
        )}
      </Field>
      <Field className="gap-1.5">
        <FieldLabel htmlFor="password">Contraseña</FieldLabel>
        <InputGroup
          className="border-[#E5E5E7] border rounded-md shadow-xs/10 shadow-[#0000001A] shadow-blur-2 has-[[data-slot=input-group-control]:focus-visible]:border-2 has-[[data-slot=input-group-control]:focus-visible]:border-[#1A1A1A] has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot][aria-invalid=true]]:border-[#FF4342] has-[[data-slot][aria-invalid=true]]:ring-0">
          
          <InputGroupInput
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Tu Contraseña"
            required
            className="px-3 py-1"
            aria-invalid={state.error ? "true" : "false"}
          />
          <InputGroupAddon align="inline-end">
            <button onClick={() => setShowPassword(!showPassword)} className="px-2 py-1" type="button">
              {showPassword ? <EyeIcon strokeWidth={1.5} className="w-6 md:w-4.5 h-6 md:h-4.5 text-[#0A0A0A] md:text-[#737373]"/> : <EyeOffIcon strokeWidth={1.5} className="w-6 md:w-4.5 h-6 md:h-4.5 text-[#0A0A0A] md:text-[#737373]"/>}
            </button>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <div className='flex flex-col lg:flex-row justify-between gap-3 lg:gap-0'>
        <FieldGroup className="gap-3 " >
          <Field orientation="horizontal" className="cursor-pointer">
            <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic" className="rounded-sm w-4 h-4 shadow-xs/10 shadow-[#0000001A] shadow-blur-2 bg-[#FFFFFF] border-[#E5E5E5]"/>
            <FieldLabel htmlFor="terms-checkbox-basic" className="text-sm font-medium leading-5 tracking-normal text-[#0A0A0A]">Recordarme</FieldLabel>
          </Field>
        </FieldGroup>
        <p className="hidden md:flex shrink-0 text-sm font-sans font-medium leading-5 tracking-normal text-[#0A0A0A] cursor-pointer hover:underline">
          ¿Olvidaste tu contraseña?
        </p>
      </div>
      {state.error ? (
        <p className="text-destructive text-sm leading-5 font-medium font-sans">Correo o contraseña incorrectos.</p>
      ) : null}  

      <button type="submit" className="w-full h-9 rounded-lg py-2 px-4 gap-2.5 bg-[#1A1A1A] shadow-xs/10 shadow-[#0000001A] shadow-blur-2 ">
        <p className='text-[#FFFFFF] text-sm font-sans font-medium leading-5 tracking-normal '>Iniciar Sesion</p>
      </button>
        
    </form> 
  );
}


