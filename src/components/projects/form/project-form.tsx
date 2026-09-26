'use client';

import { InternalNotesSection } from './sections/internal-notes-section';
import { PublicInfoSection } from './sections/public-info-section';
import { BeneficiariesSection } from './sections/beneficiaries-section';
import { TerritorySection } from './sections/territory-section';
import { BasicInfoSection } from './sections/basic-info-section';

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from 'cn';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { notify } from '@/lib/notify';
import type { ProjectFormState } from '@/lib/validation/project';
import {
  BENEFICIARY_FIELDS,
  FIRST_PROJECT_YEAR,
  type BeneficiaryCounts,
} from '@/lib/project-display';
import { ProjectPreview } from './project-preview';
import type { ProjectFormValues } from './project-form-values';
import { projectFormSchema, readProjectFormData } from '@/lib/validation/project-form';
import { FormActions } from '@/components/ui/forms/form-actions';
import { getDefaultValues } from './get-default-values';
import { getPreviewLabels } from './get-preview-labels';

type ProjectFormProps = {
  mode?: 'create' | 'edit';
  initialValues?: Partial<ProjectFormValues>;
  submitAction: (previousState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  cancelHref?: string;
  children?: ReactNode;
  coordinators: { id: number; firstName: string; lastName: string }[];
  departments: { id: number; name: string }[];
  topics: { id: number; name: string }[];
  beneficiaryRecords?: (BeneficiaryCounts & { year: number })[];
  currentYear: number;
};

const INITIAL_STATE: ProjectFormState = {};

export function ProjectForm({
  mode = 'create',
  coordinators,
  departments,
  topics,
  beneficiaryRecords = [],
  currentYear,
  initialValues,
  submitAction,
  cancelHref = '/dashboard/projects',
  children,
}: ProjectFormProps) {
  async function submitProject(
    previousState: ProjectFormState,
    formData: FormData
  ): Promise<ProjectFormState> {
    const parsed = projectFormSchema.safeParse(readProjectFormData(formData));
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }
    if (mode === 'edit') {
      return submitAction(previousState, formData);
    }
    return submitWithToast(previousState, formData);
  }
  async function submitWithToast(
    previousState: ProjectFormState,
    formData: FormData
  ): Promise<ProjectFormState> {
    let redirectError: unknown;
    let failedState: ProjectFormState | undefined;
    const submission = submitAction(previousState, formData).then(
      (state) => {
        if (!state.errors && !state.formError) return state;
        failedState = state;
        throw new Error('Project submission failed');
      },
      (error) => {
        if (!isRedirectError(error)) throw error;
        redirectError = error;
        return INITIAL_STATE;
      }
    );
    notify.promise(submission, {
      loading: 'Creando proyecto...',
      success: 'Proyecto creado',
      error: 'No se pudo crear el proyecto',
    });
    try {
      const state = await submission;
      if (redirectError) throw redirectError;
      return state;
    } catch (error) {
      if (failedState) return failedState;
      throw error;
    }
  }
  const isEditing = mode === 'edit';
  const variant = isEditing ? 'detailed' : 'default';
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
  const [values, setValues] = useState<ProjectFormValues>(() => ({
    ...getDefaultValues(currentYear),
    ...initialValues,
  }));
  const beneficiaryDrafts = useRef<Record<string, Partial<ProjectFormValues>>>({});

  function selectYear(year: string) {
    beneficiaryDrafts.current[values.year] = Object.fromEntries(
      BENEFICIARY_FIELDS.map(({ key }) => [key, values[key]])
    );
    const record = beneficiaryRecords.find((record) => String(record.year) === year);
    const counts = Object.fromEntries(
      BENEFICIARY_FIELDS.map(({ key }) => [key, String(record?.[key] ?? 0)])
    );
    setValues((previous) => ({ ...previous, ...counts, ...beneficiaryDrafts.current[year], year }));
  }
  const submissionRef = useRef(false);

  useEffect(() => {
    if (!pending) submissionRef.current = false;
  }, [pending, state]);

  function updateField<K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  const { topicLabel, locationLabel, coverageLabel, beneficiaryTotal } = getPreviewLabels(
    values,
    departments,
    topics,
    isEditing
  );

  return (
    <form
      action={formAction}
      noValidate
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

          <BasicInfoSection
            variant={variant}
            isEditing={isEditing}
            values={values}
            state={state}
            updateField={updateField}
            yearOptions={yearOptions}
            coordinatorOptions={coordinatorOptions}
            topics={topics}
          />

          <TerritorySection
            variant={variant}
            isEditing={isEditing}
            values={values}
            state={state}
            updateField={updateField}
            departmentOptions={departmentOptions}
            coverageLabel={coverageLabel}
          />

          <BeneficiariesSection
            variant={variant}
            isEditing={isEditing}
            values={values}
            state={state}
            updateField={updateField}
            yearOptions={yearOptions}
            selectYear={selectYear}
          />

          <PublicInfoSection
            variant={variant}
            values={values}
            state={state}
            updateField={updateField}
          />

          <InternalNotesSection
            variant={variant}
            isEditing={isEditing}
            values={values}
            state={state}
            updateField={updateField}
          />
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
      />
    </form>
  );
}
