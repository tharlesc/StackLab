export type StatusVariant = 'success' | 'warning' | 'error' | 'info';

export * from './auth';
export * from './work';
export * from './rdo';

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

export interface MetricItem {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  variant: StatusVariant;
}

export interface ChartData {
  value: number;
  color: string;
}

export interface IndicatorItem {
  id: string;
  label: string;
  value: number;
  color: string;
}
