'use client';

import { useActionState, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { completeForcedPasswordChange } from '@/app/actions/password';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { Button } from '@/components/ui/button';

function PasswordVisibilityToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="px-2 py-1" type="button">
      {visible ? (
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
  );
}

export function PasswordResetForm() {
  const [state, formAction, pending] = useActionState(completeForcedPasswordChange, {});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverErrorDismissed, setServerErrorDismissed] = useState(false);
  const [prevState, setPrevState] = useState(state);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  if (state !== prevState) {
    setPrevState(state);
    setServerErrorDismissed(false);
  }

  const currentPasswordError = !serverErrorDismissed
    ? state.errors?.currentPassword?.[0]
    : undefined;
  const newPasswordError = !serverErrorDismissed ? state.errors?.newPassword?.[0] : undefined;
  const confirmNewPasswordError = !serverErrorDismissed
    ? state.errors?.confirmNewPassword?.[0]
    : undefined;
  const formError = !serverErrorDismissed ? state.formError : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4.5">
        <TextInputField
          id="currentPassword"
          name="currentPassword"
          label="Contraseña temporal"
          type={showCurrentPassword ? 'text' : 'password'}
          value={currentPassword}
          onValueChange={(value) => {
            setCurrentPassword(value);
            setServerErrorDismissed(true);
          }}
          required
          autoComplete="current-password"
          placeholder="Tu contraseña temporal"
          messages={
            currentPasswordError
              ? [currentPasswordError]
              : formError
                ? [formError]
                : undefined
          }
          trailingAction={
            <PasswordVisibilityToggle
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((value) => !value)}
            />
          }
        />
        <TextInputField
          id="newPassword"
          name="newPassword"
          label="Nueva contraseña"
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onValueChange={(value) => {
            setNewPassword(value);
            setServerErrorDismissed(true);
          }}
          required
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          messages={newPasswordError ? [newPasswordError] : undefined}
          trailingAction={
            <PasswordVisibilityToggle
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((value) => !value)}
            />
          }
        />
        <TextInputField
          id="confirmNewPassword"
          name="confirmNewPassword"
          label="Confirmar nueva contraseña"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmNewPassword}
          onValueChange={(value) => {
            setConfirmNewPassword(value);
            setServerErrorDismissed(true);
          }}
          required
          autoComplete="new-password"
          placeholder="Repetí la nueva contraseña"
          messages={confirmNewPasswordError ? [confirmNewPasswordError] : undefined}
          trailingAction={
            <PasswordVisibilityToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
            />
          }
        />
      </div>
      <Button type="submit" disabled={pending} className="h-9 w-full shadow-xs/10">
        Actualizar contraseña
      </Button>
    </form>
  );
}
