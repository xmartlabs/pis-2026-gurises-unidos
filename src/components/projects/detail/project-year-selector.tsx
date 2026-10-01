'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ProjectYearSelector({ year, years }: { year: number; years: number[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function selectYear(value: string | number) {
    startTransition(() => router.push(`${pathname}?year=${value}`, { scroll: false }));
  }

  return (
    <div>
      <div className="hidden sm:block">
        <Tabs
          value={String(year)}
          onValueChange={selectYear}
          className="gap-0"
          aria-label="Seleccionar año"
        >
          <TabsList className="h-9! p-0.5">
            {years.map((option) => (
              <TabsTrigger
                key={option}
                value={String(option)}
                disabled={isPending}
                className="h-8 px-2.5 text-sm font-normal data-active:font-medium"
              >
                {option}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="sm:hidden">
        <Select
          value={String(year)}
          onValueChange={(value) => {
            if (value !== null) selectYear(value);
          }}
          disabled={isPending}
        >
          <SelectTrigger aria-label="Seleccionar año" className="bg-background h-9 min-w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {years.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span role="status" className="sr-only">
        {isPending ? 'Cargando datos…' : ''}
      </span>
    </div>
  );
}
