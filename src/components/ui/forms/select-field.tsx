'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SelectOption = {
  value: string;
  label: string;
};

export function SelectField({
  id,
  name,
  label,
  value,
  placeholder,
  options,
  onValueChange,
  description,
  messages,
  required,
}: {
  id: string;
  name?: string;
  label: string;
  value: string;
  placeholder?: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  description?: string;
  messages?: string[];
  required?: boolean;
}) {
  return (
    <Field className="min-w-0 gap-1.5" data-invalid={Boolean(messages?.length)}>
      <FieldLabel htmlFor={id} className="text-foreground text-xs leading-4 font-medium">
        {label}
      </FieldLabel>
      <Select
        items={options}
        name={name}
        value={value || null}
        onValueChange={(nextValue) => onValueChange(nextValue ?? '')}
        required={required}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(messages?.length)}
          className="border-input bg-background w-full min-w-0 rounded-lg px-3 text-sm data-[size=default]:h-9"
        >
          <SelectValue placeholder={placeholder} className="min-w-0 truncate" />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <FieldDescription className="text-muted-foreground text-xs leading-4">
          {description}
        </FieldDescription>
      )}
      <FieldError className="text-xs leading-4">{messages?.[0]}</FieldError>
    </Field>
  );
}
