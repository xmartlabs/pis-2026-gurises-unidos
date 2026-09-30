import Link from 'next/link';
import { Button } from '@/components/ui/button';

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  hash?: string;
};

const BUTTON_CLASSES =
  'bg-card text-foreground hover:bg-card/80 h-9.5 rounded-full px-3 text-sm font-normal sm:px-4';

function PageButton({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (href === null) {
    return (
      <Button className={BUTTON_CLASSES} disabled>
        {children}
      </Button>
    );
  }
  return (
    <Button className={BUTTON_CLASSES} nativeButton={false} render={<Link href={href} />}>
      {children}
    </Button>
  );
}

export function PaginationControls({
  currentPage,
  totalPages,
  basePath,
  hash = '',
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const getHref = (page: number) => `${basePath}?page=${page}${hash}`;

  return (
    <nav
      aria-label="Paginación"
      className="flex w-full items-center justify-center gap-2 pt-4 sm:gap-3"
    >
      <PageButton href={currentPage > 1 ? getHref(currentPage - 1) : null}>Anterior</PageButton>
      <span className="text-muted-foreground text-xs whitespace-nowrap sm:text-sm">
        Página {currentPage} de {totalPages}
      </span>
      <PageButton href={currentPage < totalPages ? getHref(currentPage + 1) : null}>
        Siguiente
      </PageButton>
    </nav>
  );
}
