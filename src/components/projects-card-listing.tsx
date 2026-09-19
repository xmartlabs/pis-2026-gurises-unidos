'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Prisma } from '@/generated/prisma/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from 'cn';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { sumBeneficiaries, INTENSITY_LABEL } from '@/lib/project-display';
import { formatNumber } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus } from '@/generated/prisma/enums';

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    leadCoordinator: { select: { firstName: true; lastName: true } };
    department: true;
    projectBeneficiaries: true;
  };
}>;

type ProjectStatusDisplay = 'active' | 'paused' | 'closed';

const PROJECT_STATUS_META: Record<
  ProjectStatus,
  {
    displayStatus: ProjectStatusDisplay;
    label: string;
    badgeVariant: 'active' | 'pending' | 'disabled';
  }
> = {
  active: { displayStatus: 'active', label: 'Activo', badgeVariant: 'active' },
  inProgress: { displayStatus: 'active', label: 'Activo', badgeVariant: 'active' },
  archived: { displayStatus: 'paused', label: 'Pausado', badgeVariant: 'pending' },
  completed: { displayStatus: 'closed', label: 'Cerrado', badgeVariant: 'disabled' },
};

type ProjectCardProps = {
  id: number;
  name: string;
  status: ProjectWithRelations['status'];
  territory: ProjectWithRelations['department'];
  coordinator: string;
  intensity: ProjectWithRelations['intensity'];
  year: number;
  totalReach: number;
};

function ProjectCard({
  id,
  name,
  status,
  territory,
  coordinator,
  intensity,
  year,
  totalReach,
}: ProjectCardProps) {
  const statusMeta = PROJECT_STATUS_META[status];

  return (
    <Link href={`/dashboard/projects/${id}`} className="block">
      <Card className="bg-card flex flex-col gap-3.5 rounded-lg px-5 py-4.5 hover:shadow-sm/10">
        <CardHeader className="text-primary flex flex-row justify-between p-0! text-[16px] font-semibold">
          <h1>{name}</h1>
          <Badge
            variant={statusMeta.badgeVariant}
            className="h-5.5 gap-2.5 rounded-lg px-5.5 py-0.5 text-xs leading-4 font-medium tracking-normal"
          >
            {statusMeta.label}
          </Badge>
        </CardHeader>
        <div className="flex flex-col gap-1.5">
          <CardDescription className="flex flex-row justify-between">
            <p className="text-muted-foreground text-xs leading-4 font-normal tracking-normal">
              Territorio
            </p>
            <p className="text-foreground text-xs leading-4 font-medium tracking-normal">
              {territory.name}
            </p>
          </CardDescription>
          <CardDescription className="flex flex-row justify-between">
            <p className="text-muted-foreground text-xs leading-4 font-normal tracking-normal">
              Coordinador/a
            </p>
            <p className="text-foreground text-xs leading-4 font-medium tracking-normal">
              {coordinator}
            </p>
          </CardDescription>
          <CardDescription className="flex flex-row justify-between">
            <p className="text-muted-foreground text-xs leading-4 font-normal tracking-normal">
              Intensidad
            </p>
            <p className="text-foreground text-xs leading-4 font-medium tracking-normal">
              {INTENSITY_LABEL[intensity]}
            </p>
          </CardDescription>
        </div>
        <Separator />
        <CardDescription className="flex flex-row items-center justify-between">
          <p className="text-muted-foreground text-xs leading-4 font-normal tracking-normal">
            Beneficiarios {year}
          </p>
          <p className="text-primary text-[20px] leading-7 font-bold tracking-normal">
            {formatNumber(totalReach)}
          </p>
        </CardDescription>
      </Card>
    </Link>
  );
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos', title: 'Proyectos' },
  { value: 'active', label: 'Activos', title: 'Proyectos activos' },
  { value: 'paused', label: 'Pausados', title: 'Proyectos pausados' },
  { value: 'closed', label: 'Cerrados', title: 'Proyectos cerrados' },
] as const;

type StatusFilterValue = (typeof STATUS_FILTERS)[number]['value'];

export function ProjectsCardList({ projects }: { projects: ProjectWithRelations[] }) {
  const projectYears = Array.from(
    new Set(projects.flatMap((p) => p.projectBeneficiaries.map((b) => b.year)))
  ).sort((a, b) => b - a);

  const [status, setStatus] = useState<StatusFilterValue>('all');
  const [year, setYear] = useState<number | undefined>(projectYears[0]);
  const current = STATUS_FILTERS.find((f) => f.value === status)!;

  const filtered = projects.filter(
    (p) =>
      (status === 'all' || PROJECT_STATUS_META[p.status].displayStatus === status) &&
      p.projectBeneficiaries.some((b) => b.year === year)
  );

  return (
    <div className="bg-background flex h-screen w-auto flex-col gap-5 pt-5 pr-4 pb-4 pl-4 lg:px-8 lg:py-7">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-muted-foreground block text-xs leading-4 font-medium lg:hidden">
            Proyectos
          </p>
          <h1 className="text-primary shrink-0 grow text-2xl leading-8 font-bold tracking-normal">
            {current.title}
          </h1>
        </div>
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
        <div className="hidden justify-end lg:flex">
          <Button
            variant="outline"
            className="h-8 gap-2.5 rounded-md px-3 shadow-xs/10"
            nativeButton={false}
            render={<Link href="/dashboard/projects/new" />}
          >
            <p className="text-primary text-sm leading-5 font-medium tracking-normal">
              + Nuevo proyecto
            </p>
          </Button>
        </div>
      </div>
      <div className="flex justify-end lg:hidden">
        <Button
          variant="outline"
          className="h-8 gap-2.5 rounded-md px-3 shadow-xs/10"
          nativeButton={false}
          render={<Link href="/dashboard/projects/new" />}
        >
          <p className="text-primary text-sm leading-5 font-medium tracking-normal">
            Nuevo proyecto
          </p>
        </Button>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-1.5">
          <Tabs value={status} onValueChange={(value) => setStatus(value as StatusFilterValue)}>
            <div className="bg-secondary flex h-9 w-fit flex-row items-center rounded-lg px-0.5 py-0.75">
              <TabsList>
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
            {filtered.length} proyectos
          </p>
        </div>
        <div className="hidden flex-row items-center gap-1.5 lg:flex">
          <Tabs value={year} onValueChange={(value) => setYear(value as number)}>
            <div className="bg-secondary flex h-9 w-fit flex-row items-center rounded-lg px-0.5 py-0.75">
              <TabsList>
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
        {filtered.length} proyectos
      </p>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          No hay proyectos con estas características.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(358px,1fr))] gap-4">
          {filtered.map((p) => {
            const yearBeneficiaries = p.projectBeneficiaries.find((b) => b.year === year)!;
            const totalReach = sumBeneficiaries(yearBeneficiaries);
            return (
              <ProjectCard
                key={p.id}
                id={p.id}
                name={p.name}
                status={p.status}
                territory={p.department}
                coordinator={`${p.leadCoordinator.firstName} ${p.leadCoordinator.lastName}`}
                intensity={p.intensity}
                year={year!}
                totalReach={totalReach}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
