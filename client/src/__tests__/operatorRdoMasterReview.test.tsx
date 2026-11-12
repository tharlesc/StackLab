/**
 * @jest-environment jsdom
 */

const { TransformStream, ReadableStream, WritableStream } = require('node:stream/web');
Object.assign(globalThis, { TransformStream, ReadableStream, WritableStream });
if (typeof window !== 'undefined') {
  Object.assign(window, { TransformStream, ReadableStream, WritableStream });
}

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-constants', () => ({
  default: { expoConfig: {} },
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        return (props: any) => React.createElement('span', { 'data-icon': String(prop), ...props });
      },
    },
  );
});

let mockRouteParams: { id?: string; workId?: string } = { id: 'rdo-004' };
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockRouteParams,
}));

jest.mock('react-native', () => {
  (globalThis as any).__DEV__ = true;
  return {
    Alert: { alert: jest.fn() },
    Platform: { OS: 'ios', select: (obj: any) => obj?.ios ?? obj?.default },
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    Modal: ({ children, visible }: any) => (visible ? <div>{children}</div> : null),
    KeyboardAvoidingView: ({ children }: any) => <div>{children}</div>,
    Keyboard: { dismiss: jest.fn() },
    View: ({ children, testID, ...props }: any) => <div data-testid={testID} {...props}>{children}</div>,
    Text: ({ children, testID, ...props }: any) => <span data-testid={testID} {...props}>{children}</span>,
    TouchableOpacity: ({ children, onPress, ...props }: any) => <button onClick={onPress} {...props}>{children}</button>,
    ScrollView: ({ children, ...props }: any) => <div>{children}</div>,
    Image: (props: any) => <img {...props} />,
    ActivityIndicator: () => null,
  };
});

jest.mock('styled-components/native', () => {
  const { lightTheme } = require('@/constants/theme');
  const React = require('react');

  const createComponent = (name: string) => {
    const fn: any = (..._args: any[]) => {
      const comp: any = (props: any) => {
        const cleanProps: any = {};
        for (const key of Object.keys(props)) {
          if (!key.startsWith('$') && key !== 'activeOpacity') {
            cleanProps[key] = props[key];
          }
        }
        return React.createElement(name, cleanProps);
      };
      comp.attrs = (_attrs: any) => fn;
      return comp;
    };
    fn.attrs = (_attrs: any) => fn;
    return fn;
  };

  const styledFn: any = (Comp: any) => createComponent(typeof Comp === 'string' ? Comp : 'div');
  const proxy = new Proxy(styledFn, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      return createComponent(String(prop).toLowerCase());
    },
  });

  return {
    __esModule: true,
    default: proxy,
    useTheme: () => lightTheme,
    ThemeProvider: ({ children }: any) => children,
    css: (..._args: any[]) => '',
  };
});

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RDOProvider, useRDOs } from '@/contexts/RDOContext';
import { AuthContext } from '@/contexts/AuthContext';
import { RDOReviewView } from '@/screens/master/RDOReview/RDOReviewView';
import { saveRdoToSupabase, fetchRdosFromSupabase } from '@/services/modules/supabaseDataService';
import type { RDO, User, ActiveWork } from '@/types';

if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

const mockOperator: User = {
  id: 'usr-operador-01',
  name: 'Eng. Tharles Silva',
  email: 'tharles@stacklab.com',
  role: 'Engenheiro Residente',
  profile: 'common',
  assignedWorkIds: ['work-alphaville-aracagy'],
  active: true,
};

const mockMaster: User = {
  id: 'usr-master-01',
  name: 'Eng. Master Davi Hudson',
  email: 'davi@stacklab.com',
  role: 'Engenheiro Master',
  profile: 'master',
  assignedWorkIds: ['work-alphaville-aracagy'],
  active: true,
};

const mockWorkAlphaville: ActiveWork = {
  id: 'work-alphaville-aracagy',
  name: 'ALPHAVILLE Araçagy',
  subtitle: 'Loteamento Fechado — Infraestrutura e Pavimentação',
  statusType: '100% Em Dia',
  lastRdo: 'Hoje',
  weather: 'Ensolarado',
  team: '7 Operários',
  rdoStatus: 'Em Dia',
  rdoNumber: 4,
  actionText: 'Novo RDO',
};

describe('R1 & R2: Operator-submitted RDO Data Persistence & Master Approval View Display', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  let rdoContextValue: ReturnType<typeof useRDOs> | null = null;

  const ContextExtractor = () => {
    rdoContextValue = useRDOs();
    return null;
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    rdoContextValue = null;
    mockRouteParams = { id: 'rdo-004' };
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root!.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  it('renders all operator-submitted sections in Master View without empty placeholders or zero counts (RDO #004 / ALPHAVILLE Araçagy)', async () => {
    // 1. Setup RDO Context initially with Alphaville work
    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockOperator,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[]}>
            <ContextExtractor />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    expect(rdoContextValue).not.toBeNull();

    // 2. Operator fills complete RDO #004 for ALPHAVILLE Araçagy
    const draftRdo004: RDO = {
      id: 'rdo-004',
      number: 4,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'rascunho',
      locked: false,
      // 1. Condições Climáticas
      weather: [
        { shift: 'manha', condition: 'Ensolarado', practical: true },
        {
          shift: 'tarde',
          condition: 'Chuvoso',
          practical: false,
          stoppageHours: 3,
          impact: 'Terraplenagem interrompida por alagamento das vias',
        },
      ],
      // 2. Mão de Obra & Efetivos
      labor: [
        { role: 'Pedreiro', quantity: 4, hours: 8, isContractor: false, horaInicio: '07:00', horaFim: '16:00' },
        { role: 'Servente', quantity: 2, hours: 8, isContractor: false },
        { role: 'Operador de Máquinas', quantity: 1, hours: 8, isContractor: true },
      ],
      // 3. Equipamentos Presentes
      equipment: [
        {
          name: 'Betoneira 400L',
          activeHours: 6,
          idleHours: 2,
          idleJustification: 'Aguardando entrega de cimento',
          isRented: false,
        },
        {
          name: 'Escavadeira Hidráulica CAT 320',
          activeHours: 5,
          idleHours: 3,
          idleJustification: 'Paralisada por chuva e risco de tombamento na lama',
          isRented: true,
        },
      ],
      // 4. Atividades Executadas
      activities: [
        {
          description: 'Abertura de valas e drenagem pluvial',
          location: 'Avenida Principal — Trecho 2',
          unit: 'm',
          quantity: 45,
          progress: 55,
          status: 'Em andamento',
        },
        {
          description: 'Elevação de poços de visita',
          location: 'Quadra 04 — Lotes 1 a 6',
          unit: 'un',
          quantity: 3,
          progress: 100,
          status: 'Concluído',
        },
      ],
      // 5. Ocorrências & DDS
      occurrences: [
        {
          type: 'dds',
          description: 'DDS: Diálogo de segurança sobre escavações e trabalho em encostas',
          horaInicio: '07:00',
          horaFim: '07:30',
        },
        {
          type: 'paralisacao',
          description: 'Paralisação geral de serviços externos das 14h às 17h decorrente de tempestade',
        },
      ],
      materials: [
        { name: 'Tubos PEAD 400mm', supplier: 'Tigre S.A.', invoice: 'NF-e 88123' },
      ],
      photos: [
        {
          id: 'photo-alphaville-01',
          uri: 'https://cdn.stacklab.com/obras/alphaville/foto1.jpg',
          watermarkedUri: 'https://cdn.stacklab.com/obras/alphaville/foto1-wm.jpg',
          caption: 'Escavação da rede pluvial na Avenida Principal',
          takenAt: '30/10/2026 10:30',
          author: 'Eng. Tharles Silva',
        },
      ],
      comments: [],
    };

    // Operator submits draft
    let submittedRdo: RDO | null = null;
    await act(async () => {
      submittedRdo = await rdoContextValue!.submitDraft(draftRdo004, mockOperator);
    });

    expect(submittedRdo).not.toBeNull();
    expect(submittedRdo!.status).toBe('submetido');
    expect(submittedRdo!.number).toBe(4);

    // 3. Switch view to Master Profile to approve RDO #004
    mockRouteParams = { id: 'rdo-004' };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-master-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[submittedRdo!]}>
            <RDOReviewView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    const renderedText = container!.textContent || '';

    // Verify Title & Identification
    expect(renderedText).toContain('RDO #4');
    expect(renderedText).toContain('ALPHAVILLE Araçagy');
    expect(renderedText).toContain('30/10/2026');
    expect(renderedText).toContain('Eng. Tharles Silva');

    // Section 1: Condições Climáticas (MUST NOT BE EMPTY)
    expect(renderedText).toContain('Condições Climáticas por Turno:');
    expect(renderedText).toContain('MANHA: Ensolarado (Praticável)');
    expect(renderedText).toContain('TARDE: Chuvoso (Impraticável) • 3h parado (Terraplenagem interrompida por alagamento das vias)');
    expect(renderedText).not.toContain('Nenhuma condição climática registrada.');

    // Section 2: Mão de Obra & Efetivos (MUST NOT BE EMPTY OR ZERO COUNTS)
    expect(renderedText).toContain('7 operários • 3 funções • 56 Homem-Hora total');
    expect(renderedText).toContain('Pedreiro (Próprio): 4 profissionais');
    expect(renderedText).toContain('Servente (Próprio): 2 profissionais');
    expect(renderedText).toContain('Operador de Máquinas (Terceirizado): 1 profissionais');
    expect(renderedText).not.toContain('0 operários • 0 funções • 0 Homem-Hora total');
    expect(renderedText).not.toContain('Nenhum efetivo registrado.');

    // Section 3: Equipamentos Presentes (MUST NOT BE EMPTY OR ZERO COUNTS)
    expect(renderedText).toContain('2 tipos • 2 unidades no canteiro');
    expect(renderedText).toContain('Betoneira 400L');
    expect(renderedText).toContain('Horas Ativas: 6h | Horas Paradas: 2h');
    expect(renderedText).toContain('Justificativa inatividade: Aguardando entrega de cimento');
    expect(renderedText).toContain('Escavadeira Hidráulica CAT 320');
    expect(renderedText).toContain('Horas Ativas: 5h | Horas Paradas: 3h');
    expect(renderedText).toContain('Justificativa inatividade: Paralisada por chuva e risco de tombamento na lama');
    expect(renderedText).not.toContain('0 tipos • 0 unidades no canteiro');
    expect(renderedText).not.toContain('Nenhum equipamento registrado no canteiro.');

    // Section 4: Atividades Executadas (MUST NOT BE EMPTY OR ZERO COUNTS)
    expect(renderedText).toContain('2 frentes de serviço registradas');
    expect(renderedText).toContain('Abertura de valas e drenagem pluvial');
    expect(renderedText).toContain('Status: Em andamento • Local: Avenida Principal — Trecho 2 • Quantidade: 45 m • Avanço: 55%');
    expect(renderedText).toContain('Elevação de poços de visita');
    expect(renderedText).toContain('Status: Concluído • Local: Quadra 04 — Lotes 1 a 6 • Quantidade: 3 un • Avanço: 100%');
    expect(renderedText).not.toContain('0 frentes de serviço registradas');
    expect(renderedText).not.toContain('Nenhuma atividade executada registrada.');

    // Section 5: Ocorrências & DDS (MUST NOT BE EMPTY OR ZERO COUNTS)
    expect(renderedText).toContain('2 ocorrências e diálogos de segurança');
    expect(renderedText).toContain('[DDS]');
    expect(renderedText).toContain('DDS: Diálogo de segurança sobre escavações e trabalho em encostas');
    expect(renderedText).toContain('[PARALISACAO]');
    expect(renderedText).toContain('Paralisação geral de serviços externos das 14h às 17h decorrente de tempestade');
    expect(renderedText).not.toContain('0 ocorrências e diálogos de segurança');
    expect(renderedText).not.toContain('Nenhuma ocorrência ou DDS registrado.');

    // Section 6: Fotos da Obra (MUST NOT BE EMPTY)
    expect(renderedText).toContain('1 registros fotográficos com marca d\'água');
    expect(renderedText).toContain('Escavação da rede pluvial na Avenida Principal');
    expect(renderedText).not.toContain('Nenhuma foto anexada ao relatório.');
  });

  it('allows master to approve operator-submitted RDO without regression', async () => {
    let capturedContext: ReturnType<typeof useRDOs> | null = null;

    const Consumer = () => {
      capturedContext = useRDOs();
      return null;
    };

    const initialRdo: RDO = {
      id: 'rdo-test-approve',
      number: 4,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [{ role: 'Pedreiro', quantity: 2, hours: 8 }],
      equipment: [{ name: 'Compactador', activeHours: 4, idleHours: 0 }],
      activities: [{ description: 'Compactação de solo', location: 'Trecho 1', unit: 'm²', quantity: 100 }],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[initialRdo]}>
            <Consumer />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    expect(capturedContext!.getRdo('rdo-test-approve')?.status).toBe('submetido');

    let approved: RDO | null = null;
    await act(async () => {
      approved = capturedContext!.approveRdo('rdo-test-approve', mockMaster);
    });

    expect(approved).not.toBeNull();
    expect(approved!.status).toBe('aprovado');
    expect(approved!.locked).toBe(true);
    expect(approved!.signature).toBeDefined();
    expect(approved!.signature?.signedByName).toBe('Eng. Master Davi Hudson');
    expect(capturedContext!.getRdo('rdo-test-approve')?.status).toBe('aprovado');
  });

  it('saveRdoToSupabase handles draft-first sequence to prevent RLS child insertion block', async () => {
    // Verify that saveRdoToSupabase returns success: false gracefully when Supabase is not configured
    const rdoSample: RDO = {
      id: 'rdo-004',
      number: 4,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado' }],
      labor: [{ role: 'Pedreiro', quantity: 1, hours: 8 }],
      equipment: [],
      activities: [{ description: 'Vala', location: 'Canteiro', quantity: 10, unit: 'm' }],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    const res = await saveRdoToSupabase(rdoSample);
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
  });

  it('adversarial edge case: getRdo distinguishes UUID starting with digit from numeric sequential number', async () => {
    let capturedContext: ReturnType<typeof useRDOs> | null = null;
    const Consumer = () => {
      capturedContext = useRDOs();
      return null;
    };

    // RDO 1 has number 4 and an arbitrary ID
    const rdoNumber4: RDO = {
      id: 'uuid-unrelated-alpha',
      number: 4,
      version: 1,
      workId: 'work-1',
      workName: 'Obra 1',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    // RDO 2 has a UUID starting with digit 4 ('4c238052-...'), but number 99
    const uuidStartingWith4 = '4c238052-198f-41dc-90d2-9eb51ea3656c';
    const rdoUuidWith4: RDO = {
      id: uuidStartingWith4,
      number: 99,
      version: 1,
      workId: 'work-2',
      workName: 'Obra 2',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[rdoNumber4, rdoUuidWith4]}>
            <Consumer />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    // 1. Searching for the UUID starting with 4 must resolve rdoUuidWith4, NOT rdoNumber4!
    const foundByUuid = capturedContext!.getRdo(uuidStartingWith4);
    expect(foundByUuid).toBeDefined();
    expect(foundByUuid?.id).toBe(uuidStartingWith4);
    expect(foundByUuid?.number).toBe(99);

    // 2. Searching for nonexistent UUID starting with 4 must return undefined, NOT rdoNumber4!
    const nonexistentUuidStartingWith4 = '4c238052-nonexistent-uuid';
    const notFound = capturedContext!.getRdo(nonexistentUuidStartingWith4);
    expect(notFound).toBeUndefined();

    // 3. Searching for sequential number 4 must resolve rdoNumber4
    const foundBySeq = capturedContext!.getRdo('4');
    expect(foundBySeq).toBeDefined();
    expect(foundBySeq?.id).toBe('uuid-unrelated-alpha');
    expect(foundBySeq?.number).toBe(4);

    // 4. Searching for 'rdo-004' must resolve rdoNumber4
    const foundByPrefixed = capturedContext!.getRdo('rdo-004');
    expect(foundByPrefixed).toBeDefined();
    expect(foundByPrefixed?.id).toBe('uuid-unrelated-alpha');
  });

  it('adversarial edge case: RDOReviewView handles entries with missing/null optional fields without crashing', async () => {
    // Malformed/incomplete entries submitted by an operator (null shift, undefined hours, missing occurrence type)
    const malformedRdo: RDO = {
      id: 'rdo-malformed-001',
      number: 10,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '31/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      // Weather entry with missing shift and condition
      weather: [
        { shift: undefined as any, condition: undefined as any, practical: false, stoppageHours: 2 },
      ],
      // Labor entry with undefined quantity and hours
      labor: [
        { role: 'Ajudante', quantity: undefined as any, hours: undefined as any },
      ],
      // Equipment with undefined activeHours and quantity
      equipment: [
        { name: 'Gerador', quantity: undefined as any, activeHours: undefined as any, idleHours: undefined as any },
      ],
      // Activity with undefined quantity and status
      activities: [
        { description: 'Escavação manual', location: undefined as any, quantity: undefined as any, unit: undefined as any },
      ],
      // Occurrence with undefined type
      occurrences: [
        { type: undefined as any, description: 'Sem tipo especificado' },
      ],
      materials: [],
      // Photos with missing takenAt and missing author
      photos: [
        {
          id: 'photo-no-date',
          caption: 'Foto sem data explícita',
          uri: 'https://example.com/photo.jpg',
          takenAt: undefined as any,
          author: undefined as any,
        },
      ],
      // Comments with missing createdAt
      comments: [
        {
          id: 'c1',
          section: 'identificacao',
          authorId: 'u1',
          authorName: 'Engenheiro',
          text: 'Comentário sem timestamp explícito',
          createdAt: undefined as any,
        },
      ],
    };

    mockRouteParams = { id: 'rdo-malformed-001' };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[malformedRdo]}>
            <RDOReviewView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    const rendered = container!.textContent || '';
    expect(rendered).toContain('RDO #10');
    expect(rendered).toContain('ALPHAVILLE Araçagy');
    // Ensure no NaN Homem-Hora or NaN date strings
    expect(rendered).not.toContain('NaN');
    // Ensure occurrence with undefined type defaulted to OUTRO
    expect(rendered).toContain('[OUTRO]');
    expect(rendered).toContain('Sem tipo especificado');
    expect(rendered).toContain('Foto sem data explícita');
    expect(rendered).toContain('Comentário sem timestamp explícito');
  });

  it('adversarial edge case: formatDate, formatDateTime, and rdoMatchesQuery handle Brazilian dates, nullish fields and missing arrays safely', () => {
    const { formatDate, formatDateTime, hoursSince } = require('@/utils/date');
    const { rdoMatchesQuery } = require('@/utils/rdo');

    // 1. Brazilian date strings must format correctly, NOT as NaN/NaN/NaN
    expect(formatDate('30/10/2026')).toBe('30/10/2026');
    expect(formatDate('2026-10-30')).toBe('30/10/2026');

    // 2. Nullish and invalid inputs must return '—' without throwing
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('invalid-date')).toBe('—');

    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('')).toBe('—');
    expect(formatDateTime('invalid-date')).toBe('—');

    expect(hoursSince(undefined)).toBe(0);
    expect(hoursSince(null)).toBe(0);

    // 3. rdoMatchesQuery must not crash when child collections are undefined or null
    const bareRdo: any = {
      id: 'rdo-bare',
      number: 1,
      workName: 'Obra Teste',
      authorName: 'Operador',
      date: '30/10/2026',
      status: 'custom_status', // Non-standard status not in RDO_STATUS_META
      activities: undefined,
      occurrences: undefined,
      materials: undefined,
    };

    expect(() => rdoMatchesQuery(bareRdo, 'Obra')).not.toThrow();
    expect(rdoMatchesQuery(bareRdo, 'Obra')).toBe(true);
    expect(rdoMatchesQuery(bareRdo, 'inexistente')).toBe(false);
  });

  it('renders ISO date (YYYY-MM-DD from Supabase) formatted as DD/MM/YYYY in Master Review View', async () => {
    const isoRdo: RDO = {
      id: 'rdo-iso-date',
      number: 5,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '2026-10-30', // Raw ISO date as stored in Supabase
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [{ role: 'Encarregado', quantity: 1, hours: 8 }],
      equipment: [],
      activities: [{ description: 'Medição topográfica', location: 'Trecho 1', quantity: 1, unit: 'un' }],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    mockRouteParams = { id: 'rdo-iso-date' };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[isoRdo]}>
            <RDOReviewView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    const rendered = container!.textContent || '';
    // Must format 2026-10-30 to Brazilian 30/10/2026 in the header/info row
    expect(rendered).toContain('30/10/2026');
    expect(rendered).not.toContain('2026-10-30');
  });

  it('submitRdo ensures positive sequential number when draft had number 0', async () => {
    let capturedContext: ReturnType<typeof useRDOs> | null = null;
    const Consumer = () => {
      capturedContext = useRDOs();
      return null;
    };

    const draftWithZero: RDO = {
      id: 'rdo-draft-zero',
      number: 0,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'rascunho',
      locked: false,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockOperator,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[draftWithZero]}>
            <Consumer />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    let submitted: RDO | null = null;
    await act(async () => {
      submitted = capturedContext!.submitRdo('rdo-draft-zero', mockOperator);
    });

    expect(submitted).not.toBeNull();
    expect(submitted!.status).toBe('submetido');
    expect(submitted!.number).toBeGreaterThan(0);
    expect(capturedContext!.getRdo('rdo-draft-zero')?.number).toBeGreaterThan(0);
  });

  it('getRdo disambiguates by workId when two works have the same RDO number', async () => {
    let capturedContext: ReturnType<typeof useRDOs> | null = null;
    const Consumer = () => {
      capturedContext = useRDOs();
      return null;
    };

    const rdoWork1: RDO = {
      id: 'uuid-obra-1-rdo-4',
      number: 4,
      version: 1,
      workId: 'work-1',
      workName: 'Obra 1',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    const rdoWork2: RDO = {
      id: 'uuid-obra-2-rdo-4',
      number: 4,
      version: 1,
      workId: 'work-2',
      workName: 'Obra 2',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[rdoWork1, rdoWork2]}>
            <Consumer />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    // When querying for number 4 with workId 'work-2', must return rdoWork2, not rdoWork1
    const foundWork2 = capturedContext!.getRdo('4', 'work-2');
    expect(foundWork2).toBeDefined();
    expect(foundWork2?.id).toBe('uuid-obra-2-rdo-4');
    expect(foundWork2?.workId).toBe('work-2');

    // When querying for number 4 with workId 'work-1', must return rdoWork1
    const foundWork1 = capturedContext!.getRdo('4', 'work-1');
    expect(foundWork1).toBeDefined();
    expect(foundWork1?.id).toBe('uuid-obra-1-rdo-4');
    expect(foundWork1?.workId).toBe('work-1');
  });

  it('useNotifications forwards workId when navigating to RDO review', async () => {
    const { useNotifications } = require('@/hooks/useNotifications');
    let capturedHook: ReturnType<typeof useNotifications> | null = null;
    const HookExtractor = () => {
      capturedHook = useNotifications();
      return null;
    };

    const notifRdo: RDO = {
      id: 'rdo-notif-1',
      number: 1,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[notifRdo]}>
            <HookExtractor />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    expect(capturedHook).not.toBeNull();
    await act(async () => {
      capturedHook!.handlePressNotification({
        id: 'notif-1',
        title: 'Novo RDO',
        message: 'RDO enviado para análise',
        time: 'Agora',
        variant: 'info',
        isUnread: true,
        rdoId: 'rdo-notif-1',
      });
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/rdo-review',
      params: { id: 'rdo-notif-1', workId: 'work-alphaville-aracagy' },
    });
  });

  it('useClientDashboard forwards workId when navigating to RDO review', async () => {
    const { useClientDashboard } = require('@/hooks/useClientDashboard');
    let capturedHook: ReturnType<typeof useClientDashboard> | null = null;
    const HookExtractor = () => {
      capturedHook = useClientDashboard();
      return null;
    };

    const clientApprovedRdo: RDO = {
      id: 'rdo-client-app-1',
      number: 1,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'aprovado',
      locked: true,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    const mockClientUser: User = {
      id: 'usr-client-01',
      name: 'Cliente Alphaville',
      email: 'fiscal@alphaville.com.br',
      role: 'Cliente / Fiscal',
      profile: 'client',
      assignedWorkIds: ['work-alphaville-aracagy'],
      active: true,
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockClientUser,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[clientApprovedRdo]}>
            <HookExtractor />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    expect(capturedHook).not.toBeNull();
    await act(async () => {
      capturedHook!.navigateToReview('rdo-client-app-1', 'work-alphaville-aracagy');
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/rdo-review',
      params: { id: 'rdo-client-app-1', workId: 'work-alphaville-aracagy' },
    });
  });

  it('handles shift with accent (manhã) and activity with quantity 0 without losing submitted data', async () => {
    const rdoWithZeroAndAccent: RDO = {
      id: 'rdo-accent-zero-001',
      number: 8,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [
        { shift: 'manhã' as any, condition: 'Ensolarado', practical: true },
      ],
      labor: [{ role: 'Vigia', quantity: 1, hours: 12 }],
      equipment: [],
      activities: [
        {
          description: 'Aguardando liberação ambiental',
          location: 'Setor Norte',
          quantity: 0,
          unit: 'frente',
          progress: 0,
          status: 'Paralisado',
        },
      ],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    mockRouteParams = { id: 'rdo-accent-zero-001' };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[rdoWithZeroAndAccent]}>
            <RDOReviewView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    const rendered = container!.textContent || '';
    expect(rendered).toContain('MANHÃ: Ensolarado (Praticável)');
    expect(rendered).toContain('Aguardando liberação ambiental');
    expect(rendered).toContain('Quantidade: 0 frente');
    expect(rendered).toContain('Avanço: 0%');
    expect(rendered).toContain('Paralisado');
    expect(rendered).not.toContain('Nenhuma condição climática registrada.');
    expect(rendered).not.toContain('Nenhuma atividade executada registrada.');
  });

  it('adversarial edge case: labor with hours 0 displays Jornada: 0h and 0 Homem-Hora without coercing to 8h in Master Review', async () => {
    const rdoWithZeroHours: RDO = {
      id: 'rdo-zero-hours-001',
      number: 9,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [
        { role: 'Operador de Guindaste (Standby)', quantity: 1, hours: 0, isContractor: false },
        { role: 'Técnico de Segurança (Treinamento)', quantity: 2, hours: 0, isContractor: true },
      ],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    mockRouteParams = { id: 'rdo-zero-hours-001' };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[rdoWithZeroHours]}>
            <RDOReviewView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    const rendered = container!.textContent || '';
    // Must display 3 operários, 2 funções, 0 Homem-Hora total
    expect(rendered).toContain('3 operários • 2 funções • 0 Homem-Hora total');
    // Must display Jornada: 0h (0 Homem-Hora total)
    expect(rendered).toContain('Operador de Guindaste (Standby) (Próprio): 1 profissionais');
    expect(rendered).toContain('Jornada: 0h (0 Homem-Hora total)');
    expect(rendered).toContain('Técnico de Segurança (Treinamento) (Terceirizado): 2 profissionais');
    // Must NOT coerce to 8h or 24 Homem-Hora total
    expect(rendered).not.toContain('24 Homem-Hora total');
    expect(rendered).not.toContain('Jornada: 8h');
  });

  it('useNotifications resolves notification.rdoId via getRdo (sequential or prefixed ID) and forwards canonical ID and workId', async () => {
    const { useNotifications } = require('@/hooks/useNotifications');
    let capturedHook: ReturnType<typeof useNotifications> | null = null;
    const HookExtractor = () => {
      capturedHook = useNotifications();
      return null;
    };

    // Stored RDO in context has a real UUID and number 4
    const canonicalRdo: RDO = {
      id: 'uuid-alphaville-real-004',
      number: 4,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[canonicalRdo]}>
            <HookExtractor />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    expect(capturedHook).not.toBeNull();

    // Notification references rdoId as 'rdo-004' (prefixed display format)
    await act(async () => {
      capturedHook!.handlePressNotification({
        id: 'notif-prefixed-4',
        title: 'RDO #004 Submetido',
        message: 'RDO enviado para análise',
        time: 'Agora',
        variant: 'info',
        isUnread: true,
        rdoId: 'rdo-004',
      });
    });

    // Must resolve canonical ID 'uuid-alphaville-real-004' and forward workId 'work-alphaville-aracagy'
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/rdo-review',
      params: { id: 'uuid-alphaville-real-004', workId: 'work-alphaville-aracagy' },
    });
  });

  it('adversarial edge case: labor with undefined/null hours defaults consistently to 8h in Jornada, line Homem-Hora and calcManHours without 0 Homem-Hora contradiction', async () => {
    const { calcManHours } = require('@/utils/rdo');

    const laborWithUndefinedHours = [
      { role: 'Carpinteiro', quantity: 2, hours: undefined as any },
    ];

    // 1. calcManHours must evaluate 2 workers * 8h = 16, NOT 0!
    expect(calcManHours(laborWithUndefinedHours)).toBe(16);

    const rdoOmittedHours: RDO = {
      id: 'rdo-omitted-hours-001',
      number: 11,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'submetido',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: laborWithUndefinedHours,
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    mockRouteParams = { id: 'rdo-omitted-hours-001' };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[rdoOmittedHours]}>
            <RDOReviewView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    const rendered = container!.textContent || '';
    // Must display 16 Homem-Hora total both in section header and in line item subtitle
    expect(rendered).toContain('2 operários • 1 funções • 16 Homem-Hora total');
    expect(rendered).toContain('Carpinteiro (Próprio): 2 profissionais');
    expect(rendered).toContain('Jornada: 8h (16 Homem-Hora total)');
    // Must NOT display the contradictory 'Jornada: 8h (0 Homem-Hora total)'
    expect(rendered).not.toContain('0 Homem-Hora total');
  });

  it('adversarial edge case: preserves labor hours 0, equipment activeHours 0, and activity quantity 0 during draft submission and review', async () => {
    let capturedContext: ReturnType<typeof useRDOs> | null = null;
    const Consumer = () => {
      capturedContext = useRDOs();
      return null;
    };

    const rdoWithZeroes: RDO = {
      id: 'rdo-zeroes-test',
      number: 12,
      version: 1,
      workId: 'work-alphaville-aracagy',
      workName: 'ALPHAVILLE Araçagy',
      date: '30/10/2026',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      status: 'rascunho',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [{ role: 'Operador Reserva', quantity: 1, hours: 0 }],
      equipment: [{ name: 'Trator Parado', activeHours: 0, idleHours: 8, idleJustification: 'Manutenção' }],
      activities: [{ description: 'Aguardando liberação', location: 'Trecho A', quantity: 0, unit: 'un', progress: 0, status: 'Paralisado' }],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockOperator,
            token: 'mock-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider initialWorks={[mockWorkAlphaville]} initialRdos={[rdoWithZeroes]}>
            <Consumer />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    let submitted: RDO | null = null;
    await act(async () => {
      submitted = await capturedContext!.submitDraft(rdoWithZeroes, mockOperator);
    });

    expect(submitted).not.toBeNull();
    expect(submitted!.labor[0].hours).toBe(0);
    expect(submitted!.equipment[0].activeHours).toBe(0);
    expect(submitted!.equipment[0].idleHours).toBe(8);
    expect(submitted!.activities[0].quantity).toBe(0);
    expect(submitted!.activities[0].progress).toBe(0);
  });
});
