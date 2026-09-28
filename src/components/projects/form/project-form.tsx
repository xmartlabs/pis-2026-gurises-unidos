'use client';

import { InternalNotesSection } from './sections/internal-notes-section';
import { PublicInfoSection } from './sections/public-info-section';
import { BeneficiariesSection } from './sections/beneficiaries-section';
import { TerritorySection } from './sections/territory-section';
import { BasicInfoSection } from './sections/basic-info-section';

import { startTransition, useActionState, useMemo, type SubmitEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from 'cn';
import type { ProjectFormState } from '@/lib/validation/project';
import { FIRST_PROJECT_YEAR, type BeneficiaryCounts } from '@/lib/project-display';
import { ProjectPreview } from './project-preview';
import type { ProjectFormValues } from './project-form-values';
import { projectFormSchema } from '@/lib/validation/project-form';
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
  const router = useRouter();
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
  const defaultValues = {
    ...getDefaultValues(currentYear),
    ...initialValues,
  };
  const [state, formAction, pending] = useActionState(submitAction, INITIAL_STATE);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema) as unknown as Resolver<ProjectFormValues>,
    defaultValues,
    mode: 'onChange',
  });
  const { control, handleSubmit } = form;
  const watchedValues = useWatch({ control });
  const values = {
    ...defaultValues,
    ...watchedValues,
    coverPhotoUrl: defaultValues.coverPhotoUrl ?? null,
  } as ProjectFormValues;

  const { locationLabel, coverageLabel, beneficiaryTotal } = getPreviewLabels(
    values,
    departments,
    isEditing
  );

  const beneficiaryYearOptions = yearOptions.filter(
    ({ value }) => Number(value) >= Number(values.startYear)
  );

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formElement = event.currentTarget;
    return handleSubmit(() => {
      startTransition(() => {
        formAction(new FormData(formElement));
      });
    })(event);
  }

  return (
    <FormProvider {...form}>
      <form
        noValidate
        className={cn(
          'text-foreground flex min-h-0 min-w-0 flex-1 flex-col',
          isEditing ? 'bg-surface-page' : 'bg-muted/30'
        )}
        aria-busy={pending}
        onSubmit={onSubmit}
      >
        {!isEditing && values.coverPhotoUrl && (
          <input type="hidden" name="projectPlaceholder" value={values.coverPhotoUrl} />
        )}
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
            {/* TODO: remove once the toast is implemented */}
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
              yearOptions={yearOptions}
              coordinatorOptions={coordinatorOptions}
              topics={topics}
            />

            <TerritorySection
              variant={variant}
              isEditing={isEditing}
              departmentOptions={departmentOptions}
              coverageLabel={coverageLabel}
            />

            <BeneficiariesSection
              variant={variant}
              isEditing={isEditing}
              yearOptions={beneficiaryYearOptions}
              beneficiaryRecords={beneficiaryRecords}
            />

            <PublicInfoSection variant={variant} />

            <InternalNotesSection variant={variant} isEditing={isEditing} />
            {children}
          </div>

          <ProjectPreview
            variant={variant}
            values={values}
            locationLabel={locationLabel}
            beneficiaryTotal={beneficiaryTotal}
          />
        </div>

        <FormActions
          variant={variant}
          onCancel={() => router.push(cancelHref)}
          submitLabel="Guardar cambios"
          pending={pending}
        />
      </form>
    </FormProvider>
  );
}
