import { listProjects } from '@/lib/projects/list';
import { PROJECT_LIST_MAX_PAGE_SIZE, parseProjectFilters } from '@/lib/validation/project-filters';

export async function getYearProjects(year: number) {
  const filters = parseProjectFilters({
    beneficiaryYear: String(year),
    pageSize: String(PROJECT_LIST_MAX_PAGE_SIZE),
  });
  const firstPage = await listProjects(filters);
  const otherPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      listProjects({ ...filters, page: index + 2 })
    )
  );
  return [firstPage, ...otherPages].flatMap((page) => page.items);
}
