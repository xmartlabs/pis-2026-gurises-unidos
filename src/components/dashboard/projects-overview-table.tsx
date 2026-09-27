import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber } from '@/lib/format';
import { INTENSITY_LABEL } from '@/lib/project-display';
import { PROJECT_STATUS_META } from '@/lib/projects/constants';
import type { DashboardProjectRow } from '@/lib/dashboard/mock-data';

type ProjectsOverviewTableProps = {
  projects: DashboardProjectRow[];
  total: number;
  year: number;
};

export function ProjectsOverviewTable({ projects, total, year }: ProjectsOverviewTableProps) {
  return (
    <div className="bg-card border-border overflow-hidden rounded-[14px] border">
      <div className="flex flex-col gap-3 p-4 lg:hidden">
        {projects.map((project) => {
          const statusMeta = PROJECT_STATUS_META[project.status];
          return (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="block">
              <Card className="gap-3 py-4 hover:shadow-sm/10">
                <CardContent className="flex items-center justify-between px-4">
                  <p className="text-foreground font-medium">{project.name}</p>
                  <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
                </CardContent>
                <CardContent className="flex flex-col gap-1.5 px-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Intensidad</span>
                    <span className="text-foreground text-sm">
                      {INTENSITY_LABEL[project.intensity]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Beneficiarios {year}</span>
                    <span className="text-foreground text-base font-semibold">
                      {formatNumber(project.beneficiaries)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="hidden lg:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="text-muted-foreground h-auto px-4 py-2.5 text-xs font-medium">
                Proyecto
              </TableHead>
              <TableHead className="text-muted-foreground h-auto px-4 py-2.5 text-xs font-medium">
                Estado
              </TableHead>
              <TableHead className="text-muted-foreground h-auto px-4 py-2.5 text-xs font-medium">
                Intensidad
              </TableHead>
              <TableHead className="text-muted-foreground h-auto px-4 py-2.5 text-right text-xs font-medium">
                Beneficiarios
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const statusMeta = PROJECT_STATUS_META[project.status];
              return (
                <TableRow key={project.id} className="relative cursor-pointer">
                  <TableCell className="text-foreground h-[46px] px-4 py-3 font-medium">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="after:absolute after:inset-0"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
                  </TableCell>
                  <TableCell className="text-foreground px-4 py-3">
                    {INTENSITY_LABEL[project.intensity]}
                  </TableCell>
                  <TableCell className="text-foreground px-4 py-3 text-right font-medium">
                    {formatNumber(project.beneficiaries)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="border-border bg-surface-page flex flex-col gap-1 border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Total {year}</span>
          <span className="text-foreground text-sm font-semibold">{formatNumber(total)}</span>
        </div>
        <p className="text-muted-foreground text-xs">
          Proyectos activos durante el período {year}
        </p>
      </div>
    </div>
  );
}
