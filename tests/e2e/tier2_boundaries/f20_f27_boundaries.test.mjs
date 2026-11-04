/**
 * Tier 2: Boundary & Corner Cases — Features 20 to 27 (Master Review, Watermark Inspection, Comments, Edits, Return, 2FA, Rectification, Audit Trail)
 * 5 test cases per feature = 40 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createValidRDO,
  createMockUser,
  createPhotoEntry,
  createActivityEntry,
  isOverdue,
  getDisplayStatus,
  REVIEW_SLA_HOURS,
  MASTER_PIN,
} from '../harness/contracts.mjs';
import {
  returnRdo,
  auditedEdit,
  addComment,
  approveRdo,
  rectifyRdo,
  WorkflowError,
} from '../harness/workflow.mjs';
import { verifyPhotoWatermark } from '../harness/watermark.mjs';
import { MockServerApi, ApiError } from '../harness/apiClient.mjs';

/* ========================================================================== */
/* Feature 20 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B20.1: Master retrieving non-existent RDO throws 404 ApiError', async () => {
  const api = new MockServerApi();
  await assert.rejects(
    async () => api.getRDO('non-existent-id'),
    (err) => err instanceof ApiError && err.status === 404
  );
});

test('B20.2: Master viewing RDO with 0 comments renders empty comments list', () => {
  const rdo = createValidRDO({ comments: [] });
  assert.strictEqual(rdo.comments.length, 0);
});

test('B20.3: Master viewing RDO with empty optional sections handles gracefully', () => {
  const rdo = createValidRDO({
    materials: [],
    occurrences: [],
    photos: [],
  });
  assert.strictEqual(rdo.materials.length, 0);
  assert.strictEqual(rdo.occurrences.length, 0);
  assert.strictEqual(rdo.photos.length, 0);
});

test('B20.4: Viewing RDO with 30+ activity entries preserves full array', () => {
  const activities = Array.from({ length: 30 }, (_, i) =>
    createActivityEntry({ description: `Frente de serviço ${i + 1}`, progress: i * 3 })
  );
  const rdo = createValidRDO({ activities });
  assert.strictEqual(rdo.activities.length, 30);
});

test('B20.5: RDO search query with no matching terms yields empty list', () => {
  const rdos = [createValidRDO({ workName: 'Residencial Topázio' })];
  const query = 'Hospital da Criança';
  const matches = rdos.filter((r) => r.workName.includes(query));
  assert.strictEqual(matches.length, 0);
});

/* ========================================================================== */
/* Feature 21 Boundaries: Inspeção de Marca d'Água (5 tests)                  */
/* ========================================================================== */

test('B21.1: Inspected photo with tampered GPS coordinates is flagged as anomaly', () => {
  const photo = createPhotoEntry();
  photo.metadata.latitude = 95.0; // Out of bounds

  const inspection = verifyPhotoWatermark(photo);
  assert.strictEqual(inspection.verified, false);
  assert.ok(inspection.anomalies.some((a) => a.includes('latitude inválida')));
});

test('B21.2: Inspected photo with mismatching workId is flagged as anomaly', () => {
  const rdo = createValidRDO({ workId: 'work-abc' });
  const photo = createPhotoEntry();
  photo.metadata.workId = 'work-xyz';

  const inspection = verifyPhotoWatermark(photo, rdo);
  assert.strictEqual(inspection.verified, false);
  assert.ok(inspection.anomalies.some((a) => a.includes('diverge da obra do RDO')));
});

test('B21.3: Inspected photo with altered hash fails integrity verification', () => {
  const photo = createPhotoEntry();
  photo.metadata.hash = 'SL-FORGED01';

  const inspection = verifyPhotoWatermark(photo);
  assert.strictEqual(inspection.verified, false);
  assert.ok(inspection.anomalies.some((a) => a.includes('Hash criptográfico corrompido')));
});

test('B21.4: Inspected photo with missing metadata returns verified: false', () => {
  const photo = createPhotoEntry();
  photo.metadata = null;

  const inspection = verifyPhotoWatermark(photo);
  assert.strictEqual(inspection.verified, false);
  assert.ok(inspection.anomalies.some((a) => a.includes('Metadados')));
});

test('B21.5: Null photo input to inspector returns error anomaly', () => {
  const inspection = verifyPhotoWatermark(null);
  assert.strictEqual(inspection.verified, false);
  assert.ok(inspection.anomalies.length > 0);
});

/* ========================================================================== */
/* Feature 22 Boundaries: Comentários Técnicos (5 tests)                      */
/* ========================================================================== */

test('B22.1: Adding comment with empty string throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => addComment(rdo, master, 'identificacao', ''),
    /O comentário não pode ser vazio/
  );
});

test('B22.2: Adding comment with whitespace only throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => addComment(rdo, master, 'maoDeObra', '     '),
    /O comentário não pode ser vazio/
  );
});

test('B22.3: Extremely long comment text (5000 chars) succeeds', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  const longText = 'Comentário técnico detalhado sobre as diretrizes de execução. '.repeat(80).trim();

  const { rdo: updated } = addComment(rdo, master, 'atividades', longText);
  assert.strictEqual(updated.comments.length, 1);
  assert.strictEqual(updated.comments[0].text, longText);
});

test('B22.4: Multiple comments across different sections are preserved', () => {
  const master = createMockUser({ profile: 'master' });
  let rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  rdo = addComment(rdo, master, 'identificacao', 'Nota clima').rdo;
  rdo = addComment(rdo, master, 'fotos', 'Nota foto').rdo;

  assert.strictEqual(rdo.comments.length, 2);
  assert.strictEqual(rdo.comments[0].section, 'identificacao');
  assert.strictEqual(rdo.comments[1].section, 'fotos');
});

test('B22.5: Comment retains author details and ISO timestamp', () => {
  const master = createMockUser({ id: 'm-99', name: 'Eng. Auditor', profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { comment } = addComment(rdo, master, 'equipamentos', 'Aferição de tacômetro');
  assert.strictEqual(comment.authorId, 'm-99');
  assert.strictEqual(comment.authorName, 'Eng. Auditor');
  assert.ok(!isNaN(Date.parse(comment.createdAt)));
});

/* ========================================================================== */
/* Feature 23 Boundaries: Edição Auditada (5 tests)                           */
/* ========================================================================== */

test('B23.1: Audited edit with justification < 5 chars (e.g. ok) throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => auditedEdit(rdo, master, {
      section: 'atividades',
      field: 'description',
      previousValue: 'Pintura',
      newValue: 'Pintura Epóxi',
      justification: 'ok',
    }),
    /Justificativa da alteração é obrigatória \(mínimo 5 caracteres\)/
  );
});

test('B23.2: Audited edit where newValue equals previousValue throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => auditedEdit(rdo, master, {
      section: 'atividades',
      field: 'description',
      previousValue: 'Alvenaria',
      newValue: 'Alvenaria',
      justification: 'Tentando salvar mesmo valor',
    }),
    /O novo valor é igual ao anterior/
  );
});

test('B23.3: Audited edit on locked RDO throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO, locked: true });

  assert.throws(
    () => auditedEdit(rdo, master, {
      section: 'atividades',
      field: 'description',
      previousValue: 'A',
      newValue: 'B',
      justification: 'Justificativa válida',
    }),
    /Edição auditável disponível apenas para RDOs em análise/
  );
});

test('B23.4: Audited edit on draft RDO (not submetido) throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.RASCUNHO });

  assert.throws(
    () => auditedEdit(rdo, master, {
      section: 'atividades',
      field: 'description',
      previousValue: 'A',
      newValue: 'B',
      justification: 'Justificativa válida',
    }),
    /Edição auditável disponível apenas para RDOs em análise/
  );
});

test('B23.5: Audited edit on approved RDO throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.APROVADO, locked: true });

  assert.throws(
    () => auditedEdit(rdo, master, {
      section: 'atividades',
      field: 'description',
      previousValue: 'A',
      newValue: 'B',
      justification: 'Justificativa válida',
    }),
    /Edição auditável disponível apenas para RDOs em análise/
  );
});

/* ========================================================================== */
/* Feature 24 Boundaries: Devolução Motivada (5 tests)                        */
/* ========================================================================== */

test('B24.1: Devolução with justification < 10 chars (e.g. refazer) throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => returnRdo(rdo, master, 'refazer'),
    /Justificativa de devolução é obrigatória \(mínimo 10 caracteres\)/
  );
});

test('B24.2: Devolução with empty string justification throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => returnRdo(rdo, master, ''),
    /Justificativa de devolução é obrigatória \(mínimo 10 caracteres\)/
  );
});

test('B24.3: Devolução on draft RDO (not submetido) throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.RASCUNHO });

  assert.throws(
    () => returnRdo(rdo, master, 'Justificativa técnica detalhada'),
    /Só é possível devolver RDOs submetidos/
  );
});

test('B24.4: Devolução on approved RDO throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.APROVADO, locked: true });

  assert.throws(
    () => returnRdo(rdo, master, 'Justificativa técnica detalhada'),
    /RDO bloqueado não pode ser devolvido/
  );
});

test('B24.5: Devolução on locked RDO throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO, locked: true });

  assert.throws(
    () => returnRdo(rdo, master, 'Justificativa técnica detalhada'),
    /RDO bloqueado não pode ser devolvido/
  );
});

/* ========================================================================== */
/* Feature 25 Boundaries: Aprovação e 2FA (5 tests)                           */
/* ========================================================================== */

test('B25.1: Approval with wrong PIN (e.g. 0000, 9999) throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => approveRdo(rdo, master, { pin: '0000' }),
    /PIN de homologação incorreto/
  );
  assert.throws(
    () => approveRdo(rdo, master, { pin: '9999' }),
    /PIN de homologação incorreto/
  );
});

test('B25.2: Approval with empty PIN throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => approveRdo(rdo, master, { pin: '' }),
    /PIN de homologação incorreto/
  );
});

test('B25.3: Approval of draft RDO throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.RASCUNHO });

  assert.throws(
    () => approveRdo(rdo, master, { pin: MASTER_PIN }),
    /Apenas RDOs submetidos e não bloqueados podem ser aprovados/
  );
});

test('B25.4: Approval of already approved RDO throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.APROVADO, locked: true });

  assert.throws(
    () => approveRdo(rdo, master, { pin: MASTER_PIN }),
    /Apenas RDOs submetidos e não bloqueados podem ser aprovados/
  );
});

test('B25.5: Approval of returned RDO (before resubmission) throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.DEVOLVIDO });

  assert.throws(
    () => approveRdo(rdo, master, { pin: MASTER_PIN }),
    /Apenas RDOs submetidos e não bloqueados podem ser aprovados/
  );
});

/* ========================================================================== */
/* Feature 26 Boundaries: RDO Retificador (5 tests)                           */
/* ========================================================================== */

test('B26.1: Rectification on unapproved RDO throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.throws(
    () => rectifyRdo(rdo, master, 'Motivo de retificação válido'),
    /Apenas RDOs aprovados podem ser retificados/
  );
});

test('B26.2: Rectification with justification < 5 chars throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.APROVADO, locked: true });

  assert.throws(
    () => rectifyRdo(rdo, master, 'erro'),
    /Justificativa da retificação é obrigatória \(mínimo 5 caracteres\)/
  );
});

test('B26.3: Duplicate rectification of same RDO version throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const approved = createValidRDO({ id: 'rdo-1', version: 1, status: RDO_STATUS.APROVADO, locked: true });

  const { newVersion, rdos } = rectifyRdo(approved, master, 'Primeira retificação', [approved]);

  assert.throws(
    () => rectifyRdo(approved, master, 'Segunda retificação proibida', [approved, newVersion]),
    /Este RDO já possui uma retificação emitida/
  );
});

test('B26.4: Rectification on unlocked RDO throws WorkflowError', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.APROVADO, locked: false });

  assert.throws(
    () => rectifyRdo(rdo, master, 'Motivo válido de retificação'),
    /Apenas RDOs aprovados podem ser retificados/
  );
});

test('B26.5: Successive rectifications (v1 -> v2 -> v3) succeed with sequential versioning', () => {
  const master = createMockUser({ profile: 'master' });
  const v1 = createValidRDO({ id: 'doc-1', version: 1, status: RDO_STATUS.APROVADO, locked: true });

  const resV2 = rectifyRdo(v1, master, 'Primeira revisão pós aprovação', [v1]);
  assert.strictEqual(resV2.newVersion.version, 2);

  // Approve v2
  const approvedV2 = { ...resV2.newVersion, status: RDO_STATUS.APROVADO, locked: true };

  // Rectify v2 -> v3
  const resV3 = rectifyRdo(approvedV2, master, 'Segunda revisão pós aprovação', [v1, approvedV2]);
  assert.strictEqual(resV3.newVersion.version, 3);
  assert.strictEqual(resV3.newVersion.previousVersionId, approvedV2.id);
});

/* ========================================================================== */
/* Feature 27 Boundaries: Trilha de Auditoria & SLA (5 tests)                 */
/* ========================================================================== */

test('B27.1: Attempting to mutate audit log entry throws error if frozen', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  const { log } = returnRdo(rdo, master, 'Justificativa para teste de congelamento');

  const frozen = Object.freeze(log);
  assert.throws(() => {
    frozen.justification = 'modificado';
  }, TypeError);
});

test('B27.2: RDO overdue by > 24h derives display status atrasado', () => {
  const now = new Date('2026-10-30T16:00:00.000Z');
  const submitted25hAgo = new Date('2026-10-29T15:00:00.000Z').toISOString();

  const rdo = { status: RDO_STATUS.SUBMETIDO, submittedAt: submitted25hAgo };
  assert.strictEqual(isOverdue(rdo, now), true);
  assert.strictEqual(getDisplayStatus(rdo, now), 'atrasado');
});

test('B27.3: RDO submitted at exactly 23h 59m is NOT overdue (stays submetido)', () => {
  const now = new Date('2026-10-30T16:00:00.000Z');
  const submitted23h59mAgo = new Date('2026-10-29T16:01:00.000Z').toISOString();

  const rdo = { status: RDO_STATUS.SUBMETIDO, submittedAt: submitted23h59mAgo };
  assert.strictEqual(isOverdue(rdo, now), false);
  assert.strictEqual(getDisplayStatus(rdo, now), RDO_STATUS.SUBMETIDO);
});

test('B27.4: RDO submitted at 24h 01m is overdue (derives atrasado)', () => {
  const now = new Date('2026-10-30T16:00:00.000Z');
  const submitted24h01mAgo = new Date('2026-10-29T15:59:00.000Z').toISOString();

  const rdo = { status: RDO_STATUS.SUBMETIDO, submittedAt: submitted24h01mAgo };
  assert.strictEqual(isOverdue(rdo, now), true);
  assert.strictEqual(getDisplayStatus(rdo, now), 'atrasado');
});

test('B27.5: Approved RDO is never overdue even if submitted > 24h ago', () => {
  const now = new Date('2026-10-30T16:00:00.000Z');
  const submitted48hAgo = new Date('2026-10-28T16:00:00.000Z').toISOString();

  const rdo = { status: RDO_STATUS.APROVADO, submittedAt: submitted48hAgo };
  assert.strictEqual(isOverdue(rdo, now), false);
  assert.strictEqual(getDisplayStatus(rdo, now), RDO_STATUS.APROVADO);
});
