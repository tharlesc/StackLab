import type { User, UserProfile } from '@/types';

/**
 * 🔐 Matriz de Permissões (RBAC) — fonte única de verdade no client.
 * Deve espelhar o middleware de autorização do backend (roadmap server §2).
 */
export const PERMISSIONS = {
  // Operacional
  RDO_CREATE: 'rdo:create',
  RDO_EDIT_OWN_DRAFT: 'rdo:edit-own-draft',
  RDO_SUBMIT: 'rdo:submit',
  RDO_FIX_RETURNED: 'rdo:fix-returned',

  // Visibilidade
  WORKS_VIEW_ASSIGNED: 'works:view-assigned',
  WORKS_VIEW_ALL: 'works:view-all',
  SEARCH_GLOBAL: 'search:global',
  DASHBOARD_ANALYTICS: 'dashboard:analytics',

  // Master — cadeia de aprovação
  RDO_REVIEW: 'rdo:review',
  RDO_COMMENT: 'rdo:comment',
  RDO_AUDITED_EDIT: 'rdo:audited-edit',
  RDO_RETURN: 'rdo:return',
  RDO_APPROVE_SIGN: 'rdo:approve-sign',
  RDO_RECTIFY: 'rdo:rectify',
  AUDIT_VIEW: 'audit:view',

  // Master — administração e exportação
  ADMIN_WORKS: 'admin:works',
  ADMIN_USERS: 'admin:users',
  ADMIN_ACCESS_MATRIX: 'admin:access-matrix',
  EXPORT_PDF: 'export:pdf',
  EXPORT_CSV: 'export:csv',
  EXPORT_PHOTOS: 'export:photos',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const COMMON_PERMISSIONS: Permission[] = [
  PERMISSIONS.RDO_CREATE,
  PERMISSIONS.RDO_EDIT_OWN_DRAFT,
  PERMISSIONS.RDO_SUBMIT,
  PERMISSIONS.RDO_FIX_RETURNED,
  PERMISSIONS.WORKS_VIEW_ASSIGNED,
];

const MASTER_PERMISSIONS: Permission[] = [
  PERMISSIONS.WORKS_VIEW_ASSIGNED,
  PERMISSIONS.WORKS_VIEW_ALL,
  PERMISSIONS.SEARCH_GLOBAL,
  PERMISSIONS.DASHBOARD_ANALYTICS,
  PERMISSIONS.RDO_REVIEW,
  PERMISSIONS.RDO_COMMENT,
  PERMISSIONS.RDO_AUDITED_EDIT,
  PERMISSIONS.RDO_RETURN,
  PERMISSIONS.RDO_APPROVE_SIGN,
  PERMISSIONS.RDO_RECTIFY,
  PERMISSIONS.AUDIT_VIEW,
  PERMISSIONS.ADMIN_WORKS,
  PERMISSIONS.ADMIN_USERS,
  PERMISSIONS.ADMIN_ACCESS_MATRIX,
  PERMISSIONS.EXPORT_PDF,
  PERMISSIONS.EXPORT_CSV,
  PERMISSIONS.EXPORT_PHOTOS,
];

export const ROLE_PERMISSIONS: Record<UserProfile, readonly Permission[]> = {
  common: COMMON_PERMISSIONS,
  master: MASTER_PERMISSIONS,
};

export const PROFILE_LABELS: Record<UserProfile, string> = {
  common: 'Operacional',
  master: 'Master',
};

export const hasPermission = (user: User | null | undefined, permission: Permission): boolean =>
  !!user && ROLE_PERMISSIONS[user.profile].includes(permission);

export const isMaster = (user: User | null | undefined): boolean => user?.profile === 'master';
