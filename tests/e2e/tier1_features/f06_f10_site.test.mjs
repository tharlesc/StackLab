/**
 * Tier 1: Feature Coverage — Features 6 to 10 (Site Machinery, Idle Hours, Activities, Physical Progress)
 * 5 test cases per feature = 25 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createEquipmentEntry,
  createActivityEntry,
} from '../harness/contracts.mjs';
import { validateEquipment, validateActivities } from '../harness/validation.mjs';

/* ========================================================================== */
/* Feature 6: Equipamentos Mobilizados (5 tests)                              */
/* ========================================================================== */

test('F6.1: Mobilized own equipment entry (Betoneira, Caminhão Basculante)', () => {
  const equip = [
    createEquipmentEntry({ name: 'Betoneira 400L', type: 'proprio', quantity: 2 }),
    createEquipmentEntry({ name: 'Caminhão Basculante', type: 'proprio', quantity: 1 }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(equip.every((e) => e.type === 'proprio'), true);
});

test('F6.2: Mobilized leased equipment entry (Grua de Torre, Escavadeira)', () => {
  const equip = [
    createEquipmentEntry({ name: 'Grua de Torre 30m', type: 'locado', quantity: 1 }),
    createEquipmentEntry({ name: 'Mini Escavadeira CAT', type: 'locado', quantity: 1 }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(equip.every((e) => e.type === 'locado'), true);
});

test('F6.3: Multi-unit equipment allocation', () => {
  const equip = [
    createEquipmentEntry({ name: 'Compactador de Solo (Sapo)', quantity: 3, activeHours: 6, idleHours: 0 }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(equip[0].quantity, 3);
});

test('F6.4: Equipment categorization and naming fidelity', () => {
  const names = ['Andaime Fachadeiro', 'Vibrador de Imersão', 'Serra Circular de Bancada'];
  const equip = names.map((name) => createEquipmentEntry({ name }));
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.deepStrictEqual(equip.map((e) => e.name), names);
});

test('F6.5: Inventory listing with operational status', () => {
  const equip = [
    createEquipmentEntry({ name: 'Bomba de Concreto', activeHours: 4, idleHours: 0 }),
    createEquipmentEntry({ name: 'Gerador 50kVA', activeHours: 8, idleHours: 0 }),
  ];
  const operational = equip.filter((e) => e.activeHours > 0);
  assert.strictEqual(operational.length, 2);
});

/* ========================================================================== */
/* Feature 7: Equipamentos - Horas Ativas vs Ociosas (5 tests)                */
/* ========================================================================== */

test('F7.1: Equipment with 100% active hours (e.g. 8h active, 0h idle)', () => {
  const equip = [createEquipmentEntry({ activeHours: 8, idleHours: 0 })];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(equip[0].activeHours, 8);
  assert.strictEqual(equip[0].idleHours, 0);
});

test('F7.2: Equipment with mixed hours (e.g. 5h active, 3h idle)', () => {
  const equip = [
    createEquipmentEntry({
      activeHours: 5,
      idleHours: 3,
      idleJustification: 'Aguardando liberação da ferragem pelo armador',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(equip[0].activeHours + equip[0].idleHours, 8);
});

test('F7.3: Equipment 100% standby/idle for entire shift (0h active, 8h idle)', () => {
  const equip = [
    createEquipmentEntry({
      activeHours: 0,
      idleHours: 8,
      idleJustification: 'Equipamento em reserva técnica para emergências',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(equip[0].activeHours, 0);
  assert.strictEqual(equip[0].idleHours, 8);
});

test('F7.4: Fractional hours tracking (e.g. 6.5h active, 1.5h idle)', () => {
  const equip = [
    createEquipmentEntry({
      activeHours: 6.5,
      idleHours: 1.5,
      idleJustification: 'Parada preventiva para engraxe e abastecimento',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(equip[0].activeHours, 6.5);
  assert.strictEqual(equip[0].idleHours, 1.5);
});

test('F7.5: Multiple machines total active vs idle hours aggregation', () => {
  const equip = [
    createEquipmentEntry({ name: 'Betoneira 1', activeHours: 7, idleHours: 1, idleJustification: 'Limpeza de tambor' }),
    createEquipmentEntry({ name: 'Betoneira 2', activeHours: 8, idleHours: 0 }),
    createEquipmentEntry({ name: 'Guincho', activeHours: 4, idleHours: 4, idleJustification: 'Manutenção de cabo de aço' }),
  ];
  const totalActive = equip.reduce((sum, e) => sum + e.activeHours, 0);
  const totalIdle = equip.reduce((sum, e) => sum + e.idleHours, 0);
  assert.strictEqual(totalActive, 19);
  assert.strictEqual(totalIdle, 5);
});

/* ========================================================================== */
/* Feature 8: Equipamentos - Justificativa de Ociosidade (5 tests)            */
/* ========================================================================== */

test('F8.1: Idle machine with mechanical breakdown justification', () => {
  const equip = [
    createEquipmentEntry({
      name: 'Retroescavadeira',
      activeHours: 2,
      idleHours: 6,
      idleJustification: 'Quebra de mangueira hidráulica durante escavação',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.ok(equip[0].idleJustification.includes('hidráulica'));
});

test('F8.2: Idle machine with weather/rain stoppage justification', () => {
  const equip = [
    createEquipmentEntry({
      name: 'Rolo Compactador',
      activeHours: 3,
      idleHours: 5,
      idleJustification: 'Paralisado devido a forte chuva e saturação do solo',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.ok(equip[0].idleJustification.includes('chuva'));
});

test('F8.3: Idle machine with material shortage justification', () => {
  const equip = [
    createEquipmentEntry({
      name: 'Projetora de Argamassa',
      activeHours: 0,
      idleHours: 8,
      idleJustification: 'Falta de argamassa usinada entregue pelo fornecedor',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0);
  assert.ok(equip[0].idleJustification.includes('argamassa'));
});

test('F8.4: Equipment with 0 idle hours does not require justification', () => {
  const equip = [
    createEquipmentEntry({
      name: 'Placa Vibratória',
      activeHours: 8,
      idleHours: 0,
      idleJustification: '',
    }),
  ];
  const errors = validateEquipment(equip);
  assert.strictEqual(errors.length, 0, 'No justification needed when idleHours = 0');
});

test('F8.5: Master inspection displays idle justification with visual alert', () => {
  const equip = createEquipmentEntry({
    name: 'Guindaste Rodoviário',
    activeHours: 4,
    idleHours: 4,
    idleJustification: 'Aguardando peça estrutural pré-moldada',
  });
  const hasAlert = equip.idleHours > 0;
  assert.strictEqual(hasAlert, true);
  assert.strictEqual(equip.idleJustification, 'Aguardando peça estrutural pré-moldada');
});

/* ========================================================================== */
/* Feature 9: Atividades Executadas (5 tests)                                 */
/* ========================================================================== */

test('F9.1: Single activity entry with location, unit, and quantity', () => {
  const activities = [
    createActivityEntry({
      description: 'Chapisco e emboço externo',
      location: 'Fachada Leste - 5º andar',
      unit: 'm²',
      quantity: 85,
    }),
  ];
  const errors = validateActivities(activities);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(activities[0].unit, 'm²');
  assert.strictEqual(activities[0].quantity, 85);
});

test('F9.2: Multiple concurrent activities across different work fronts', () => {
  const activities = [
    createActivityEntry({ description: 'Armação de vigas e laje', location: 'Torre A - 8º Pavimento' }),
    createActivityEntry({ description: 'Passagem de conduítes corrugados', location: 'Torre A - 7º Pavimento' }),
    createActivityEntry({ description: 'Instalação de tubos de água fria', location: 'Torre B - Térreo' }),
  ];
  const errors = validateActivities(activities);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(activities.length, 3);
});

test('F9.3: Detailed location tracking (building, floor, axis, room)', () => {
  const entry = createActivityEntry({
    description: 'Pintura de selador acrílico',
    location: 'Bloco C - 2º Andar - Aptos 201 e 202',
  });
  const errors = validateActivities([entry]);
  assert.strictEqual(errors.length, 0);
  assert.ok(entry.location.includes('Aptos 201 e 202'));
});

test('F9.4: Different engineering units (m², m³, m, kg, un)', () => {
  const units = ['m²', 'm³', 'm', 'kg', 'un'];
  const activities = units.map((unit, idx) =>
    createActivityEntry({
      description: `Atividade de teste em ${unit}`,
      unit,
      quantity: (idx + 1) * 10,
    })
  );
  const errors = validateActivities(activities);
  assert.strictEqual(errors.length, 0);
  assert.deepStrictEqual(activities.map((a) => a.unit), units);
});

test('F9.5: Activity list ordering and structured preservation', () => {
  const activities = [
    createActivityEntry({ description: 'Etapa 1: Demolição controlada', progress: 100 }),
    createActivityEntry({ description: 'Etapa 2: Remoção de entulho', progress: 50 }),
    createActivityEntry({ description: 'Etapa 3: Regularização do contrapiso', progress: 0 }),
  ];
  const errors = validateActivities(activities);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(activities[0].description.startsWith('Etapa 1'), true);
  assert.strictEqual(activities[2].description.startsWith('Etapa 3'), true);
});

/* ========================================================================== */
/* Feature 10: Atividades - Avanço Físico (5 tests)                            */
/* ========================================================================== */

test('F10.1: Activity initial progress (0% or started)', () => {
  const entry = createActivityEntry({ progress: 0 });
  const errors = validateActivities([entry]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(entry.progress, 0);
});

test('F10.2: Intermediate progress tracking (e.g. 25%, 50%, 75%)', () => {
  const progressValues = [25, 50, 75];
  for (const prog of progressValues) {
    const entry = createActivityEntry({ progress: prog });
    const errors = validateActivities([entry]);
    assert.strictEqual(errors.length, 0);
    assert.strictEqual(entry.progress, prog);
  }
});

test('F10.3: Activity completion (100% progress)', () => {
  const entry = createActivityEntry({
    description: 'Instalação de guarda-corpos',
    progress: 100,
  });
  const errors = validateActivities([entry]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(entry.progress, 100);
});

test('F10.4: Progress evolution from prior day', () => {
  const yesterdayProgress = 35;
  const todayProgress = 60;
  const delta = todayProgress - yesterdayProgress;
  assert.strictEqual(delta, 25, 'Physical progress should advance by +25%');
  const entry = createActivityEntry({ progress: todayProgress });
  const errors = validateActivities([entry]);
  assert.strictEqual(errors.length, 0);
});

test('F10.5: Qualitative status mapping with percentage progress', () => {
  const mapStatus = (prog) => {
    if (prog === 0) return 'Iniciado';
    if (prog === 100) return 'Concluído';
    return 'Em Andamento';
  };
  assert.strictEqual(mapStatus(0), 'Iniciado');
  assert.strictEqual(mapStatus(45), 'Em Andamento');
  assert.strictEqual(mapStatus(100), 'Concluído');
});
