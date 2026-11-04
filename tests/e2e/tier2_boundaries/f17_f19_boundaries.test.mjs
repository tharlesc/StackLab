/**
 * Tier 2: Boundary & Corner Cases — Features 17 to 19 (Offline Storage, Pre-Submission Errors, Submission Invariants)
 * 5 test cases per feature = 15 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createValidRDO,
  createMockUser,
  createWeatherEntry,
  createEquipmentEntry,
} from '../harness/contracts.mjs';
import {
  validatePreSubmission,
  assertPreSubmissionValid,
  ValidationError,
} from '../harness/validation.mjs';
import {
  submitRdo,
  WorkflowError,
  canCommonEdit,
} from '../harness/workflow.mjs';
import { OfflineStore } from '../harness/offlineStore.mjs';

/* ========================================================================== */
/* Feature 17 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B17.1: Saving invalid RDO without ID throws error', async () => {
  const store = new OfflineStore();
  await assert.rejects(
    async () => store.saveDraft({ workName: 'Obra sem ID' }),
    /RDO inválido para gravação de rascunho/
  );
});

test('B17.2: Draft retrieval of non-existent ID returns null', async () => {
  const store = new OfflineStore();
  const draft = await store.getDraft('rdo-inexistente-999');
  assert.strictEqual(draft, null);
});

test('B17.3: Deleting non-existent draft returns false without crash', async () => {
  const store = new OfflineStore();
  const res = await store.removeDraft('rdo-ghost');
  assert.strictEqual(res, false);
});

test('B17.4: Offline store clear resets all drafts and queue', async () => {
  const store = new OfflineStore();
  await store.saveDraft(createValidRDO({ id: 'd1' }));
  await store.saveDraft(createValidRDO({ id: 'd2' }));
  await store.enqueueSync('SUBMIT_RDO', { id: 'd1' });

  assert.strictEqual((await store.listDrafts()).length, 2);
  assert.strictEqual(store.getSyncQueue().length, 1);

  await store.clear();
  assert.strictEqual((await store.listDrafts()).length, 0);
  assert.strictEqual(store.getSyncQueue().length, 0);
});

test('B17.5: Processing sync queue while offline returns 0 synced and error message', async () => {
  const store = new OfflineStore();
  store.setOnline(false);
  await store.enqueueSync('SUBMIT_RDO', { id: 'rdo-test' });

  const dummyApiClient = {};
  const res = await store.processSyncQueue(dummyApiClient);
  assert.strictEqual(res.syncedCount, 0);
  assert.strictEqual(res.remainingCount, 1);
  assert.strictEqual(res.error, 'Dispositivo desconectado');
});

/* ========================================================================== */
/* Feature 18 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B18.1: Submitting RDO with cumulative errors returns full error list', () => {
  const rdo = createValidRDO({
    labor: [],
    activities: [],
    weather: [],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.length >= 3);
  assert.ok(res.errors.some((e) => e.includes('turno')));
  assert.ok(res.errors.some((e) => e.includes('efetivo')));
  assert.ok(res.errors.some((e) => e.includes('atividade')));
});

test('B18.2: Boundary: RDO with minimum valid fields (1 worker, 1 activity, 1 shift) passes', () => {
  const rdo = createValidRDO();
  assert.doesNotThrow(() => assertPreSubmissionValid(rdo));
});

test('B18.3: Boundary: Multiple equipment items catches missing justification on second item', () => {
  const rdo = createValidRDO({
    equipment: [
      createEquipmentEntry({ name: 'Betoneira', activeHours: 8, idleHours: 0 }),
      createEquipmentEntry({ name: 'Guincho', activeHours: 4, idleHours: 4, idleJustification: '' }),
    ],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('Guincho')));
});

test('B18.4: Boundary: Multiple weather shifts catches stoppage impact error on afternoon shift', () => {
  const rdo = createValidRDO({
    weather: [
      createWeatherEntry({ shift: 'manha', condition: 'Ensolarado' }),
      createWeatherEntry({ shift: 'tarde', condition: 'Chuvoso', stoppageHours: 3, impact: '' }),
    ],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('tarde')));
});

test('B18.5: assertPreSubmissionValid throws ValidationError on invalid state', () => {
  const rdo = createValidRDO({ labor: [] });
  assert.throws(
    () => assertPreSubmissionValid(rdo),
    (err) => err instanceof ValidationError && err.errors.length > 0
  );
});

/* ========================================================================== */
/* Feature 19 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B19.1: Attempting to submit an already submetido RDO throws WorkflowError', () => {
  const worker = createMockUser({ profile: 'common' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  assert.throws(
    () => submitRdo(rdo, worker),
    /Apenas rascunhos ou RDOs devolvidos podem ser submetidos/
  );
});

test('B19.2: Attempting to submit an aprovado RDO throws WorkflowError', () => {
  const worker = createMockUser({ profile: 'common' });
  const rdo = createValidRDO({ status: RDO_STATUS.APROVADO, locked: true });
  assert.throws(
    () => submitRdo(rdo, worker),
    /RDO bloqueado para submissão/
  );
});

test('B19.3: Attempting to submit a locked RDO throws WorkflowError', () => {
  const worker = createMockUser({ profile: 'common' });
  const rdo = createValidRDO({ status: RDO_STATUS.RASCUNHO, locked: true });
  assert.throws(
    () => submitRdo(rdo, worker),
    /RDO bloqueado para submissão/
  );
});

test('B19.4: Attempting to submit with invalid pre-submission data throws ValidationError', () => {
  const worker = createMockUser({ profile: 'common' });
  const invalidRdo = createValidRDO({ labor: [] });
  assert.throws(
    () => submitRdo(invalidRdo, worker),
    (err) => err instanceof ValidationError
  );
});

test('B19.5: Common worker attempting to edit after submission is blocked (canCommonEdit is false)', () => {
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  assert.strictEqual(canCommonEdit(rdo), false);
});
