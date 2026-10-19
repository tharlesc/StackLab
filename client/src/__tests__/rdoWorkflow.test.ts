import {
  submitRdo,
  approveRdo,
  returnRdo,
  rectifyRdo,
  auditedEdit,
  addComment,
  getAvailableActions,
  WorkflowError,
} from '@/services/modules/rdoWorkflow';
import type { RDO, User } from '@/types';

const masterUser: User = {
  id: 'user-master-1',
  name: 'Tharles Master',
  profile: 'master',
  role: 'Engenheiro Gestor',
  crea: 'CREA-SP 123456',
  email: 'master@stacklab.com',
  assignedWorkIds: ['work-1'],
};

const commonUser: User = {
  id: 'user-common-1',
  name: 'Davi Operacional',
  profile: 'common',
  role: 'Engenheiro Residente',
  crea: 'CREA-SP 654321',
  email: 'campo@stacklab.com',
  assignedWorkIds: ['work-1'],
};

const createBaseRdo = (overrides: Partial<RDO> = {}): RDO => ({
  id: 'rdo-100',
  number: 100,
  version: 1,
  workId: 'work-1',
  workName: 'Residencial Aurora',
  date: '17/10/2026',
  status: 'submetido',
  authorId: commonUser.id,
  authorName: commonUser.name,
  submittedAt: '2026-10-17T10:00:00.000Z',
  weather: [{ shift: 'manha', condition: 'Sol' }],
  labor: [{ role: 'Armador', quantity: 5, hours: 8 }],
  equipment: [{ name: 'Betoneira 400L', activeHours: 6, idleHours: 2 }],
  activities: [{ description: 'Armação de pilares P1 a P8', quantity: 8, unit: 'un', location: 'Térreo' }],
  materials: [{ name: 'Aço CA-50', supplier: 'Gerdau', invoice: 'NF-990' }],
  occurrences: [{ type: 'dds', description: 'Uso de EPI' }],
  photos: [],
  comments: [],
  locked: false,
  ...overrides,
});

describe('services/modules/rdoWorkflow', () => {
  describe('approveRdo (aprovar só em submetido)', () => {
    it('approves and locks a submitted RDO, generating a signature hash and audit log', () => {
      const rdo = createBaseRdo({ status: 'submetido', locked: false });
      const { rdo: approved, log } = approveRdo(rdo, masterUser, {
        ip: '10.0.0.1',
        deviceId: 'ios-17',
      });

      expect(approved.status).toBe('aprovado');
      expect(approved.locked).toBe(true);
      expect(approved.signature).toBeDefined();
      expect(approved.signature?.signedById).toBe(masterUser.id);
      expect(approved.signature?.hash).toMatch(/^SL-[0-9A-F]{8}$/);
      expect(log.action).toBe('aprovado');
    });

    it('rejects approval when RDO is not in submetido status or is already locked', () => {
      const draft = createBaseRdo({ status: 'rascunho' });
      const returned = createBaseRdo({ status: 'devolvido' });
      const alreadyApproved = createBaseRdo({ status: 'aprovado', locked: true });

      expect(() => approveRdo(draft, masterUser, { ip: '1.1.1.1', deviceId: 'dev' })).toThrow(
        WorkflowError,
      );
      expect(() => approveRdo(returned, masterUser, { ip: '1.1.1.1', deviceId: 'dev' })).toThrow(
        WorkflowError,
      );
      expect(() =>
        approveRdo(alreadyApproved, masterUser, { ip: '1.1.1.1', deviceId: 'dev' }),
      ).toThrow(WorkflowError);
    });
  });

  describe('returnRdo (devolver)', () => {
    it('returns a submitted RDO with justification and logs the reason', () => {
      const rdo = createBaseRdo({ status: 'submetido' });
      const { rdo: returned, log } = returnRdo(
        rdo,
        masterUser,
        'Faltou anexar a nota fiscal do aço recebido.',
      );

      expect(returned.status).toBe('devolvido');
      expect(returned.returnReason).toBe('Faltou anexar a nota fiscal do aço recebido.');
      expect(log.action).toBe('devolvido');
      expect(log.justification).toBe('Faltou anexar a nota fiscal do aço recebido.');
    });

    it('rejects return without a valid justification or when status is not submetido', () => {
      const rdo = createBaseRdo({ status: 'submetido' });
      expect(() => returnRdo(rdo, masterUser, 'curt')).toThrow(WorkflowError);

      const draft = createBaseRdo({ status: 'rascunho' });
      expect(() => returnRdo(draft, masterUser, 'Justificativa válida com mais de 5 chars')).toThrow(
        WorkflowError,
      );
    });
  });

  describe('rectifyRdo (retificar sem duplicar)', () => {
    it('freezes v1 and replaces it in active rdos list with v2 without duplicating', () => {
      const v1 = createBaseRdo({ id: 'rdo-100', status: 'aprovado', locked: true, version: 1 });
      const otherRdo = createBaseRdo({ id: 'rdo-101', number: 101 });
      const existingList = [v1, otherRdo];

      const { original, newVersion, rdos, log } = rectifyRdo(
        v1,
        masterUser,
        'Correção de quantitativo de aço aferido em medição.',
        existingList,
      );

      expect(original.locked).toBe(true);
      expect(newVersion.id).toBe('rdo-100-v2');
      expect(newVersion.version).toBe(2);
      expect(newVersion.previousVersionId).toBe('rdo-100');
      expect(newVersion.status).toBe('submetido');
      expect(newVersion.locked).toBe(false);
      expect(newVersion.signature).toBeUndefined();

      // Must replace v1 in the active list instead of duplicating
      expect(rdos).toHaveLength(2);
      expect(rdos.map((r) => r.id)).toEqual(['rdo-100-v2', 'rdo-101']);
      expect(log.action).toBe('retificado');
    });

    it('prevents duplicate rectification when a newer version already exists', () => {
      const v1 = createBaseRdo({ id: 'rdo-100', status: 'aprovado', locked: true, version: 1 });
      const v2 = createBaseRdo({
        id: 'rdo-100-v2',
        version: 2,
        previousVersionId: 'rdo-100',
        status: 'submetido',
      });

      expect(() =>
        rectifyRdo(v1, masterUser, 'Tentativa duplicada de retificação', [v1, v2]),
      ).toThrow(WorkflowError);
    });
  });

  describe('auditedEdit (edição auditável altera o campo)', () => {
    it('alters the target section field on the RDO and records previous/new values in audit log', () => {
      const rdo = createBaseRdo({ status: 'submetido' });
      const previousDescription = rdo.activities[0]!.description;
      const newDescription = 'Armação de pilares P1 a P12 (conferido em campo)';

      const { rdo: edited, log } = auditedEdit(rdo, masterUser, {
        section: 'atividades',
        field: 'Descrição da Atividade #1',
        previousValue: previousDescription,
        newValue: newDescription,
        justification: 'Ajuste de numeração de pilares conforme projeto executivo.',
      });

      expect(edited.activities[0]!.description).toBe(newDescription);
      expect(log.action).toBe('editado');
      expect(log.section).toBe('atividades');
      expect(log.previousValue).toBe(previousDescription);
      expect(log.newValue).toBe(newDescription);
      expect(log.justification).toBe('Ajuste de numeração de pilares conforme projeto executivo.');
    });

    it('rejects audited edit when value did not change or justification is missing', () => {
      const rdo = createBaseRdo({ status: 'submetido' });
      expect(() =>
        auditedEdit(rdo, masterUser, {
          section: 'atividades',
          field: 'Descrição',
          previousValue: 'Mesmo valor',
          newValue: 'Mesmo valor',
          justification: 'Justificativa válida',
        }),
      ).toThrow(WorkflowError);
    });
  });

  describe('getAvailableActions (por status e perfil)', () => {
    it('returns correct actions for common profile across all statuses', () => {
      expect(getAvailableActions('rascunho', 'common')).toEqual(['edit', 'submit']);
      expect(getAvailableActions('devolvido', 'common')).toEqual(['edit', 'submit']);
      expect(getAvailableActions('submetido', 'common')).toEqual([]);
      expect(getAvailableActions('aprovado', 'common')).toEqual([]);
    });

    it('returns correct actions for master profile across all statuses', () => {
      expect(getAvailableActions('rascunho', 'master')).toEqual(['edit', 'submit']);
      expect(getAvailableActions('devolvido', 'master')).toEqual(['edit', 'submit']);
      expect(getAvailableActions('submetido', 'master')).toEqual([
        'approve',
        'return',
        'auditedEdit',
        'comment',
      ]);
      expect(getAvailableActions('aprovado', 'master')).toEqual(['rectify']);
    });
  });

  describe('submitRdo & addComment', () => {
    it('submits a returned RDO clearing returnReason', () => {
      const returned = createBaseRdo({ status: 'devolvido', returnReason: 'Motivo antigo' });
      const { rdo: submitted, log } = submitRdo(returned, commonUser);
      expect(submitted.status).toBe('submetido');
      expect(submitted.returnReason).toBeUndefined();
      expect(log.action).toBe('submetido');
    });

    it('adds a technical comment to a section and logs it', () => {
      const rdo = createBaseRdo({ status: 'submetido' });
      const { rdo: commented, log } = addComment(
        rdo,
        masterUser,
        'maoDeObra',
        'Confirmar efetivo terceirizado amanhã.',
      );
      expect(commented.comments).toHaveLength(1);
      expect(commented.comments[0]!.text).toBe('Confirmar efetivo terceirizado amanhã.');
      expect(log.action).toBe('comentado');
    });
  });
});
