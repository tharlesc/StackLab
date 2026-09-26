import type { User, ChartData, IndicatorItem, ActiveWork } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Davi Hudson',
    email: 'davi@stacklab.com',
    role: 'Engenheiro Master',
    crea: 'CREA-MA 123456/D',
    isMaster: true,
  },
  {
    id: '2',
    name: 'Tharles',
    email: 'tharles@stacklab.com',
    role: 'Engenheiro Residente',
    crea: 'CREA-MA 987654/D',
    isMaster: false,
  },
];

export const MOCK_CHART_DATA: ChartData[] = [
  { value: 24, color: '#10B981' },
  { value: 4, color: '#F59E0B' },
  { value: 2, color: '#EF4444' },
];

export const MOCK_INDICATORS: IndicatorItem[] = [
  { id: '1', label: 'Assinados', value: 24, color: '#10B981' },
  { id: '2', label: 'Em Análise', value: 4, color: '#F59E0B' },
  { id: '3', label: 'Pendentes', value: 2, color: '#EF4444' },
];

export const MOCK_ACTIVE_WORKS: ActiveWork[] = [
  {
    id: 'w1',
    name: 'Residencial Alphaville',
    subtitle: 'Torre B — Alvenaria e Estrutura',
    statusType: '100% Em Dia',
    lastRdo: 'Hoje',
    weather: 'Ensolarado',
    team: '24 Operários',
    rdoStatus: 'RDO #184 Validado',
    actionText: 'Novo RDO',
  },
  {
    id: 'w2',
    name: 'Hospital Geral Municipal',
    subtitle: 'Bloco Cirúrgico — Instalações Elétricas',
    statusType: 'Atenção',
    lastRdo: 'Ontem',
    weather: 'Chuva',
    team: 'Eng. Roberto',
    rdoStatus: 'RDO Pendente de Envio',
  },
];

export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  variant: NotificationVariant;
  isUnread: boolean;
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'RDO #184 Validado',
    message: 'O relatório diário da obra Residencial Alphaville foi assinado pelo fiscal.',
    time: '10 min atrás',
    variant: 'success',
    isUnread: true,
  },
  {
    id: '2',
    title: 'Sincronização Pendente',
    message: 'Existem 2 RDOs na fila aguardando conexão com a internet para upload.',
    time: '2 horas atrás',
    variant: 'warning',
    isUnread: true,
  },
  {
    id: '3',
    title: 'Atualização do Sistema',
    message: 'A versão 1.2.0 está disponível com novas melhorias de estabilidade.',
    time: 'Ontem',
    variant: 'info',
    isUnread: false,
  },
  {
    id: '4',
    title: 'Alerta Meteorológico',
    message: 'Previsão de chuva forte para o canteiro do Hospital Geral Municipal.',
    time: 'Ontem',
    variant: 'error',
    isUnread: false,
  },
];

export const MOCK_SYNC_QUEUE = [
  { id: 'q1', title: 'RDO #185', subtitle: 'Residencial Alphaville', date: 'Hoje, 16:30', status: 'pending', size: '2.4 MB' },
  { id: 'q2', title: 'RDO #042', subtitle: 'Hospital Geral Municipal', date: 'Hoje, 14:15', status: 'pending', size: '5.1 MB' }
];
