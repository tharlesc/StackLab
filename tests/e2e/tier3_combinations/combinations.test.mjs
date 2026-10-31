/**
 * Tier 3: Cross-Feature Combinations — Pairwise Integration Suites
 * 27 pairwise combinations covering critical cross-feature interactions.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RDO_STATUS,
  createValidRDO,
  createMockUser,
  createMockWork,
  createWeatherEntry,
  createLaborEntry,
  createEquipmentEntry,
  createActivityEntry,
  createMaterialEntry,
  createOccurrenceEntry,
  createPhotoEntry,
  calcHeadcount,
  calcManHours,
  isOverdue,
  getDisplayStatus,
  MASTER_PIN,
} from '../harness/contracts.mjs';
import {
  validatePreSubmission,
  validatePhotos,
} from '../harness/validation.mjs';
import {
  applySecurityWatermark,
  verifyPhotoWatermark,
} from '../harness/watermark.mjs';
import {
  submitRdo,
  returnRdo,
  auditedEdit,
  addComment,
  approveRdo,
  rectifyRdo,
  canCommonEdit,
  getAvailableActions,
} from '../harness/workflow.mjs';
import { OfflineStore } from '../harness/offlineStore.mjs';
import { MockServerApi } from '../harness/apiClient.mjs';

/* ========================================================================== */
/* Tier 3 Pairwise Combinations (27 tests)                                    */
/* ========================================================================== */

test('C01: Rain + Equipment idle stoppage (F2 + F3 + F7 + F8)', () => {
  const rdo = createValidRDO({
    weather: [
      createWeatherEntry({
        shift: 'tarde',
        condition: 'Chuvoso',
        stoppageHours: 4,
        impact: 'Chuva torrencial paralisou terraplenagem',
      }),
    ],
    equipment: [
      createEquipmentEntry({
        name: 'Motoniveladora CAT',
        activeHours: 4,
        idleHours: 4,
        idleJustification: 'Paralisada devido à chuva no turno da tarde',
      }),
    ],
  });

  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(rdo.weather[0].stoppageHours, rdo.equipment[0].idleHours);
});

test('C02: Photo + GPS + Watermark + Pre-submission validation (F14 + F15 + F16 + F18)', () => {
  const work = createMockWork();
  const author = createMockUser();
  const gps = { latitude: -2.5307, longitude: -44.3068, accuracy: 3.8, address: 'São Luís, MA' };

  const photo = applySecurityWatermark({
    rawPhotoUri: 'file:///cam/p1.jpg',
    work,
    author,
    gps,
    caption: 'Armação de pilar P12',
    rdoNumber: 1,
  });

  const rdo = createValidRDO({ photos: [photo] });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.ok(photo.watermarkText.includes('Lat -2.530700°'));
});

test('C03: Photo with invalid GPS blocks pre-submission (F14 + F15 + F18)', () => {
  const photo = createPhotoEntry();
  photo.metadata.latitude = 120.0; // Out of range

  const rdo = createValidRDO({ photos: [photo] });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('Latitude da foto 1 inválida')));
});

test('C04: Offline draft persistence + Online submission queue (F17 + F19)', async () => {
  const store = new OfflineStore();
  const api = new MockServerApi();
  const rdo = createValidRDO();

  // 1. Worker saves draft offline
  store.setOnline(false);
  await store.saveDraft(rdo);
  await store.enqueueSync('SUBMIT_RDO', rdo);

  // 2. Connectivity restored
  store.setOnline(true);
  const syncRes = await store.processSyncQueue(api);

  assert.strictEqual(syncRes.syncedCount, 1);
  assert.strictEqual(syncRes.remainingCount, 0);
  assert.strictEqual(syncRes.results[0].res.data.status, RDO_STATUS.SUBMETIDO);
});

test('C05: Submission + Worker lock + Master review access (F19 + F20)', () => {
  const worker = createMockUser({ profile: 'common' });
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO();

  const { rdo: submitted } = submitRdo(rdo, worker);
  assert.strictEqual(canCommonEdit(submitted), false);

  const workerActions = getAvailableActions(submitted, worker);
  assert.deepStrictEqual(workerActions, []);

  const masterActions = getAvailableActions(submitted, master);
  assert.ok(masterActions.includes('approve'));
  assert.ok(masterActions.includes('return'));
});

test('C06: Master Devolução + Worker fix + Resubmission (F24 + F19)', () => {
  const worker = createMockUser({ profile: 'common' });
  const master = createMockUser({ profile: 'master' });
  let rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  // 1. Master devolves
  const ret = returnRdo(rdo, master, 'Ajustar quantidade de blocos de concreto no térreo.');
  rdo = ret.rdo;
  assert.strictEqual(rdo.status, RDO_STATUS.DEVOLVIDO);
  assert.strictEqual(canCommonEdit(rdo), true);

  // 2. Worker fixes
  rdo.activities[0].quantity = 200;

  // 3. Worker resubmits
  const sub = submitRdo(rdo, worker);
  rdo = sub.rdo;
  assert.strictEqual(rdo.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(rdo.returnReason, undefined);
  assert.strictEqual(canCommonEdit(rdo), false);
});

test('C07: Rain stoppage + Activity progress reduction (F3 + F10)', () => {
  const rdo = createValidRDO({
    weather: [
      createWeatherEntry({ condition: 'Chuva', stoppageHours: 6, impact: 'Solo impraticável' }),
    ],
    activities: [
      createActivityEntry({ description: 'Terraplenagem do platô', progress: 0 }),
    ],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(rdo.activities[0].progress, 0);
});

test('C08: Subcontracted labor + Equipment leasing (F4 + F6)', () => {
  const rdo = createValidRDO({
    labor: [
      createLaborEntry({ role: 'Montador Estrutural', type: 'terceirizado', quantity: 4, hours: 8 }),
    ],
    equipment: [
      createEquipmentEntry({ name: 'Plataforma Elevatória Tesoura', type: 'locado', activeHours: 8, idleHours: 0 }),
    ],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(rdo.labor[0].type, 'terceirizado');
  assert.strictEqual(rdo.equipment[0].type, 'locado');
});

test('C09: Labor Headcount + Homem-Hora + Daily shift calculation (F4 + F5 + F1)', () => {
  const labor = [
    createLaborEntry({ role: 'Pedreiro', quantity: 5, hours: 8 }),
    createLaborEntry({ role: 'Servente', quantity: 10, hours: 8 }),
    createLaborEntry({ role: 'Encarregado', quantity: 1, hours: 9 }),
  ];
  const headcount = calcHeadcount(labor);
  const manHours = calcManHours(labor);

  assert.strictEqual(headcount, 16);
  assert.strictEqual(manHours, 5 * 8 + 10 * 8 + 1 * 9); // 40 + 80 + 9 = 129
});

test('C10: Material delivery + Activity consumption (F11 + F9)', () => {
  const rdo = createValidRDO({
    materials: [
      createMaterialEntry({ name: 'Concreto FCK 25 MPa', supplier: 'MixConcreto', invoice: 'NF-1029', quantity: 16, unit: 'm³' }),
    ],
    activities: [
      createActivityEntry({ description: 'Concretagem do piso industrial', quantity: 16, unit: 'm³', progress: 100 }),
    ],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(rdo.materials[0].quantity, rdo.activities[0].quantity);
});

test('C11: Safety incident occurrence + Weather condition (F12 + F2)', () => {
  const rdo = createValidRDO({
    weather: [
      createWeatherEntry({ shift: 'tarde', condition: 'Chuva', stoppageHours: 1, impact: 'Piso escorregadio' }),
    ],
    occurrences: [
      createOccurrenceEntry({
        type: 'acidente',
        description: 'Escorregão em rampa de acesso molhada pela chuva; atendimento de primeiros socorros sem afastamento.',
      }),
    ],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.ok(rdo.occurrences[0].description.includes('chuva'));
});

test('C12: DDS NR-18 + Workforce headcount attendance (F13 + F4 + F5)', () => {
  const labor = [
    createLaborEntry({ role: 'Armador', quantity: 8, hours: 8 }),
    createLaborEntry({ role: 'Carpinteiro', quantity: 4, hours: 8 }),
  ];
  const headcount = calcHeadcount(labor);

  const dds = createOccurrenceEntry({
    type: 'dds',
    description: 'DDS NR-18: Riscos na carpintaria e armação de ferragens',
    participants: headcount,
  });

  assert.strictEqual(dds.participants, 12);
  assert.strictEqual(dds.participants, headcount);
});

test('C13: Photo watermark inspection + Master GPS verification (F15 + F21)', () => {
  const work = createMockWork({ id: 'work-site-a' });
  const author = createMockUser({ id: 'user-op-1' });
  const gps = { latitude: -2.5307, longitude: -44.3068, accuracy: 4.5, address: 'São Luís - MA' };

  const photo = applySecurityWatermark({
    rawPhotoUri: 'file:///photo1.jpg',
    work,
    author,
    gps,
    rdoNumber: 42,
  });

  const rdo = createValidRDO({ workId: 'work-site-a', number: 42 });
  const inspection = verifyPhotoWatermark(photo, rdo);

  assert.strictEqual(inspection.verified, true);
  assert.strictEqual(inspection.anomalies.length, 0);
  assert.strictEqual(inspection.metadata.workId, 'work-site-a');
});

test('C14: Master section comment + Audit log generation (F22 + F27)', () => {
  const master = createMockUser({ profile: 'master', name: 'Eng. Master Davi' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: updated, log } = addComment(rdo, master, 'maoDeObra', 'Efetivo terceirizado sem encarregado.');
  assert.strictEqual(updated.comments.length, 1);
  assert.strictEqual(log.action, 'comentado');
  assert.strictEqual(log.actorName, 'Eng. Master Davi');
  assert.strictEqual(log.section, 'maoDeObra');
});

test('C15: Master Audited Edit + Historical Value Preservation (F23 + F27)', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({
    status: RDO_STATUS.SUBMETIDO,
    equipment: [createEquipmentEntry({ name: 'Betoneira Manual' })],
  });

  const { rdo: edited, log } = auditedEdit(rdo, master, {
    section: 'equipamentos',
    field: 'name',
    previousValue: 'Betoneira Manual',
    newValue: 'Betoneira Elétrica 400L',
    justification: 'Correção de tipo de acionamento do motor',
  });

  assert.strictEqual(edited.equipment[0].name, 'Betoneira Elétrica 400L');
  assert.strictEqual(log.previousValue, 'Betoneira Manual');
  assert.strictEqual(log.newValue, 'Betoneira Elétrica 400L');
  assert.strictEqual(log.justification, 'Correção de tipo de acionamento do motor');
});

test('C16: Master Approval + 2FA PIN + Signature Hash (F25 + F27)', () => {
  const master = createMockUser({ profile: 'master', name: 'Davi Hudson' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  const { rdo: approved, log, signature } = approveRdo(rdo, master, {
    pin: MASTER_PIN,
    ip: '201.88.42.10',
    deviceId: 'iPad-Air-5',
  });

  assert.strictEqual(approved.status, RDO_STATUS.APROVADO);
  assert.strictEqual(approved.locked, true);
  assert.strictEqual(signature.signedByName, 'Davi Hudson');
  assert.ok(signature.hash.startsWith('SL-'));
  assert.strictEqual(log.action, 'aprovado');
});

test('C17: Approved RDO + Official Rectification + Historical Freeze (F25 + F26)', () => {
  const master = createMockUser({ profile: 'master' });
  const approvedV1 = createValidRDO({ id: 'rdo-doc', version: 1, status: RDO_STATUS.APROVADO, locked: true });

  const { original, newVersion, log } = rectifyRdo(
    approvedV1,
    master,
    'Retificação de metragem de reboco',
    [approvedV1]
  );

  assert.strictEqual(original.locked, true);
  assert.strictEqual(original.version, 1);
  assert.strictEqual(newVersion.version, 2);
  assert.strictEqual(newVersion.previousVersionId, original.id);
  assert.strictEqual(newVersion.status, RDO_STATUS.SUBMETIDO);
  assert.strictEqual(log.action, 'retificado');
});

test('C18: Multiple photos + Multiple activities cataloging (F9 + F16)', () => {
  const act1 = createActivityEntry({ description: 'Concretagem de viga' });
  const act2 = createActivityEntry({ description: 'Instalação de armaduras' });

  const p1 = createPhotoEntry({ caption: 'Foto viga concretada', activityId: 'act-1' });
  const p2 = createPhotoEntry({ caption: 'Foto ferragem amarrada', activityId: 'act-2' });

  const rdo = createValidRDO({ activities: [act1, act2], photos: [p1, p2] });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(rdo.photos.length, 2);
});

test('C19: Offline photo capture + Watermark baking + Local storage (F14 + F15 + F17)', async () => {
  const store = new OfflineStore();
  const work = createMockWork();
  const author = createMockUser();
  const gps = { latitude: -2.53, longitude: -44.30, accuracy: 5 };

  const watermarkedPhoto = applySecurityWatermark({
    rawPhotoUri: 'file:///dcim/photo_offline.jpg',
    work,
    author,
    gps,
    caption: 'Foto capturada sem rede',
  });

  const rdo = createValidRDO({ photos: [watermarkedPhoto] });
  await store.saveDraft(rdo);

  const restored = await store.getDraft(rdo.id);
  assert.strictEqual(restored.photos.length, 1);
  assert.ok(restored.photos[0].watermarkText.includes('OB-101'));
});

test('C20: 24h SLA derivation + Inbox priority sorting (F1 + F27 + SLA)', () => {
  const now = new Date('2026-10-30T16:00:00.000Z');
  const rdoNormal = {
    id: 'rdo-1',
    status: RDO_STATUS.SUBMETIDO,
    submittedAt: '2026-10-30T10:00:00.000Z', // 6h ago
  };
  const rdoDelayed = {
    id: 'rdo-2',
    status: RDO_STATUS.SUBMETIDO,
    submittedAt: '2026-10-29T10:00:00.000Z', // 30h ago (overdue)
  };

  assert.strictEqual(isOverdue(rdoNormal, now), false);
  assert.strictEqual(isOverdue(rdoDelayed, now), true);
  assert.strictEqual(getDisplayStatus(rdoDelayed, now), 'atrasado');

  // Priority sorting: overdue first
  const list = [rdoNormal, rdoDelayed].sort((a, b) => {
    return Number(isOverdue(b, now)) - Number(isOverdue(a, now));
  });
  assert.strictEqual(list[0].id, 'rdo-2');
});

test('C21: Partial rain stoppage + Partial equipment operation (F3 + F7)', () => {
  const rdo = createValidRDO({
    weather: [
      createWeatherEntry({ shift: 'manha', condition: 'Chuvoso', stoppageHours: 3, impact: 'Solo enlameado' }),
    ],
    equipment: [
      createEquipmentEntry({ name: 'Rolo Compactador', activeHours: 5, idleHours: 3, idleJustification: 'Solo enlameado pela chuva' }),
    ],
  });
  const res = validatePreSubmission(rdo);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(rdo.weather[0].stoppageHours, 3);
  assert.strictEqual(rdo.equipment[0].idleHours, 3);
});

test('C22: NF-e Invoice + Material Entry + Master Audited Edit (F11 + F23)', () => {
  const master = createMockUser({ profile: 'master' });
  const rdo = createValidRDO({
    status: RDO_STATUS.SUBMETIDO,
    materials: [createMaterialEntry({ name: 'Aço CA-50', invoice: 'NF-1001' })],
  });

  const { rdo: edited, log } = auditedEdit(rdo, master, {
    section: 'materiais',
    field: 'invoice',
    previousValue: 'NF-1001',
    newValue: 'NF-1001-A',
    justification: 'Inclusão da subsérie da nota fiscal',
  });

  assert.strictEqual(edited.materials[0].invoice, 'NF-1001-A');
  assert.strictEqual(log.newValue, 'NF-1001-A');
});

test('C23: Master Comment + Devolução with Reference to Comment (F22 + F24)', () => {
  const master = createMockUser({ profile: 'master' });
  let rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });

  rdo = addComment(rdo, master, 'equipamentos', 'A grua operou 10h sem autorização.').rdo;
  const ret = returnRdo(rdo, master, 'Favor verificar comentário na seção de equipamentos.');
  rdo = ret.rdo;

  assert.strictEqual(rdo.status, RDO_STATUS.DEVOLVIDO);
  assert.strictEqual(rdo.comments.length, 1);
  assert.ok(rdo.returnReason.includes('equipamentos'));
});

test('C24: Rectified RDO (v2) + Master Approval of v2 + Signature (F26 + F25)', () => {
  const master = createMockUser({ profile: 'master' });
  const v1 = createValidRDO({ id: 'rdo-seq', version: 1, status: RDO_STATUS.APROVADO, locked: true });

  const { newVersion: v2 } = rectifyRdo(v1, master, 'Retificação autorizada', [v1]);
  assert.strictEqual(v2.version, 2);
  assert.strictEqual(v2.status, RDO_STATUS.SUBMETIDO);

  const { rdo: approvedV2, signature } = approveRdo(v2, master, { pin: MASTER_PIN });
  assert.strictEqual(approvedV2.status, RDO_STATUS.APROVADO);
  assert.strictEqual(approvedV2.locked, true);
  assert.strictEqual(approvedV2.version, 2);
  assert.ok(signature.hash.startsWith('SL-'));
});

test('C25: Common worker attempts audited edit (F23 + RBAC)', () => {
  const worker = createMockUser({ profile: 'common' });
  const rdo = createValidRDO({ status: RDO_STATUS.SUBMETIDO });
  const actions = getAvailableActions(rdo, worker);
  assert.strictEqual(actions.includes('auditedEdit'), false, 'Common worker must not have auditedEdit action');
});

test('C26: Full audit trail chronological ordering across multi-actor cycle (F27 + F19 + F24 + F25)', () => {
  const worker = createMockUser({ id: 'w-1', name: 'Operário', profile: 'common' });
  const master = createMockUser({ id: 'm-1', name: 'Master', profile: 'master' });
  let rdo = createValidRDO();
  const logs = [];

  const s1 = submitRdo(rdo, worker);
  rdo = s1.rdo;
  logs.push(s1.log);

  const d1 = returnRdo(rdo, master, 'Corrigir descrição da atividade de alvenaria.');
  rdo = d1.rdo;
  logs.push(d1.log);

  const s2 = submitRdo(rdo, worker);
  rdo = s2.rdo;
  logs.push(s2.log);

  const a1 = approveRdo(rdo, master, { pin: '1234' });
  logs.push(a1.log);

  assert.strictEqual(logs.length, 4);
  assert.deepStrictEqual(logs.map((l) => l.action), ['submetido', 'devolvido', 'submetido', 'aprovado']);
});

test('C27: REST API upload photo + Submit RDO with photoIds + Master GET (F14 + F15 + F19 + F20)', async () => {
  const api = new MockServerApi();
  const work = createMockWork();
  const author = createMockUser();
  const gps = { latitude: -2.5307, longitude: -44.3068, accuracy: 4.2 };

  const watermarked = applySecurityWatermark({
    rawPhotoUri: 'file:///upload.jpg',
    work,
    author,
    gps,
    caption: 'Foto API End-to-End',
  });

  // 1. Upload photo to server
  const photoRes = await api.uploadPhoto({
    photo: 'binary-buffer-data',
    caption: watermarked.caption,
    workId: work.id,
    takenAt: watermarked.takenAt,
    latitude: watermarked.metadata.latitude,
    longitude: watermarked.metadata.longitude,
    accuracy: watermarked.metadata.accuracy,
    watermarkText: watermarked.watermarkText,
    authorName: author.name,
  });

  assert.strictEqual(photoRes.status, 201);
  const photoId = photoRes.data.id;

  // 2. Submit RDO referencing uploaded photo
  const validRdo = createValidRDO({ workId: work.id });
  const rdoRes = await api.submitRDO({
    ...validRdo,
    photoIds: [photoId],
  });

  assert.strictEqual(rdoRes.status, 201);
  const rdoId = rdoRes.data.id;

  // 3. Master retrieves RDO
  const getRes = await api.getRDO(rdoId);
  assert.strictEqual(getRes.status, 200);
  assert.strictEqual(getRes.data.photos.length, 1);
  assert.strictEqual(getRes.data.photos[0].id, photoId);
  assert.ok(getRes.data.photos[0].metadata.watermarkText.includes('OB-101'));
});
