jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDraftStorageKey,
  createDraft,
  validateDraftForSubmission,
  submitRdo,
  approveRdo,
  returnRdo,
  rectifyRdo,
  auditedEdit,
  addComment,
  getAvailableActions,
  computeIntegrityHash,
  WorkflowError,
} from '@/services/modules/rdoWorkflow';
import type { RDO, User, LaborEntry, EquipmentEntry, ActivityEntry, WeatherEntry } from '@/types';

const mockWorker: User = {
  id: 'worker-adv-1',
  name: 'Operário Teste',
  profile: 'common',
  role: 'Encarregado',
  email: 'worker@stacklab.com',
  assignedWorkIds: ['work-adv-1'],
};

const mockMaster: User = {
  id: 'master-adv-1',
  name: 'Engenheiro Master',
  profile: 'master',
  role: 'Diretor Técnico',
  crea: 'CREA-SP 999999',
  email: 'master@stacklab.com',
  assignedWorkIds: ['work-adv-1'],
};

const createValidRdo = (overrides: Partial<RDO> = {}): RDO => ({
  id: 'rdo-valid-1',
  number: 1,
  version: 1,
  workId: 'work-adv-1',
  workName: 'Obra Teste Adversarial',
  date: '29/10/2026',
  authorId: mockWorker.id,
  authorName: mockWorker.name,
  status: 'rascunho',
  locked: false,
  weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
  labor: [{ role: 'Pedreiro', quantity: 2, hours: 8 }],
  equipment: [{ name: 'Betoneira', activeHours: 4, idleHours: 0 }],
  activities: [{ description: 'Concretagem', location: 'Térreo', unit: 'm³', quantity: 12, progress: 25 }],
  materials: [],
  occurrences: [],
  photos: [],
  comments: [],
  ...overrides,
});

describe('Adversarial Challenge Suite: Client Domain Logic (Milestone 1)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. Boundary Values, Numeric Integrity & Contract Divergence
  // =========================================================================
  describe('1. Boundary Values & Numeric Integrity in Validation', () => {
    it('fails when headcount is 0 or all labor entries have 0 quantity', () => {
      const rdo = createValidRdo({
        labor: [
          { role: 'Vigia', quantity: 0, hours: 8 },
          { role: 'Ajudante', quantity: 0, hours: 8 },
        ],
      });
      const result = validateDraftForSubmission(rdo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Informe ao menos 1 colaborador no efetivo.');
    });

    it('fails validation when individual labor quantity is negative or less than 1', () => {
      const rdo = createValidRdo({
        labor: [
          { role: 'Fantasma', quantity: -5, hours: 8 },
          { role: 'Real', quantity: 6, hours: 8 },
        ],
      });
      const result = validateDraftForSubmission(rdo);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('quantidade deve ser um número inteiro maior ou igual a 1')),
      ).toBe(true);
    });

    it('fails when activity progress is negative (-0.01, -100, -Infinity)', () => {
      const testCases = [-0.01, -1, -50, -Infinity];
      for (const val of testCases) {
        const rdo = createValidRdo({
          activities: [{ description: 'Alvenaria', location: '1º Pav', unit: 'm²', quantity: 10, progress: val }],
        });
        const result = validateDraftForSubmission(rdo);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('progresso deve ser um percentual entre 0 e 100'))).toBe(true);
      }
    });

    it('fails when activity progress exceeds 100 (100.01, 150, Infinity)', () => {
      const testCases = [100.01, 101, 9999, Infinity];
      for (const val of testCases) {
        const rdo = createValidRdo({
          activities: [{ description: 'Alvenaria', location: '1º Pav', unit: 'm²', quantity: 10, progress: val }],
        });
        const result = validateDraftForSubmission(rdo);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('progresso deve ser um percentual entre 0 e 100'))).toBe(true);
      }
    });

    it('fails when activity progress is NaN or non-number type', () => {
      const rdoNaN = createValidRdo({
        activities: [{ description: 'Alvenaria', location: '1º Pav', unit: 'm²', quantity: 10, progress: NaN }],
      });
      expect(validateDraftForSubmission(rdoNaN).isValid).toBe(false);

      const rdoString = createValidRdo({
        activities: [{ description: 'Alvenaria', location: '1º Pav', unit: 'm²', quantity: 10, progress: '50' as any }],
      });
      expect(validateDraftForSubmission(rdoString).isValid).toBe(false);
    });

    it('accepts exact boundary values for progress: 0 and 100', () => {
      const rdo0 = createValidRdo({
        activities: [{ description: 'Alvenaria', location: '1º Pav', unit: 'm²', quantity: 10, progress: 0 }],
      });
      expect(validateDraftForSubmission(rdo0).isValid).toBe(true);

      const rdo100 = createValidRdo({
        activities: [{ description: 'Alvenaria', location: '1º Pav', unit: 'm²', quantity: 10, progress: 100 }],
      });
      expect(validateDraftForSubmission(rdo100).isValid).toBe(true);
    });

    it('fails when equipment idleHours > 0 has whitespace-only justification', () => {
      const rdo = createValidRdo({
        equipment: [{ name: 'Guindaste', activeHours: 2, idleHours: 4, idleJustification: '     ' }],
      });
      const result = validateDraftForSubmission(rdo);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('justificativa obrigatória quando houver horas ociosas'))).toBe(true);
    });

    it('enforces minimum 5 characters for equipment idle justification', () => {
      const rdo = createValidRdo({
        equipment: [{ name: 'Guindaste', activeHours: 2, idleHours: 4, idleJustification: 'ok' }],
      });
      const result = validateDraftForSubmission(rdo);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('5 caracteres') || e.includes('justificativa')),
      ).toBe(true);
    });

    it('fails when rain condition has stoppageHours > 0 but impact is empty or whitespace', () => {
      const testCases = ['', '    ', '\t\n'];
      for (const impact of testCases) {
        const rdo = createValidRdo({
          weather: [{ shift: 'manha', condition: 'Chuva torrencial', stoppageHours: 3, impact }],
        });
        const result = validateDraftForSubmission(rdo);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('informe a justificativa do impacto da chuva'))).toBe(true);
      }
    });

    it('accepts rain condition with stoppageHours = 0 even without impact', () => {
      const rdo = createValidRdo({
        weather: [{ shift: 'manha', condition: 'Chuva fraca', stoppageHours: 0 }],
      });
      const result = validateDraftForSubmission(rdo);
      expect(result.isValid).toBe(true);
    });

    it('enforces rain impact validation for both "chuva" and "chuvoso" conditions', () => {
      const rdoChuva = createValidRdo({
        weather: [{ shift: 'tarde', condition: 'Pancadas de Chuva', stoppageHours: 2, impact: '' }],
      });
      expect(validateDraftForSubmission(rdoChuva).isValid).toBe(false);

      const rdoChuvoso = createValidRdo({
        weather: [{ shift: 'tarde', condition: 'Tempo Chuvoso', stoppageHours: 2, impact: '' }],
      });
      expect(validateDraftForSubmission(rdoChuvoso).isValid).toBe(false);
      expect(validateDraftForSubmission(rdoChuvoso).errors.some((e) => e.includes('impacto'))).toBe(true);
    });

    it('fails when activity description is empty or shorter than 3 characters', () => {
      const rdoEmpty = createValidRdo({
        activities: [{ description: '', location: 'Canteiro', unit: 'un', quantity: 1 }],
      });
      expect(validateDraftForSubmission(rdoEmpty).isValid).toBe(false);

      const rdoShort = createValidRdo({
        activities: [{ description: 'ab', location: 'Canteiro', unit: 'un', quantity: 1 }],
      });
      expect(validateDraftForSubmission(rdoShort).isValid).toBe(false);
    });
  });

  // =========================================================================
  // 2. Storage Keys, Unicode, Special Characters & Work Isolation
  // =========================================================================
  describe('2. Storage Keys, Work Isolation & Unicode Resilience', () => {
    it('generates distinct storage keys for different works to prevent cross-work overwrite', () => {
      const keyA = getDraftStorageKey('work-alpha');
      const keyB = getDraftStorageKey('work-beta');
      expect(keyA).not.toBe(keyB);
      expect(keyA).toBe('@stacklab:rdo_draft_work-alpha');
      expect(keyB).toBe('@stacklab:rdo_draft_work-beta');
    });

    it('handles Unicode, emojis, and accented characters in workId', () => {
      const emojiKey = getDraftStorageKey('obra-🏗️-setor-A');
      expect(emojiKey).toBe('@stacklab:rdo_draft_obra-🏗️-setor-A');

      const accentedKey = getDraftStorageKey('obra-São-Gonçalo-10');
      expect(accentedKey).toBe('@stacklab:rdo_draft_obra-São-Gonçalo-10');
    });

    it('rejects empty, whitespace-only, or missing workId in getDraftStorageKey', () => {
      expect(() => getDraftStorageKey('')).toThrow(WorkflowError);
      expect(() => getDraftStorageKey('   ')).toThrow(WorkflowError);
      expect(() => getDraftStorageKey('\t\n')).toThrow(WorkflowError);
      expect(() => getDraftStorageKey(null as any)).toThrow(WorkflowError);
      expect(() => getDraftStorageKey(undefined as any)).toThrow(WorkflowError);
    });

    it('handles concurrent draft saves across multiple distinct works without data collision', async () => {
      const workIds = ['work-001', 'work-002', 'work-003', 'work-004', 'work-005'];
      const drafts = workIds.map((id, idx) => ({
        workId: id,
        step: idx,
        note: `Nota da obra ${id} com acentuação: Concluído ✓`,
      }));

      // Concurrent write simulation
      await Promise.all(
        drafts.map((d) => AsyncStorage.setItem(getDraftStorageKey(d.workId), JSON.stringify(d))),
      );

      // Verify each work maintained its own isolated state
      for (let i = 0; i < workIds.length; i++) {
        const storedRaw = await AsyncStorage.getItem(getDraftStorageKey(workIds[i]!));
        expect(storedRaw).not.toBeNull();
        const parsed = JSON.parse(storedRaw!);
        expect(parsed.workId).toBe(workIds[i]);
        expect(parsed.step).toBe(i);
        expect(parsed.note).toContain('Concluído ✓');
      }
    });

    it('handles special characters in comments and audit logs (newlines, HTML tags, SQL fragments, quotes)', () => {
      const rdo = createValidRdo({ status: 'submetido' });
      const maliciousComments = [
        '<script>alert("xss")</script>',
        "Robert'); DROP TABLE rdos;--",
        'Linha 1\nLinha 2\r\nLinha 3\tTabulação',
        'Canteiro com caracteres: "aspas", \'simples\', & e símbolos: ⚠️ 🚧 👷',
        '\u0000\u001F\u200Bzero-width',
      ];

      for (const text of maliciousComments) {
        const { rdo: commented, log } = addComment(rdo, mockMaster, 'atividades', text);
        const lastComment = commented.comments[commented.comments.length - 1];
        expect(lastComment?.text).toBe(text.trim());
        expect(log.newValue).toBe(text.trim());
      }
    });
  });

  // =========================================================================
  // 3. Corrupt Draft Recovery & Massive Payload Stress
  // =========================================================================
  describe('3. Corrupt Draft Recovery & Massive Payload Stress', () => {
    it('handles corrupt JSON in storage without unhandled crash', async () => {
      const key = getDraftStorageKey('work-corrupt');
      await AsyncStorage.setItem(key, '{ invalid json payload truncated...');

      const raw = await AsyncStorage.getItem(key);
      let parsed: unknown = null;
      let parseFailed = false;
      try {
        parsed = JSON.parse(raw!);
      } catch {
        parseFailed = true;
      }

      expect(parseFailed).toBe(true);
      expect(parsed).toBeNull();
    });

    it('handles non-object JSON values in storage gracefully (primitive strings, numbers, booleans, arrays)', async () => {
      const badValues = ['12345', '"plain string"', 'true', 'null', '[]'];
      for (const val of badValues) {
        const key = getDraftStorageKey(`work-${val.replace(/[^a-z0-9]/gi, '') || 'val'}`);
        await AsyncStorage.setItem(key, val);
        const raw = await AsyncStorage.getItem(key);
        const parsed = JSON.parse(raw!);
        expect(parsed !== undefined).toBe(true);
      }
    });

    it('handles massive payload: 1,000 labor entries and 1,000 activities without memory or validation breakdown', () => {
      const massiveLabor: LaborEntry[] = Array.from({ length: 1000 }, (_, i) => ({
        role: `Função Especializada #${i}`,
        quantity: 1,
        hours: 8,
        isContractor: i % 2 === 0,
      }));

      const massiveActivities: ActivityEntry[] = Array.from({ length: 1000 }, (_, i) => ({
        description: `Execução de item do cronograma físico-financeiro #${i} com descrição detalhada de serviço`,
        location: `Setor ${i % 10}, Pavimento ${Math.floor(i / 10)}`,
        unit: 'm²',
        quantity: 10 + (i % 50),
        progress: (i % 101),
      }));

      const massiveRdo = createValidRdo({
        labor: massiveLabor,
        activities: massiveActivities,
      });

      const startTime = Date.now();
      const result = validateDraftForSubmission(massiveRdo);
      const elapsed = Date.now() - startTime;

      expect(result.isValid).toBe(true);
      expect(elapsed).toBeLessThan(500); // Must execute in under 500ms
    });

    it('computes integrity hash deterministically even for large payloads and Portuguese accents', () => {
      const rdo = createValidRdo({
        workName: 'Edifício São João & Santa Fé — Bloco Açucena',
        activities: [
          { description: 'Instalação de tubulação hidráulica e sanitária', location: '1º Pavimento', unit: 'm', quantity: 30, progress: 100 },
        ],
      });

      const hash1 = computeIntegrityHash(rdo);
      const hash2 = computeIntegrityHash(rdo);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^SL-[0-9A-F]{8}$/);

      // Minor variation must produce different hash (avalanche effect)
      const modifiedRdo = { ...rdo, workName: 'Edifício São João & Santa Fé — Bloco AçucenB' };
      const hash3 = computeIntegrityHash(modifiedRdo);
      expect(hash3).not.toBe(hash1);
    });
  });

  // =========================================================================
  // 4. State Machine Bypass & Unauthorized Transition Attacks
  // =========================================================================
  describe('4. State Machine Bypass & Transition Security', () => {
    it('rejects approving a draft directly (must be submetido first)', () => {
      const draft = createValidRdo({ status: 'rascunho', locked: false });
      expect(() => approveRdo(draft, mockMaster, { ip: '1.1.1.1', deviceId: 'dev-1' })).toThrow(
        WorkflowError,
      );
    });

    it('rejects approving a devolved RDO directly (must be corrected and re-submitted first)', () => {
      const devolved = createValidRdo({ status: 'devolvido', locked: false });
      expect(() => approveRdo(devolved, mockMaster, { ip: '1.1.1.1', deviceId: 'dev-1' })).toThrow(
        WorkflowError,
      );
    });

    it('rejects approving an already approved and locked RDO', () => {
      const approved = createValidRdo({ status: 'aprovado', locked: true });
      expect(() => approveRdo(approved, mockMaster, { ip: '1.1.1.1', deviceId: 'dev-1' })).toThrow(
        WorkflowError,
      );
    });

    it('rejects returning a draft or approved RDO', () => {
      const draft = createValidRdo({ status: 'rascunho' });
      expect(() => returnRdo(draft, mockMaster, 'Justificativa válida')).toThrow(WorkflowError);

      const approved = createValidRdo({ status: 'aprovado', locked: true });
      expect(() => returnRdo(approved, mockMaster, 'Justificativa válida')).toThrow(WorkflowError);
    });

    it('rejects return without mandatory justification or with insufficient length (< 5 chars)', () => {
      const submitted = createValidRdo({ status: 'submetido' });
      expect(() => returnRdo(submitted, mockMaster, '')).toThrow(WorkflowError);
      expect(() => returnRdo(submitted, mockMaster, 'abc')).toThrow(WorkflowError);
      expect(() => returnRdo(submitted, mockMaster, '    ')).toThrow(WorkflowError);
    });

    it('rejects submitting an approved or locked RDO', () => {
      const approved = createValidRdo({ status: 'aprovado', locked: true });
      expect(() => submitRdo(approved, mockWorker)).toThrow(WorkflowError);

      const lockedDraft = createValidRdo({ status: 'rascunho', locked: true });
      expect(() => submitRdo(lockedDraft, mockWorker)).toThrow(WorkflowError);
    });

    it('rejects submitting an already submitted RDO', () => {
      const submitted = createValidRdo({ status: 'submetido', locked: false });
      expect(() => submitRdo(submitted, mockWorker)).toThrow(WorkflowError);
    });

    it('rejects audited edit on locked or unsubmitted RDO', () => {
      const draft = createValidRdo({ status: 'rascunho', locked: false });
      expect(() =>
        auditedEdit(draft, mockMaster, {
          section: 'atividades',
          field: 'descricao',
          previousValue: 'A',
          newValue: 'B',
          justification: 'Correção técnica válida',
        }),
      ).toThrow(WorkflowError);

      const approved = createValidRdo({ status: 'aprovado', locked: true });
      expect(() =>
        auditedEdit(approved, mockMaster, {
          section: 'atividades',
          field: 'descricao',
          previousValue: 'A',
          newValue: 'B',
          justification: 'Correção técnica válida',
        }),
      ).toThrow(WorkflowError);
    });

    it('rejects audited edit when new value is identical to previous value or justification is too short', () => {
      const submitted = createValidRdo({ status: 'submetido', locked: false });
      expect(() =>
        auditedEdit(submitted, mockMaster, {
          section: 'atividades',
          field: 'descricao',
          previousValue: 'Mesmo Valor',
          newValue: '  Mesmo Valor  ',
          justification: 'Justificativa válida',
        }),
      ).toThrow(WorkflowError);

      expect(() =>
        auditedEdit(submitted, mockMaster, {
          section: 'atividades',
          field: 'descricao',
          previousValue: 'Valor Antigo',
          newValue: 'Valor Novo',
          justification: 'curt',
        }),
      ).toThrow(WorkflowError);
    });

    it('rejects rectifying an unapproved RDO (must be approved first)', () => {
      const draft = createValidRdo({ status: 'rascunho', locked: false });
      expect(() => rectifyRdo(draft, mockMaster, 'Justificativa de retificação')).toThrow(WorkflowError);

      const submitted = createValidRdo({ status: 'submetido', locked: false });
      expect(() => rectifyRdo(submitted, mockMaster, 'Justificativa de retificação')).toThrow(WorkflowError);
    });

    it('prevents multiple rectifications for the same approved version', () => {
      const v1 = createValidRdo({ id: 'rdo-100', status: 'aprovado', locked: true, version: 1 });
      const { newVersion, rdos } = rectifyRdo(v1, mockMaster, 'Primeira retificação', [v1]);

      expect(newVersion.version).toBe(2);
      expect(newVersion.previousVersionId).toBe('rdo-100');

      // Attempt second rectification of the already rectified v1
      expect(() => rectifyRdo(v1, mockMaster, 'Segunda retificação', rdos)).toThrow(WorkflowError);
    });

    it('rejects adding comments to approved, locked, or draft RDOs', () => {
      const approved = createValidRdo({ status: 'aprovado', locked: true });
      expect(() => addComment(approved, mockMaster, 'ocorrencias', 'Comentário pós-aprovação')).toThrow(
        WorkflowError,
      );

      const draft = createValidRdo({ status: 'rascunho', locked: false });
      expect(() => addComment(draft, mockMaster, 'ocorrencias', 'Comentário em rascunho')).toThrow(
        WorkflowError,
      );
    });
  });

  // =========================================================================
  // 5. Immutability, Deep State Integrity & Rectification ID Truncation
  // =========================================================================
  describe('5. Immutability & State Mutation Safety', () => {
    it('does not mutate original RDO input during submitRdo', () => {
      const original = createValidRdo({ status: 'rascunho', locked: false });
      const originalClone = JSON.parse(JSON.stringify(original));

      const { rdo: submitted } = submitRdo(original, mockWorker);

      expect(original.status).toBe('rascunho');
      expect(original.submittedAt).toBeUndefined();
      expect(original).toEqual(originalClone);
      expect(submitted.status).toBe('submetido');
      expect(submitted.submittedAt).toBeDefined();
    });

    it('does not mutate original RDO input during approveRdo', () => {
      const original = createValidRdo({ status: 'submetido', locked: false });
      const originalClone = JSON.parse(JSON.stringify(original));

      const { rdo: approved } = approveRdo(original, mockMaster, { ip: '1.2.3.4', deviceId: 'dev-1' });

      expect(original.status).toBe('submetido');
      expect(original.locked).toBe(false);
      expect(original.signature).toBeUndefined();
      expect(original).toEqual(originalClone);
      expect(approved.status).toBe('aprovado');
      expect(approved.locked).toBe(true);
      expect(approved.signature).toBeDefined();
    });

    it('does not mutate original RDO input during returnRdo', () => {
      const original = createValidRdo({ status: 'submetido', locked: false });
      const originalClone = JSON.parse(JSON.stringify(original));

      const { rdo: returned } = returnRdo(original, mockMaster, 'Devolvendo para ajuste');

      expect(original.status).toBe('submetido');
      expect(original.returnReason).toBeUndefined();
      expect(original).toEqual(originalClone);
      expect(returned.status).toBe('devolvido');
      expect(returned.returnReason).toBe('Devolvendo para ajuste');
    });

    it('preserves full base ID without premature truncation when ID contains "-v" substring', () => {
      const customIdRdo = createValidRdo({
        id: 'rdo-obra-valinhos-01',
        version: 1,
        status: 'aprovado',
        locked: true,
      });

      const { newVersion } = rectifyRdo(customIdRdo, mockMaster, 'Retificação técnica');

      expect(newVersion.id).toBe('rdo-obra-valinhos-01-v2');
      expect(newVersion.previousVersionId).toBe('rdo-obra-valinhos-01');
    });
  });

  // =========================================================================
  // 6. Role-Based Permissions Matrix (getAvailableActions)
  // =========================================================================
  describe('6. Role-Based Action Matrix Enforcement', () => {
    it('strictly forbids common worker from executing master actions across all lifecycle states', () => {
      const allStatuses: Array<'rascunho' | 'submetido' | 'devolvido' | 'aprovado'> = [
        'rascunho',
        'submetido',
        'devolvido',
        'aprovado',
      ];

      for (const st of allStatuses) {
        const locked = st === 'aprovado';
        const actions = getAvailableActions({ status: st, locked }, 'common');

        expect(actions).not.toContain('approve');
        expect(actions).not.toContain('return');
        expect(actions).not.toContain('auditedEdit');
        expect(actions).not.toContain('rectify');
      }
    });

    it('locks common worker completely once RDO is submetido or aprovado', () => {
      expect(getAvailableActions({ status: 'submetido', locked: false }, 'common')).toEqual([]);
      expect(getAvailableActions({ status: 'aprovado', locked: true }, 'common')).toEqual([]);
    });

    it('restricts master actions when RDO is locked or in wrong state', () => {
      expect(getAvailableActions({ status: 'aprovado', locked: true }, 'master')).toEqual(['rectify']);
      expect(getAvailableActions({ status: 'aprovado', locked: false }, 'master')).toEqual([]);
    });
  });
});
