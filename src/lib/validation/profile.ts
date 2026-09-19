import { z } from 'zod';

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio.')
    .max(100, 'El apellido no puede superar los 100 caracteres.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'El correo es obligatorio.')
    .max(254, 'El correo no puede superar los 254 caracteres.')
    .pipe(z.email({ error: 'Ingresá un correo electrónico válido.' })),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export type ProfileFormState = {
  errors?: Record<string, string[]>;
  formError?: string;
  success?: boolean;
  values?: ProfileFormValues;
};
