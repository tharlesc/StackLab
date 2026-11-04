/**
 * Tier 4: Real-World Scenario 3 — Ciclo Completo de Vida do RDO
 * (Rascunho Offline -> Submissão -> Devolução Master -> Correção -> Aprovação 2FA)
 * Features Exercised: F1, F17, F19, F20, F22, F24, F25, F27
 * Complexity: Alta
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createMockWork,
  createMockUser,
  createValidRDO,
  createEquipmentEntry,
  MASTER_PIN,
} from '../harness/contracts.mjs';
import {
  submitRdo,
  returnRdo,
  addComment,
  approveRdo,
  canCommonEdit,
} from '../harness/workflow.mjs';
import { OfflineStore } from '../harness/offlineStore.mjs';
import { MockServerApi } from '../harness/apiClient.mjs';

test('Scenario 3: Ciclo Completo: Rascunho Offline -> Fila de Sincronização -> Devolução Master -> Correção -> Aprovação 2FA', async () => {
  const store = new OfflineStore();
  const api = new MockServerApi();
  const work = createMockWork({ id: 'work-sc3', name: 'Residencial Horizonte', code: 'OB-303' });
  const worker = createMockUser({ id: 'usr-worker-3', name: 'Eng. Tharles Silva', profile: 'common' });
  const master = createMockUser({ id: 'usr-master-3', name: 'Eng. Davi Hudson', profile: 'master' });

  const auditTrail = [];

  // =========================================================================
  // Step 1: Worker starts RDO offline in mobile app (AsyncStorage persistence)
  // =========================================================================
  store.setOnline(false);

  const initialDraft = createValidRDO({
    workId: work.id,
    workName: work.name,
    number: 77,
    authorId: worker.id,
    authorName: worker.name,
    status: RDO_STATUS.RASCUNHO,
    equipment: [
      createEquipmentEntry({
        name: 'Placa Compactadora',
        activeHours: 4,
        idleHours: 4,
        idleJustification: 'Aguardando liberação de vala',
      }),
    ],
  });

  await store.saveDraft(initialDraft);
  auditTrail.push({ action: 'criado', actorId: worker.id, timestamp: new Date().toISOString() });

  // Simulate app restart / reload from storage
  const restoredDraft = await store.getDraft(initialDraft.id);
  assert.ok(restoredDraft);
  assert.strictEqual(restoredDraft.id, initialDraft.id);
  assert.strictEqual(restoredDraft.status, RDO_STATUS.RASCUNHO);

  // =========================================================================
  // Step 2: Connectivity restored -> RDO enqueued and synced to server
  // =========================================================================
  const { rdo: submittedRdo, log: logSubmit1 } = submitRdo(restoredDraft, worker);
  auditTrail.push(logSubmit1);
  assert.strictEqual(submittedRdo.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(canCommonEdit(submittedRdo), false);

  // Enqueue submission
  await store.enqueueSync('SUBMIT_RDO', submittedRdo);
  assert.strictEqual(store.getSyncQueue().length, 1);

  // Come online and sync
  store.setOnline(true);
  const syncResult = await store.processSyncQueue(api);
  assert.strictEqual(syncResult.syncedCount, 1);
  assert.strictEqual(syncResult.remainingCount, 0);

  const serverRdoId = syncResult.results[0].res.data.id;
  await store.removeDraft(initialDraft.id); // Clean local draft post-sync

  // =========================================================================
  // Step 3: Master accesses /inbox and reviews RDO at /rdo-review
  // =========================================================================
  const getRes = await api.getRDO(serverRdoId);
  assert.strictEqual(getRes.status, 200);
  let masterRdo = getRes.data;

  // Master comments on equipment section
  const { rdo: commentedRdo, log: logComment } = addComment(
    masterRdo,
    master,
    'equipamentos',
    'A justificativa da placa compactadora precisa detalhar qual trecho de vala estava pendente.'
  );
  masterRdo = commentedRdo;
  auditTrail.push(logComment);
  assert.strictEqual(masterRdo.comments.length, 1);

  // =========================================================================
  // Step 4: Master devolves RDO for correction with mandatory reason (>= 10 chars)
  // =========================================================================
  const returnReason = 'Favor detalhar a localização exata da vala pendente e o motivo da espera.';
  const { rdo: returnedRdo, log: logReturn } = returnRdo(masterRdo, master, returnReason);
  masterRdo = returnedRdo;
  auditTrail.push(logReturn);

  assert.strictEqual(masterRdo.status, RDO_STATUS.DEVOLVIDO);
  assert.strictEqual(masterRdo.returnReason, returnReason);
  assert.strictEqual(canCommonEdit(masterRdo), true, 'Worker can now edit returned RDO');

  // =========================================================================
  // Step 5: Worker receives devolved RDO, corrects field, and resubmits
  // =========================================================================
  let workerFixRdo = JSON.parse(JSON.stringify(masterRdo));
  workerFixRdo.equipment[0].idleJustification =
    'Aguardando liberação da vala do Eixo 4-C pela equipe de topografia da prefeitura.';

  const { rdo: resubmittedRdo, log: logSubmit2 } = submitRdo(workerFixRdo, worker);
  auditTrail.push(logSubmit2);

  assert.strictEqual(resubmittedRdo.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(resubmittedRdo.returnReason, undefined, 'Resubmission clears returnReason');
  assert.strictEqual(canCommonEdit(resubmittedRdo), false);

  // =========================================================================
  // Step 6: Master homologates with 2FA / PIN '1234'
  // =========================================================================
  const { rdo: approvedRdo, log: logApprove, signature } = approveRdo(resubmittedRdo, master, {
    pin: MASTER_PIN,
    ip: '189.120.45.12',
    deviceId: 'Master-MacBook-Pro',
  });
  auditTrail.push(logApprove);

  assert.strictEqual(approvedRdo.status, RDO_STATUS.APROVADO);
  assert.strictEqual(approvedRdo.locked, true, 'Approved RDO is permanently locked');
  assert.strictEqual(signature.signedByName, 'Eng. Davi Hudson');
  assert.ok(signature.hash.startsWith('SL-'));

  // =========================================================================
  // Step 7: Verify complete forensic audit trail
  // =========================================================================
  assert.strictEqual(auditTrail.length, 6);
  assert.deepStrictEqual(
    auditTrail.map((a) => a.action),
    ['criado', 'submetido', 'comentado', 'devolvido', 'submetido', 'aprovado']
  );
});
