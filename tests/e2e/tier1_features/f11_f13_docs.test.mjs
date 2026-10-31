/**
 * Tier 1: Feature Coverage — Features 11 to 13 (Materials/Invoices, Occurrences, DDS)
 * 5 test cases per feature = 15 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMaterialEntry,
  createOccurrenceEntry,
} from '../harness/contracts.mjs';
import { validateMaterials, validateOccurrences } from '../harness/validation.mjs';

/* ========================================================================== */
/* Feature 11: Materiais Recebidos e NF-e (5 tests)                           */
/* ========================================================================== */

test('F11.1: Material delivery with supplier, description, and NF-e number', () => {
  const materials = [
    createMaterialEntry({
      name: 'Aço CA-50 10mm',
      supplier: 'Gerdau Aços Longos',
      invoice: 'NF-e 129482',
      quantity: 500,
      unit: 'barras',
    }),
  ];
  const errors = validateMaterials(materials);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(materials[0].invoice, 'NF-e 129482');
  assert.strictEqual(materials[0].supplier, 'Gerdau Aços Longos');
});

test('F11.2: Multiple material deliveries in single day (cement, rebar, sand)', () => {
  const materials = [
    createMaterialEntry({ name: 'Cimento CP-II', supplier: 'Votorantim', invoice: 'NF-01' }),
    createMaterialEntry({ name: 'Areia Média Lavada', supplier: 'Mineração São Bento', invoice: 'NF-02' }),
    createMaterialEntry({ name: 'Brita 1', supplier: 'Pedreira Boa Vista', invoice: 'NF-03' }),
  ];
  const errors = validateMaterials(materials);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(materials.length, 3);
});

test('F11.3: Quantity and packaging unit tracking (sacos, m³, toneladas)', () => {
  const materials = [
    createMaterialEntry({ name: 'Argamassa AC-III', quantity: 80, unit: 'sacos' }),
    createMaterialEntry({ name: 'Concreto Usinado', quantity: 24, unit: 'm³' }),
    createMaterialEntry({ name: 'Bloco de Concreto', quantity: 1500, unit: 'un' }),
  ];
  const errors = validateMaterials(materials);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(materials[0].unit, 'sacos');
  assert.strictEqual(materials[1].unit, 'm³');
});

test('F11.4: Supplier information fidelity', () => {
  const entry = createMaterialEntry({
    supplier: 'Distribuidora Hidráulica e Elétrica Ltda.',
  });
  const errors = validateMaterials([entry]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(entry.supplier, 'Distribuidora Hidráulica e Elétrica Ltda.');
});

test('F11.5: NF-e tracking for financial and technical audit', () => {
  const entry = createMaterialEntry({
    invoice: 'NFe-3526-1029-4820-1920-5500-1000-0192-8110-8291-8273',
  });
  const errors = validateMaterials([entry]);
  assert.strictEqual(errors.length, 0);
  assert.ok(entry.invoice.startsWith('NFe-3526'));
});

/* ========================================================================== */
/* Feature 12: Ocorrências e Fatos Relevantes (5 tests)                       */
/* ========================================================================== */

test('F12.1: Safety occurrence (acidente / near-miss) with detailed report', () => {
  const occurrences = [
    createOccurrenceEntry({
      type: 'acidente',
      description: 'Quase-acidente com rompimento de cinta de içamento no 2º andar. Ninguém ferido.',
    }),
  ];
  const errors = validateOccurrences(occurrences);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(occurrences[0].type, 'acidente');
});

test('F12.2: External interference occurrence (power outage, utility stoppage)', () => {
  const occurrences = [
    createOccurrenceEntry({
      type: 'interferencia',
      description: 'Interrupção no fornecimento de energia elétrica pela concessionária local das 14h às 16h.',
    }),
  ];
  const errors = validateOccurrences(occurrences);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(occurrences[0].type, 'interferencia');
});

test('F12.3: Technical pending issue occurrence (pendencia)', () => {
  const occurrences = [
    createOccurrenceEntry({
      type: 'pendencia',
      description: 'Aguardando detalhamento do projeto estrutural das vigas de transição V-201.',
    }),
  ];
  const errors = validateOccurrences(occurrences);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(occurrences[0].type, 'pendencia');
});

test('F12.4: General site event (outro)', () => {
  const occurrences = [
    createOccurrenceEntry({
      type: 'outro',
      description: 'Visita técnica dos fiscais da Caixa Econômica Federal para medição da etapa 3.',
    }),
  ];
  const errors = validateOccurrences(occurrences);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(occurrences[0].type, 'outro');
});

test('F12.5: Multiple occurrences categorized with tags', () => {
  const occurrences = [
    createOccurrenceEntry({ type: 'acidente', description: 'Corte superficial na luva de vaqueta sem lesão' }),
    createOccurrenceEntry({ type: 'pendencia', description: 'Revisão na paginação de piso do hall' }),
    createOccurrenceEntry({ type: 'paralisacao', description: 'Paralisação preventiva durante rajada de ventos fortes' }),
  ];
  const errors = validateOccurrences(occurrences);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(occurrences.length, 3);
  assert.deepStrictEqual(occurrences.map((o) => o.type), ['acidente', 'pendencia', 'paralisacao']);
});

/* ========================================================================== */
/* Feature 13: Registro de DDS (Diálogo Diário de Segurança) (5 tests)        */
/* ========================================================================== */

test('F13.1: NR-18 daily safety dialogue topic recorded', () => {
  const dds = createOccurrenceEntry({
    type: 'dds',
    description: 'DDS Matinal: Medidas preventivas contra quedas em trabalho de periferia (NR-18 e NR-35).',
  });
  const errors = validateOccurrences([dds]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(dds.type, 'dds');
  assert.ok(dds.description.includes('NR-18'));
});

test('F13.2: DDS instructor / technician identification', () => {
  const dds = createOccurrenceEntry({
    type: 'dds',
    description: 'DDS: Riscos biológicos e hidratação térmica no canteiro de obras.',
    instructor: 'Téc. Seg. Carlos Eduardo (Reg. MTE 44129)',
  });
  assert.strictEqual(dds.instructor, 'Téc. Seg. Carlos Eduardo (Reg. MTE 44129)');
});

test('F13.3: Participant attendance headcount recording', () => {
  const dds = createOccurrenceEntry({
    type: 'dds',
    description: 'DDS: Uso correto e higienização de protetores auditivos tipo concha.',
    participants: 18,
  });
  assert.strictEqual(dds.participants, 18);
});

test('F13.4: DDS linkage to daily labor presence', () => {
  const totalLaborHeadcount = 20;
  const dds = createOccurrenceEntry({
    type: 'dds',
    description: 'DDS sobre ordem e limpeza no canteiro (5S).',
    participants: 20,
  });
  assert.strictEqual(dds.participants, totalLaborHeadcount, 'All 20 present workers attended DDS');
});

test('F13.5: Distinct occurrence tagging for DDS vs incidents', () => {
  const occurrences = [
    createOccurrenceEntry({ type: 'dds', description: 'DDS do dia: Prevenção de choques em quadros temporários' }),
    createOccurrenceEntry({ type: 'acidente', description: 'Queda de ferramenta na bandeja de proteção' }),
  ];
  const ddsItems = occurrences.filter((o) => o.type === 'dds');
  const incidentItems = occurrences.filter((o) => o.type === 'acidente');
  assert.strictEqual(ddsItems.length, 1);
  assert.strictEqual(incidentItems.length, 1);
});
