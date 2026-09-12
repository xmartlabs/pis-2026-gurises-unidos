'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  type ChangeEvent,
  type ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createProject } from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectFormState } from '@/lib/validation/project';
import { cn } from 'cn';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inProgress', label: 'En progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'archived', label: 'Archivado' },
] as const;

const TOPIC_OPTIONS = [
  { value: 'education', label: 'Educación' },
  { value: 'health', label: 'Salud' },
  { value: 'protection', label: 'Protección' },
  { value: 'community', label: 'Comunidad' },
  { value: 'employment', label: 'Empleo' },
] as const;

const INTENSITY_OPTIONS = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' },
] as const;

const ZONE_OPTIONS = [
  { value: 'city', label: 'Montevideo' },
  { value: 'inland', label: 'Interior' },
  { value: 'border', label: 'Frontera' },
  { value: 'rural', label: 'Rural' },
] as const;

const BENEFICIARY_FIELDS = [
  { name: 'directChildrenAdolescents', label: 'NNA directos' },
  { name: 'indirectChildrenAdolescents', label: 'NNA indirectos' },
  { name: 'youth18To29', label: 'Jóvenes (18–29)' },
  { name: 'families', label: 'Familias' },
  { name: 'coordinatedInstitutions', label: 'Instituciones coordinadas' },
  { name: 'communityLeaders', label: 'Referentes comunitarios' },
  { name: 'basicServiceStaff', label: 'Funcionarios de servicios básicos' },
] as const;

const MAX_COVER_PHOTO_SIZE = 5 * 1024 * 1024;
const COVER_PHOTO_TYPES = ['image/jpeg', 'image/png'];
const FIRST_PROJECT_YEAR = 1989;
const PREVIEW_TOPIC_FALLBACK = 'Educación';
const PREVIEW_LOCATION_FALLBACK = 'Montevideo';

type BeneficiaryFieldName = (typeof BENEFICIARY_FIELDS)[number]['name'];

type ProjectDraft = {
  name: string;
  status: string;
  topic: string;
  intensity: string;
  startYear: string;
  leadCoordinatorId: string;
  departmentId: string;
  zone: string;
  localityNeighborhood: string;
  generalObjective: string;
  publicDescription: string;
  internalNotes: string;
};

type ProjectFormProps = {
  coordinators: { id: number; firstName: string; lastName: string }[];
  departments: { id: number; name: string }[];
};

type SelectOption = {
  value: string;
  label: string;
};

const INITIAL_STATE: ProjectFormState = {};

const INPUT_CLASS_NAME =
  'h-9 min-w-0 rounded-lg border-input bg-background px-3 text-base shadow-none md:text-sm';

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

function FormFieldError({ messages }: { messages?: string[] }) {
  return (
    <FieldError className="text-xs leading-4" errors={messages?.map((message) => ({ message }))} />
  );
}

function TextInputField({
  id,
  name,
  label,
  value,
  onValueChange,
  placeholder,
  description,
  messages,
  required,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  messages?: string[];
  required?: boolean;
}) {
  return (
    <Field className="min-w-0 gap-1.5" data-invalid={Boolean(messages?.length)}>
      <FieldLabel htmlFor={id} className="text-foreground text-xs leading-4 font-medium">
        {label}
      </FieldLabel>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(messages?.length)}
        className={INPUT_CLASS_NAME}
      />
      {description && (
        <FieldDescription className="text-muted-foreground text-xs leading-4">
          {description}
        </FieldDescription>
      )}
      <FormFieldError messages={messages} />
    </Field>
  );
}

function SelectField({
  id,
  name,
  label,
  value,
  placeholder,
  options,
  onValueChange,
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
          className="border-input bg-background w-full min-w-0 rounded-lg px-3 text-sm shadow-none data-[size=default]:h-9"
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
      <FormFieldError messages={messages} />
    </Field>
  );
}

function BeneficiaryField({
  name,
  label,
  value,
  messages,
  onChange,
  className,
}: {
  name: BeneficiaryFieldName;
  label: string;
  value: string;
  messages?: string[];
  onChange: (name: BeneficiaryFieldName, value: string) => void;
  className?: string;
}) {
  return (
    <Field className={cn('min-w-0 gap-1.5', className)} data-invalid={Boolean(messages?.length)}>
      <FieldLabel htmlFor={name} className="text-foreground text-xs leading-4 font-medium">
        {label}
      </FieldLabel>
      <Input
        id={name}
        name={name}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          if (/^[0-9]*$/.test(nextValue)) onChange(name, nextValue);
        }}
        aria-invalid={Boolean(messages?.length)}
        className={INPUT_CLASS_NAME}
      />
      <FormFieldError messages={messages} />
    </Field>
  );
}

function ProjectPreview({
  draft,
  topicLabel,
  locationLabel,
  beneficiaryTotal,
  coverPhotoUrl,
}: {
  draft: ProjectDraft;
  topicLabel: string;
  locationLabel: string;
  beneficiaryTotal: number;
  coverPhotoUrl: string | null;
}) {
  const statusLabel =
    STATUS_OPTIONS.find((option) => option.value === draft.status)?.label ?? 'Activo';

  return (
    <aside aria-label="Vista previa de la tarjeta pública" className="bg-muted/30 min-w-0">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
        <p className="text-muted-foreground text-xs leading-4">
          Vista previa de la tarjeta pública
        </p>
        <p className="text-muted-foreground text-xs leading-4">Actualización automática</p>
      </div>
      <div className="bg-muted/60 flex flex-col items-center gap-3 px-4 py-8 sm:px-6">
        <Card className="bg-card ring-border w-full max-w-[377px] gap-0 overflow-hidden rounded-xl py-0 shadow-none ring-1">
          <div className="bg-muted relative flex aspect-[377/140] shrink-0 items-center justify-center overflow-hidden">
            {coverPhotoUrl ? (
              <Image
                src={coverPhotoUrl}
                alt="Foto de portada del proyecto"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="text-muted-foreground/60 text-xs leading-4">Foto de portada</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className="bg-primary text-primary-foreground h-[22px] rounded-full px-2.5 text-xs">
                {statusLabel}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-muted text-secondary-foreground h-[22px] rounded-full px-2.5 text-xs"
              >
                {topicLabel}
              </Badge>
            </div>
            <h3 className="text-foreground truncate text-base leading-6 font-semibold">
              {draft.name || 'Nombre del proyecto'}
            </h3>
            <p className="text-muted-foreground truncate text-xs leading-4">
              {draft.generalObjective || 'El tagline aparecerá aquí cuando lo completes.'}
            </p>
            <div className="text-muted-foreground flex items-center gap-4 pt-1 text-xs leading-4">
              <span className="truncate">📍 {locationLabel}</span>
              <span className="shrink-0">👥 {beneficiaryTotal || '—'}</span>
            </div>
          </div>
        </Card>
        <p className="text-muted-foreground text-center text-xs leading-4">
          Así se verá en el listado público
        </p>
      </div>
    </aside>
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
  const [state, formAction, pending] = useActionState(createProject, INITIAL_STATE);
  const [draft, setDraft] = useState<ProjectDraft>({
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
  });
  const [beneficiaries, setBeneficiaries] = useState<Record<BeneficiaryFieldName, string>>({
    directChildrenAdolescents: '0',
    indirectChildrenAdolescents: '0',
    youth18To29: '0',
    families: '0',
    coordinatedInstitutions: '0',
    communityLeaders: '0',
    basicServiceStaff: '0',
  });
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [coverPhotoError, setCoverPhotoError] = useState<string>();
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const submissionRef = useRef(false);

  useEffect(() => {
    if (!pending) submissionRef.current = false;
  }, [pending, state]);

  useEffect(() => {
    return () => {
      if (coverPhotoUrl) URL.revokeObjectURL(coverPhotoUrl);
    };
  }, [coverPhotoUrl]);

  const updateDraft = (field: keyof ProjectDraft, value: string) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const updateBeneficiary = (field: BeneficiaryFieldName, value: string) => {
    setBeneficiaries((currentBeneficiaries) => ({
      ...currentBeneficiaries,
      [field]: value,
    }));
  };

  const removeCoverPhoto = () => {
    setCoverPhotoUrl(null);
    setCoverPhotoError(undefined);
    if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = '';
  };

  const handleCoverPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (!COVER_PHOTO_TYPES.includes(file.type)) {
      setCoverPhotoError('La imagen debe ser JPG o PNG.');
      event.currentTarget.value = '';
      return;
    }

    if (file.size > MAX_COVER_PHOTO_SIZE) {
      setCoverPhotoError('La imagen no puede superar los 5 MB.');
      event.currentTarget.value = '';
      return;
    }

    setCoverPhotoError(undefined);
    setCoverPhotoUrl(URL.createObjectURL(file));
  };

  const topicLabel =
    TOPIC_OPTIONS.find((option) => option.value === draft.topic)?.label ?? PREVIEW_TOPIC_FALLBACK;
  const departmentLabel = departments.find(
    (department) => String(department.id) === draft.departmentId
  )?.name;
  const zoneLabel = ZONE_OPTIONS.find((option) => option.value === draft.zone)?.label;
  const locationLabel = departmentLabel ?? zoneLabel ?? PREVIEW_LOCATION_FALLBACK;
  const beneficiaryTotal = Object.values(beneficiaries).reduce(
    (total, value) => total + Math.max(0, Number(value) || 0),
    0
  );

  return (
    <form
      action={formAction}
      className="bg-muted/30 text-foreground flex min-h-dvh min-w-0 flex-col"
      aria-busy={pending}
      onSubmit={(event) => {
        if (
          submissionRef.current ||
          pending ||
          Object.values(beneficiaries).some((value) => Number(value) < 0)
        ) {
          event.preventDefault();
          return;
        }
        submissionRef.current = true;
      }}
    >
      <header className="bg-background flex min-h-15 items-center border-b px-4 py-4 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList className="gap-1.5 text-sm leading-5">
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard/projects" />}>
                Proyectos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/60">/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-semibold">
                Nuevo Proyecto
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

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
              value={draft.name}
              onValueChange={(value) => updateDraft('name', value)}
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
                value={draft.status}
                options={STATUS_OPTIONS}
                messages={state.errors?.status}
                onValueChange={(value) => updateDraft('status', value)}
                required
              />
              <SelectField
                id="topic"
                label="Temática"
                value={draft.topic}
                placeholder="Ej: Educación, Salud..."
                options={TOPIC_OPTIONS}
                onValueChange={(value) => updateDraft('topic', value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="intensity"
                name="intensity"
                label="Intensidad"
                value={draft.intensity}
                options={INTENSITY_OPTIONS}
                messages={state.errors?.intensity}
                onValueChange={(value) => updateDraft('intensity', value)}
                required
              />
              <SelectField
                id="startYear"
                name="startYear"
                label="Año de inicio"
                value={draft.startYear}
                options={yearOptions}
                onValueChange={(value) => updateDraft('startYear', value)}
                messages={state.errors?.startYear}
                required
              />
            </div>
            <SelectField
              id="leadCoordinatorId"
              name="leadCoordinatorId"
              label="Coordinador responsable"
              value={draft.leadCoordinatorId}
              placeholder="Seleccionar coordinador..."
              options={coordinatorOptions}
              onValueChange={(value) => updateDraft('leadCoordinatorId', value)}
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
                value={draft.departmentId}
                placeholder="Seleccionar..."
                options={departmentOptions}
                onValueChange={(value) => updateDraft('departmentId', value)}
                messages={state.errors?.departmentId}
                required
              />
              <TextInputField
                id="localityNeighborhood"
                name="localityNeighborhood"
                label="Localidad / Barrio"
                value={draft.localityNeighborhood}
                onValueChange={(value) => updateDraft('localityNeighborhood', value)}
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
                value={draft.zone}
                onValueChange={(value) => updateDraft('zone', value)}
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
              <FormFieldError messages={state.errors?.zone} />
            </Field>
          </FormSection>

          <FormSection
            title="Beneficiarios principales"
            description="Estas categorías son el núcleo del impacto. Completá lo que aplica."
            contentClassName="grid grid-cols-1 content-start gap-4 sm:grid-cols-2"
          >
            {BENEFICIARY_FIELDS.map((field, index) => (
              <BeneficiaryField
                key={field.name}
                name={field.name}
                label={field.label}
                value={beneficiaries[field.name]}
                messages={state.errors?.[field.name]}
                onChange={updateBeneficiary}
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
              value={draft.generalObjective}
              onValueChange={(value) => updateDraft('generalObjective', value)}
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
                value={draft.publicDescription}
                onChange={(event) => updateDraft('publicDescription', event.currentTarget.value)}
                maxLength={300}
                placeholder="Contá de qué trata el proyecto, a quiénes ayuda y cuál es su impacto..."
                aria-invalid={Boolean(state.errors?.publicDescription)}
                className="border-input bg-background min-h-20 resize-y rounded-lg px-3 py-2 text-base shadow-none md:text-sm"
              />
              <FieldDescription className="text-muted-foreground text-xs leading-4">
                Máx. 300 caracteres
              </FieldDescription>
              <FormFieldError messages={state.errors?.publicDescription} />
            </Field>
            <Field className="min-w-0 gap-1.5" data-invalid={Boolean(coverPhotoError)}>
              <FieldLabel
                htmlFor="coverPhoto"
                className="text-foreground text-xs leading-4 font-medium"
              >
                Foto de portada
              </FieldLabel>
              <Input
                id="coverPhoto"
                ref={coverPhotoInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleCoverPhotoChange}
                aria-invalid={Boolean(coverPhotoError)}
                aria-describedby={coverPhotoError ? 'cover-photo-error' : undefined}
                className="peer sr-only"
              />
              <Label
                htmlFor="coverPhoto"
                className="border-input bg-muted text-muted-foreground hover:bg-accent peer-focus-visible:ring-ring flex min-h-18 w-full cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-center text-xs leading-4 font-normal peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
              >
                Clic para subir imagen (JPG, PNG, máx. 5MB)
              </Label>
              {coverPhotoUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeCoverPhoto}
                  className="self-start"
                >
                  Quitar foto
                </Button>
              )}
              <FieldError
                id="cover-photo-error"
                className="text-xs leading-4"
                errors={[{ message: coverPhotoError }]}
              />
            </Field>
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
              value={draft.internalNotes}
              onChange={(event) => updateDraft('internalNotes', event.currentTarget.value)}
              placeholder="Escribí un comentario para el equipo…"
              className="border-input bg-background min-h-20 w-full resize-y rounded-lg px-3 py-2 text-base shadow-none sm:max-w-md md:text-sm"
            />
            <FormFieldError messages={state.errors?.internalNotes} />
          </FormSection>
        </div>

        <ProjectPreview
          draft={draft}
          topicLabel={topicLabel}
          locationLabel={locationLabel}
          beneficiaryTotal={beneficiaryTotal}
          coverPhotoUrl={coverPhotoUrl}
        />
      </div>

      <footer className="bg-background sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 sm:px-6">
        <Button
          nativeButton={false}
          variant="ghost"
          size="lg"
          render={<Link href="/dashboard/projects" />}
          className="px-3"
        >
          Cancelar
        </Button>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button type="button" variant="outline" size="lg" disabled className="sm:min-w-36">
            Guardar borrador
          </Button>
          <Button type="submit" size="lg" disabled={pending} className="sm:min-w-36">
            {pending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </footer>
    </form>
  );
}
