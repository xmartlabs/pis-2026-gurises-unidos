import {
  ChartNoAxesColumn,
  FileChartColumnIncreasing,
  FolderKanban,
  HomeIcon,
  type LucideIcon,
  Newspaper,
  Users,
} from 'lucide-react';

export type PathMatch = 'exact' | 'prefix';

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  match?: PathMatch;
  children?: readonly NavigationItem[];
}

export interface NavigationGroup {
  id: string;
  title: string;
  items: readonly NavigationItem[];
}

function isPathActive(pathname: string, href: string, match: PathMatch = 'prefix') {
  if (match === 'exact') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isItemActive(pathname: string, item: { href: string; match?: PathMatch }) {
  return isPathActive(pathname, item.href, item.match ?? 'prefix');
}

export const NAV_GROUPS: readonly NavigationGroup[] = [
  {
    id: 'principal',
    title: 'Principal',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '#',
        icon: HomeIcon,
        match: 'exact',
        children: [
          {
            id: 'projects',
            title: 'Proyectos',
            href: '/dashboard/projects',
            icon: FolderKanban,
          },
          {
            id: 'metrics',
            title: 'Métricas',
            href: '#',
            icon: ChartNoAxesColumn,
          },
          {
            id: 'beneficiaries',
            title: 'Beneficiarios',
            href: '#',
            icon: Users,
          },
        ],
      },
      {
        id: 'publications',
        title: 'Publicaciones',
        href: '#',
        icon: Newspaper,
      },
      {
        id: 'reports',
        title: 'Reportes',
        href: '#',
        icon: FileChartColumnIncreasing,
      },
    ],
  },
  {
    id: 'administration',
    title: 'Administración',
    items: [
      {
        id: 'users',
        title: 'Usuarios',
        href: '#',
        icon: Users,
      },
    ],
  },
];

export function flattenNavItems(items: readonly NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => {
    if (!item.children?.length) {
      return [item];
    }

    const { children, ...parent } = item;
    return [parent, ...children];
  });
}
