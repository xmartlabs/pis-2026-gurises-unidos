'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { loadPublicProjectsPage } from '@/app/actions/public-projects';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectCard } from '@/components/projects/project-card';
import type { PublicProject, PublicProjectsPage } from '@/lib/projects/public-projects';

const SCROLL_TOP_THRESHOLD = 300;

type PublicProjectsListProps = {
  year: number;
  initialPage: PublicProjectsPage;
};

export function PublicProjectsList({ year, initialPage }: PublicProjectsListProps) {
  const [projects, setProjects] = useState<PublicProject[]>(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const next = await loadPublicProjectsPage(year, page + 1);
      setProjects((current) => [...current, ...next.items]);
      setPage(next.page);
      setHasMore(next.hasMore);
    } catch {
      setFailed(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [year, page]);

  useEffect(() => {
    const container = containerRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !sentinel || !hasMore || failed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root: container, rootMargin: '0px 0px 200px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, failed, loadMore, projects.length]);

  return (
    <div className="relative w-full max-w-328">
      <ScrollArea
        viewportRef={containerRef}
        viewportClassName="max-h-[70vh] overscroll-contain pr-3.5"
        onViewportScroll={(event) =>
          setShowScrollTop(event.currentTarget.scrollTop > SCROLL_TOP_THRESHOLD)
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              variant="public-dark"
              territory={project.department}
              name={project.name}
              description={project.description}
              reach={project.reach}
            />
          ))}
        </div>
        {hasMore && <div ref={sentinelRef} className="h-px" />}
        {loading && (
          <p role="status" className="text-muted-foreground py-4 text-center text-sm">
            Cargando proyectos...
          </p>
        )}
        {failed && (
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-muted-foreground text-sm">No se pudieron cargar más proyectos.</p>
            <Button variant="outline" onClick={loadMore}>
              Reintentar
            </Button>
          </div>
        )}
      </ScrollArea>
      {showScrollTop && (
        <Button
          size="icon-lg"
          aria-label="Volver al inicio de la lista"
          className="absolute right-4 bottom-4 rounded-full shadow-md"
          onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp />
        </Button>
      )}
    </div>
  );
}
