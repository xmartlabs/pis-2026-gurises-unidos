import type { ComponentProps } from 'react';
import { cn } from 'cn';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

type TextareaFieldProps = Omit<ComponentProps<typeof Textarea>, 'onChange'> & {
  id: string;
  label: string;
  variant?: 'default' | 'detailed';
  onValueChange: (value: string) => void;
  messages?: string[];
  description?: string;
};

export function TextareaField({
  id,
  label,
  variant = 'default',
  onValueChange,
  messages,
  description,
  ...props
}: TextareaFieldProps) {
  return (
    <Field data-invalid={Boolean(messages?.length)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        {...props}
        id={id}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        aria-invalid={Boolean(messages?.length)}
        aria-describedby={description ? `${id}-description` : undefined}
        className={cn(
          'border-input bg-background min-h-20 resize-y rounded-lg px-3 py-2 text-base',
          variant === 'detailed' ? 'leading-6 shadow-sm' : 'md:text-sm'
        )}
      />
      {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      <FieldError>{messages?.[0]}</FieldError>
    </Field>
  );
}
