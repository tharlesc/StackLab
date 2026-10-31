/**
 * Tier 1: Feature Coverage — Features 17 to 19 (Offline Persistence, Pre-Submission Validation, Submission)
 * 5 test cases per feature = 15 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createValidRDO,
  createMockUser,
  createWeatherEntry,
  createLaborEntry,
  createEquipmentEntry,
  createActivityEntry,
} from '../harness/contracts.mjs';
import { validatePreSubmission } from '../harness/validation.mjs';
import { submitRdo, canCommonEdit } from '../harness/workflow.mjs';
import { OfflineStore } from '../harness/offlineStore.mjs';

/* ========================================================================== */
/* Feature 17: Persistência de Rascunho Offline (5 tests)                     */
/* ========================================================================== */

test('F17.1: Draft auto-saved locally during worker input', async () => {
  const store = new OfflineStore();
  const rdo = createValidRDO({ workName: 'Obra Alfa', status: RDO_STATUS.RASCUNHO });

  await store.saveDraft(rdo);
  const loaded = await store.getDraft(rdo.id);

  assert.ok(loaded);
  assert.strictEqual(loaded.id, rdo.id);
  assert.strictEqual(loaded.workName, 'Obra Alfa');
  assert.strictEqual(loaded.status, RDO_STATUS.RASCUNHO);
});

test('F17.2: Draft restored on app re-open without data loss', async () => {
  const store = new OfflineStore();
  const rdo = createValidRDO({
    weather: [createWeatherEntry({ condition: 'Nublado' })],
    labor: [createLaborEntry({ role: 'Pintor', quantity: 3 })],
  });

  await store.saveDraft(rdo);
  // Simulate app restart by retrieving from storage
  const restored = await store.getDraft(rdo.id);

  assert.deepStrictEqual(restored.weather, rdo.weather);
  assert.deepStrictEqual(restored.labor, rdo.labor);
});

test('F17.3: Multiple drafts for different assigned works stored independently', async () => {
  const store = new OfflineStore();
  const rdo1 = createValidRDO({ id: 'rdo-w1', workId: 'w1', workName: 'Obra 1' });
  const rdo2 = createValidRDO({ id: 'rdo-w2', workId: 'w2', workName: 'Obra 2' });

  await store.saveDraft(rdo1);
  await store.saveDraft(rdo2);

  const drafts = await store.listDrafts();
  assert.strictEqual(drafts.length, 2);
  assert.ok(drafts.some((d) => d.workId === 'w1'));
  assert.ok(drafts.some((d) => d.workId === 'w2'));
});

test('F17.4: Incremental section-by-section draft updating', async () => {
  const store = new OfflineStore();
  const rdo = createValidRDO({ activities: [] });
  await store.saveDraft(rdo);

  // Worker adds an activity in step 3
  rdo.activities.push(createActivityEntry({ description: 'Concretagem de viga' }));
  await store.saveDraft(rdo);

  const updated = await store.getDraft(rdo.id);
  assert.strictEqual(updated.activities.length, 1);
  assert.strictEqual(updated.activities[0].description, 'Concretagem de viga');
});

test('F17.5: Draft removal upon successful submission', async () => {
  const store = new OfflineStore();
  const rdo = createValidRDO();
  await store.saveDraft(rdo);

  let draft = await store.getDraft(rdo.id);
  assert.ok(draft);

  await store.removeDraft(rdo.id);
  draft = await store.getDraft(rdo.id);
  assert.strictEqual(draft, null);
});

/* ========================================================================== */
/* Feature 18: Validação de Pré-Submissão (5 tests)                            */
/* ========================================================================== */

test('F18.1: Complete valid RDO passes pre-submission validation cleanly', () => {
  const rdo = createValidRDO();
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.errors.length, 0);
});

test('F18.2: Pre-submission enforces minimum headcount >= 1', () => {
  const rdo = createValidRDO({ labor: [] });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('efetivo')));
});

test('F18.3: Pre-submission enforces minimum activities >= 1', () => {
  const rdo = createValidRDO({ activities: [] });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('atividade')));
});

test('F18.4: Pre-submission enforces rain stoppage impact description', () => {
  const rdo = createValidRDO({
    weather: [createWeatherEntry({ condition: 'Chuva', stoppageHours: 3, impact: '' })],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('Impacto da paralisação')));
});

test('F18.5: Pre-submission enforces equipment idle justification', () => {
  const rdo = createValidRDO({
    equipment: [createEquipmentEntry({ name: 'Trator', activeHours: 4, idleHours: 4, idleJustification: '' })],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('Justificativa de ociosidade')));
});

/* ========================================================================== */
/* Feature 19: Submissão de RDO (5 tests)                                     */
/* ========================================================================== */

test('F19.1: Submission transitions status from rascunho to submetido', () => {
  const worker = createMockUser({ profile: 'common' });
  const rdo = createValidRDO({ status: RDO_STATUS.RASCUNHO });

  const { rdo: submitted } = submitRdo(rdo, worker);
  assert.strictEqual(submitted.status, RDO_STATUS.SUBMETIDO);
});

test('F19.2: Submission records UTC submittedAt timestamp', () => {
  const worker = createMockUser({ profile: 'common' });
  const rdo = createValidRDO({ status: RDO_STATUS.RASCUNHO });

  const before = Date.now();
  const { rdo: submitted } = submitRdo(rdo, worker);
  const after = Date.now();

  assert.ok(submitted.submittedAt);
  const subTime = new Date(submitted.submittedAt).getTime();
  assert.ok(subTime >= before && subTime <= after);
});

test('F19.3: Submission locks editing for common worker (canCommonEdit returns false)', () => {
  const worker = createMockUser({ profile: 'common' });
  const rdo = createValidRDO({ status: RDO_STATUS.RASCUNHO });

  assert.strictEqual(canCommonEdit(rdo), true);
  const { rdo: submitted } = submitRdo(rdo, worker);
  assert.strictEqual(canCommonEdit(submitted), false, 'Submitted RDO is read-only for common worker');
});

test('F19.4: Submission clears prior returnReason if resubmitting', () => {
  const worker = createMockUser({ profile: 'common' });
  const rdo = createValidRDO({
    status: RDO_STATUS.DEVOLVIDO,
    returnReason: 'Corrigir quantidade de concreto no piso 4',
  });

  const { rdo: resubmitted } = submitRdo(rdo, worker);
  assert.strictEqual(resubmitted.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(resubmitted.returnReason, undefined);
});

test('F19.5: Submission generates append-only audit log with action submetido', () => {
  const worker = createMockUser({ id: 'usr-12', name: 'Operário João', profile: 'common' });
  const rdo = createValidRDO({ status: RDO_STATUS.RASCUNHO });

  const { log } = submitRdo(rdo, worker);
  assert.strictEqual(log.action, 'submetido');
  assert.strictEqual(log.actorId, worker.id);
  assert.strictEqual(log.actorName, worker.name);
  assert.ok(log.timestamp);
});
