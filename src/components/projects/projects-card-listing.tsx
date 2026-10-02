'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { ProjectCardsGrid, type ProjectListQuery } from '@/components/projects/project-cards-grid';
import type { ProjectListItem } from '@/lib/projects/list';
import { STATUS_FILTERS, type StatusFilterValue } from '@/lib/projects/constants';
import { PROJECT_SEARCH_MAX_LENGTH } from '@/lib/validation/project-filters';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';

const ALL_YEARS = 'all';
const SEARCH_DEBOUNCE_MS = 400;

type YearFilterValue = number | typeof ALL_YEARS;

type ProjectsCardListProps = {
  projects: ProjectListItem[];
  total: number;
  page: number;
  totalPages: number;
  years: number[];
  status: StatusFilterValue;
  beneficiaryYear: number | undefined;
  search: string | undefined;
};

export function ProjectsCardList({
  projects,
  total,
  page,
  totalPages,
  years,
  status,
  beneficiaryYear,
  search,
}: ProjectsCardListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchText, setSearchText] = useState(search ?? '');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const requestedParams = useRef(searchParams.toString());

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  useEffect(() => {
    requestedParams.current = searchParams.toString();
  }, [searchParams]);

  const year: YearFilterValue = beneficiaryYear ?? ALL_YEARS;
  const yearOptions: { value: YearFilterValue; label: string }[] = [
    { value: ALL_YEARS, label: 'Todos' },
    ...years.map((y) => ({ value: y, label: String(y) })),
  ];

  const current = STATUS_FILTERS.find((f) => f.value === status) ?? STATUS_FILTERS[0];

  const query = useMemo<ProjectListQuery>(
    () => ({ status, beneficiaryYear: String(year), search }),
    [status, year, search]
  );

  function updateFilter(key: 'status' | 'beneficiaryYear' | 'search', value: string | null) {
    const params = new URLSearchParams(requestedParams.current);
    if (value) params.set(key, value);
    else params.delete(key);
    const queryString = params.toString();
    requestedParams.current = queryString;
    startTransition(() =>
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    );
  }

  function handleSearchChange(value: string) {
    setSearchText(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(
      () => updateFilter('search', value.trim() || null),
      SEARCH_DEBOUNCE_MS
    );
  }

  const filteredCountLabel = `${total} ${total === 1 ? 'proyecto' : 'proyectos'}`;

  const newProjectButton = (
    <Button
      variant="outline"
      className="h-8 gap-2.5 rounded-md px-3 shadow-xs/10"
      nativeButton={false}
      render={<Link href="/dashboard/projects/new" />}
    >
      <p className="text-primary text-sm leading-5 font-medium tracking-normal">Nuevo proyecto</p>
    </Button>
  );

  const yearSelect = (
    <Select<YearFilterValue>
      items={yearOptions}
      value={year}
      onValueChange={(value) => value !== null && updateFilter('beneficiaryYear', String(value))}
      disabled={isPending}
    >
      <SelectTrigger
        aria-label="Filtrar por año"
        className="bg-background h-9! w-22.5 rounded-md px-3 py-2 shadow-xs/10"
      >
        <SelectValue className="text-primary text-sm leading-5 tracking-normal" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {yearOptions.map((y) => (
          <SelectItem key={y.value} value={y.value}>
            {y.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="bg-primary-foreground flex h-full w-auto flex-col gap-5 pt-5 pr-4 pb-4 pl-4 lg:px-8 lg:py-7">
      <div className="flex flex-row items-start justify-between gap-3 lg:items-center">
        <div className="flex flex-col justify-center gap-0.5">
          <p className="text-muted-foreground block text-xs leading-4 font-medium lg:hidden">
            Proyectos
          </p>
          <h1 className="text-primary shrink-0 grow text-2xl leading-8 font-bold tracking-normal">
            {current.title}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="lg:hidden">{yearSelect}</div>
          {newProjectButton}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-row items-center gap-3">
          <Tabs value={status} onValueChange={(value) => updateFilter('status', String(value))}>
            <div className="bg-secondary flex h-9 w-fit flex-row items-center rounded-lg px-0.5 py-0.75">
              <TabsList aria-label="Filtrar por estado">
                {STATUS_FILTERS.map((f) => (
                  <TabsTrigger
                    key={f.value}
                    value={f.value}
                    className={cn(
                      'text-muted-foreground h-7.25 cursor-pointer gap-2.5 rounded-md px-2 py-1 text-sm font-medium',
                      'data-active:bg-card data-active:text-primary data-active:border-border data-active:shadow-sm/10'
                    )}
                  >
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
          <p className="text-muted-foreground hidden text-sm leading-5 font-normal tracking-normal lg:block">
            {filteredCountLabel}
          </p>
        </div>
        <InputGroup className="bg-background h-9 w-full rounded-md lg:ml-auto lg:w-80">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Buscar proyectos por nombre"
            placeholder="Buscar por nombre..."
            maxLength={PROJECT_SEARCH_MAX_LENGTH}
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </InputGroup>
        <div className="hidden lg:block">{yearSelect}</div>
      </div>
      <p className="text-primary block text-lg leading-7 font-semibold lg:hidden">
        {filteredCountLabel}
      </p>

      <ProjectCardsGrid
        key={`${query.status}-${query.beneficiaryYear}-${query.search ?? ''}`}
        projects={projects}
        page={page}
        totalPages={totalPages}
        query={query}
        isPending={isPending}
      />
      <ScrollToTopButton />
    </div>
  );
}
