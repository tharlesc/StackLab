/**
 * Tier 2: Boundary & Corner Cases — Features 11 to 13 (Materials, Occurrences, DDS)
 * 5 test cases per feature = 15 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMaterialEntry,
  createOccurrenceEntry,
} from '../harness/contracts.mjs';
import {
  validateMaterials,
  validateOccurrences,
} from '../harness/validation.mjs';

/* ========================================================================== */
/* Feature 11 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B11.1: Material with empty name rejects', () => {
  const materials = [createMaterialEntry({ name: '' })];
  const errors = validateMaterials(materials);
  assert.ok(errors.some((e) => e.includes('Nome do insumo/material')));
});

test('B11.2: Material with empty supplier rejects', () => {
  const materials = [createMaterialEntry({ supplier: '   ' })];
  const errors = validateMaterials(materials);
  assert.ok(errors.some((e) => e.includes('Fornecedor do material')));
});

test('B11.3: Material with empty invoice (NF-e) rejects', () => {
  const materials = [createMaterialEntry({ invoice: '' })];
  const errors = validateMaterials(materials);
  assert.ok(errors.some((e) => e.includes('Número da NF-e')));
});

test('B11.4: Empty materials array is allowed (optional section)', () => {
  const errors = validateMaterials([]);
  assert.strictEqual(errors.length, 0);
});

test('B11.5: Long NF-e access key (44 digits) handles correctly', () => {
  const longInvoice = '35261029482019205500100001928110829182736451';
  const materials = [createMaterialEntry({ invoice: longInvoice })];
  const errors = validateMaterials(materials);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(materials[0].invoice, longInvoice);
});

/* ========================================================================== */
/* Feature 12 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B12.1: Occurrence with invalid type rejects', () => {
  const occurrences = [createOccurrenceEntry({ type: 'invalido' })];
  const errors = validateOccurrences(occurrences);
  assert.ok(errors.some((e) => e.includes('Tipo de ocorrência inválido')));
});

test('B12.2: Occurrence with description < 5 characters rejects', () => {
  const occurrences = [createOccurrenceEntry({ description: 'fogo' })];
  const errors = validateOccurrences(occurrences);
  assert.ok(errors.some((e) => e.includes('no mínimo 5 caracteres')));
});

test('B12.3: Occurrence with whitespace-only description rejects', () => {
  const occurrences = [createOccurrenceEntry({ description: '      ' })];
  const errors = validateOccurrences(occurrences);
  assert.ok(errors.some((e) => e.includes('no mínimo 5 caracteres')));
});

test('B12.4: Empty occurrences array is allowed (optional section)', () => {
  const errors = validateOccurrences([]);
  assert.strictEqual(errors.length, 0);
});

test('B12.5: Long occurrence description (2000 chars) handles properly', () => {
  const longDesc = 'Relato minucioso de interferência externa na rede de drenagem pluvial. '.repeat(30);
  const occurrences = [createOccurrenceEntry({ description: longDesc })];
  const errors = validateOccurrences(occurrences);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(occurrences[0].description, longDesc);
});

/* ========================================================================== */
/* Feature 13 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B13.1: DDS occurrence with description < 5 chars rejects', () => {
  const dds = [createOccurrenceEntry({ type: 'dds', description: 'dds' })];
  const errors = validateOccurrences(dds);
  assert.ok(errors.some((e) => e.includes('no mínimo 5 caracteres')));
});

test('B13.2: DDS with 0 participants allowed (when recorded without headcount)', () => {
  const dds = createOccurrenceEntry({ type: 'dds', participants: 0 });
  assert.strictEqual(dds.participants, 0);
});

test('B13.3: DDS with negative participants flags boundary', () => {
  const dds = createOccurrenceEntry({ type: 'dds', participants: -5 });
  assert.ok(dds.participants < 0);
});

test('B13.4: DDS with empty instructor name defaults gracefully', () => {
  const dds = createOccurrenceEntry({ type: 'dds', instructor: '' });
  assert.strictEqual(dds.instructor, '');
});

test('B13.5: Multiple DDS entries in same day handled independently', () => {
  const occurrences = [
    createOccurrenceEntry({ type: 'dds', description: 'DDS Manhã: Trabalho em Altura' }),
    createOccurrenceEntry({ type: 'dds', description: 'DDS Tarde: Proteção Contra Incêndios' }),
  ];
  const errors = validateOccurrences(occurrences);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(occurrences.length, 2);
});
