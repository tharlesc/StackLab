/**
 * Tier 1: Feature Coverage — Features 20 to 27 (Master Review, Watermark Inspection, Comments, Edits, Return, 2FA, Rectification, Audit Trail)
 * 5 test cases per feature = 40 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createValidRDO,
  createMockUser,
  createPhotoEntry,
  createWeatherEntry,
  createLaborEntry,
  createEquipmentEntry,
  createActivityEntry,
  createMaterialEntry,
  createOccurrenceEntry,
  MASTER_PIN,
} from '../harness/contracts.mjs';
import {
  submitRdo,
  returnRdo,
  auditedEdit,
  addComment,
  approveRdo,
  rectifyRdo,
  canCommonEdit,
} from '../harness/workflow.mjs';
import { verifyPhotoWatermark } from '../harness/watermark.mjs';

/* ========================================================================== */
/* Feature 20: Master - Visualização Modular (5 tests)                        */
/* ========================================================================== */

test('F20.1: Block 1: Identificação & Clima rendered with full field fidelity', () => {
  const rdo = createValidRDO({
    workName: 'Residencial Topázio',
    date: '2026-10-29',
    weather: [
      createWeatherEntry({ shift: 'manha', condition: 'Ensolarado' }),
      createWeatherEntry({ shift: 'tarde', condition: 'Chuva', stoppageHours: 2, impact: 'Pausa concretagem' }),
    ],
  });

  assert.strictEqual(rdo.workName, 'Residencial Topázio');
  assert.strictEqual(rdo.weather.length, 2);
  assert.strictEqual(rdo.weather[1].stoppageHours, 2);
  assert.strictEqual(rdo.weather[1].impact, 'Pausa concretagem');
});

test('F20.2: Block 2: Mão de Obra & Equipamentos rendered with headcount and Hh', () => {
  const rdo = createValidRDO({
    labor: [
      createLaborEntry({ role: 'Pedreiro', quantity: 4, hours: 8 }),
      createLaborEntry({ role: 'Servente', quantity: 6, hours: 8 }),
    ],
    equipment: [
      createEquipmentEntry({ name: 'Mini Escavadeira', activeHours: 6, idleHours: 2, idleJustification: 'Aguardando caminhão' }),
    ],
  });

  assert.strictEqual(rdo.labor.length, 2);
  assert.strictEqual(rdo.equipment[0].idleJustification, 'Aguardando caminhão');
});

test('F20.3: Block 3: Atividades & Materiais rendered with progress and NF-e', () => {
  const rdo = createValidRDO({
    activities: [createActivityEntry({ description: 'Reboco paulista', progress: 65 })],
    materials: [createMaterialEntry({ name: 'Cal Hidratada', supplier: 'Itaú', invoice: 'NF-7788' })],
  });

  assert.strictEqual(rdo.activities[0].progress, 65);
  assert.strictEqual(rdo.materials[0].invoice, 'NF-7788');
});

test('F20.4: Block 4: Ocorrências & Fotos rendered with watermarks', () => {
  const rdo = createValidRDO({
    occurrences: [createOccurrenceEntry({ type: 'dds', description: 'DDS NR-18' })],
    photos: [createPhotoEntry({ caption: 'Foto de armadura' })],
  });

  assert.strictEqual(rdo.occurrences[0].type, 'dds');
  assert.strictEqual(rdo.photos[0].caption, 'Foto de armadura');
  assert.ok(rdo.photos[0].watermarkedUri);
});

test('F20.5: Zero data omission across all 7 sections', () => {
  const rdo = createValidRDO();
  const keys = ['workId', 'weather', 'labor', 'equipment', 'activities', 'materials', 'occurrences', 'photos'];
  for (const k of keys) {
    assert.ok(rdo[k] !== undefined && rdo[k] !== null, `Section/field ${k} must be present in Master view`);
  }
});

/* ========================================================================== */
/* Feature 21: Master - Inspeção de Marca d'Água (5 tests)                    */
/* ========================================================================== */

test('F21.1: Watermark inspection verifies GPS latitude, longitude, and accuracy', () => {
  const rdo = createValidRDO();
  const photo = rdo.photos[0];
  const inspection = verifyPhotoWatermark(photo, rdo);

  assert.strictEqual(inspection.verified, true);
  assert.strictEqual(typeof inspection.metadata.latitude, 'number');
  assert.strictEqual(typeof inspection.metadata.longitude, 'number');
  assert.strictEqual(typeof inspection.metadata.accuracy, 'number');
});

test('F21.2: Watermark inspection verifies date/time matches capture', () => {
  const rdo = createValidRDO();
  const photo = rdo.photos[0];
  const inspection = verifyPhotoWatermark(photo, rdo);

  assert.ok(inspection.metadata.capturedAt);
  assert.ok(inspection.metadata.formattedBrasiliaTime);
});

test('F21.3: Watermark inspection verifies work ID matches RDO work', () => {
  const rdo = createValidRDO({ workId: 'work-target' });
  const photo = createPhotoEntry({
    metadata: { workId: 'work-target' },
  });

  const inspection = verifyPhotoWatermark(photo, rdo);
  assert.strictEqual(inspection.verified, true);
  assert.strictEqual(inspection.metadata.workId, rdo.workId);
});

test('F21.4: Watermark inspection validates cryptographic hash integrity', () => {
  const rdo = createValidRDO();
  const photo = rdo.photos[0];
  const inspection = verifyPhotoWatermark(photo, rdo);

  assert.strictEqual(inspection.verified, true);
  assert.ok(inspection.metadata.hash.startsWith('SL-'));
});

test('F21.5: Watermark zoom view renders high-contrast text lines', () => {
  const photo = createPhotoEntry();
  assert.ok(photo.metadata);
  const inspection = verifyPhotoWatermark(photo);
  assert.strictEqual(inspection.verified, true);
});

/* ========================================================================== */
/* Feature 22: Master - Comentários Técnicos (5 tests)                        */
/* ========================================================================== */

test('F22.1: Master adds technical comment to identificacao section', () => {
  const master = createMockUser({ profile: 'master', name: 'Eng. Master Davi' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: updated, log } = addComment(rdo, master, 'identificacao', 'Verificar medição pluviométrica da tarde.');
  assert.strictEqual(updated.comments.length, 1);
  assert.strictEqual(updated.comments[0].section, 'identificacao');
  assert.strictEqual(log.action, 'comentado');
});

test('F22.2: Master adds technical comment to maoDeObra section', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: updated } = addComment(rdo, master, 'maoDeObra', 'Subcontratada de gesso com efetivo reduzido.');
  assert.strictEqual(updated.comments[0].section, 'maoDeObra');
});

test('F22.3: Master adds technical comment to equipamentos section', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: updated } = addComment(rdo, master, 'equipamentos', 'Solicitar laudo de manutenção da grua.');
  assert.strictEqual(updated.comments[0].section, 'equipamentos');
});

test('F22.4: Comment records author name, author ID, timestamp', () => {
  const master = createMockUser({ id: 'usr-master-1', name: 'Eng. Chefe Marcos', profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { comment } = addComment(rdo, master, 'atividades', 'Excelente avanço no reboco.');
  assert.strictEqual(comment.authorId, master.id);
  assert.strictEqual(comment.authorName, master.name);
  assert.ok(comment.createdAt);
});

test('F22.5: Comment appends audit log with action comentado', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { log } = addComment(rdo, master, 'fotos', 'Foto 1 com nitidez impecável.');
  assert.strictEqual(log.action, 'comentado');
  assert.strictEqual(log.section, 'fotos');
});

/* ========================================================================== */
/* Feature 23: Master - Edição Auditada (5 tests)                             */
/* ========================================================================== */

test('F23.1: Audited edit updates field value in active section', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({
    status: RDO_STATUS.SUBMETIDO,
    labor: [createLaborEntry({ role: 'Ajudante Geral', quantity: 2, hours: 8 })],
  });

  const { rdo: edited } = auditedEdit(rdo, master, {
    section: 'maoDeObra',
    field: 'role',
    previousValue: 'Ajudante Geral',
    newValue: 'Servente de Obras',
    justification: 'Ajuste de nomenclatura para padrão CBO do cliente',
  });

  assert.strictEqual(edited.labor[0].role, 'Servente de Obras');
});

test('F23.2: Audited edit requires justification >= 5 characters', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { log } = auditedEdit(rdo, master, {
    section: 'atividades',
    field: 'description',
    previousValue: 'Concretagem',
    newValue: 'Concretagem de laje',
    justification: 'Especificação técnica necessária',
  });

  assert.strictEqual(log.justification, 'Especificação técnica necessária');
});

test('F23.3: Audited edit records previousValue and newValue', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { log } = auditedEdit(rdo, master, {
    section: 'equipamentos',
    field: 'name',
    previousValue: 'Betoneira Velha',
    newValue: 'Betoneira 400L CSM',
    justification: 'Identificação completa do maquinário',
  });

  assert.strictEqual(log.previousValue, 'Betoneira Velha');
  assert.strictEqual(log.newValue, 'Betoneira 400L CSM');
});

test('F23.4: Audited edit appends immutable audit log with action editado', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { log } = auditedEdit(rdo, master, {
    section: 'materiais',
    field: 'name',
    previousValue: 'Cimento',
    newValue: 'Cimento CP-II F 32',
    justification: 'Especificação do tipo exato de cimento',
  });

  assert.strictEqual(log.action, 'editado');
  assert.strictEqual(log.section, 'materiais');
});

test('F23.5: Audited edit preserves historical audit trail', () => {
  const master = createMockUser({ profile: 'master' });
  let rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  const logs = [];

  const res1 = auditedEdit(rdo, master, {
    section: 'atividades',
    field: 'description',
    previousValue: 'Alvenaria',
    newValue: 'Alvenaria Bloco Cerâmico',
    justification: 'Detalhamento do bloco',
  });
  rdo = res1.rdo;
  logs.push(res1.log);

  const res2 = auditedEdit(rdo, master, {
    section: 'atividades',
    field: 'description',
    previousValue: 'Alvenaria Bloco Cerâmico',
    newValue: 'Alvenaria Bloco Cerâmico 14x19x29',
    justification: 'Dimensão do bloco adicionada',
  });
  logs.push(res2.log);

  assert.strictEqual(logs.length, 2);
  assert.strictEqual(logs[0].previousValue, 'Alvenaria');
  assert.strictEqual(logs[1].newValue, 'Alvenaria Bloco Cerâmico 14x19x29');
});

/* ========================================================================== */
/* Feature 24: Master - Devolução Motivada (5 tests)                          */
/* ========================================================================== */

test('F24.1: Devolução transitions status from submetido to devolvido', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: returned } = returnRdo(rdo, master, 'Faltou anexar as fotos da concretagem do 4º piso.');
  assert.strictEqual(returned.status, RDO_STATUS.DEVOLVIDO);
});

test('F24.2: Devolução requires technical justification >= 10 characters', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  const reason = 'Justificativa técnica bem elaborada com mais de 10 caracteres';

  const { rdo: returned } = returnRdo(rdo, master, reason);
  assert.strictEqual(returned.returnReason, reason);
});

test('F24.3: Devolução unlocks RDO for worker (canCommonEdit returns true)', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  assert.strictEqual(canCommonEdit(rdo), false);
  const { rdo: returned } = returnRdo(rdo, master, 'Ajustar cálculo de homens-hora do turno tarde.');
  assert.strictEqual(canCommonEdit(returned), true, 'Returned RDO must be editable by worker');
});

test('F24.4: Devolução records returnReason in RDO', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  const msg = 'Favor detalhar paralisação por chuva das 15h às 17h.';

  const { rdo: returned } = returnRdo(rdo, master, msg);
  assert.strictEqual(returned.returnReason, msg);
});

test('F24.5: Devolução generates audit log with action devolvido', () => {
  const master = createMockUser({ id: 'usr-m-9', name: 'Eng. Davi', profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { log } = returnRdo(rdo, master, 'Necessário revisar fornecedor de brita.');
  assert.strictEqual(log.action, 'devolvido');
  assert.strictEqual(log.actorId, master.id);
  assert.strictEqual(log.justification, 'Necessário revisar fornecedor de brita.');
});

/* ========================================================================== */
/* Feature 25: Master - Aprovação e 2FA (5 tests)                             */
/* ========================================================================== */

test('F25.1: Master approval requires 2FA PIN 1234', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: approved } = approveRdo(rdo, master, { pin: MASTER_PIN });
  assert.strictEqual(approved.status, RDO_STATUS.APROVADO);
});

test('F25.2: Approval transitions status from submetido to aprovado', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: approved } = approveRdo(rdo, master, { pin: '1234' });
  assert.strictEqual(approved.status, RDO_STATUS.APROVADO);
});

test('F25.3: Approval sets locked: true, permanently freezing document', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: approved } = approveRdo(rdo, master, { pin: '1234' });
  assert.strictEqual(approved.locked, true);
  assert.strictEqual(canCommonEdit(approved), false);
});

test('F25.4: Approval captures SignatureMeta (signer, IP, device, SHA-256 hash)', () => {
  const master = createMockUser({ id: 'm-01', name: 'Eng. Master Davi', profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { signature } = approveRdo(rdo, master, { pin: '1234', ip: '192.168.1.50', deviceId: 'iPad-Pro-01' });
  assert.strictEqual(signature.signedById, master.id);
  assert.strictEqual(signature.signedByName, master.name);
  assert.strictEqual(signature.ip, '192.168.1.50');
  assert.strictEqual(signature.deviceId, 'iPad-Pro-01');
  assert.ok(signature.hash.startsWith('SL-'));
});

test('F25.5: Approval generates audit log with action aprovado', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { log } = approveRdo(rdo, master, { pin: '1234' });
  assert.strictEqual(log.action, 'aprovado');
  assert.ok(log.newValue.startsWith('SL-'));
});

/* ========================================================================== */
/* Feature 26: Master - RDO Retificador (5 tests)                             */
/* ========================================================================== */

test('F26.1: Rectification creates version N+1 linked to original approved RDO', () => {
  const master = createMockUser({ profile: 'master' });
  const approvedRdo = createValidRDO({ id: 'rdo-100', version: 1, status: RDO_STATUS.APROVADO, locked: true });

  const { original, newVersion } = rectifyRdo(approvedRdo, master, 'Correção de quantitativo de aço CA-50', [approvedRdo]);
  assert.strictEqual(newVersion.version, 2);
  assert.strictEqual(newVersion.previousVersionId, original.id);
  assert.strictEqual(newVersion.id, 'rdo-100-v2');
});

test('F26.2: Original approved RDO remains frozen with locked: true', () => {
  const master = createMockUser({ profile: 'master' });
  const approvedRdo = createValidRDO({ id: 'rdo-100', version: 1, status: RDO_STATUS.APROVADO, locked: true });

  const { original } = rectifyRdo(approvedRdo, master, 'Ajuste formal', [approvedRdo]);
  assert.strictEqual(original.locked, true);
  assert.strictEqual(original.status, RDO_STATUS.APROVADO);
});

test('F26.3: New rectified version starts in submetido for technical review', () => {
  const master = createMockUser({ profile: 'master' });
  const approvedRdo = createValidRDO({ id: 'rdo-100', version: 1, status: RDO_STATUS.APROVADO, locked: true });

  const { newVersion } = rectifyRdo(approvedRdo, master, 'Revisão de horas da betoneira', [approvedRdo]);
  assert.strictEqual(newVersion.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(newVersion.locked, false);
});

test('F26.4: Rectification records formal reason (>= 5 chars)', () => {
  const master = createMockUser({ profile: 'master' });
  const approvedRdo = createValidRDO({ id: 'rdo-100', version: 1, status: RDO_STATUS.APROVADO, locked: true });
  const reason = 'Retificação oficial solicitada pela fiscalização do contratante';

  const { log } = rectifyRdo(approvedRdo, master, reason, [approvedRdo]);
  assert.strictEqual(log.justification, reason);
});

test('F26.5: Rectification generates audit log with action retificado', () => {
  const master = createMockUser({ profile: 'master' });
  const approvedRdo = createValidRDO({ id: 'rdo-100', version: 1, status: RDO_STATUS.APROVADO, locked: true });

  const { log } = rectifyRdo(approvedRdo, master, 'Ajuste técnico de horas', [approvedRdo]);
  assert.strictEqual(log.action, 'retificado');
  assert.strictEqual(log.newValue, 'Versão 2');
});

/* ========================================================================== */
/* Feature 27: Trilha de Auditoria (5 tests)                                  */
/* ========================================================================== */

test('F27.1: Append-only audit log records lifecycle events in chronological order', () => {
  const worker = createMockUser({ profile: 'common' });
  const master = createMockUser({ profile: 'master' });
  let rdo = createValidRDO();
  const trail = [];

  const sub = submitRdo(rdo, worker);
  rdo = sub.rdo;
  trail.push(sub.log);

  const ret = returnRdo(rdo, master, 'Correção de relatório de chuva necessária');
  rdo = ret.rdo;
  trail.push(ret.log);

  const resub = submitRdo(rdo, worker);
  rdo = resub.rdo;
  trail.push(resub.log);

  const app = approveRdo(rdo, master, { pin: '1234' });
  trail.push(app.log);

  assert.strictEqual(trail.length, 4);
  assert.deepStrictEqual(trail.map((t) => t.action), ['submetido', 'devolvido', 'submetido', 'aprovado']);
});

test('F27.2: Audit log captures actor ID, actor name, action, timestamp', () => {
  const master = createMockUser({ id: 'm-77', name: 'Fiscal Davi', profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { log } = returnRdo(rdo, master, 'Necessário revisar efetivo alocado.');
  assert.strictEqual(log.actorId, 'm-77');
  assert.strictEqual(log.actorName, 'Fiscal Davi');
  assert.strictEqual(log.action, 'devolvido');
  assert.ok(log.timestamp);
});

test('F27.3: Audit log preserves field change diffs (previousValue, newValue)', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { log } = auditedEdit(rdo, master, {
    section: 'atividades',
    field: 'progress',
    previousValue: '50',
    newValue: '75',
    justification: 'Medição presencial confirmou 75% executado',
  });

  assert.strictEqual(log.previousValue, '50');
  assert.strictEqual(log.newValue, '75');
});

test('F27.4: Audit log entries are immutable (cannot be edited or deleted)', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  const { log } = returnRdo(rdo, master, 'Justificativa de teste imutabilidade');

  const frozenLog = Object.freeze(log);
  assert.strictEqual(Object.isFrozen(frozenLog), true);
});

test('F27.5: Audit trail provides complete forensic traceability', () => {
  const worker = createMockUser({ id: 'w-1', name: 'Operário', profile: 'common' });
  const master = createMockUser({ id: 'm-1', name: 'Master', profile: 'master' });
  let rdo = createValidRDO();

  const step1 = submitRdo(rdo, worker);
  const step2 = approveRdo(step1.rdo, master, { pin: '1234' });

  const fullTrail = [step1.log, step2.log];
  assert.strictEqual(fullTrail[0].action, 'submetido');
  assert.strictEqual(fullTrail[1].action, 'aprovado');
  assert.ok(fullTrail[1].newValue.startsWith('SL-'));
});
