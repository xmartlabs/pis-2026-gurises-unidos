import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatNumber } from '@/lib/format';
import { INTENSITY_LABEL } from '@/lib/project-display';
import { PROJECT_STATUS_META } from '@/lib/projects/constants';
import type { ProjectListItem } from '@/lib/projects/list';

export type ProjectCardProps = {
  id: number;
  name: string;
  status: ProjectListItem['status'];
  territory: ProjectListItem['department'];
  coordinator: string;
  intensity: ProjectListItem['intensity'];
  year: number | undefined;
  totalReach: number | null;
};

export function ProjectCard({
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
        <CardHeader className="text-primary flex flex-row justify-between p-0! text-base font-semibold">
          <h2>{name}</h2>
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
            {totalReach !== null ? `Beneficiarios ${year}` : 'Sin datos'}
          </p>
          <p className="text-primary text-xl leading-7 font-bold tracking-normal">
            {totalReach !== null ? formatNumber(totalReach) : '—'}
          </p>
        </CardDescription>
      </Card>
    </Link>
  );
}
