export type StatusVariant = 'success' | 'warning' | 'error' | 'info';

export * from './auth';
export * from './work';
export * from './rdo';
export * from './ui';

export type NotificationVariant = StatusVariant;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  variant: NotificationVariant;
  isUnread: boolean;
  /** RDO relacionado (ex.: devolução) — permite navegação direta. */
  rdoId?: string;
}
