import { listProjects } from '@/lib/projects/list';
import { parseProjectFilters } from '@/lib/validation/project-filters';

export const PUBLIC_PROJECTS_PAGE_SIZE = 12;

export type PublicProject = {
  id: number;
  name: string;
  department: string;
  description: string;
  reach: number;
};

export type PublicProjectsPage = {
  items: PublicProject[];
  page: number;
  hasMore: boolean;
};

export async function getPublicProjectsPage(
  year: number,
  rawPage: string | undefined
): Promise<PublicProjectsPage> {
  const filters = parseProjectFilters({
    beneficiaryYear: String(year),
    page: rawPage,
    pageSize: String(PUBLIC_PROJECTS_PAGE_SIZE),
  });
  const result = await listProjects(filters);
  const outOfRange = filters.page > result.page;

  return {
    items: outOfRange
      ? []
      : result.items.map((project) => ({
          id: project.id,
          name: project.name,
          department: project.department.name,
          description: project.publicDescription ?? '',
          reach: project.beneficiaries.reduce((sum, record) => sum + record.total, 0),
        })),
    page: result.page,
    hasMore: !outOfRange && result.page < result.totalPages,
  };
}
