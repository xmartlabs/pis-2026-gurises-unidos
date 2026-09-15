'use client';

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from 'cn';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectFormState } from '@/lib/validation/project';
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
import { FormSection } from '@/components/ui/forms/form-section';
import { FormActions } from '@/components/ui/forms/form-actions';

type ProjectFormProps = {
  mode?: 'create' | 'edit';
  initialValues?: Partial<ProjectFormValues>;
  submitAction: (previousState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  cancelHref?: string;
  children?: ReactNode;
  coordinators: { id: number; firstName: string; lastName: string }[];
  departments: { id: number; name: string }[];
};

const INITIAL_STATE: ProjectFormState = {};

export function ProjectForm({
  mode = 'create',
  coordinators,
  departments,
  initialValues,
  submitAction,
  cancelHref = '/dashboard/projects',
  children,
}: ProjectFormProps) {
  async function submitProject(
    previousState: ProjectFormState,
    formData: FormData
  ): Promise<ProjectFormState> {
    const parsed = projectFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }
    return submitAction(previousState, formData);
  }
  const isEditing = mode === 'edit';
  const variant = isEditing ? 'detailed' : 'default';
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
    year: String(currentYear),
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
    ...initialValues,
  });
  const coverPhotoUrl = values.coverPhotoUrl;
  const submissionRef = useRef(false);

  useEffect(() => {
    if (!pending) submissionRef.current = false;
  }, [pending, state]);

  useEffect(() => {
    return () => {
      if (coverPhotoUrl?.startsWith('blob:')) URL.revokeObjectURL(coverPhotoUrl);
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
  const locationLabel =
    (isEditing && values.localityNeighborhood.trim()) ||
    departmentLabel ||
    zoneLabel ||
    PREVIEW_LOCATION_FALLBACK;
  const coverageLabel = [departmentLabel, values.localityNeighborhood.trim()]
    .filter(Boolean)
    .join(' • ');
  const beneficiaryTotal = BENEFICIARY_FIELDS.reduce(
    (total, field) => total + Math.max(0, Number(values[field.key]) || 0),
    0
  );

  return (
    <form
      action={formAction}
      className={cn(
        'text-foreground flex min-h-0 min-w-0 flex-1 flex-col',
        isEditing ? 'bg-surface-page' : 'bg-muted/30'
      )}
      aria-busy={pending}
      onSubmit={(event) => {
        if (submissionRef.current || pending) {
          event.preventDefault();
          return;
        }

        submissionRef.current = true;
      }}
    >
      <input type="hidden" name="year" value={values.year} />
      <div
        className={cn(
          'grid flex-1 content-start items-start',
          isEditing
            ? 'lg:grid-cols-[minmax(0,152fr)_minmax(0,85fr)]'
            : 'lg:grid-cols-[minmax(0,16fr)_minmax(0,9fr)]'
        )}
      >
        <div
          className={cn(
            'flex min-w-0 flex-col gap-5 px-4 pt-6 pb-8 sm:px-6',
            !isEditing && 'lg:pb-20'
          )}
        >
          {state.formError && (
            <p
              role="alert"
              className="border-destructive bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
            >
              {state.formError}
            </p>
          )}

          <FormSection variant={variant} title="Información básica">
            <TextInputField
              variant={variant}
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
                options={
                  isEditing
                    ? STATUS_OPTIONS
                    : STATUS_OPTIONS.filter((option) => option.value !== 'inProgress')
                }
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

          <FormSection
            variant={variant}
            title="Territorio"
            description="¿En qué zonas opera este proyecto?"
            descriptionSpacing={isEditing ? 'relaxed' : 'compact'}
          >
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
                variant={variant}
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
            {isEditing && (
              <div className="bg-muted rounded-[10px] px-3.5 py-3">
                <p className="text-muted-foreground text-sm leading-5">Cobertura</p>
                <p className="mt-1 flex items-center gap-1 text-sm leading-5">
                  <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                  {coverageLabel || 'Seleccioná un departamento'}
                </p>
              </div>
            )}
          </FormSection>

          <FormSection
            variant={variant}
            title="Beneficiarios principales"
            descriptionSpacing={isEditing ? 'relaxed' : 'compact'}
            description="Estas categorías son el núcleo del impacto. Completá lo que aplica."
            contentClassName="grid grid-cols-1 content-start gap-4 sm:grid-cols-2"
          >
            {BENEFICIARY_FIELDS.map((field, index) => (
              <TextInputField
                variant={variant}
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
            variant={variant}
            title="Información pública"
            description="Aparece en la vista pública para donantes y aliados."
          >
            <TextInputField
              variant={variant}
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
              className={cn('min-w-0', isEditing ? 'gap-3' : 'gap-1.5')}
              data-invalid={Boolean(state.errors?.publicDescription)}
            >
              <FieldLabel
                htmlFor="publicDescription"
                className={cn(
                  'text-foreground font-medium',
                  isEditing ? 'text-sm leading-5' : 'text-xs leading-4'
                )}
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
                className={cn(
                  'border-input bg-background min-h-20 resize-y rounded-lg px-3 py-2 text-base',
                  isEditing ? 'leading-6 shadow-sm' : 'shadow-none md:text-sm'
                )}
              />
              <FieldDescription
                className={cn(
                  'text-muted-foreground',
                  isEditing ? 'text-sm leading-5' : 'text-xs leading-4'
                )}
              >
                Máx. 300 caracteres
              </FieldDescription>
              <FieldError className="text-xs leading-4">
                {state.errors?.publicDescription?.[0]}
              </FieldError>
            </Field>
            <ImageUploadField
              variant={variant}
              id="coverPhoto"
              label="Foto de portada"
              imageUrl={values.coverPhotoUrl}
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
            variant={variant}
            title="Notas internas"
            description="Comentarios para el equipo. No se muestran en la vista pública."
            separator={!isEditing}
            descriptionClassName={isEditing ? 'text-text-muted text-sm leading-5' : undefined}
            contentClassName={isEditing ? 'pt-4' : 'pt-3'}
          >
            <Textarea
              id="internalNotes"
              name="internalNotes"
              aria-label="Notas internas"
              aria-invalid={Boolean(state.errors?.internalNotes)}
              value={values.internalNotes}
              onChange={(event) => updateField('internalNotes', event.currentTarget.value)}
              placeholder="Escribí un comentario para el equipo…"
              className={cn(
                'border-input bg-background min-h-20 w-full resize-y rounded-lg px-3 py-2 text-base sm:max-w-md',
                isEditing ? 'leading-6 shadow-sm' : 'shadow-none md:text-sm'
              )}
            />
            <FieldError className="text-xs leading-4">
              {state.errors?.internalNotes?.[0]}
            </FieldError>
          </FormSection>
          {children}
        </div>

        <ProjectPreview
          variant={variant}
          values={values}
          topicLabel={topicLabel}
          locationLabel={locationLabel}
          beneficiaryTotal={beneficiaryTotal}
        />
      </div>

      <FormActions
        variant={variant}
        cancelHref={cancelHref}
        submitLabel="Guardar cambios"
        pending={pending}
        secondaryAction={
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled
            className={cn(
              'flex-1 sm:min-w-36',
              isEditing && 'rounded-[10px] px-4 shadow-sm disabled:opacity-100'
            )}
          >
            Guardar borrador
          </Button>
        }
      />
    </form>
  );
}
