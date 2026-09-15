'use client';

import { cn } from 'cn';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png'];

type ImageUploadFieldProps = {
  variant?: 'default' | 'detailed';
  id: string;
  label: string;
  value: File | null;
  imageUrl?: string | null;
  onValueChange: (value: File | null) => void;
};

export function ImageUploadField({
  variant = 'default',
  id,
  label,
  value,
  imageUrl,
  onValueChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const errorId = `${id}-error`;

  return (
    <Field className="min-w-0 gap-1.5" data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id} className="text-foreground text-xs leading-4 font-medium">
        {label}
      </FieldLabel>
      <Input
        ref={inputRef}
        id={id}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="peer sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;

          if (!IMAGE_TYPES.includes(file.type)) {
            setError('La imagen debe ser JPG o PNG.');
            event.currentTarget.value = '';
            return;
          }

          if (file.size > MAX_IMAGE_SIZE) {
            setError('La imagen no puede superar los 5 MB.');
            event.currentTarget.value = '';
            return;
          }

          setError(undefined);
          onValueChange(file);
        }}
      />
      <Label
        style={{
          backgroundImage:
            variant !== 'detailed'
              ? undefined
              : imageUrl
                ? `url(${JSON.stringify(imageUrl)})`
                : 'linear-gradient(172deg, #e7f0e9 7.14%, #f9f1e2 46.43%, #f5e8db 78.57%)',
        }}
        htmlFor={id}
        className={cn(
          'peer-focus-visible:ring-ring flex min-h-18 w-full cursor-pointer items-center justify-center rounded-lg px-4 py-3 text-center text-xs leading-4 font-normal peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
          variant === 'detailed'
            ? 'text-secondary-foreground bg-cover bg-center'
            : 'border-input bg-muted text-muted-foreground hover:bg-accent border'
        )}
      >
        <span
          className={
            variant === 'detailed' && imageUrl ? 'bg-background/85 rounded px-2 py-1' : undefined
          }
        >
          {variant === 'default'
            ? 'Clic para subir imagen (JPG, PNG, máx. 5MB)'
            : value
              ? `${value.name} · Cambiar imagen`
              : imageUrl
                ? 'Cambiar imagen'
                : 'Clic para subir imagen (JPG, PNG, máx. 5MB)'}
        </span>
      </Label>
      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = '';
            setError(undefined);
            onValueChange(null);
          }}
        >
          Quitar foto
        </Button>
      )}
      <FieldError id={errorId} className="text-xs leading-4">
        {error}
      </FieldError>
    </Field>
  );
}
