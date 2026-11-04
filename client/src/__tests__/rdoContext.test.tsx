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
import { getDraftStorageKey, WorkflowError } from '@/services/modules/rdoWorkflow';
import type { RDO, User } from '@/types';

// Polyfill globals for React 19 testing in Node environment if missing
if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

const mockWorker: User = {
  id: 'worker-ctx-1',
  name: 'Operário Context',
  profile: 'common',
  role: 'Encarregado',
  email: 'ctx@stacklab.com',
  assignedWorkIds: ['work-ctx-10'],
};

describe('RDOContext Adversarial & Lifecycle Verification', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  let contextValue: ReturnType<typeof useRDOs> | null = null;

  const TestConsumer = () => {
    contextValue = useRDOs();
    return null;
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    contextValue = null;

    await act(async () => {
      root!.render(
        <RDOProvider>
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
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  it('provides all draft lifecycle methods in context', () => {
    expect(contextValue).toBeDefined();
    expect(typeof contextValue!.createDraft).toBe('function');
    expect(typeof contextValue!.saveDraft).toBe('function');
    expect(typeof contextValue!.loadDraft).toBe('function');
    expect(typeof contextValue!.discardDraft).toBe('function');
    expect(typeof contextValue!.submitDraft).toBe('function');
  });

  it('creates, saves, loads, and discards draft via context methods', async () => {
    const draft = contextValue!.createDraft({
      workId: 'work-ctx-10',
      workName: 'Obra Contextual',
      author: mockWorker,
      initialData: {
        date: '29/10/2026',
        labor: [{ role: 'Carpinteiro', quantity: 2, hours: 8 }],
      },
    });

    expect(draft.workId).toBe('work-ctx-10');
    expect(draft.status).toBe('rascunho');

    // Save draft
    await act(async () => {
      await contextValue!.saveDraft('work-ctx-10', draft);
    });

    const storedRaw = await AsyncStorage.getItem(getDraftStorageKey('work-ctx-10'));
    expect(storedRaw).not.toBeNull();
    expect(JSON.parse(storedRaw!).workId).toBe('work-ctx-10');

    // Load draft
    let loaded: Partial<RDO> | null = null;
    await act(async () => {
      loaded = await contextValue!.loadDraft('work-ctx-10');
    });
    expect(loaded).not.toBeNull();
    expect(loaded!.workId).toBe('work-ctx-10');

    // Discard draft
    await act(async () => {
      await contextValue!.discardDraft('work-ctx-10');
    });

    let loadedAfterDiscard: Partial<RDO> | null = null;
    await act(async () => {
      loadedAfterDiscard = await contextValue!.loadDraft('work-ctx-10');
    });
    expect(loadedAfterDiscard).toBeNull();
  });

  it('handles corrupt JSON in loadDraft without throwing (returns null)', async () => {
    const key = getDraftStorageKey('work-corrupt-json');
    await AsyncStorage.setItem(key, '{ invalid json truncated');

    let loaded: Partial<RDO> | null = null;
    await act(async () => {
      loaded = await contextValue!.loadDraft('work-corrupt-json');
    });

    expect(loaded).toBeNull();
  });

  it('rejects submitDraft when domain pre-validation fails (e.g. zero headcount)', async () => {
    const invalidDraft = contextValue!.createDraft({
      workId: 'work-ctx-10',
      workName: 'Obra Falha',
      author: mockWorker,
      initialData: {
        labor: [], // 0 headcount
        activities: [{ description: 'Serviço', location: 'Térreo', unit: 'un', quantity: 1 }],
      },
    });

    let errorThrown: any = null;
    await act(async () => {
      try {
        await contextValue!.submitDraft(invalidDraft, mockWorker);
      } catch (err) {
        errorThrown = err;
      }
    });

    expect(errorThrown).toBeInstanceOf(WorkflowError);
    expect(errorThrown.message).toContain('Informe ao menos 1 colaborador no efetivo.');
  });

  it('submits valid draft, updates rdos state, registers audit log, and cleans storage draft', async () => {
    const validDraft: RDO = {
      id: 'rdo-draft-submission-test',
      number: 0,
      version: 1,
      workId: 'work-ctx-10',
      workName: 'Obra Submissão',
      date: '29/10/2026',
      authorId: mockWorker.id,
      authorName: mockWorker.name,
      status: 'rascunho',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [{ role: 'Pedreiro', quantity: 3, hours: 8 }],
      equipment: [{ name: 'Trator', activeHours: 4, idleHours: 0 }],
      activities: [{ description: 'Terraplenagem', location: 'Setor 1', unit: 'm²', quantity: 50, progress: 10 }],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    // Pre-save to storage to verify auto-cleanup
    await AsyncStorage.setItem(getDraftStorageKey('work-ctx-10'), JSON.stringify(validDraft));

    let submittedRdo: RDO | null = null;
    await act(async () => {
      submittedRdo = await contextValue!.submitDraft(validDraft, mockWorker);
    });

    expect(submittedRdo).not.toBeNull();
    expect(submittedRdo!.status).toBe('submetido');
    expect(submittedRdo!.submittedAt).toBeDefined();

    // Verify stored draft was deleted
    const storedAfter = await AsyncStorage.getItem(getDraftStorageKey('work-ctx-10'));
    expect(storedAfter).toBeNull();

    // Verify RDO was added to context rdos
    expect(contextValue!.rdos.some((r) => r.id === 'rdo-draft-submission-test')).toBe(true);

    // Verify audit log was recorded
    const trail = contextValue!.getAuditTrail('rdo-draft-submission-test');
    expect(trail.some((l) => l.action === 'submetido')).toBe(true);
  });

  it('submits draft safely even if discardDraft storage removal throws', async () => {
    const validDraft: RDO = {
      id: 'rdo-draft-storage-fail-test',
      number: 0,
      version: 1,
      workId: 'work-fail-storage',
      workName: 'Obra Erro Storage',
      date: '29/10/2026',
      authorId: mockWorker.id,
      authorName: mockWorker.name,
      status: 'rascunho',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [{ role: 'Pedreiro', quantity: 1, hours: 8 }],
      equipment: [{ name: 'Trator', activeHours: 4, idleHours: 0 }],
      activities: [{ description: 'Terraplenagem', location: 'Setor 1', unit: 'm²', quantity: 50, progress: 10 }],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValueOnce(new Error('Storage I/O failure'));

    let submitted: RDO | null = null;
    await act(async () => {
      submitted = await contextValue!.submitDraft(validDraft, mockWorker);
    });

    expect(submitted).not.toBeNull();
    expect(submitted!.status).toBe('submetido');
  });
});
