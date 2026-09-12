'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ChangeEvent, type ReactNode, useActionState, useEffect, useMemo, useState } from 'react';
import { createProject } from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  { name: 'directChildrenAdolescents', label: 'NNA participantes directos' },
  { name: 'indirectChildrenAdolescents', label: 'NNA participantes indirectos' },
  { name: 'youth18To29', label: 'Jóvenes de 18 a 29 años' },
  { name: 'families', label: 'Familias acompañadas' },
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

const initialState: ProjectFormState = {};

const inputClassName =
  'h-9 rounded-lg border-[#e5e5e7] bg-white px-3 text-base shadow-[0_1px_2px_rgba(0,0,0,0.1)] md:text-base';

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
        'gap-0 overflow-visible rounded-[14px] bg-white py-0 shadow-none ring-1 ring-[#e5e5e7]',
        className
      )}
    >
      <div className="px-6 pt-5">
        <h2 className="text-base leading-6 font-semibold text-[#0a0a0a]">{title}</h2>
        {description && <p className="mt-0.5 text-xs leading-4 text-[#737373]">{description}</p>}
      </div>
      <Separator className="mt-4 bg-[#e5e5e7]" />
      <div className={cn('flex flex-1 flex-col gap-4 px-6 pt-4 pb-5', contentClassName)}>
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
    <Field className="gap-1.5" data-invalid={Boolean(messages?.length)}>
      <FieldLabel htmlFor={id} className="text-xs leading-4 font-medium text-[#0a0a0a]">
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
        className={inputClassName}
      />
      {description && (
        <FieldDescription className="text-xs leading-4 text-[#737373]">
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
    <Field className="gap-1.5" data-invalid={Boolean(messages?.length)}>
      <FieldLabel htmlFor={id} className="text-xs leading-4 font-medium text-[#0a0a0a]">
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
          className="h-9 w-full rounded-lg border-[#e5e5e7] bg-white px-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        >
          <SelectValue placeholder={placeholder} />
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
    <Field className={cn('gap-1.5', className)} data-invalid={Boolean(messages?.length)}>
      <FieldLabel htmlFor={name} className="text-xs leading-4 font-medium text-[#0a0a0a]">
        {label}
      </FieldLabel>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(event) => onChange(name, event.currentTarget.value)}
        aria-invalid={Boolean(messages?.length)}
        className={inputClassName}
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
    <aside className="w-[425px] shrink-0 bg-[#f5f5f5]">
      <div className="flex h-12 items-center justify-between border-b border-[#e5e5e7] bg-[#fafafb] px-6">
        <p className="text-xs leading-4 font-semibold text-[#0a0a0a]">
          Vista previa de la tarjeta pública
        </p>
        <p className="text-xs leading-4 text-[#737373]">Actualización automática</p>
      </div>
      <div className="flex h-[362px] flex-col items-center gap-3 bg-[#f5f5f5] px-6 py-8">
        <Card className="h-[278px] w-[377px] gap-0 overflow-hidden rounded-xl bg-white py-0 shadow-none ring-1 ring-[#e5e5e7]">
          <div className="relative flex h-[140px] shrink-0 items-center justify-center overflow-hidden bg-[#fafafa]">
            {coverPhotoUrl ? (
              <Image
                src={coverPhotoUrl}
                alt="Foto de portada del proyecto"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="text-xs leading-4 text-[#a1a1aa]">Foto de portada</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex h-[22px] items-center gap-1.5">
              <Badge className="h-[22px] rounded-full bg-[#171717] px-2.5 text-xs text-white">
                {statusLabel}
              </Badge>
              <Badge
                variant="secondary"
                className="h-[22px] rounded-full bg-[#f5f5f5] px-2.5 text-xs text-[#525252]"
              >
                {topicLabel}
              </Badge>
            </div>
            <h3 className="truncate text-base leading-6 font-semibold text-[#0a0a0a]">
              {draft.name || 'Nombre del proyecto'}
            </h3>
            <p className="truncate text-xs leading-4 text-[#737373]">
              {draft.generalObjective || 'El tagline aparecerá aquí cuando lo completes.'}
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs leading-4 text-[#737373]">
              <span className="truncate">📍 {locationLabel}</span>
              <span>👥 {beneficiaryTotal || '—'}</span>
            </div>
          </div>
        </Card>
        <p className="text-center text-xs leading-4 text-[#737373]">
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
  const [state, formAction, pending] = useActionState(createProject, initialState);
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
      className="min-w-[1185px] bg-white text-[#0a0a0a]"
      onSubmit={(event) => {
        if (Object.values(beneficiaries).some((value) => Number(value) < 0)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="year" value={draft.startYear} />

      <header className="flex h-[60px] items-center border-b border-[#e5e5e7] bg-white px-5">
        <Breadcrumb>
          <BreadcrumbList className="gap-1.5 text-sm leading-5">
            <BreadcrumbItem className="text-[#737373]">Proyectos</BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#a1a1aa]">/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-[#0a0a0a]">
                Nuevo Proyecto
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="grid grid-cols-[760px_425px] items-start">
        <div className="flex w-[760px] flex-col gap-5 bg-[#fafafb] px-6 pt-6 pb-8">
          {state.formError && (
            <p
              role="alert"
              className="border-destructive bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
            >
              {state.formError}
            </p>
          )}

          <FormSection title="Información básica" className="min-h-[394px]">
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
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                id="status"
                name="status"
                label="Estado"
                value={draft.status}
                options={STATUS_OPTIONS}
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
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                id="intensity"
                name="intensity"
                label="Intensidad"
                value={draft.intensity}
                options={INTENSITY_OPTIONS}
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

          <FormSection
            title="Territorio"
            description="¿En qué zonas opera este proyecto?"
            className="min-h-[250px]"
          >
            <div className="grid grid-cols-2 gap-4">
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
                placeholder="Ej: Malvín Norte"
              />
            </div>
            <Field className="gap-1.5">
              <FieldLabel className="text-xs leading-4 font-medium text-[#0a0a0a]">Zona</FieldLabel>
              <RadioGroup
                name="zone"
                value={draft.zone}
                onValueChange={(value) => updateDraft('zone', value)}
                className="flex gap-2"
              >
                {ZONE_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    className="relative h-[22px] cursor-pointer rounded-full bg-[#f5f5f5] px-2.5 text-xs leading-4 font-medium text-[#525252] has-data-checked:bg-[#171717] has-data-checked:text-white"
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
            </Field>
          </FormSection>

          <FormSection
            title="Beneficiarios"
            description="Estas categorías son el núcleo del impacto. Completá lo que aplica."
            className="min-h-[397px]"
            contentClassName="grid grid-cols-2 content-start gap-x-4 gap-y-4"
          >
            {BENEFICIARY_FIELDS.map((field, index) => (
              <BeneficiaryField
                key={field.name}
                name={field.name}
                label={field.label}
                value={beneficiaries[field.name]}
                messages={state.errors?.[field.name]}
                onChange={updateBeneficiary}
                className={index === BENEFICIARY_FIELDS.length - 1 ? 'col-span-2' : undefined}
              />
            ))}
          </FormSection>

          <FormSection
            title="Información pública"
            description="Aparece en la vista pública para donantes y aliados."
            className="min-h-[456px]"
          >
            <TextInputField
              id="generalObjective"
              name="generalObjective"
              label="Objetivo general"
              value={draft.generalObjective}
              onValueChange={(value) => updateDraft('generalObjective', value)}
              placeholder="Ej: Acompañando a jóvenes en situación de vulnerabilidad"
              description="Aparece como subtítulo en la vista pública"
            />
            <Field className="gap-1.5" data-invalid={Boolean(state.errors?.publicDescription)}>
              <FieldLabel
                htmlFor="publicDescription"
                className="text-xs leading-4 font-medium text-[#0a0a0a]"
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
                className="h-20 resize-none rounded-lg border-[#e5e5e7] bg-white px-3 py-2 text-base shadow-[0_1px_2px_rgba(0,0,0,0.1)] md:text-base"
              />
              <FieldDescription className="text-xs leading-4 text-[#737373]">
                Máx. 300 caracteres
              </FieldDescription>
              <FormFieldError messages={state.errors?.publicDescription} />
            </Field>
            <Field className="gap-1.5" data-invalid={Boolean(coverPhotoError)}>
              <FieldLabel
                htmlFor="coverPhoto"
                className="text-xs leading-4 font-medium text-[#0a0a0a]"
              >
                Foto de portada
              </FieldLabel>
              <Input
                id="coverPhoto"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleCoverPhotoChange}
                className="sr-only"
              />
              <Label
                htmlFor="coverPhoto"
                className="flex h-[72px] w-full cursor-pointer items-center justify-center rounded-lg border border-[#e5e5e7] bg-[#f5f5f5] text-xs leading-4 font-normal text-[#737373] hover:bg-[#ededed]"
              >
                Clic para subir imagen (JPG, PNG, máx. 5MB)
              </Label>
              <FieldError className="text-xs leading-4" errors={[{ message: coverPhotoError }]} />
            </Field>
          </FormSection>

          <FormSection
            title="Notas internas"
            description="Comentarios para el equipo. No se muestran en la vista pública."
            className="min-h-[182px]"
            contentClassName="pt-3"
          >
            <Textarea
              id="internalNotes"
              name="internalNotes"
              value={draft.internalNotes}
              onChange={(event) => updateDraft('internalNotes', event.currentTarget.value)}
              placeholder="Escribí un comentario para el equipo…"
              className="h-20 w-[448px] resize-none rounded-lg border-[#e5e5e7] bg-white px-3 py-2 text-base shadow-[0_1px_2px_rgba(0,0,0,0.1)] md:text-base"
            />
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

      <footer className="sticky bottom-0 z-20 flex h-[68px] items-center justify-between border-t border-[#e5e5e7] bg-white px-6 py-4">
        <Button
          variant="ghost"
          size="lg"
          render={<Link href="/dashboard/projects" />}
          className="px-3"
        >
          Cancelar
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="lg" className="w-[147px]">
            Guardar borrador
          </Button>
          <Button type="submit" size="lg" disabled={pending} className="w-[145px]">
            {pending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </footer>
    </form>
  );
}
