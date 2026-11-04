/**
 * Tier 4: Real-World Scenario 2 — Registro Fotográfico Completo com Múltiplas Frentes
 * Features Exercised: F1, F9, F10, F14, F15, F16, F20, F21
 * Complexity: Alta
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMockWork,
  createMockUser,
  createValidRDO,
  createActivityEntry,
} from '../harness/contracts.mjs';
import {
  applySecurityWatermark,
  verifyPhotoWatermark,
} from '../harness/watermark.mjs';
import { MockServerApi } from '../harness/apiClient.mjs';

test('Scenario 2: Registro Fotográfico Completo com Marca d\'Água Indelével em Múltiplas Frentes', async () => {
  const api = new MockServerApi();
  const work = createMockWork({
    id: 'work-sc2',
    name: 'Hospital Geral Regional',
    code: 'OB-202',
    client: 'Secretaria de Estado da Saúde',
  });
  const worker = createMockUser({
    id: 'usr-op-2',
    name: 'Eng. Tharles Resident',
    role: 'Engenheiro Residente',
    crea: 'CREA-MA 987654/D',
  });

  // 1. Worker defines 3 distinct work fronts
  const activities = [
    createActivityEntry({
      description: 'Concretagem de blocos de coroamento B-01 a B-04',
      location: 'Subsolo - Bloco Cirúrgico',
      unit: 'm³',
      quantity: 32,
      progress: 60,
    }),
    createActivityEntry({
      description: 'Instalação de bandejas de cabos elétricos primários',
      location: 'Ala Oeste - Pavimento 1',
      unit: 'm',
      quantity: 120,
      progress: 40,
    }),
    createActivityEntry({
      description: 'Alvenaria com bloco estrutural de vedação acústica',
      location: 'UTI Neonatal - Pavimento 2',
      unit: 'm²',
      quantity: 85,
      progress: 25,
    }),
  ];

  // 2. Worker captures in-app native photos for each front with real GPS acquisition
  const captures = [
    {
      uri: 'file:///storage/dcim/fundacao_b01.jpg',
      caption: 'Concretagem com vibração do bloco de fundação B-02',
      gps: { latitude: -2.530712, longitude: -44.306815, accuracy: 3.2, address: 'Subsolo Obra Hospitalar' },
      capturedAt: '2026-10-29T10:15:30.000Z',
    },
    {
      uri: 'file:///storage/dcim/eletrica_ala_oeste.jpg',
      caption: 'Passagem e fixação de leitos para infraestrutura elétrica',
      gps: { latitude: -2.530845, longitude: -44.306920, accuracy: 4.1, address: 'Ala Oeste Pavimento 1' },
      capturedAt: '2026-10-29T11:45:12.000Z',
    },
    {
      uri: 'file:///storage/dcim/alvenaria_uti.jpg',
      caption: 'Elevação de alvenaria com amarração de tela eletrosoldada',
      gps: { latitude: -2.530698, longitude: -44.306780, accuracy: 3.5, address: 'Pavimento 2 UTI' },
      capturedAt: '2026-10-29T14:30:45.000Z',
    },
  ];

  // 3. Camera Engine burns security watermark overlay on each photo
  const watermarkedPhotos = captures.map((c, idx) =>
    applySecurityWatermark({
      rawPhotoUri: c.uri,
      work,
      author: worker,
      gps: c.gps,
      caption: c.caption,
      rdoNumber: 55,
      capturedAt: c.capturedAt,
    })
  );

  // Verify visual overlay structure on all photos
  for (const p of watermarkedPhotos) {
    assert.strictEqual(p.overlay.position, 'bottom');
    assert.strictEqual(p.overlay.backgroundColor, 'rgba(0, 0, 0, 0.75)');
    assert.strictEqual(p.overlay.textColor, '#FFFFFF');
    assert.strictEqual(p.overlay.accentColor, '#FFD700');
    assert.strictEqual(p.overlay.lines.length, 4);

    assert.ok(p.watermarkText.includes('OBRA: Hospital Geral Regional'));
    assert.ok(p.watermarkText.includes('CÓD: OB-202'));
    assert.ok(p.watermarkText.includes('Eng. Tharles Resident'));
    assert.ok(p.watermarkText.includes('Lat -2.530'));
    assert.ok(p.watermarkText.includes('Long -44.306'));
    assert.ok(p.metadata.hash.startsWith('SL-'));
  }

  // 4. Photos are uploaded via multipart endpoint POST /api/v1/photos/upload
  const uploadedPhotoIds = [];
  for (const wp of watermarkedPhotos) {
    const uploadRes = await api.uploadPhoto({
      photo: 'mock-binary-data',
      caption: wp.caption,
      workId: work.id,
      takenAt: wp.takenAt,
      latitude: wp.metadata.latitude,
      longitude: wp.metadata.longitude,
      accuracy: wp.metadata.accuracy,
      watermarkText: wp.watermarkText,
      authorName: worker.name,
      authorId: worker.id,
      rdoNumber: 55,
      hash: wp.metadata.hash,
    });
    assert.strictEqual(uploadRes.status, 201);
    uploadedPhotoIds.push(uploadRes.data.id);
  }

  // 5. Worker submits RDO with linked photo IDs
  const rdoDraft = createValidRDO({
    workId: work.id,
    workName: work.name,
    number: 55,
    authorId: worker.id,
    authorName: worker.name,
    activities,
  });

  const submitRes = await api.submitRDO({
    ...rdoDraft,
    photoIds: uploadedPhotoIds,
  });
  assert.strictEqual(submitRes.status, 201);
  const rdoId = submitRes.data.id;

  // 6. Master inspects photos in /rdo-review modal
  const getRes = await api.getRDO(rdoId);
  assert.strictEqual(getRes.status, 200);
  const reviewedRdo = getRes.data;

  assert.strictEqual(reviewedRdo.photos.length, 3);
  for (let i = 0; i < reviewedRdo.photos.length; i++) {
    const photo = reviewedRdo.photos[i];
    assert.strictEqual(photo.caption, captures[i].caption);
    assert.ok(photo.uri.startsWith('/uploads/photos/'));

    // Master Watermark Inspection Engine
    const inspection = verifyPhotoWatermark(photo, reviewedRdo);
    assert.strictEqual(inspection.verified, true);
    assert.strictEqual(inspection.anomalies.length, 0);
  }
});
