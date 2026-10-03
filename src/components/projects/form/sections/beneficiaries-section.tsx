'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BENEFICIARY_FIELDS } from '@/lib/project-display';
import { TextInputField } from '@/components/ui/forms/text-input-field';
import { SelectField } from '@/components/ui/forms/select-field';
import { FormSection } from '@/components/ui/forms/form-section';
import type { ProjectFormValues } from '../project-form-values';
import type { SectionProps } from './section-props';

export function BeneficiariesSection({
  isEditing,
  yearOptions,
  beneficiaryRecords,
}: Pick<SectionProps, 'isEditing' | 'yearOptions' | 'beneficiaryRecords'>) {
  const { getValues, setValue } = useFormContext<ProjectFormValues>();
  const beneficiaryDrafts = useRef<Record<string, Partial<ProjectFormValues>>>({});

  const startYear = useWatch({ name: 'startYear' });
  const status = useWatch({ name: 'status' });
  const endYear = useWatch({ name: 'endYear' });
  const year = useWatch({ name: 'year' });

  // TODO: Implement multiple years support on the backend
  // right now we only support one year
  const selectYear = useCallback(
    (beneficiaryYear: string) => {
      const current = getValues();
      beneficiaryDrafts.current[current.year] = Object.fromEntries(
        BENEFICIARY_FIELDS.map(({ key }) => [key, current[key]])
      );
      const record = beneficiaryRecords.find((item) => String(item.year) === beneficiaryYear);
      const counts = Object.fromEntries(
        BENEFICIARY_FIELDS.map(({ key }) => [key, String(record?.[key] ?? 0)])
      );
      const nextCounts = { ...counts, ...beneficiaryDrafts.current[beneficiaryYear] };
      for (const { key } of BENEFICIARY_FIELDS) {
        setValue(key, String(nextCounts[key] ?? '0'), { shouldValidate: true });
      }
      setValue('year', beneficiaryYear);
    },
    [getValues, setValue, beneficiaryRecords]
  );

  useEffect(() => {
    if (!startYear || !year) return;
    if (status === 'closed' && endYear) {
      if (Number(endYear) < Number(startYear)) return;
      if (Number(year) > Number(endYear)) {
        selectYear(endYear);
        return;
      }
    }
    if (Number(year) < Number(startYear)) {
      selectYear(startYear);
    }
  }, [startYear, status, endYear, year, selectYear]);

  return (
    <FormSection
      title="Beneficiarios principales"
      descriptionSpacing={isEditing ? 'relaxed' : 'compact'}
      description="Estas categorías son el núcleo del impacto. Completá lo que aplica."
      contentClassName="grid grid-cols-1 content-start gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <SelectField
          id="year"
          name="year"
          label="Año de beneficiarios"
          options={yearOptions}
          onValueChange={selectYear}
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Se guardan únicamente los beneficiarios del año seleccionado. Los cambios de otros años no
          se guardarán al salir.
        </p>
      </div>
      {BENEFICIARY_FIELDS.map((field, index) => (
        <TextInputField
          key={field.key}
          id={field.key}
          name={field.key}
          label={field.label}
          type="text"
          inputMode="numeric"
          className={index === BENEFICIARY_FIELDS.length - 1 ? 'sm:col-span-2' : undefined}
        />
      ))}
    </FormSection>
  );
}
