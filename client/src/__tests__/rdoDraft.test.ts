jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDraftStorageKey,
  createDraft,
  validateDraftForSubmission,
  WorkflowError,
} from '@/services/modules/rdoWorkflow';
import type { RDO, User } from '@/types';

const mockWorker: User = {
  id: 'worker-1',
  name: 'Operário Silva',
  profile: 'common',
  role: 'Encarregado',
  email: 'operario@stacklab.com',
  assignedWorkIds: ['work-10'],
};

describe('RDO Draft Lifecycle & Validation (Milestone 1)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('getDraftStorageKey', () => {
    it('returns standardized key @stacklab:rdo_draft_${workId}', () => {
      expect(getDraftStorageKey('work-10')).toBe('@stacklab:rdo_draft_work-10');
      expect(getDraftStorageKey('obra-alpha')).toBe('@stacklab:rdo_draft_obra-alpha');
    });

    it('throws error when workId is missing or empty', () => {
      expect(() => getDraftStorageKey('')).toThrow(WorkflowError);
    });
  });

  describe('createDraft', () => {
    it('initializes a valid draft with default weather and empty sections', () => {
      const draft = createDraft({
        workId: 'work-10',
        workName: 'Residencial Bela Vista',
        author: mockWorker,
      });

      expect(draft.id).toMatch(/^rdo-draft-/);
      expect(draft.status).toBe('rascunho');
      expect(draft.locked).toBe(false);
      expect(draft.version).toBe(1);
      expect(draft.workId).toBe('work-10');
      expect(draft.authorId).toBe(mockWorker.id);
      expect(draft.weather).toHaveLength(2);
      expect(draft.weather[0]!.practical).toBe(true);
      expect(draft.labor).toEqual([]);
      expect(draft.equipment).toEqual([]);
      expect(draft.activities).toEqual([]);
    });

    it('allows overriding initial fields via initialData', () => {
      const draft = createDraft({
        workId: 'work-10',
        workName: 'Residencial Bela Vista',
        author: mockWorker,
        initialData: {
          labor: [{ role: 'Pedreiro', quantity: 2, hours: 8 }],
        },
      });

      expect(draft.labor).toHaveLength(1);
      expect(draft.labor[0]!.role).toBe('Pedreiro');
    });
  });

  describe('validateDraftForSubmission', () => {
    const validDraft: RDO = {
      id: 'draft-1',
      number: 1,
      version: 1,
      workId: 'work-10',
      workName: 'Obra 10',
      date: '29/10/2026',
      authorId: mockWorker.id,
      authorName: mockWorker.name,
      status: 'rascunho',
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [{ role: 'Carpinteiro', quantity: 3, hours: 8 }],
      equipment: [{ name: 'Serra Circular', activeHours: 6, idleHours: 0 }],
      activities: [{ description: 'Formas de vigas', location: '1º Pavimento', unit: 'm²', quantity: 25, progress: 50 }],
      materials: [],
      occurrences: [],
      photos: [],
      comments: [],
    };

    it('passes validation when all requirements are satisfied', () => {
      const result = validateDraftForSubmission(validDraft);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when headcount is 0', () => {
      const invalid = { ...validDraft, labor: [] };
      const result = validateDraftForSubmission(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Informe ao menos 1 colaborador no efetivo.');
    });

    it('fails when activities list is empty', () => {
      const invalid = { ...validDraft, activities: [] };
      const result = validateDraftForSubmission(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Informe ao menos uma atividade executada.');
    });

    it('fails when activity progress is outside 0-100%', () => {
      const invalid = {
        ...validDraft,
        activities: [{ description: 'Escavação', location: 'Subsolo', unit: 'm³', quantity: 10, progress: 120 }],
      };
      const result = validateDraftForSubmission(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/progresso deve ser um percentual entre 0 e 100/);
    });

    it('fails when equipment has idleHours > 0 without idleJustification', () => {
      const invalid = {
        ...validDraft,
        equipment: [{ name: 'Guindaste', activeHours: 2, idleHours: 6, idleJustification: '' }],
      };
      const result = validateDraftForSubmission(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/justificativa obrigatória quando houver horas ociosas/);
    });

    it('fails when rain stoppage occurs without impact description', () => {
      const invalid = {
        ...validDraft,
        weather: [{ shift: 'tarde' as const, condition: 'Chuva', stoppageHours: 3, impact: '' }],
      };
      const result = validateDraftForSubmission(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/informe a justificativa do impacto da chuva/);
    });

    it('fails when equipment idleJustification is less than 5 characters', () => {
      const invalid = {
        ...validDraft,
        equipment: [{ name: 'Guindaste', activeHours: 2, idleHours: 6, idleJustification: 'pane' }],
      };
      const result = validateDraftForSubmission(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('5 caracteres') || e.includes('justificativa'))).toBe(true);
    });

    it('fails when rain stoppage impact is less than 3 characters', () => {
      const invalid = {
        ...validDraft,
        weather: [{ shift: 'tarde' as const, condition: 'Chuva', stoppageHours: 3, impact: 'ab' }],
      };
      const result = validateDraftForSubmission(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('3 caracteres') || e.includes('impacto'))).toBe(true);
    });

    it('fails when weather condition is "Tempo Chuvoso" with stoppageHours > 0 and impact is missing', () => {
      const invalid = {
        ...validDraft,
        weather: [{ shift: 'tarde' as const, condition: 'Tempo Chuvoso', stoppageHours: 2, impact: '' }],
      };
      const result = validateDraftForSubmission(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('impacto da chuva'))).toBe(true);
    });
  });

  describe('AsyncStorage Persistence Operations', () => {
    it('persists and retrieves partial draft in AsyncStorage using standard key', async () => {
      const key = getDraftStorageKey('work-10');
      const partialData = { workId: 'work-10', date: '29/10/2026', currentStep: 3 };

      await AsyncStorage.setItem(key, JSON.stringify(partialData));

      const stored = await AsyncStorage.getItem(key);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(partialData);

      await AsyncStorage.removeItem(key);
      const afterRemoval = await AsyncStorage.getItem(key);
      expect(afterRemoval).toBeNull();
    });
  });
});
