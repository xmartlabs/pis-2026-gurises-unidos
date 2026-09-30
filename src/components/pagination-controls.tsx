import Link from 'next/link';
import { Button } from '@/components/ui/button';

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  hash?: string;
};

export function PaginationControls({
  currentPage,
  totalPages,
  basePath,
  hash = '',
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const getHref = (page: number) => `${basePath}?page=${page}${hash}`;

  return (
    <nav aria-label="Paginación" className="flex w-full items-center justify-center gap-3 pt-4">
      <Button
        className="bg-card text-foreground hover:bg-card/80 h-9.5 rounded-full px-4 text-sm font-normal"
        disabled={currentPage === 1}
        nativeButton={false}
        render={<Link href={getHref(currentPage - 1)} />}
      >
        Anterior
      </Button>
      <span className="text-muted-foreground text-sm">
        Página {currentPage} de {totalPages}
      </span>
      <Button
        className="bg-card text-foreground hover:bg-card/80 h-9.5 rounded-full px-4 text-sm font-normal"
        disabled={currentPage === totalPages}
        nativeButton={false}
        render={<Link href={getHref(currentPage + 1)} />}
      >
        Siguiente
      </Button>
    </nav>
  );
}
