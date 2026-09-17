export type StatusVariant = 'success' | 'warning' | 'error' | 'info';

export interface ActiveWork {
  id: string;
  name: string;
  subtitle: string;
  statusType: '100% Em Dia' | 'Atenção';
  lastRdo: string;
  weather: string;
  team: string;
  rdoStatus: string;
  actionText?: string;
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
