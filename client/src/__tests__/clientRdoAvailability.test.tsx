/**
 * @jest-environment jsdom
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RDOProvider, useRDOs } from '@/contexts/RDOContext';
import { isRdoAvailableToClient, getAvailableActions } from '@/services/modules/rdoWorkflow';
import type { RDO, User, ActiveWork } from '@/types';

if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

const mockMaster: User = {
  id: 'master-1',
  name: 'Engenheiro Master',
  profile: 'master',
  role: 'Diretor Técnico',
  email: 'master@stacklab.com',
  assignedWorkIds: ['obra-alpha'],
};

const mockClient: User = {
  id: 'client-1',
  name: 'Carlos Contratante',
  profile: 'client',
  role: 'Cliente / Fiscal',
  email: 'carlos@cliente.com',
  assignedWorkIds: ['obra-alpha'],
};

const mockWorks: ActiveWork[] = [
  {
    id: 'obra-alpha',
    name: 'Residencial Alpha',
    subtitle: 'Edifício Residencial',
    statusType: '100% Em Dia',
    lastRdo: 'Hoje',
    weather: 'Ensolarado',
    team: '15 Operários',
    rdoStatus: 'Em Dia',
    actionText: 'Novo RDO',
  },
];

const mockInitialRdos: RDO[] = [
  {
    id: 'rdo-sub-1',
    number: 1,
    version: 1,
    workId: 'obra-alpha',
    workName: 'Residencial Alpha',
    date: '2026-11-10',
    authorId: 'worker-1',
    authorName: 'Operador Campo',
    status: 'submetido',
    submittedAt: '2026-11-10T10:00:00Z',
    weather: [{ shift: 'manha', condition: 'Ensolarado' }],
    labor: [{ role: 'Pedreiro', quantity: 4, hours: 8 }],
    equipment: [],
    activities: [{ description: 'Alvenaria', location: '1º Pavimento', quantity: 20, unit: 'm²' }],
    materials: [],
    occurrences: [],
    photos: [],
    comments: [],
    locked: false,
  },
  {
    id: 'rdo-draft-1',
    number: 2,
    version: 1,
    workId: 'obra-alpha',
    workName: 'Residencial Alpha',
    date: '2026-11-10',
    authorId: 'worker-1',
    authorName: 'Operador Campo',
    status: 'rascunho',
    weather: [],
    labor: [],
    equipment: [],
    activities: [],
    materials: [],
    occurrences: [],
    photos: [],
    comments: [],
    locked: false,
  },
];

describe('Disponibilização Automática de RDO para o Cliente', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  let contextValue: ReturnType<typeof useRDOs> | null = null;

  const TestConsumer = () => {
    contextValue = useRDOs();
    return null;
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    contextValue = null;

    await act(async () => {
      root!.render(
        <RDOProvider initialWorks={mockWorks} initialRdos={mockInitialRdos}>
          <TestConsumer />
        </RDOProvider>,
      );
    });
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root!.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('RDOs em rascunho ou submetidos NÃO são disponibilizados para o cliente', () => {
    const allRdos = contextValue!.rdos;
    const clientAvailableRdos = allRdos.filter(
      (r) => r.workId === 'obra-alpha' && isRdoAvailableToClient(r),
    );

    expect(clientAvailableRdos).toHaveLength(0);
    expect(isRdoAvailableToClient(contextValue!.getRdo('rdo-sub-1'))).toBe(false);
    expect(isRdoAvailableToClient(contextValue!.getRdo('rdo-draft-1'))).toBe(false);
  });

  it('Perfil cliente possui ações vazias no workflow (somente leitura)', () => {
    expect(getAvailableActions('rascunho', 'client')).toEqual([]);
    expect(getAvailableActions('submetido', 'client')).toEqual([]);
    expect(getAvailableActions('aprovado', 'client')).toEqual([]);
    expect(getAvailableActions('devolvido', 'client')).toEqual([]);
  });

  it('Quando o Master aprova e assina o RDO, ele se torna automaticamente disponível para o cliente da obra', async () => {
    // 1. Antes da aprovação: 0 disponíveis para o cliente
    let clientAvailableRdos = contextValue!.rdos.filter(
      (r) => r.workId === 'obra-alpha' && isRdoAvailableToClient(r),
    );
    expect(clientAvailableRdos).toHaveLength(0);

    // 2. Master aprova e assina o RDO #1
    let approvedRdo: RDO;
    await act(async () => {
      approvedRdo = contextValue!.approveRdo('rdo-sub-1', mockMaster);
    });

    // 3. Verifica assinatura e imutabilidade
    expect(approvedRdo!.status).toBe('aprovado');
    expect(approvedRdo!.locked).toBe(true);
    expect(approvedRdo!.signature).toBeDefined();
    expect(approvedRdo!.signature?.signedById).toBe(mockMaster.id);
    expect(approvedRdo!.signature?.signedByName).toBe(mockMaster.name);
    expect(approvedRdo!.signature?.hash).toMatch(/^SL-[0-9A-F]{8}$/);

    // 4. Automaticamente disponibilizado para o cliente da obra no estado atualizado
    clientAvailableRdos = contextValue!.rdos.filter(
      (r) => r.workId === 'obra-alpha' && isRdoAvailableToClient(r),
    );
    expect(clientAvailableRdos).toHaveLength(1);
    expect(clientAvailableRdos[0]!.id).toBe('rdo-sub-1');
    expect(clientAvailableRdos[0]!.status).toBe('aprovado');
    expect(clientAvailableRdos[0]!.locked).toBe(true);
  });
});
