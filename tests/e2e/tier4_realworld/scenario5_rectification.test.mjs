/**
 * Tier 4: Real-World Scenario 5 — Retificação Oficial Pós-Aprovação e Preservação de Histórico
 * Features Exercised: F1, F20, F25, F26, F27
 * Complexity: Alta
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createMockWork,
  createMockUser,
  createValidRDO,
  MASTER_PIN,
} from '../harness/contracts.mjs';
import {
  approveRdo,
  rectifyRdo,
  auditedEdit,
  WorkflowError,
} from '../harness/workflow.mjs';

test('Scenario 5: Retificação Oficial Pós-Aprovação (v1 -> v2) e Preservação Rigorosa de Histórico Congelado', () => {
  const work = createMockWork({ id: 'work-rec-5', name: 'Edifício Parque das Dunas', code: 'OB-505' });
  const master = createMockUser({ id: 'usr-master-5', name: 'Eng. Master Davi', profile: 'master' });
  const allHistoricalRdos = [];
  const fullAuditTrail = [];

  // =========================================================================
  // Step 1: Document Version 1 is Submitted and Approved
  // =========================================================================
  const rdoV1 = createValidRDO({
    id: 'rdo-obra505-001',
    number: 184,
    version: 1,
    workId: work.id,
    workName: work.name,
    status: RDO_STATUS.SUBMETIDO,
  });

  const { rdo: approvedV1, log: logApproveV1, signature: sigV1 } = approveRdo(rdoV1, master, {
    pin: MASTER_PIN,
    ip: '200.140.10.5',
    deviceId: 'iPad-Master',
  });

  allHistoricalRdos.push(approvedV1);
  fullAuditTrail.push(logApproveV1);

  assert.strictEqual(approvedV1.version, 1);
  assert.strictEqual(approvedV1.status, RDO_STATUS.APROVADO);
  assert.strictEqual(approvedV1.locked, true);
  assert.ok(sigV1.hash.startsWith('SL-'));

  // =========================================================================
  // Step 2: Contractual audit identifies need for official rectification
  // =========================================================================
  const rectificationReason =
    'Retificação oficial decorrente de medição conjunta com o fiscal do contratante: ajuste na quantidade executada de contrapiso.';

  const { original: frozenV1, newVersion: rdoV2, rdos: updatedList, log: logRectify } = rectifyRdo(
    approvedV1,
    master,
    rectificationReason,
    allHistoricalRdos
  );

  fullAuditTrail.push(logRectify);

  // 1. Version 1 must remain frozen in history
  assert.strictEqual(frozenV1.version, 1);
  assert.strictEqual(frozenV1.status, RDO_STATUS.APROVADO);
  assert.strictEqual(frozenV1.locked, true);
  assert.strictEqual(frozenV1.signature.hash, sigV1.hash);

  // 2. Version 2 must be spawned with N+1 version and reference to V1
  assert.strictEqual(rdoV2.version, 2);
  assert.strictEqual(rdoV2.previousVersionId, approvedV1.id);
  assert.strictEqual(rdoV2.id, 'rdo-obra505-001-v2');
  assert.strictEqual(rdoV2.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(rdoV2.locked, false, 'New rectified version must be editable for adjustments');
  assert.strictEqual(rdoV2.signature, undefined, 'New version does not inherit prior signature');

  // =========================================================================
  // Step 3: Enforce Invariant: Cannot spawn duplicate rectification on V1
  // =========================================================================
  assert.throws(
    () => rectifyRdo(approvedV1, master, 'Tentativa de segunda retificação concorrente', updatedList),
    /Este RDO já possui uma retificação emitida/
  );

  // =========================================================================
  // Step 4: Corrections applied to Version 2 in analysis
  // =========================================================================
  const { rdo: correctedV2, log: logEditV2 } = auditedEdit(rdoV2, master, {
    section: 'atividades',
    field: 'description',
    previousValue: rdoV2.activities[0].description,
    newValue: 'Contrapiso autonivelante regularizado e polido (medição ajustada)',
    justification: 'Ajuste conforme ata de reunião nº 14 da contratante',
  });
  fullAuditTrail.push(logEditV2);

  // =========================================================================
  // Step 5: Master homologates Version 2 with 2FA / PIN '1234'
  // =========================================================================
  const { rdo: approvedV2, log: logApproveV2, signature: sigV2 } = approveRdo(correctedV2, master, {
    pin: MASTER_PIN,
    ip: '200.140.10.5',
    deviceId: 'iPad-Master',
  });
  fullAuditTrail.push(logApproveV2);

  assert.strictEqual(approvedV2.version, 2);
  assert.strictEqual(approvedV2.status, RDO_STATUS.APROVADO);
  assert.strictEqual(approvedV2.locked, true);
  assert.notStrictEqual(sigV2.hash, sigV1.hash, 'Rectified version must generate a distinct signature hash');

  // =========================================================================
  // Step 6: Verify Multi-Version Historical Preservation & Complete Audit Trail
  // =========================================================================
  assert.strictEqual(frozenV1.version, 1);
  assert.strictEqual(frozenV1.status, RDO_STATUS.APROVADO);
  assert.strictEqual(approvedV2.version, 2);
  assert.strictEqual(approvedV2.previousVersionId, frozenV1.id);

  assert.strictEqual(fullAuditTrail.length, 4);
  assert.deepStrictEqual(
    fullAuditTrail.map((a) => a.action),
    ['aprovado', 'retificado', 'editado', 'aprovado']
  );
  assert.strictEqual(fullAuditTrail[1].justification, rectificationReason);
});
