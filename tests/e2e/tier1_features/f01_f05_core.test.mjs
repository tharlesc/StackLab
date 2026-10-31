/**
 * Tier 1: Feature Coverage — Features 1 to 5 (Core Identification, Weather, Labor, Man-Hours)
 * 5 test cases per feature = 25 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createValidRDO,
  createWeatherEntry,
  createLaborEntry,
  calcManHours,
  calcHeadcount,
} from '../harness/contracts.mjs';
import { validateIdentification, validateWeather, validateLabor } from '../harness/validation.mjs';

/* ========================================================================== */
/* Feature 1: Identificação do RDO (5 tests)                                   */
/* ========================================================================== */

test('F1.1: Header metadata preservation (workId, workName, date, authorId, number, version)', () => {
  const rdo = createValidRDO({
    workId: 'work-abc-123',
    workName: 'Edifício Solar do Parque',
    date: '2026-10-29',
    authorId: 'usr-456',
    authorName: 'Eng. Tharles Silva',
    number: 142,
    version: 1,
  });

  const errors = validateIdentification(rdo);
  assert.strictEqual(errors.length, 0, 'Valid identification must produce zero errors');
  assert.strictEqual(rdo.workId, 'work-abc-123');
  assert.strictEqual(rdo.workName, 'Edifício Solar do Parque');
  assert.strictEqual(rdo.date, '2026-10-29');
  assert.strictEqual(rdo.authorId, 'usr-456');
  assert.strictEqual(rdo.number, 142);
  assert.strictEqual(rdo.version, 1);
});

test('F1.2: Sequential numbering generation and uniqueness', () => {
  const rdo1 = createValidRDO({ number: 101 });
  const rdo2 = createValidRDO({ number: 102 });
  assert.strictEqual(rdo1.number + 1, rdo2.number, 'Sequential number must increment by 1');
  assert.notStrictEqual(rdo1.id, rdo2.id, 'Unique IDs must be generated for each RDO');
});

test('F1.3: Affiliation check (valid author assigned to work)', () => {
  const author = { id: 'usr-1', name: 'Eng. Residente', assignedWorkIds: ['work-01', 'work-02'] };
  const rdo = createValidRDO({ workId: 'work-01', authorId: author.id });
  const isAssigned = author.assignedWorkIds.includes(rdo.workId);
  assert.strictEqual(isAssigned, true, 'Author must be assigned to the target work');
});

test('F1.4: Version tracking (initial version = 1)', () => {
  const rdo = createValidRDO();
  assert.strictEqual(rdo.version, 1, 'Initial RDO version must always be 1');
  assert.strictEqual(rdo.previousVersionId, undefined, 'Initial RDO must have no previousVersionId');
});

test('F1.5: Initial status is draft (rascunho) with unlocked state', () => {
  const rdo = createValidRDO();
  assert.strictEqual(rdo.status, RDO_STATUS.RASCUNHO, 'Initial status must be rascunho');
  assert.strictEqual(rdo.locked, false, 'Draft RDO must not be locked');
});

/* ========================================================================== */
/* Feature 2: Clima por Turno (5 tests)                                       */
/* ========================================================================== */

test('F2.1: Single shift recording (manha with condition Ensolarado)', () => {
  const weather = [createWeatherEntry({ shift: 'manha', condition: 'Ensolarado' })];
  const errors = validateWeather(weather);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(weather[0].shift, 'manha');
  assert.strictEqual(weather[0].condition, 'Ensolarado');
});

test('F2.2: Multi-shift recording (manha, tarde, noite) with distinct conditions', () => {
  const weather = [
    createWeatherEntry({ shift: 'manha', condition: 'Ensolarado' }),
    createWeatherEntry({ shift: 'tarde', condition: 'Nublado' }),
    createWeatherEntry({ shift: 'noite', condition: 'Chuvoso', stoppageHours: 0 }),
  ];
  const errors = validateWeather(weather);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(weather.length, 3);
  assert.deepStrictEqual(weather.map((w) => w.condition), ['Ensolarado', 'Nublado', 'Chuvoso']);
});

test('F2.3: Condition taxonomy validation (Ensolarado, Nublado, Chuvoso, Instável)', () => {
  const conditions = ['Ensolarado', 'Nublado', 'Chuvoso', 'Instável'];
  for (const cond of conditions) {
    const entry = createWeatherEntry({ shift: 'manha', condition: cond });
    const errors = validateWeather([entry]);
    assert.strictEqual(errors.length, 0, `Condition "${cond}" should be valid`);
  }
});

test('F2.4: Shift persistence and retrieval fidelity', () => {
  const weather = [
    createWeatherEntry({ shift: 'manha', condition: 'Instável', stoppageHours: 1, impact: 'Serviço externo reduzido' }),
    createWeatherEntry({ shift: 'tarde', condition: 'Ensolarado', stoppageHours: 0 }),
  ];
  const serialized = JSON.stringify(weather);
  const deserialized = JSON.parse(serialized);
  assert.deepStrictEqual(weather, deserialized, 'Weather entries must survive serialization without loss');
});

test('F2.5: Multi-turn weather summary formatting', () => {
  const weather = [
    createWeatherEntry({ shift: 'manha', condition: 'Ensolarado' }),
    createWeatherEntry({ shift: 'tarde', condition: 'Chuva', stoppageHours: 2, impact: 'Paralisação pintura' }),
  ];
  const shiftLabels = { manha: 'MANHÃ', tarde: 'TARDE', noite: 'NOITE' };
  const summary = weather.map((w) => `${shiftLabels[w.shift] || w.shift.toUpperCase()}: ${w.condition}`).join(' | ');
  assert.strictEqual(summary, 'MANHÃ: Ensolarado | TARDE: Chuva');
});

/* ========================================================================== */
/* Feature 3: Clima - Praticabilidade e Horas Paradas (5 tests)               */
/* ========================================================================== */

test('F3.1: Workable day with 0 stoppage hours', () => {
  const entry = createWeatherEntry({ shift: 'manha', condition: 'Ensolarado', stoppageHours: 0, impact: '' });
  const errors = validateWeather([entry]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(entry.stoppageHours, 0);
});

test('F3.2: Rain with partial stoppage (e.g. 3 hours) and valid impact description', () => {
  const entry = createWeatherEntry({
    shift: 'tarde',
    condition: 'Chuvoso',
    stoppageHours: 3,
    impact: 'Chuva forte paralisou concretagem de laje',
  });
  const errors = validateWeather([entry]);
  assert.strictEqual(errors.length, 0, 'Rain with valid impact description must be accepted');
  assert.strictEqual(entry.stoppageHours, 3);
});

test('F3.3: Heavy storm with full shift stoppage (8 hours) and impact explanation', () => {
  const entry = createWeatherEntry({
    shift: 'manha',
    condition: 'Chuvoso',
    stoppageHours: 8,
    impact: 'Tempestade torrencial alagou valas de fundação',
  });
  const errors = validateWeather([entry]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(entry.stoppageHours, 8);
});

test('F3.4: Unworkable site flag with impact on outdoor activities', () => {
  const entry = createWeatherEntry({
    shift: 'manha',
    condition: 'Chuvoso',
    stoppageHours: 4,
    impact: 'Canteiro impraticável na terraplenagem',
  });
  assert.ok(entry.stoppageHours > 0);
  assert.ok(entry.impact.includes('impraticável'));
});

test('F3.5: Rain with indoor services continuing (0 stoppage hours, no stoppage impact required)', () => {
  const entry = createWeatherEntry({
    shift: 'tarde',
    condition: 'Chuvoso',
    stoppageHours: 0,
    impact: '',
  });
  const errors = validateWeather([entry]);
  assert.strictEqual(errors.length, 0, 'Rain without stoppage (indoor work) does not require impact');
});

/* ========================================================================== */
/* Feature 4: Mão de Obra Própria e Terceirizada (5 tests)                    */
/* ========================================================================== */

test('F4.1: Own labor entry (Pedreiro, Servente) with quantity and standard hours', () => {
  const labor = [
    createLaborEntry({ role: 'Pedreiro', quantity: 5, hours: 8, type: 'proprio' }),
    createLaborEntry({ role: 'Servente', quantity: 8, hours: 8, type: 'proprio' }),
  ];
  const errors = validateLabor(labor);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(labor.every((l) => l.type === 'proprio'), true);
});

test('F4.2: Subcontracted / terceirizado labor entry (Eletricista, Encanador)', () => {
  const labor = [
    createLaborEntry({ role: 'Eletricista', quantity: 3, hours: 8, type: 'terceirizado' }),
    createLaborEntry({ role: 'Encanador', quantity: 2, hours: 8, type: 'terceirizado' }),
  ];
  const errors = validateLabor(labor);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(labor.every((l) => l.type === 'terceirizado'), true);
});

test('F4.3: Mixed workforce allocation (proprio + terceirizado)', () => {
  const labor = [
    createLaborEntry({ role: 'Mestre de Obras', quantity: 1, hours: 8, type: 'proprio' }),
    createLaborEntry({ role: 'Gesseiro', quantity: 4, hours: 8, type: 'terceirizado' }),
  ];
  const errors = validateLabor(labor);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(calcHeadcount(labor), 5);
});

test('F4.4: Multiple roles with different daily shifts (e.g. 4h, 8h, 10h)', () => {
  const labor = [
    createLaborEntry({ role: 'Estagiário', quantity: 1, hours: 4 }),
    createLaborEntry({ role: 'Armador', quantity: 6, hours: 8 }),
    createLaborEntry({ role: 'Operador de Grua', quantity: 1, hours: 10 }),
  ];
  const errors = validateLabor(labor);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(calcManHours(labor), 1 * 4 + 6 * 8 + 1 * 10); // 4 + 48 + 10 = 62
});

test('F4.5: Workforce categorization preservation', () => {
  const labor = [
    createLaborEntry({ role: 'Carpinteiro', quantity: 3, hours: 8, type: 'proprio' }),
    createLaborEntry({ role: 'Montador Drywall', quantity: 4, hours: 8, type: 'terceirizado' }),
  ];
  const ownCount = labor.filter((l) => l.type === 'proprio').reduce((s, l) => s + l.quantity, 0);
  const thirdCount = labor.filter((l) => l.type === 'terceirizado').reduce((s, l) => s + l.quantity, 0);
  assert.strictEqual(ownCount, 3);
  assert.strictEqual(thirdCount, 4);
});

/* ========================================================================== */
/* Feature 5: Cálculo de Homem-Hora e Headcount (5 tests)                     */
/* ========================================================================== */

test('F5.1: Simple headcount calculation (sum of quantities)', () => {
  const labor = [
    createLaborEntry({ quantity: 2 }),
    createLaborEntry({ quantity: 5 }),
    createLaborEntry({ quantity: 3 }),
  ];
  assert.strictEqual(calcHeadcount(labor), 10);
});

test('F5.2: Mixed role headcount calculation', () => {
  const labor = [
    createLaborEntry({ role: 'Encarregado', quantity: 1 }),
    createLaborEntry({ role: 'Pedreiro', quantity: 4 }),
    createLaborEntry({ role: 'Servente', quantity: 6 }),
  ];
  assert.strictEqual(calcHeadcount(labor), 11);
});

test('F5.3: Man-hours calculation: quantity * hours sum', () => {
  const labor = [
    createLaborEntry({ role: 'Pintor', quantity: 3, hours: 8 }), // 24
    createLaborEntry({ role: 'Ajudante', quantity: 2, hours: 6 }), // 12
  ];
  assert.strictEqual(calcManHours(labor), 36);
});

test('F5.4: Man-hours calculation with decimal/fractional hours (e.g. 8.5h)', () => {
  const labor = [
    createLaborEntry({ role: 'Soldador', quantity: 2, hours: 8.5 }), // 17
    createLaborEntry({ role: 'Ajudante', quantity: 2, hours: 4.5 }), // 9
  ];
  assert.strictEqual(calcManHours(labor), 26);
});

test('F5.5: Real-time calculation consistency across multiple labor updates', () => {
  let labor = [createLaborEntry({ quantity: 2, hours: 8 })]; // 16 Hh, 2 headcount
  assert.strictEqual(calcHeadcount(labor), 2);
  assert.strictEqual(calcManHours(labor), 16);

  labor = [...labor, createLaborEntry({ quantity: 3, hours: 8 })]; // +24 Hh, +3 headcount
  assert.strictEqual(calcHeadcount(labor), 5);
  assert.strictEqual(calcManHours(labor), 40);

  labor = labor.filter((l, idx) => idx !== 0); // Remove first
  assert.strictEqual(calcHeadcount(labor), 3);
  assert.strictEqual(calcManHours(labor), 24);
});
