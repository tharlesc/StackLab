/**
 * Tier 2: Boundary & Corner Cases — Features 1 to 5 (Core Identification, Weather, Labor, Man-Hours)
 * 5 test cases per feature = 25 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createValidRDO,
  createWeatherEntry,
  createLaborEntry,
  calcManHours,
  calcHeadcount,
} from '../harness/contracts.mjs';
import {
  validateIdentification,
  validateWeather,
  validateLabor,
} from '../harness/validation.mjs';

/* ========================================================================== */
/* Feature 1 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B1.1: Empty workId rejects with validation error', () => {
  const rdo = createValidRDO({ workId: '' });
  const errors = validateIdentification(rdo);
  assert.ok(errors.some((e) => e.includes('obra é obrigatória')));
});

test('B1.2: Invalid date format (e.g. DD/MM/YYYY or text) rejects', () => {
  const rdo1 = createValidRDO({ date: '29/10/2026' });
  const rdo2 = createValidRDO({ date: 'ontem' });
  assert.ok(validateIdentification(rdo1).some((e) => e.includes('Data do RDO inválida')));
  assert.ok(validateIdentification(rdo2).some((e) => e.includes('Data do RDO inválida')));
});

test('B1.3: Whitespace-only workId rejects', () => {
  const rdo = createValidRDO({ workId: '   ' });
  const errors = validateIdentification(rdo);
  assert.ok(errors.some((e) => e.includes('obra é obrigatória')));
});

test('B1.4: Empty authorId rejects', () => {
  const rdo = createValidRDO({ authorId: '' });
  const errors = validateIdentification(rdo);
  assert.ok(errors.some((e) => e.includes('autor do RDO é obrigatória')));
});

test('B1.5: Null authorId rejects', () => {
  const rdo = createValidRDO({ authorId: null });
  const errors = validateIdentification(rdo);
  assert.ok(errors.some((e) => e.includes('autor do RDO é obrigatória')));
});

/* ========================================================================== */
/* Feature 2 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B2.1: Empty weather array (0 shifts) rejects submission', () => {
  const errors = validateWeather([]);
  assert.ok(errors.some((e) => e.includes('ao menos 1 turno')));
});

test('B2.2: Invalid shift name (madrugada or empty) rejects', () => {
  const weather = [createWeatherEntry({ shift: 'madrugada' })];
  const errors = validateWeather(weather);
  assert.ok(errors.some((e) => e.includes('Turno inválido')));
});

test('B2.3: Duplicate shift registration in same RDO rejects', () => {
  const weather = [
    createWeatherEntry({ shift: 'manha', condition: 'Ensolarado' }),
    createWeatherEntry({ shift: 'manha', condition: 'Nublado' }),
  ];
  const errors = validateWeather(weather);
  assert.ok(errors.some((e) => e.includes('Turno duplicado')));
});

test('B2.4: Blank/empty condition string rejects', () => {
  const weather = [createWeatherEntry({ shift: 'manha', condition: '   ' })];
  const errors = validateWeather(weather);
  assert.ok(errors.some((e) => e.includes('Condição climática')));
});

test('B2.5: Boundary shift transitions (all 3 shifts manha, tarde, noite registered)', () => {
  const weather = [
    createWeatherEntry({ shift: 'manha', condition: 'Ensolarado' }),
    createWeatherEntry({ shift: 'tarde', condition: 'Nublado' }),
    createWeatherEntry({ shift: 'noite', condition: 'Chuvoso', stoppageHours: 0 }),
  ];
  const errors = validateWeather(weather);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(weather.length, 3);
});

/* ========================================================================== */
/* Feature 3 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B3.1: Rain with stoppageHours > 0 but missing impact description rejects', () => {
  const weather = [createWeatherEntry({ condition: 'Chuvoso', stoppageHours: 2, impact: '' })];
  const errors = validateWeather(weather);
  assert.ok(errors.some((e) => e.includes('Impacto da paralisação por chuva')));
});

test('B3.2: Rain with impact description < 3 characters (e.g. ok) rejects', () => {
  const weather = [createWeatherEntry({ condition: 'Chuva', stoppageHours: 1, impact: 'ok' })];
  const errors = validateWeather(weather);
  assert.ok(errors.some((e) => e.includes('mínimo 3 caracteres')));
});

test('B3.3: Stoppage hours > 24 hours in a single shift/day rejects', () => {
  const weather = [createWeatherEntry({ condition: 'Chuvoso', stoppageHours: 25, impact: 'Alagamento' })];
  const errors = validateWeather(weather);
  assert.ok(errors.some((e) => e.includes('devem estar entre 0 e 24h')));
});

test('B3.4: Negative stoppage hours (< 0) rejects', () => {
  const weather = [createWeatherEntry({ condition: 'Ensolarado', stoppageHours: -1 })];
  const errors = validateWeather(weather);
  assert.ok(errors.some((e) => e.includes('devem estar entre 0 e 24h')));
});

test('B3.5: Extreme decimal stoppage hours (e.g. 7.75h) accepted cleanly', () => {
  const weather = [
    createWeatherEntry({
      condition: 'Chuvoso',
      stoppageHours: 7.75,
      impact: 'Chuva intermitente durante quase todo o turno',
    }),
  ];
  const errors = validateWeather(weather);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(weather[0].stoppageHours, 7.75);
});

/* ========================================================================== */
/* Feature 4 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B4.1: Empty labor array rejects', () => {
  const errors = validateLabor([]);
  assert.ok(errors.some((e) => e.includes('ao menos 1 colaborador')));
});

test('B4.2: Labor entry with quantity 0 rejects', () => {
  const labor = [createLaborEntry({ role: 'Pedreiro', quantity: 0 })];
  const errors = validateLabor(labor);
  assert.ok(errors.some((e) => e.includes('deve ser um número inteiro >= 1')));
});

test('B4.3: Labor entry with negative quantity rejects', () => {
  const labor = [createLaborEntry({ role: 'Pedreiro', quantity: -3 })];
  const errors = validateLabor(labor);
  assert.ok(errors.some((e) => e.includes('deve ser um número inteiro >= 1')));
});

test('B4.4: Daily hours > 24 hours per worker rejects', () => {
  const labor = [createLaborEntry({ role: 'Vigia', quantity: 1, hours: 25 })];
  const errors = validateLabor(labor);
  assert.ok(errors.some((e) => e.includes('deve estar entre 0 e 24 horas')));
});

test('B4.5: Daily hours < 0 rejects', () => {
  const labor = [createLaborEntry({ role: 'Servente', quantity: 1, hours: -4 })];
  const errors = validateLabor(labor);
  assert.ok(errors.some((e) => e.includes('deve estar entre 0 e 24 horas')));
});

/* ========================================================================== */
/* Feature 5 Boundaries (5 tests)                                             */
/* ========================================================================== */

test('B5.1: Labor with 0 total headcount returns calcHeadcount = 0', () => {
  assert.strictEqual(calcHeadcount([]), 0);
  assert.strictEqual(calcHeadcount([{ quantity: 0 }]), 0);
});

test('B5.2: Labor with fractional decimal hours (e.g. 0.25h) calculates precisely', () => {
  const labor = [createLaborEntry({ quantity: 4, hours: 0.25 })]; // 4 * 0.25 = 1 Hh
  assert.strictEqual(calcManHours(labor), 1);
});

test('B5.3: Very large workforce (e.g. 1000 workers, 8000 Hh) calculates without overflow', () => {
  const labor = [
    createLaborEntry({ quantity: 600, hours: 8 }),
    createLaborEntry({ quantity: 400, hours: 8 }),
  ];
  assert.strictEqual(calcHeadcount(labor), 1000);
  assert.strictEqual(calcManHours(labor), 8000);
});

test('B5.4: Empty array returns calcManHours = 0 without error', () => {
  assert.strictEqual(calcManHours([]), 0);
  assert.strictEqual(calcManHours(null), 0);
  assert.strictEqual(calcManHours(undefined), 0);
});

test('B5.5: Non-numeric quantities or hours sanitized gracefully', () => {
  const labor = [{ role: 'Estagiário', quantity: 'abc', hours: 'xyz' }];
  assert.strictEqual(calcHeadcount(labor), 0);
  assert.strictEqual(calcManHours(labor), 0);
});
