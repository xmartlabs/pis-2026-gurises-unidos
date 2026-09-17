import { UserRole, UserStatus } from '@/generated/prisma/enums';

export const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Activo',
  pendingInvitation: 'Invitación pendiente',
  disabled: 'Deshabilitado',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  coordinator: 'Coordinador',
};
