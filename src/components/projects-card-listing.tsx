'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import type { ProjectListItem } from '@/lib/projects/list';
import {
  PROJECT_STATUS_META,
  STATUS_FILTERS,
  type StatusFilterValue,
} from '@/lib/projects/constants';

type ProjectsCardListProps = {
  projects: ProjectListItem[];
  total: number;
};

export function ProjectsCardList({ projects, total }: ProjectsCardListProps) {
  const projectYears = Array.from(
    new Set(projects.flatMap((p) => p.beneficiaries.map((b) => b.year)))
  ).sort((a, b) => b - a);

  const [status, setStatus] = useState<StatusFilterValue>('all');
  const [year, setYear] = useState<number>(projectYears[0] ?? new Date().getFullYear());
  const current = STATUS_FILTERS.find((f) => f.value === status)!;

  const filtered = projects.filter(
    (p) => status === 'all' || PROJECT_STATUS_META[p.status].displayStatus === status
  );

  const filteredCountLabel = `${filtered.length} ${filtered.length === 1 ? 'proyecto' : 'proyectos'}`;

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

  return (
    <div className="bg-background flex h-fit w-auto flex-col gap-5 pt-5 pr-4 pb-4 pl-4 lg:px-8 lg:py-7">
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
          <div className="block lg:hidden">
            <Select value={year} onValueChange={(value) => setYear(value as number)}>
              <SelectTrigger className="h-9! w-20.5 rounded-md px-3 py-2 shadow-xs/10">
                <SelectValue className="text-muted-foreground text-sm leading-5 tracking-normal" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={true}>
                {projectYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {newProjectButton}
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-1.5">
          <Tabs value={status} onValueChange={(value) => setStatus(value as StatusFilterValue)}>
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
        <div className="hidden flex-row items-center gap-1.5 lg:flex">
          <Tabs value={year} onValueChange={(value) => setYear(value as number)}>
            <div className="bg-secondary flex h-9 w-fit flex-row items-center rounded-lg px-0.5 py-0.75">
              <TabsList aria-label="Filtrar por año">
                {projectYears.map((y) => (
                  <TabsTrigger
                    key={y}
                    value={y}
                    className={cn(
                      'text-muted-foreground h-7.25 cursor-pointer gap-2.5 rounded-md px-2 py-1 text-sm font-medium',
                      'data-active:bg-card data-active:text-primary data-active:border-border data-active:shadow-sm/10'
                    )}
                  >
                    {y}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>
      </div>
      <p className="text-primary block text-lg leading-7 font-semibold lg:hidden">
        {filteredCountLabel}
      </p>

      {total > projects.length && (
        <p className="text-muted-foreground text-xs">
          Mostrando los primeros {projects.length} de {total} proyectos en total.
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          No hay proyectos con estas características.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(358px,1fr))] gap-4">
          {filtered.map((p) => {
            const yearBeneficiaries = p.beneficiaries.find((b) => b.year === year);
            const totalReach = yearBeneficiaries ? yearBeneficiaries.total : null;
            return (
              <ProjectCard
                key={p.id}
                id={p.id}
                name={p.name}
                status={p.status}
                territory={p.department}
                coordinator={`${p.leadCoordinator.firstName} ${p.leadCoordinator.lastName}`}
                intensity={p.intensity}
                year={year}
                totalReach={totalReach}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
