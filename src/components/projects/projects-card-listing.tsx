'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectCardSkeleton } from '@/components/projects/projects-card-listing-skeleton';
import { loadProjectsPage } from '@/app/actions/projects';
import type { ProjectListItem } from '@/lib/projects/list';
import { STATUS_FILTERS, type StatusFilterValue } from '@/lib/projects/constants';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';

const ALL_YEARS = 'all';
const LOAD_MORE_MARGIN = '400px';
const LOADING_SKELETONS = 3;

type YearFilterValue = number | typeof ALL_YEARS;

type ProjectsCardListProps = {
  projects: ProjectListItem[];
  total: number;
  page: number;
  totalPages: number;
  years: number[];
  status: StatusFilterValue;
  beneficiaryYear: number | undefined;
};

export function ProjectsCardList({
  projects,
  total,
  page,
  totalPages,
  years,
  status,
  beneficiaryYear,
}: ProjectsCardListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const year: YearFilterValue = beneficiaryYear ?? ALL_YEARS;
  const yearOptions: { value: YearFilterValue; label: string }[] = [
    { value: ALL_YEARS, label: 'Todos' },
    ...years.map((y) => ({ value: y, label: String(y) })),
  ];

  const current = STATUS_FILTERS.find((f) => f.value === status) ?? STATUS_FILTERS[0];

  function updateFilter(key: 'status' | 'beneficiaryYear', value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  }

  const [items, setItems] = useState(projects);
  const [pagination, setPagination] = useState({ page, totalPages });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = pagination.page < pagination.totalPages;

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    setLoadFailed(false);
    try {
      const next = await loadProjectsPage(
        { status, beneficiaryYear: String(beneficiaryYear ?? ALL_YEARS) },
        pagination.page + 1
      );
      setItems((loaded) => {
        const loadedIds = new Set(loaded.map((p) => p.id));
        return [...loaded, ...next.items.filter((p) => !loadedIds.has(p.id))];
      });
      setPagination({ page: next.page, totalPages: next.totalPages });
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [status, beneficiaryYear, pagination.page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore || loadFailed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { rootMargin: LOAD_MORE_MARGIN }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadFailed, loadMore]);

  const cards = items.flatMap((project) => {
    const cardBeneficiaries = project.beneficiaries.length > 0 ? project.beneficiaries : [null];
    return cardBeneficiaries.map((yearBeneficiaries) => ({ project, yearBeneficiaries }));
  });

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
          <div className="block lg:hidden">{yearSelect}</div>
          {newProjectButton}
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-1.5">
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
        <div className="hidden flex-row items-center gap-1.5 lg:flex">{yearSelect}</div>
      </div>
      <p className="text-primary block text-lg leading-7 font-semibold lg:hidden">
        {filteredCountLabel}
      </p>

      {cards.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          No hay proyectos con estas características.
        </p>
      ) : (
        <div
          aria-busy={isPending || isLoadingMore}
          className={cn(
            'grid grid-cols-[repeat(auto-fill,minmax(358px,1fr))] gap-4 transition-opacity',
            isPending && 'opacity-60'
          )}
        >
          {cards.map(({ project: p, yearBeneficiaries }) => (
            <ProjectCard
              key={`${p.id}-${yearBeneficiaries?.year ?? 'none'}`}
              id={p.id}
              name={p.name}
              status={p.status}
              territory={p.department}
              coordinator={`${p.leadCoordinator.firstName} ${p.leadCoordinator.lastName}`}
              intensity={p.intensity}
              year={yearBeneficiaries?.year ?? p.startYear}
              totalReach={yearBeneficiaries?.total ?? null}
            />
          ))}
          {isLoadingMore &&
            Array.from({ length: LOADING_SKELETONS }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
        </div>
      )}

      {loadFailed && (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-muted-foreground text-sm">No se pudieron cargar más proyectos.</p>
          <Button variant="outline" onClick={() => void loadMore()}>
            Reintentar
          </Button>
        </div>
      )}
      {hasMore && <div ref={sentinelRef} aria-hidden="true" />}
      <ScrollToTopButton />
    </div>
  );
}
