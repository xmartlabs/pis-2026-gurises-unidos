'use client';

import { useActionState, useState } from 'react';
import { login, type LoginState } from '@/app/actions/auth';

type FormFields = {
  email: string;
  password: string;
};

const initialFields: FormFields = {
  email: '',
  password: '',
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});
  const [fields, setFields] = useState(initialFields);

  function updateField(field: keyof FormFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        Correo
        <input
          type="email"
          name="email"
          value={fields.email}
          onChange={(event) => updateField('email', event.target.value)}
          required
          autoComplete="email"
          placeholder="nombre@gurisesunidos.org.uy"
          className="border-line bg-surface text-ink focus-visible:border-ink-3 focus-visible:ring-accent/40 rounded-lg border px-3.5 py-2.5 outline-none focus-visible:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Contraseña
        <input
          type="password"
          name="password"
          value={fields.password}
          onChange={(event) => updateField('password', event.target.value)}
          required
          autoComplete="current-password"
          className="border-line bg-surface text-ink focus-visible:border-ink-3 focus-visible:ring-accent/40 rounded-lg border px-3.5 py-2.5 outline-none focus-visible:ring-2"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-500">Correo o contraseña incorrectos.</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-deep text-on-deep mt-2 rounded-full px-6 py-3 text-sm hover:opacity-90 disabled:opacity-60"
      >
        Entrar
      </button>
    </form>
  );
}
