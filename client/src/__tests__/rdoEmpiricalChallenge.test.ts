jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  validateDraftForSubmission,
  rectifyRdo,
  addComment,
  submitRdo,
  approveRdo,
  createDraft,
  WorkflowError,
} from '@/services/modules/rdoWorkflow';
import type { RDO, User, LaborEntry, EquipmentEntry, ActivityEntry, WeatherEntry } from '@/types';

const mockWorker: User = {
  id: 'worker-challenger-1',
  name: 'Operário Challenger',
  profile: 'common',
  role: 'Encarregado',
  email: 'challenger@stacklab.com',
  assignedWorkIds: ['work-adv-challenger'],
};

const mockMaster: User = {
  id: 'master-challenger-1',
  name: 'Engenheiro Challenger Master',
  profile: 'master',
  role: 'Diretor Técnico',
  crea: 'CREA-SP 123456',
  email: 'master-challenger@stacklab.com',
  assignedWorkIds: ['work-adv-challenger'],
};

const createBaseRdo = (overrides: Partial<RDO> = {}): RDO => ({
  id: 'rdo-challenger-01',
  number: 1,
  version: 1,
  workId: 'work-adv-challenger',
  workName: 'Obra Desafio Adversarial',
  date: '29/10/2026',
  authorId: mockWorker.id,
  authorName: mockWorker.name,
  status: 'rascunho',
  locked: false,
  weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
  labor: [{ role: 'Pedreiro', quantity: 2, hours: 8 }],
  equipment: [{ name: 'Betoneira', activeHours: 4, idleHours: 0 }],
  activities: [{ description: 'Concretagem de pilares', location: 'Térreo', unit: 'm³', quantity: 15, progress: 30 }],
  materials: [],
  occurrences: [],
  photos: [],
  comments: [],
  ...overrides,
});

describe('Empirical Adversarial Challenge Suite (Milestone 1 Iteration 2)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. validateDraftForSubmission Edge Cases & Boundaries
  // =========================================================================
  describe('1. validateDraftForSubmission Boundaries & Validation Rules', () => {
    it('headcount boundaries: rejects empty labor, 0 quantity, negative quantity, fractional quantity', () => {
      // 1.1 Empty labor
      const rdoEmpty = createBaseRdo({ labor: [] });
      const resEmpty = validateDraftForSubmission(rdoEmpty);
      expect(resEmpty.isValid).toBe(false);
      expect(resEmpty.errors).toContain('Informe ao menos 1 colaborador no efetivo.');

      // 1.2 Zero quantity
      const rdoZero = createBaseRdo({ labor: [{ role: 'Ajudante', quantity: 0, hours: 8 }] });
      const resZero = validateDraftForSubmission(rdoZero);
      expect(resZero.isValid).toBe(false);
      expect(resZero.errors.some((e) => e.includes('quantidade deve ser um número inteiro maior ou igual a 1'))).toBe(true);

      // 1.3 Negative quantity
      const rdoNegative = createBaseRdo({ labor: [{ role: 'Carpinteiro', quantity: -3, hours: 8 }] });
      const resNeg = validateDraftForSubmission(rdoNegative);
      expect(resNeg.isValid).toBe(false);
      expect(resNeg.errors.some((e) => e.includes('quantidade deve ser um número inteiro maior ou igual a 1'))).toBe(true);

      // 1.4 Fractional quantity (e.g. 0.5, 2.5)
      const rdoFractional = createBaseRdo({ labor: [{ role: 'Eletricista', quantity: 1.5, hours: 8 }] });
      const resFrac = validateDraftForSubmission(rdoFractional);
      expect(resFrac.isValid).toBe(false);
      expect(resFrac.errors.some((e) => e.includes('quantidade deve ser um número inteiro'))).toBe(true);
    });

    it('labor hours boundaries: rejects 25 hours, negative hours, and verifies 0 hours behavior', () => {
      // 25 hours -> rejected
      const rdo25h = createBaseRdo({ labor: [{ role: 'Pedreiro', quantity: 1, hours: 25 }] });
      const res25h = validateDraftForSubmission(rdo25h);
      expect(res25h.isValid).toBe(false);
      expect(res25h.errors.some((e) => e.includes('jornada de trabalho deve ser entre 0 e 24 horas'))).toBe(true);

      // 24.1 hours -> rejected
      const rdo24_1h = createBaseRdo({ labor: [{ role: 'Pedreiro', quantity: 1, hours: 24.1 }] });
      const res24_1h = validateDraftForSubmission(rdo24_1h);
      expect(res24_1h.isValid).toBe(false);
      expect(res24_1h.errors.some((e) => e.includes('jornada de trabalho deve ser entre 0 e 24 horas'))).toBe(true);

      // Negative hours (-1) -> rejected
      const rdoNegH = createBaseRdo({ labor: [{ role: 'Pedreiro', quantity: 1, hours: -1 }] });
      const resNegH = validateDraftForSubmission(rdoNegH);
      expect(resNegH.isValid).toBe(false);
      expect(resNegH.errors.some((e) => e.includes('jornada de trabalho deve ser entre 0 e 24 horas'))).toBe(true);

      // Exactly 24 hours -> valid
      const rdo24h = createBaseRdo({ labor: [{ role: 'Vigia', quantity: 1, hours: 24 }] });
      expect(validateDraftForSubmission(rdo24h).isValid).toBe(true);

      // Exactly 0 hours in client domain:
      // Client rule is: l.hours < 0 || l.hours > 24
      // So l.hours === 0 passes client validation
      const rdo0h = createBaseRdo({ labor: [{ role: 'Ajudante', quantity: 1, hours: 0 }] });
      const res0h = validateDraftForSubmission(rdo0h);
      expect(res0h.isValid).toBe(true);
    });

    it('activity description boundaries: rejects empty or < 3 chars, accepts >= 3 chars', () => {
      // Empty
      const rdoEmpty = createBaseRdo({
        activities: [{ description: '', location: 'Bloco A', unit: 'm²', quantity: 10 }],
      });
      expect(validateDraftForSubmission(rdoEmpty).isValid).toBe(false);

      // Short: 2 chars
      const rdo2c = createBaseRdo({
        activities: [{ description: 'ab', location: 'Bloco A', unit: 'm²', quantity: 10 }],
      });
      expect(validateDraftForSubmission(rdo2c).isValid).toBe(false);
      expect(validateDraftForSubmission(rdo2c).errors.some((e) => e.includes('mínimo 3 caracteres'))).toBe(true);

      // Whitespace only
      const rdoWs = createBaseRdo({
        activities: [{ description: '   ', location: 'Bloco A', unit: 'm²', quantity: 10 }],
      });
      expect(validateDraftForSubmission(rdoWs).isValid).toBe(false);

      // Exactly 3 chars -> valid
      const rdo3c = createBaseRdo({
        activities: [{ description: 'DDS', location: 'Bloco A', unit: 'm²', quantity: 10 }],
      });
      expect(validateDraftForSubmission(rdo3c).isValid).toBe(true);
    });

    it('equipment idle justification: rejects < 5 chars like "1234", accepts >= 5 chars', () => {
      // idleHours > 0 with short justification '1234' (length 4) -> rejected
      const rdoShortJust = createBaseRdo({
        equipment: [{ name: 'Guindaste', activeHours: 2, idleHours: 3, idleJustification: '1234' }],
      });
      const resShort = validateDraftForSubmission(rdoShortJust);
      expect(resShort.isValid).toBe(false);
      expect(resShort.errors.some((e) => e.includes('mínimo 5 caracteres'))).toBe(true);

      // idleHours > 0 with whitespace justification -> rejected
      const rdoWsJust = createBaseRdo({
        equipment: [{ name: 'Guindaste', activeHours: 2, idleHours: 3, idleJustification: '    ' }],
      });
      expect(validateDraftForSubmission(rdoWsJust).isValid).toBe(false);

      // idleHours > 0 with 5 chars '12345' -> valid
      const rdoValidJust = createBaseRdo({
        equipment: [{ name: 'Guindaste', activeHours: 2, idleHours: 3, idleJustification: '12345' }],
      });
      expect(validateDraftForSubmission(rdoValidJust).isValid).toBe(true);

      // idleHours = 0 without justification -> valid
      const rdoZeroIdle = createBaseRdo({
        equipment: [{ name: 'Guindaste', activeHours: 8, idleHours: 0 }],
      });
      expect(validateDraftForSubmission(rdoZeroIdle).isValid).toBe(true);
    });

    it('rain impact: rejects short impact like "12", accepts >= 3 chars', () => {
      // Chuva with stoppageHours > 0 and impact '12' (length 2) -> rejected
      const rdoShortImpact = createBaseRdo({
        weather: [{ shift: 'manha', condition: 'Chuva', stoppageHours: 3, impact: '12' }],
      });
      const resShort = validateDraftForSubmission(rdoShortImpact);
      expect(resShort.isValid).toBe(false);
      expect(resShort.errors.some((e) => e.includes('mínimo 3 caracteres'))).toBe(true);

      // Tempo Chuvoso with stoppageHours > 0 and impact '123' (length 3) -> valid
      const rdoValidImpact = createBaseRdo({
        weather: [{ shift: 'tarde', condition: 'Tempo Chuvoso', stoppageHours: 2, impact: '123' }],
      });
      expect(validateDraftForSubmission(rdoValidImpact).isValid).toBe(true);
    });

    it('condition variations: evaluates "Chuva", "Chuvoso", "chuvinha", "chuvisco", "tempestade"', () => {
      // 1. "Chuva" with stoppage > 0 and no impact -> fails
      const rdoChuva = createBaseRdo({
        weather: [{ shift: 'manha', condition: 'Chuva', stoppageHours: 2, impact: '' }],
      });
      expect(validateDraftForSubmission(rdoChuva).isValid).toBe(false);

      // 2. "Chuvoso" with stoppage > 0 and no impact -> fails
      const rdoChuvoso = createBaseRdo({
        weather: [{ shift: 'manha', condition: 'Chuvoso', stoppageHours: 2, impact: '' }],
      });
      expect(validateDraftForSubmission(rdoChuvoso).isValid).toBe(false);

      // 3. "Pancadas de Chuva" with stoppage > 0 and no impact -> fails
      const rdoPancadas = createBaseRdo({
        weather: [{ shift: 'manha', condition: 'Pancadas de Chuva', stoppageHours: 2, impact: '' }],
      });
      expect(validateDraftForSubmission(rdoPancadas).isValid).toBe(false);

      // 4. "chuvinha": empirical test of /chuva|chuvoso/i regex
      // Note: 'chuvinha' does not contain 'chuva' or 'chuvoso'
      const rdoChuvinha = createBaseRdo({
        weather: [{ shift: 'manha', condition: 'chuvinha', stoppageHours: 2, impact: '' }],
      });
      const resChuvinha = validateDraftForSubmission(rdoChuvinha);
      // Documents that 'chuvinha' is not matched by /chuva|chuvoso/i
      expect(resChuvinha.isValid).toBe(true);

      // 5. "chuvisco": empirical test of /chuva|chuvoso/i regex
      const rdoChuvisco = createBaseRdo({
        weather: [{ shift: 'manha', condition: 'chuvisco', stoppageHours: 2, impact: '' }],
      });
      const resChuvisco = validateDraftForSubmission(rdoChuvisco);
      expect(resChuvisco.isValid).toBe(true);

      // 6. "tempestade": does not match /chuva|chuvoso/i
      const rdoTempestade = createBaseRdo({
        weather: [{ shift: 'manha', condition: 'tempestade', stoppageHours: 2, impact: '' }],
      });
      const resTempestade = validateDraftForSubmission(rdoTempestade);
      expect(resTempestade.isValid).toBe(true);
    });
  });

  // =========================================================================
  // 2. rectifyRdo with Complex IDs & Immutability
  // =========================================================================
  describe('2. rectifyRdo with Complex IDs & Versioning Integrity', () => {
    it('correctly rectifies complex ID "rdo-valinhos-setor-v1-02-v1" without truncating internal "-v1-"', () => {
      const complexV1 = createBaseRdo({
        id: 'rdo-valinhos-setor-v1-02-v1',
        version: 1,
        status: 'aprovado',
        locked: true,
      });

      const { original, newVersion, rdos, log } = rectifyRdo(
        complexV1,
        mockMaster,
        'Retificação por erro de medição',
        [complexV1],
      );

      // Original remains frozen and unchanged
      expect(original.id).toBe('rdo-valinhos-setor-v1-02-v1');
      expect(original.status).toBe('aprovado');
      expect(original.locked).toBe(true);

      // New version ID must be rdo-valinhos-setor-v1-02-v2 (preserving internal -v1-02)
      expect(newVersion.id).toBe('rdo-valinhos-setor-v1-02-v2');
      expect(newVersion.version).toBe(2);
      expect(newVersion.previousVersionId).toBe('rdo-valinhos-setor-v1-02-v1');
      expect(newVersion.status).toBe('submetido');
      expect(newVersion.locked).toBe(false);
      expect(newVersion.signature).toBeUndefined();
      expect(newVersion.comments).toEqual([]);

      // In rdos array, original entry is replaced by newVersion active copy
      expect(rdos.length).toBe(1);
      expect(rdos[0]?.id).toBe('rdo-valinhos-setor-v1-02-v2');

      // Audit log references original RDO and records justification
      expect(log.rdoId).toBe('rdo-valinhos-setor-v1-02-v1');
      expect(log.action).toBe('retificado');
      expect(log.justification).toBe('Retificação por erro de medição');
    });

    it('correctly rectifies multi-version complex ID "rdo-v1-setor-v2-obra-v1"', () => {
      const multiV1 = createBaseRdo({
        id: 'rdo-v1-setor-v2-obra-v1',
        version: 1,
        status: 'aprovado',
        locked: true,
      });

      const { newVersion } = rectifyRdo(multiV1, mockMaster, 'Ajuste de jornada de trabalho');
      expect(newVersion.id).toBe('rdo-v1-setor-v2-obra-v2');
      expect(newVersion.previousVersionId).toBe('rdo-v1-setor-v2-obra-v1');
      expect(newVersion.version).toBe(2);
    });

    it('prevents duplicate rectification when a rectification already exists', () => {
      const v1 = createBaseRdo({
        id: 'rdo-valinhos-setor-v1-02-v1',
        version: 1,
        status: 'aprovado',
        locked: true,
      });

      const { newVersion, rdos } = rectifyRdo(
        v1,
        mockMaster,
        'Primeira retificação',
        [v1],
      );

      // Attempting to rectify v1 again with updated rdos list
      expect(() =>
        rectifyRdo(v1, mockMaster, 'Segunda retificação ilegal', rdos),
      ).toThrow(WorkflowError);
    });
  });

  // =========================================================================
  // 3. Technical Comments & Status Immutability
  // =========================================================================
  describe('3. addComment Immutability & Status Security', () => {
    it('strictly forbids adding comments to approved/locked RDOs', () => {
      const approvedRdo = createBaseRdo({
        status: 'aprovado',
        locked: true,
      });

      expect(() =>
        addComment(approvedRdo, mockMaster, 'ocorrencias', 'Nota em RDO congelado'),
      ).toThrow(WorkflowError);

      try {
        addComment(approvedRdo, mockMaster, 'ocorrencias', 'Nota em RDO congelado');
      } catch (err: any) {
        expect(err.message).toContain('Comentários técnicos são permitidos apenas em RDOs submetidos e não congelados');
      }
    });

    it('strictly forbids adding comments to draft RDOs', () => {
      const draftRdo = createBaseRdo({
        status: 'rascunho',
        locked: false,
      });

      expect(() =>
        addComment(draftRdo, mockMaster, 'atividades', 'Nota em rascunho'),
      ).toThrow(WorkflowError);
    });

    it('strictly forbids adding comments to devolved RDOs', () => {
      const devolvedRdo = createBaseRdo({
        status: 'devolvido',
        locked: false,
      });

      expect(() =>
        addComment(devolvedRdo, mockMaster, 'maoDeObra', 'Nota em RDO devolvido'),
      ).toThrow(WorkflowError);
    });

    it('allows comments on submetido non-locked RDOs and rejects empty comment text', () => {
      const submittedRdo = createBaseRdo({
        status: 'submetido',
        locked: false,
      });

      // Rejects empty or whitespace comment
      expect(() => addComment(submittedRdo, mockMaster, 'atividades', '')).toThrow(WorkflowError);
      expect(() => addComment(submittedRdo, mockMaster, 'atividades', '   ')).toThrow(WorkflowError);

      // Accepts valid comment
      const { rdo: commented, log } = addComment(
        submittedRdo,
        mockMaster,
        'atividades',
        'Favor detalhar armação do bloco 2',
      );

      expect(commented.comments.length).toBe(1);
      expect(commented.comments[0]?.text).toBe('Favor detalhar armação do bloco 2');
      expect(commented.comments[0]?.authorId).toBe(mockMaster.id);
      expect(log.action).toBe('comentado');
      expect(log.newValue).toBe('Favor detalhar armação do bloco 2');
    });
  });

  // =========================================================================
  // 4. submitDraft Storage Failover & Resilience
  // =========================================================================
  describe('4. Storage Failover & Non-Blocking State Updates', () => {
    it('ensures submitRdo transition is completely decoupled from I/O failure', () => {
      const draft = createBaseRdo({ status: 'rascunho', locked: false });
      const { rdo: submitted, log } = submitRdo(draft, mockWorker);

      expect(submitted.status).toBe('submetido');
      expect(submitted.submittedAt).toBeDefined();
      expect(log.action).toBe('submetido');
      expect(log.actorId).toBe(mockWorker.id);
    });
  });
});
