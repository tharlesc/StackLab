/**
 * Tier 2: Boundary & Corner Cases — Features 6 to 10 (Equipment, Active/Idle Hours, Justification, Activities, Progress)
 * 5 test cases per feature = 25 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createEquipmentEntry,
  createActivityEntry,
} from '../harness/contracts.mjs';
import {
  validateEquipment,
  validateActivities,
} from '../harness/validation.mjs';

/* ========================================================================== */
/* Feature 6 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B6.1: Blank equipment name rejects', () => {
  const equip = [createEquipmentEntry({ name: '' })];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('Nome do equipamento')));
});

test('B6.2: Whitespace-only equipment name rejects', () => {
  const equip = [createEquipmentEntry({ name: '    ' })];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('Nome do equipamento')));
});

test('B6.3: Empty equipment list is allowed in pre-submission (optional section)', () => {
  const errors = validateEquipment([]);
  assert.strictEqual(errors.length, 0);
});

test('B6.4: Extremely long equipment name (500 chars) handles without crash', () => {
  const longName = 'Caminhão Betoneira '.repeat(25);
  const equip = [createEquipmentEntry({ name: longName })];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
});

test('B6.5: Equipment entry with undefined name rejects', () => {
  const equip = [{ activeHours: 8, idleHours: 0 }];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('Nome do equipamento')));
});

/* ========================================================================== */
/* Feature 7 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B7.1: Negative active hours (< 0) rejects', () => {
  const equip = [createEquipmentEntry({ activeHours: -2, idleHours: 0 })];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('não podem ser negativas')));
});

test('B7.2: Negative idle hours (< 0) rejects', () => {
  const equip = [createEquipmentEntry({ activeHours: 4, idleHours: -1 })];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('não podem ser negativas')));
});

test('B7.3: Active + idle hours sum > 24h rejects (daily temporal impossibility)', () => {
  const equip = [
    createEquipmentEntry({
      activeHours: 15,
      idleHours: 10, // 25h total
      idleJustification: 'Justificativa válida com mais de 5 caracteres',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('excede 24h')));
});

test('B7.4: Exact boundary active + idle = 24.0h accepted', () => {
  const equip = [
    createEquipmentEntry({
      activeHours: 16,
      idleHours: 8, // exactly 24h
      idleJustification: 'Turno de manutenção noturna de 8 horas',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
});

test('B7.5: Active 0h + idle 0h (standby unmobilized) accepted without justification', () => {
  const equip = [createEquipmentEntry({ activeHours: 0, idleHours: 0, idleJustification: '' })];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
});

/* ========================================================================== */
/* Feature 8 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B8.1: Idle hours > 0 with empty string justification rejects', () => {
  const equip = [createEquipmentEntry({ activeHours: 4, idleHours: 4, idleJustification: '' })];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('Justificativa de ociosidade')));
});

test('B8.2: Idle hours > 0 with whitespace-only justification rejects', () => {
  const equip = [createEquipmentEntry({ activeHours: 4, idleHours: 4, idleJustification: '     ' })];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('Justificativa de ociosidade')));
});

test('B8.3: Idle hours > 0 with justification < 5 chars (e.g. queb) rejects', () => {
  const equip = [createEquipmentEntry({ activeHours: 4, idleHours: 4, idleJustification: 'queb' })];
  const errors = validateEquipment(equip);
  assert.ok(errors.some((e) => e.includes('mínimo 5 caracteres')));
});

test('B8.4: Idle hours = 0 with no justification passes cleanly', () => {
  const equip = [createEquipmentEntry({ activeHours: 8, idleHours: 0, idleJustification: '' })];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
});

test('B8.5: Extremely long justification (1000 chars) accepted without error', () => {
  const longText = 'Máquina paralisada para aguardar chegada de peças importadas. '.repeat(17);
  const equip = [createEquipmentEntry({ activeHours: 0, idleHours: 8, idleJustification: longText })];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
});

/* ========================================================================== */
/* Feature 9 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B9.1: Empty activities array (0 activities) rejects pre-submission', () => {
  const errors = validateActivities([]);
  assert.ok(errors.some((e) => e.includes('ao menos uma atividade')));
});

test('B9.2: Activity with empty description rejects', () => {
  const activities = [createActivityEntry({ description: '' })];
  const errors = validateActivities(activities);
  assert.ok(errors.some((e) => e.includes('Descrição da atividade')));
});

test('B9.3: Activity with description < 3 characters rejects', () => {
  const activities = [createActivityEntry({ description: 'ab' })];
  const errors = validateActivities(activities);
  assert.ok(errors.some((e) => e.includes('mínimo 3 caracteres')));
});

test('B9.4: Activity with empty location rejects', () => {
  const activities = [createActivityEntry({ location: '   ' })];
  const errors = validateActivities(activities);
  assert.ok(errors.some((e) => e.includes('Local/frente de serviço')));
});

test('B9.5: Activity with negative quantity rejects', () => {
  const activities = [createActivityEntry({ quantity: -10 })];
  const errors = validateActivities(activities);
  assert.ok(errors.some((e) => e.includes('não pode ser negativa')));
});

/* ========================================================================== */
/* Feature 10 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B10.1: Progress < 0% (e.g. -5%) rejects', () => {
  const activities = [createActivityEntry({ progress: -5 })];
  const errors = validateActivities(activities);
  assert.ok(errors.some((e) => e.includes('deve estar entre 0% e 100%')));
});

test('B10.2: Progress > 100% (e.g. 105%) rejects', () => {
  const activities = [createActivityEntry({ progress: 105 })];
  const errors = validateActivities(activities);
  assert.ok(errors.some((e) => e.includes('deve estar entre 0% e 100%')));
});

test('B10.3: Exact boundary 0% progress passes', () => {
  const activities = [createActivityEntry({ progress: 0 })];
  const errors = validateActivities(activities);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(activities[0].progress, 0);
});

test('B10.4: Exact boundary 100% progress passes', () => {
  const activities = [createActivityEntry({ progress: 100 })];
  const errors = validateActivities(activities);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(activities[0].progress, 100);
});

test('B10.5: Non-numeric progress (NaN or string) rejects', () => {
  const activities = [createActivityEntry({ progress: 'cem por cento' })];
  const errors = validateActivities(activities);
  assert.ok(errors.some((e) => e.includes('deve estar entre 0% e 100%')));
});
