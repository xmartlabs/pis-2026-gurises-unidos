'use client';

import type { ComponentProps } from 'react';
import { cn } from 'cn';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type TextInputFieldProps = Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'className'
> & {
  variant?: 'default' | 'detailed';
  id: string;
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  description?: string;
  messages?: string[];
  className?: string;
};

export function TextInputField({
  variant = 'default',
  id,
  name,
  label,
  value,
  onValueChange,
  description,
  messages,
  className,
  ...inputProps
}: TextInputFieldProps) {
  return (
    <Field className={cn('min-w-0 gap-1.5', className)} data-invalid={Boolean(messages?.length)}>
      <FieldLabel htmlFor={id} className="text-foreground text-xs leading-4 font-medium">
        {label}
      </FieldLabel>
      <Input
        {...inputProps}
        id={id}
        name={name}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        aria-invalid={Boolean(messages?.length)}
        className={cn(
          'border-input bg-background h-9 min-w-0 rounded-lg px-3 text-base',
          variant === 'detailed' ? 'leading-6 shadow-sm' : 'shadow-none md:text-sm'
        )}
      />
      {description && (
        <FieldDescription className="text-muted-foreground text-xs leading-4">
          {description}
        </FieldDescription>
      )}
      <FieldError className="text-xs leading-4">{messages?.[0]}</FieldError>
    </Field>
  );
}
