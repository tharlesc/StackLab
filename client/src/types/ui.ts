import type { ReactNode } from 'react';
import type { StatusVariant } from './index';

export interface MetricItem {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  variant: StatusVariant;
}

export interface ChartData {
  value: number;
  color: string;
  label?: string;
}

export interface IndicatorItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface SyncQueueItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status: string;
  size: string;
}
