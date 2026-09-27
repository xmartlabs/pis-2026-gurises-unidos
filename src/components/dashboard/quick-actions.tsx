import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function DashboardQuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button className="h-9 rounded-[10px] px-4">Cargar métricas</Button>
      <Button
        variant="outline"
        className="h-9 rounded-[10px] px-4"
        nativeButton={false}
        render={<Link href="/dashboard/projects/new" />}
      >
        Nuevo proyecto
      </Button>
      <Button variant="outline" className="h-9 rounded-[10px] px-4">
        Exportar reporte
      </Button>
      <Button variant="outline" className="h-9 rounded-[10px] px-4">
        Publicar dashboard
      </Button>
    </div>
  );
}
