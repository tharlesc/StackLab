import type {
  User,
  ChartData,
  IndicatorItem,
  ActiveWork,
  Work,
  RDO,
  AppNotification,
  SyncQueueItem,
} from '@/types';
import { lightTheme } from '@/constants/theme';
import { strings } from '@/constants/strings';
import { isoHoursAgo, formatDate } from '@/utils/date';

// Re-export para compatibilidade com imports antigos (`@/mocks`).
export type { AppNotification, NotificationVariant } from '@/types';

/** PIN de segundo fator do Master (MOCK — substituir por biometria/servidor). */
export const MOCK_MASTER_PIN = '1234';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Davi Hudson',
    email: 'davi@stacklab.com',
    role: 'Engenheiro Master',
    crea: 'CREA-MA 123456/D',
    profile: 'master',
    assignedWorkIds: ['w1', 'w2', 'w3', 'w4'],
    active: true,
  },
  {
    id: '2',
    name: 'Tharles',
    email: 'tharles@stacklab.com',
    role: 'Engenheiro Residente',
    crea: 'CREA-MA 987654/D',
    profile: 'common',
    assignedWorkIds: ['w1', 'w2'],
    active: true,
  },
  {
    id: '3',
    name: 'Marcos Silva',
    email: 'marcos@stacklab.com',
    role: 'Encarregado de Obra',
    profile: 'common',
    assignedWorkIds: ['w3'],
    active: true,
  },
  {
    id: '4',
    name: 'Ana Paula',
    email: 'ana@stacklab.com',
    role: 'Estagiária de Engenharia',
    profile: 'common',
    assignedWorkIds: ['w1'],
    active: true,
  },
];

export const MOCK_WORKS: Work[] = [
  {
    id: 'w1',
    name: 'Residencial Alphaville',
    subtitle: 'Torre B — Alvenaria e Estrutura',
    client: 'Alphaville Urbanismo',
    address: 'Av. dos Holandeses, São Luís - MA',
    active: true,
  },
  {
    id: 'w2',
    name: 'Hospital Geral Municipal',
    subtitle: 'Bloco Cirúrgico — Instalações Elétricas',
    client: 'Prefeitura Municipal',
    address: 'Rua do Sol, 120 - Centro',
    active: true,
  },
  {
    id: 'w3',
    name: 'Torre Esmeralda',
    subtitle: 'Fundações e Contenções',
    client: 'Esmeralda Incorporadora',
    address: 'Av. Litorânea, 900',
    active: true,
  },
  {
    id: 'w4',
    name: 'Galpão Logístico Tirirical',
    subtitle: 'Estrutura Metálica',
    client: 'LogMA S.A.',
    address: 'BR-135, Km 8',
    active: false,
  },
  {
    id: 'w5',
    name: 'Residencial Palmeiras',
    subtitle: 'Torre A — Alvenaria e Estrutura',
    client: 'Palmeiras Construtora',
    address: 'Cohama',
    active: false,
  },
];

export const MOCK_CHART_DATA: ChartData[] = [
  { value: 24, color: lightTheme.colors.chart.signed },
  { value: 4, color: lightTheme.colors.chart.inReview },
  { value: 2, color: lightTheme.colors.chart.pending },
];

export const MOCK_INDICATORS: IndicatorItem[] = [
  { id: '1', label: strings.status.plural.aprovado, value: 24, color: lightTheme.colors.chart.signed },
  { id: '2', label: strings.status.plural.submetido, value: 4, color: lightTheme.colors.chart.inReview },
  { id: '3', label: strings.status.plural.devolvido, value: 2, color: lightTheme.colors.chart.pending },
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
    rdoStatus: strings.status.aprovado,
    rdoDate: '27/09/2026',
    rdoNumber: 184,
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
    rdoStatus: strings.status.devolvido,
    rdoDate: '26/09/2026',
    rdoNumber: 185,
  },
  {
    id: 'w3',
    name: 'Torre Esmeralda',
    subtitle: 'Fundações e Contenções',
    statusType: 'Atenção',
    lastRdo: 'Ontem',
    weather: 'Nublado',
    team: '12 Operários',
    rdoStatus: strings.status.submetido,
    rdoDate: '26/09/2026',
    rdoNumber: 187,
  },
];

type RDOSeed = Pick<RDO, 'id' | 'number' | 'workId' | 'authorId' | 'status'> & Partial<RDO>;

const buildRdo = (seed: RDOSeed): RDO => {
  const work = MOCK_WORKS.find((w) => w.id === seed.workId)!;
  const author = MOCK_USERS.find((u) => u.id === seed.authorId)!;
  const createdIso = seed.submittedAt ?? isoHoursAgo(2);
  return {
    version: 1,
    workName: work.name,
    authorName: author.name,
    date: formatDate(createdIso),
    weather: [
      { shift: 'manha', condition: 'Ensolarado' },
      { shift: 'tarde', condition: 'Nublado' },
    ],
    labor: [
      { role: 'Pedreiro', quantity: 4, hours: 8 },
      { role: 'Servente', quantity: 2, hours: 8 },
      { role: 'Armador', quantity: 3, hours: 8 },
    ],
    equipment: [
      { name: 'Betoneira 400L', activeHours: 6, idleHours: 2, idleJustification: 'Aguardando entrega de cimento' },
      { name: 'Guincho de coluna', activeHours: 8, idleHours: 0 },
    ],
    activities: [
      { description: 'Elevação de alvenaria de vedação', location: '3º Pavimento — Ala Norte', unit: 'm²', quantity: 42 },
      { description: 'Concretagem de pilares', location: 'Térreo — Eixos A1 a A6', unit: 'm³', quantity: 8.5 },
    ],
    materials: [{ name: 'Cimento CP-II 50kg (120 sc)', supplier: 'Votorantim', invoice: 'NF-e 45.221' }],
    occurrences: [
      { type: 'dds', description: 'DDS: uso correto de cinto paraquedista em trabalho em altura.' },
      { type: 'pendencia', description: 'Aguardando projeto revisado de instalações hidráulicas.' },
    ],
    photos: [
      { id: 'p1', caption: 'Alvenaria ala norte concluída', takenAt: createdIso, author: author.name },
      { id: 'p2', caption: 'Formas dos pilares antes da concretagem', takenAt: createdIso, author: author.name },
    ],
    comments: [],
    locked: false,
    ...seed,
  } as RDO;
};

export const MOCK_RDOS: RDO[] = [
  buildRdo({
    id: 'rdo-185',
    number: 185,
    workId: 'w2',
    authorId: '2',
    status: 'submetido',
    submittedAt: isoHoursAgo(30),
    weather: [
      { shift: 'manha', condition: 'Chuva', stoppageHours: 2, impact: 'Paralisação da concretagem externa' },
      { shift: 'tarde', condition: 'Nublado' },
    ],
  }),
  buildRdo({ id: 'rdo-187', number: 187, workId: 'w3', authorId: '3', status: 'submetido', submittedAt: isoHoursAgo(26) }),
  buildRdo({ id: 'rdo-186', number: 186, workId: 'w1', authorId: '4', status: 'submetido', submittedAt: isoHoursAgo(3) }),
  buildRdo({
    id: 'rdo-183',
    number: 183,
    workId: 'w2',
    authorId: '2',
    status: 'devolvido',
    submittedAt: isoHoursAgo(50),
    returnReason: 'Refazer a foto 2 — imagem desfocada e sem legenda adequada.',
  }),
  buildRdo({
    id: 'rdo-184',
    number: 184,
    workId: 'w1',
    authorId: '2',
    status: 'aprovado',
    submittedAt: isoHoursAgo(72),
    locked: true,
    signature: {
      signedById: '1',
      signedByName: 'Davi Hudson',
      signedAt: isoHoursAgo(60),
      ip: '177.12.40.8',
      deviceId: 'iPhone-15-A1B2',
      hash: 'SL-9F3A21C7',
    },
  }),
  buildRdo({ id: 'rdo-188', number: 188, workId: 'w1', authorId: '2', status: 'rascunho' }),
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'RDO #184 Aprovado',
    message: 'O relatório diário da obra Residencial Alphaville foi assinado pelo fiscal.',
    time: '10 min atrás',
    variant: 'success',
    isUnread: true,
  },
  {
    id: '5',
    title: 'RDO #183 Devolvido',
    message: 'Refazer a foto 2 — imagem desfocada e sem legenda adequada.',
    time: '1 hora atrás',
    variant: 'error',
    isUnread: true,
    rdoId: 'rdo-183',
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

export const MOCK_SYNC_QUEUE: SyncQueueItem[] = [
  {
    id: 'q1',
    title: 'RDO #185',
    subtitle: 'Residencial Alphaville',
    date: 'Hoje, 16:30',
    status: 'pending',
    size: '2.4 MB',
  },
  {
    id: 'q2',
    title: 'RDO #042',
    subtitle: 'Hospital Geral Municipal',
    date: 'Hoje, 14:15',
    status: 'pending',
    size: '5.1 MB',
  },
];
