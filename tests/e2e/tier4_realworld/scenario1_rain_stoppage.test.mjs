/**
 * Tier 4: Real-World Scenario 1 — Jornada Completa em Dia de Chuva com Paralisação
 * Features Exercised: F1, F2, F3, F4, F5, F6, F7, F8, F9, F12, F18, F19, F20
 * Complexity: Alta
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createMockWork,
  createMockUser,
  createWeatherEntry,
  createLaborEntry,
  createEquipmentEntry,
  createActivityEntry,
  createOccurrenceEntry,
  createPhotoEntry,
  calcHeadcount,
  calcManHours,
} from '../harness/contracts.mjs';
import { validatePreSubmission } from '../harness/validation.mjs';
import { submitRdo, canCommonEdit, getAvailableActions } from '../harness/workflow.mjs';
import { MockServerApi } from '../harness/apiClient.mjs';

test('Scenario 1: Jornada Completa em Dia de Chuva com Paralisação e Ociosidade Justificada', async () => {
  const api = new MockServerApi();
  const work = createMockWork({ id: 'work-sc1', name: 'Residencial Alphaville - Torre B', code: 'OB-101' });
  const worker = createMockUser({ id: 'usr-sc1', name: 'Eng. Tharles Silva', profile: 'common' });
  const master = createMockUser({ id: 'usr-master', name: 'Eng. Master Davi Hudson', profile: 'master' });

  // 1. Worker initializes RDO for rainy day
  const rdoData = {
    workId: work.id,
    workName: work.name,
    workCode: work.code,
    date: '2026-10-29',
    authorId: worker.id,
    authorName: worker.name,
    // Morning clear, afternoon heavy rain with 4 hours stoppage
    weather: [
      createWeatherEntry({ shift: 'manha', condition: 'Ensolarado', stoppageHours: 0, impact: '' }),
      createWeatherEntry({
        shift: 'tarde',
        condition: 'Chuvoso',
        stoppageHours: 4,
        impact: 'Chuva torrencial alagou as frentes de terraplenagem e drenagem externa.',
      }),
    ],
    // Mixed labor: 15 own workers + 5 subcontracted
    labor: [
      createLaborEntry({ role: 'Pedreiro', quantity: 6, hours: 8, type: 'proprio' }),
      createLaborEntry({ role: 'Servente', quantity: 9, hours: 8, type: 'proprio' }),
      createLaborEntry({ role: 'Operador de Escavadeira', quantity: 2, hours: 8, type: 'terceirizado' }),
      createLaborEntry({ role: 'Eletricista', quantity: 3, hours: 8, type: 'terceirizado' }),
    ],
    // Equipment: Excavator stopped 4h due to rain
    equipment: [
      createEquipmentEntry({
        name: 'Escavadeira Hidráulica CAT 320',
        activeHours: 4,
        idleHours: 4,
        idleJustification: 'Paralisada das 13h às 17h devido à forte chuva e risco de tombamento na lama.',
      }),
      createEquipmentEntry({
        name: 'Betoneira 400L',
        activeHours: 4,
        idleHours: 4,
        idleJustification: 'Serviços externos de concretagem paralisados pela chuva.',
      }),
    ],
    // Activities: outdoor halted, indoor continued
    activities: [
      createActivityEntry({
        description: 'Terraplenagem e abertura de valas de drenagem',
        location: 'Acesso Principal',
        quantity: 20,
        unit: 'm³',
        progress: 30, // Halted early
      }),
      createActivityEntry({
        description: 'Alvenaria interna nos apartamentos',
        location: 'Torre B - Pavimento 3',
        quantity: 45,
        unit: 'm²',
        progress: 80, // Continued indoors
      }),
    ],
    materials: [],
    // Occurrence registered
    occurrences: [
      createOccurrenceEntry({
        type: 'paralisacao',
        description: 'Paralisação geral de serviços externos a partir das 13h por precipitação de 45mm.',
      }),
    ],
    photos: [
      createPhotoEntry({ caption: 'Canteiro externo alagado pela tempestade da tarde' }),
    ],
    status: RDO_STATUS.RASCUNHO,
    comments: [],
    locked: false,
  };

  // 2. Validate Headcount and Man-hours
  const totalHeadcount = calcHeadcount(rdoData.labor);
  const totalManHours = calcManHours(rdoData.labor);
  assert.strictEqual(totalHeadcount, 20);
  assert.strictEqual(totalManHours, 160);

  // 3. Pre-submission validation passes cleanly with full justifications
  const validation = validatePreSubmission(rdoData);
  assert.strictEqual(validation.valid, true, 'RDO with justified rain and idle hours must pass validation');

  // 4. Worker submits RDO
  const { rdo: submittedRdo, log: submitLog } = submitRdo(rdoData, worker);
  assert.strictEqual(submittedRdo.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(canCommonEdit(submittedRdo), false, 'Worker cannot edit submitted RDO');
  assert.strictEqual(submitLog.action, 'submetido');

  // 5. Submit to backend API
  const serverRes = await api.submitRDO({
    ...submittedRdo,
    photoIds: submittedRdo.photos.map((p) => p.id),
  });
  assert.strictEqual(serverRes.status, 201);
  const serverRdo = serverRes.data;

  // 6. Master accesses /rdo-review and inspects all 7 sections with 100% fidelity
  const masterViewRes = await api.getRDO(serverRdo.id);
  const reviewData = masterViewRes.data;

  assert.strictEqual(reviewData.weather[1].condition, 'Chuvoso');
  assert.strictEqual(reviewData.weather[1].stoppageHours, 4);
  assert.ok(reviewData.weather[1].impact.includes('alagou'));
  assert.strictEqual(reviewData.equipment[0].idleHours, 4);
  assert.ok(reviewData.equipment[0].idleJustification.includes('risco de tombamento'));
  assert.strictEqual(reviewData.activities.length, 2);
  assert.strictEqual(reviewData.occurrences[0].type, 'paralisacao');

  // 7. Master available actions include approve and return
  const masterActions = getAvailableActions(reviewData, master);
  assert.ok(masterActions.includes('approve'));
  assert.ok(masterActions.includes('return'));
});
