/**
 * Tier 4: Real-World Scenario 4 — Canteiro Pesado com Mão de Obra Mista e Ociosidade Justificada
 * Features Exercised: F4, F5, F6, F7, F8, F9, F11, F18, F19, F20, F23, F25
 * Complexity: Alta
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createMockWork,
  createMockUser,
  createValidRDO,
  createLaborEntry,
  createEquipmentEntry,
  createActivityEntry,
  createMaterialEntry,
  calcHeadcount,
  calcManHours,
  MASTER_PIN,
} from '../harness/contracts.mjs';
import { validatePreSubmission } from '../harness/validation.mjs';
import { submitRdo, auditedEdit, approveRdo, canCommonEdit } from '../harness/workflow.mjs';

test('Scenario 4: Canteiro Pesado com Mão de Obra Mista, Ociosidade Justificada e Edição Auditada pelo Master', () => {
  const work = createMockWork({ id: 'work-heavy-01', name: 'Complexo Logístico Industrial', code: 'OB-900' });
  const worker = createMockUser({ id: 'usr-heavy-op', name: 'Eng. Residente Roberto', profile: 'common' });
  const master = createMockUser({ id: 'usr-heavy-master', name: 'Eng. Master Davi', profile: 'master' });

  // 1. Heavy site workforce setup: 15 own + 10 subcontracted = 25 headcount
  const labor = [
    createLaborEntry({ role: 'Mestre de Obras', quantity: 1, hours: 8, type: 'proprio' }),
    createLaborEntry({ role: 'Pedreiro de Alvenaria', quantity: 6, hours: 8, type: 'proprio' }),
    createLaborEntry({ role: 'Servente de Apoio', quantity: 8, hours: 8, type: 'proprio' }),
    createLaborEntry({ role: 'Armador de Ferragem', quantity: 6, hours: 8, type: 'terceirizado' }),
    createLaborEntry({ role: 'Montador de Pré-Moldado', quantity: 4, hours: 8, type: 'terceirizado' }),
  ];

  const headcount = calcHeadcount(labor);
  const manHours = calcManHours(labor);
  assert.strictEqual(headcount, 25);
  assert.strictEqual(manHours, 200);

  // 2. Heavy machinery mobilization with 2h idle time justified
  const equipment = [
    createEquipmentEntry({
      name: 'Bomba Estacionária Schwing',
      activeHours: 6,
      idleHours: 2,
      idleJustification: 'Atraso na liberação e trajeto dos caminhões betoneira da usina.',
    }),
    createEquipmentEntry({
      name: 'Guindaste Telescópico 50T',
      activeHours: 8,
      idleHours: 0,
      type: 'locado',
    }),
    createEquipmentEntry({
      name: 'Retroescavadeira CAT 416',
      activeHours: 7,
      idleHours: 1,
      idleJustification: 'Manutenção preventiva de rotina (engraxe e filtros).',
    }),
  ];

  // 3. Materials NF-e received
  const materials = [
    createMaterialEntry({
      name: 'Concreto Usinado FCK 35 MPa',
      supplier: 'Polimix Concreto Ltda.',
      invoice: 'NF-e 049102',
      quantity: 48,
      unit: 'm³',
    }),
    createMaterialEntry({
      name: 'Aço Cortado e Dobrado CA-50',
      supplier: 'ArcelorMittal Brasil',
      invoice: 'NF-e 883910',
      quantity: 6500,
      unit: 'kg',
    }),
  ];

  // 4. Executed Activities
  const activities = [
    createActivityEntry({
      description: 'Lançamento e adensamento de concreto estrutural no bloco B-05',
      location: 'Fundação Galpão 1',
      quantity: 48,
      unit: 'm³',
      progress: 100,
    }),
    createActivityEntry({
      description: 'Içamento e montagem de pilares pré-moldados P-01 a P-06',
      location: 'Eixo 1 ao 6 - Fachada Norte',
      quantity: 6,
      unit: 'un',
      progress: 50,
    }),
  ];

  // 5. Build RDO and validate pre-submission
  const rdoData = createValidRDO({
    workId: work.id,
    workName: work.name,
    workCode: work.code,
    authorId: worker.id,
    authorName: worker.name,
    labor,
    equipment,
    materials,
    activities,
  });

  const preValidation = validatePreSubmission(rdoData);
  assert.strictEqual(preValidation.valid, true);

  // 6. Worker submits RDO
  const { rdo: submittedRdo, log: logSubmit } = submitRdo(rdoData, worker);
  assert.strictEqual(submittedRdo.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(canCommonEdit(submittedRdo), false);

  // 7. Master reviews in /rdo-review and executes Audited Direct Edit
  // Master updates machine name for exact CBO / patrimonial specification
  const { rdo: auditedRdo, log: logEdit } = auditedEdit(submittedRdo, master, {
    section: 'equipamentos',
    field: 'name',
    previousValue: 'Bomba Estacionária Schwing',
    newValue: 'Bomba Estacionária Schwing SP-500 (Patr. 441)',
    justification: 'Inclusão do modelo técnico e número de patrimônio do equipamento conforme contrato.',
  });

  assert.strictEqual(auditedRdo.equipment[0].name, 'Bomba Estacionária Schwing SP-500 (Patr. 441)');
  assert.strictEqual(logEdit.action, 'editado');
  assert.strictEqual(logEdit.previousValue, 'Bomba Estacionária Schwing');
  assert.strictEqual(logEdit.newValue, 'Bomba Estacionária Schwing SP-500 (Patr. 441)');
  assert.ok(logEdit.justification.includes('modelo técnico'));

  // 8. Master homologates with 2FA / PIN '1234'
  const { rdo: approvedRdo, log: logApprove, signature } = approveRdo(auditedRdo, master, {
    pin: MASTER_PIN,
    ip: '177.18.99.201',
    deviceId: 'Master-Terminal-Office',
  });

  assert.strictEqual(approvedRdo.status, RDO_STATUS.APROVADO);
  assert.strictEqual(approvedRdo.locked, true);
  assert.ok(signature.hash.startsWith('SL-'));

  // 9. Verify full audit trail includes both submission, audited edit, and approval
  const auditLogs = [logSubmit, logEdit, logApprove];
  assert.strictEqual(auditLogs.length, 3);
  assert.strictEqual(auditLogs[1].action, 'editado');
  assert.strictEqual(auditLogs[2].action, 'aprovado');
});
