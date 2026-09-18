'use client';

import { type ReactNode, useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { createProject } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectFormState } from '@/lib/validation/project';
import { cn } from 'cn';
import {
  BENEFICIARY_FIELDS,
  FIRST_PROJECT_YEAR,
  INTENSITY_OPTIONS,
  PREVIEW_LOCATION_FALLBACK,
  PREVIEW_TOPIC_FALLBACK,
  STATUS_OPTIONS,
  TOPIC_OPTIONS,
  ZONE_OPTIONS,
} from '@/lib/project-display';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { SelectField } from '@/components/ui/forms/select-field';
import { ImageUploadField } from '@/components/ui/forms/image-upload-field';
import { ProjectPreview } from '@/components/projects/form/project-preview';
import type { ProjectFormValues } from '@/components/projects/form/project-form-values';
import { projectFormSchema } from '@/lib/validation/project-form';
import { FormActions } from '@/components/ui/forms/form-actions';

type ProjectFormProps = {
  coordinators: { id: number; firstName: string; lastName: string }[];
  departments: { id: number; name: string }[];
};

async function submitProject(
  previousState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const parsed = projectFormSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  return createProject(previousState, formData);
}

const INITIAL_STATE: ProjectFormState = {};

function FormSection({
  title,
  description,
  className,
  contentClassName,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        'bg-background ring-border gap-0 overflow-visible rounded-2xl py-0 shadow-none ring-1',
        className
      )}
    >
      <div className="px-4 pt-5 sm:px-6">
        <h2 className="text-foreground text-base leading-6 font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-xs leading-4">{description}</p>
        )}
      </div>
      <div className="px-4 sm:px-6">
        <Separator className="mt-4" />
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-4 px-4 pt-4 pb-5 sm:px-6',
          contentClassName
        )}
      >
        {children}
      </div>
    </Card>
  );
}

export function ProjectForm({ coordinators, departments }: ProjectFormProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () =>
      Array.from({ length: currentYear - FIRST_PROJECT_YEAR + 1 }, (_, index) => ({
        value: String(currentYear - index),
        label: String(currentYear - index),
      })),
    [currentYear]
  );
  const coordinatorOptions = useMemo(
    () =>
      coordinators.map((coordinator) => ({
        value: String(coordinator.id),
        label: `${coordinator.firstName} ${coordinator.lastName}`,
      })),
    [coordinators]
  );
  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        value: String(department.id),
        label: department.name,
      })),
    [departments]
  );
  const [state, formAction, pending] = useActionState(submitProject, INITIAL_STATE);
  const [values, setValues] = useState<ProjectFormValues>({
    name: '',
    status: 'active',
    topic: '',
    intensity: 'high',
    startYear: String(currentYear),
    leadCoordinatorId: '',
    departmentId: '',
    zone: 'city',
    localityNeighborhood: '',
    generalObjective: '',
    publicDescription: '',
    internalNotes: '',
    directChildrenAdolescents: '0',
    indirectChildrenAdolescents: '0',
    youth18To29: '0',
    families: '0',
    coordinatedInstitutions: '0',
    communityLeaders: '0',
    basicServiceStaff: '0',
    coverPhoto: null,
    coverPhotoUrl: null,
  });
  const coverPhotoUrl = values.coverPhotoUrl;
  const submissionRef = useRef(false);

  useEffect(() => {
    if (!pending) submissionRef.current = false;
  }, [pending, state]);

  useEffect(() => {
    return () => {
      if (coverPhotoUrl) URL.revokeObjectURL(coverPhotoUrl);
    };
  }, [coverPhotoUrl]);

  function updateField<K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  const topicLabel =
    TOPIC_OPTIONS.find((option) => option.value === values.topic)?.label ?? PREVIEW_TOPIC_FALLBACK;
  const departmentLabel = departments.find(
    (department) => String(department.id) === values.departmentId
  )?.name;
  const zoneLabel = ZONE_OPTIONS.find((option) => option.value === values.zone)?.label;
  const locationLabel = departmentLabel ?? zoneLabel ?? PREVIEW_LOCATION_FALLBACK;
  const beneficiaryTotal = BENEFICIARY_FIELDS.reduce(
    (total, field) => total + Math.max(0, Number(values[field.key]) || 0),
    0
  );

  return (
    <form
      action={formAction}
      className="bg-muted/30 text-foreground flex min-h-0 min-w-0 flex-1 flex-col"
      aria-busy={pending}
      onSubmit={(event) => {
        if (submissionRef.current || pending) {
          event.preventDefault();
          return;
        }

        submissionRef.current = true;
      }}
    >
      <div className="grid flex-1 content-start items-start lg:grid-cols-[minmax(0,16fr)_minmax(0,9fr)]">
        <div className="flex min-w-0 flex-col gap-5 px-4 pt-6 pb-8 sm:px-6 lg:pb-20">
          {state.formError && (
            <p
              role="alert"
              className="border-destructive bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
            >
              {state.formError}
            </p>
          )}

          <FormSection title="Información básica">
            <TextInputField
              id="name"
              name="name"
              label="Nombre del proyecto"
              value={values.name}
              onValueChange={(value) => updateField('name', value)}
              placeholder="Ej: Espacio joven Malvín Norte"
              description="Nombre de fantasía — puede cambiarse después"
              messages={state.errors?.name}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="status"
                name="status"
                label="Estado"
                value={values.status}
                options={STATUS_OPTIONS}
                messages={state.errors?.status}
                onValueChange={(value) => updateField('status', value)}
                required
              />
              <SelectField
                id="topic"
                label="Temática"
                value={values.topic}
                placeholder="Ej: Educación, Salud..."
                options={TOPIC_OPTIONS}
                onValueChange={(value) => updateField('topic', value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="intensity"
                name="intensity"
                label="Intensidad"
                value={values.intensity}
                options={INTENSITY_OPTIONS}
                messages={state.errors?.intensity}
                onValueChange={(value) => updateField('intensity', value)}
                required
              />
              <SelectField
                id="startYear"
                name="startYear"
                label="Año de inicio"
                value={values.startYear}
                options={yearOptions}
                onValueChange={(value) => updateField('startYear', value)}
                messages={state.errors?.startYear}
                required
              />
            </div>
            <SelectField
              id="leadCoordinatorId"
              name="leadCoordinatorId"
              label="Coordinador responsable"
              value={values.leadCoordinatorId}
              placeholder="Seleccionar coordinador..."
              options={coordinatorOptions}
              onValueChange={(value) => updateField('leadCoordinatorId', value)}
              messages={state.errors?.leadCoordinatorId}
              required
            />
          </FormSection>

          <FormSection title="Territorio" description="¿En qué zonas opera este proyecto?">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="departmentId"
                name="departmentId"
                label="Departamento"
                value={values.departmentId}
                placeholder="Seleccionar..."
                options={departmentOptions}
                onValueChange={(value) => updateField('departmentId', value)}
                messages={state.errors?.departmentId}
                required
              />
              <TextInputField
                id="localityNeighborhood"
                name="localityNeighborhood"
                label="Localidad / Barrio"
                value={values.localityNeighborhood}
                onValueChange={(value) => updateField('localityNeighborhood', value)}
                messages={state.errors?.localityNeighborhood}
                placeholder="Ej: Malvín Norte"
              />
            </div>
            <Field className="min-w-0 gap-1.5">
              <FieldLabel id="zone-label" className="text-foreground text-xs leading-4 font-medium">
                Zona
              </FieldLabel>
              <RadioGroup
                name="zone"
                aria-labelledby="zone-label"
                aria-invalid={Boolean(state.errors?.zone)}
                value={values.zone}
                onValueChange={(value) => updateField('zone', value)}
                className="flex flex-wrap gap-2"
              >
                {ZONE_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    className="bg-muted text-secondary-foreground has-data-checked:bg-primary has-data-checked:text-primary-foreground has-[:focus-visible]:ring-ring relative h-[22px] cursor-pointer rounded-full px-2.5 text-xs leading-4 font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2"
                  >
                    <RadioGroupItem
                      value={option.value}
                      aria-label={option.label}
                      className="absolute inset-0 size-full border-0 opacity-0"
                    />
                    <span>{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
              <FieldError className="text-xs leading-4">{state.errors?.zone?.[0]}</FieldError>
            </Field>
          </FormSection>

          <FormSection
            title="Beneficiarios principales"
            description="Estas categorías son el núcleo del impacto. Completá lo que aplica."
            contentClassName="grid grid-cols-1 content-start gap-4 sm:grid-cols-2"
          >
            {BENEFICIARY_FIELDS.map((field, index) => (
              <TextInputField
                key={field.key}
                id={field.key}
                name={field.key}
                label={field.label}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={values[field.key]}
                messages={state.errors?.[field.key]}
                onValueChange={(value) => {
                  if (/^[0-9]*$/.test(value)) {
                    updateField(field.key, value);
                  }
                }}
                className={index === BENEFICIARY_FIELDS.length - 1 ? 'sm:col-span-2' : undefined}
              />
            ))}
          </FormSection>

          <FormSection
            title="Información pública"
            description="Aparece en la vista pública para donantes y aliados."
          >
            <TextInputField
              id="generalObjective"
              name="generalObjective"
              label="Objetivo general"
              value={values.generalObjective}
              onValueChange={(value) => updateField('generalObjective', value)}
              placeholder="Ej: Acompañando a jóvenes en situación de vulnerabilidad"
              messages={state.errors?.generalObjective}
              description="Aparece como subtítulo en la vista pública"
            />
            <Field
              className="min-w-0 gap-1.5"
              data-invalid={Boolean(state.errors?.publicDescription)}
            >
              <FieldLabel
                htmlFor="publicDescription"
                className="text-foreground text-xs leading-4 font-medium"
              >
                Descripción pública
              </FieldLabel>
              <Textarea
                id="publicDescription"
                name="publicDescription"
                value={values.publicDescription}
                onChange={(event) => updateField('publicDescription', event.currentTarget.value)}
                maxLength={300}
                placeholder="Contá de qué trata el proyecto, a quiénes ayuda y cuál es su impacto..."
                aria-invalid={Boolean(state.errors?.publicDescription)}
                className="border-input bg-background min-h-20 resize-y rounded-lg px-3 py-2 text-base shadow-none md:text-sm"
              />
              <FieldDescription className="text-muted-foreground text-xs leading-4">
                Máx. 300 caracteres
              </FieldDescription>
              <FieldError className="text-xs leading-4">
                {state.errors?.publicDescription?.[0]}
              </FieldError>
            </Field>
            <ImageUploadField
              id="coverPhoto"
              label="Foto de portada"
              value={values.coverPhoto}
              onValueChange={(file) => {
                const coverPhotoUrl = file ? URL.createObjectURL(file) : null;
                setValues((currentValues) => ({
                  ...currentValues,
                  coverPhoto: file,
                  coverPhotoUrl,
                }));
              }}
            />
          </FormSection>

          <FormSection
            title="Notas internas"
            description="Comentarios para el equipo. No se muestran en la vista pública."
            contentClassName="pt-3"
          >
            <Textarea
              id="internalNotes"
              name="internalNotes"
              aria-label="Notas internas"
              aria-invalid={Boolean(state.errors?.internalNotes)}
              value={values.internalNotes}
              onChange={(event) => updateField('internalNotes', event.currentTarget.value)}
              placeholder="Escribí un comentario para el equipo…"
              className="border-input bg-background min-h-20 w-full resize-y rounded-lg px-3 py-2 text-base shadow-none sm:max-w-md md:text-sm"
            />
            <FieldError className="text-xs leading-4">
              {state.errors?.internalNotes?.[0]}
            </FieldError>
          </FormSection>
        </div>

        <ProjectPreview
          values={values}
          topicLabel={topicLabel}
          locationLabel={locationLabel}
          beneficiaryTotal={beneficiaryTotal}
        />
      </div>

      <FormActions
        cancelHref="/dashboard/projects"
        submitLabel="Guardar cambios"
        pending={pending}
        secondaryAction={
          <Button type="button" variant="outline" size="lg" disabled className="flex-1 sm:min-w-36">
            Guardar borrador
          </Button>
        }
      />
    </form>
  );
}
