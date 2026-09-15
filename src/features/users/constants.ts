export type SortBy = 'name' | 'role' | 'status' | 'lastAccess';

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordinador',
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  pendingInvitation: 'Invitación pendiente',
  disabled: 'Deshabilitado',
};

export const STATUS_CLASSNAMES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pendingInvitation: 'bg-amber-100 text-amber-700',
  disabled: 'bg-muted text-muted-foreground',
};

export const ROLE_FILTER_LABELS: Record<string, string> = {
  all: 'Todos los roles',
  admin: 'Administrador',
  coordinator: 'Coordinador',
};

export const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Todos los estados',
  active: 'Activo',
  pendingInvitation: 'Invitación pendiente',
  disabled: 'Deshabilitado',
};

export const SORT_LABELS: Record<SortBy, string> = {
  name: 'Ordenar: Nombre',
  role: 'Ordenar: Rol',
  status: 'Ordenar: Estado',
  lastAccess: 'Ordenar: Último acceso',
};

export const SORT_VALUE_LABELS: Record<SortBy, string> = {
  name: 'Nombre',
  role: 'Rol',
  status: 'Estado',
  lastAccess: 'Último acceso',
};
