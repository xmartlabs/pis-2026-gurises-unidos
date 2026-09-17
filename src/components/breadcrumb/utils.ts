const RESOURCE_SEGMENTS = new Set(['projects', 'users']);

const STATIC_SEGMENTS = new Set(['dashboard', 'projects', 'users', 'management', 'new', 'edit']);

export const BREADCRUMB_SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Proyectos',
  users: 'Usuarios',
  new: 'Nuevo',
  edit: 'Editar',
};

export function formatBreadcrumbSegment(segment: string): string {
  const decoded = decodeURIComponent(segment);
  return decoded
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isResourceId(segment: string, parent: string | undefined): boolean {
  return Boolean(parent && RESOURCE_SEGMENTS.has(parent) && !STATIC_SEGMENTS.has(segment));
}

function getSegmentLabel(segment: string, segments: string[], index: number): string {
  if (BREADCRUMB_SEGMENT_LABELS[segment]) {
    return BREADCRUMB_SEGMENT_LABELS[segment];
  }

  if (isResourceId(segment, segments[index - 1])) {
    return 'Detalles';
  }

  return formatBreadcrumbSegment(segment);
}

export function getBreadcrumbsFromPathname(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let href = '';

  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    href += `/${segment}`;

    if (isResourceId(segment, segments[index - 1]) && segments[index + 1] === 'edit') {
      continue;
    }

    crumbs.push({ href, label: getSegmentLabel(segment, segments, index) });
  }

  return crumbs;
}
