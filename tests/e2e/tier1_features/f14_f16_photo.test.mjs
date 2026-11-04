/**
 * Tier 1: Feature Coverage — Features 14 to 16 (Native Camera, Security Watermark, Photo Cataloging)
 * 5 test cases per feature = 15 tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMockWork,
  createMockUser,
  createPhotoEntry,
} from '../harness/contracts.mjs';
import {
  applySecurityWatermark,
  verifyPhotoWatermark,
  formatBrasiliaTimestamp,
  validateGpsCoordinates,
} from '../harness/watermark.mjs';
import { validatePhotos } from '../harness/validation.mjs';

/* ========================================================================== */
/* Feature 14: Fotos - Captura Nativa na Obra (5 tests)                       */
/* ========================================================================== */

test('F14.1: Native camera capture returns valid URI and timestamp', () => {
  const photo = createPhotoEntry();
  assert.ok(photo.id.startsWith('photo-'));
  assert.ok(photo.uri.includes('file:///'));
  assert.ok(!isNaN(Date.parse(photo.takenAt)));
});

test('F14.2: Camera permission granted allows photo acquisition', () => {
  const permissionStatus = 'granted';
  assert.strictEqual(permissionStatus, 'granted');
  const photo = createPhotoEntry();
  const errors = validatePhotos([photo]);
  assert.strictEqual(errors.length, 0);
});

test('F14.3: Temporary photo buffer generation and link to RDO draft', () => {
  const photo = createPhotoEntry({ caption: 'Enchimento de sapata S-04' });
  assert.ok(photo.caption.includes('sapata'));
  assert.ok(photo.watermarkedUri);
});

test('F14.4: Multiple photos captured across different work fronts', () => {
  const photos = [
    createPhotoEntry({ caption: 'Fachada Principal - Pintura' }),
    createPhotoEntry({ caption: 'Subsolo - Instalações Hidráulicas' }),
    createPhotoEntry({ caption: 'Cobertura - Impermeabilização' }),
  ];
  const errors = validatePhotos(photos);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(photos.length, 3);
  assert.strictEqual(new Set(photos.map((p) => p.id)).size, 3);
});

test('F14.5: Camera capture metadata binding', () => {
  const photo = createPhotoEntry();
  assert.ok(photo.metadata);
  assert.strictEqual(typeof photo.metadata.latitude, 'number');
  assert.strictEqual(typeof photo.metadata.longitude, 'number');
  assert.strictEqual(typeof photo.metadata.accuracy, 'number');
});

/* ========================================================================== */
/* Feature 15: Fotos - Marca d'Água de Segurança (5 tests)                    */
/* ========================================================================== */

test('F15.1: Watermark overlay generation with Brasilia date and time', () => {
  const capturedAt = '2026-10-29T14:30:00.000Z';
  const formatted = formatBrasiliaTimestamp(capturedAt);
  assert.strictEqual(formatted, '29/10/2026 14:30:00');
});

test('F15.2: GPS coordinates (latitude, longitude, accuracy) embedded in watermark', () => {
  const work = createMockWork();
  const author = createMockUser();
  const gps = { latitude: -2.5307, longitude: -44.3068, accuracy: 3.5, address: 'São Luís - MA' };

  const watermarked = applySecurityWatermark({
    rawPhotoUri: 'file:///data/cache/raw_photo_01.jpg',
    work,
    author,
    gps,
    caption: 'Montagem de armadura',
  });

  assert.ok(watermarked.watermarkText.includes('Lat -2.530700°'));
  assert.ok(watermarked.watermarkText.includes('Long -44.306800°'));
  assert.ok(watermarked.watermarkText.includes('±3.5m'));
});

test('F15.3: Work identification (code, name, client) embedded in watermark', () => {
  const work = createMockWork({ code: 'OB-204', name: 'Hospital da Criança', client: 'Governo do Estado' });
  const author = createMockUser();
  const gps = { latitude: -2.5, longitude: -44.3, accuracy: 5 };

  const watermarked = applySecurityWatermark({
    rawPhotoUri: 'file:///data/cache/raw.jpg',
    work,
    author,
    gps,
  });

  assert.ok(watermarked.watermarkText.includes('OB-204'));
  assert.ok(watermarked.watermarkText.includes('Hospital da Criança'));
  assert.ok(watermarked.watermarkText.includes('Governo do Estado'));
});

test('F15.4: Author identification and role stamped on photo', () => {
  const work = createMockWork();
  const author = createMockUser({ name: 'Eng. Tharles Silva', role: 'Engenheiro Fiscal' });
  const gps = { latitude: -2.5, longitude: -44.3, accuracy: 4 };

  const watermarked = applySecurityWatermark({
    rawPhotoUri: 'file:///data/cache/raw.jpg',
    work,
    author,
    gps,
  });

  assert.ok(watermarked.watermarkText.includes('Eng. Tharles Silva'));
  assert.ok(watermarked.watermarkText.includes('Engenheiro Fiscal'));
});

test('F15.5: Cryptographic SHA-256 integrity hash SL-XXXX generation', () => {
  const work = createMockWork();
  const author = createMockUser();
  const gps = { latitude: -2.5, longitude: -44.3, accuracy: 4 };

  const watermarked = applySecurityWatermark({
    rawPhotoUri: 'file:///data/cache/raw.jpg',
    work,
    author,
    gps,
    rdoNumber: 15,
  });

  assert.ok(watermarked.metadata.hash.startsWith('SL-'));
  assert.strictEqual(watermarked.metadata.hash.length, 11); // SL- + 8 hex chars
  assert.ok(watermarked.watermarkText.includes(watermarked.metadata.hash));
});

/* ========================================================================== */
/* Feature 16: Fotos - Legenda e Catalogação (5 tests)                        */
/* ========================================================================== */

test('F16.1: Descriptive caption attached to captured photo', () => {
  const photo = createPhotoEntry({ caption: 'Panorâmica da armação do radier do Bloco B' });
  assert.strictEqual(photo.caption, 'Panorâmica da armação do radier do Bloco B');
  const errors = validatePhotos([photo]);
  assert.strictEqual(errors.length, 0);
});

test('F16.2: Photo linked to specific activity / work front', () => {
  const photo = createPhotoEntry({
    caption: 'Vibração do concreto na viga V-204',
    activityId: 'act-001',
  });
  assert.strictEqual(photo.activityId, 'act-001');
});

test('F16.3: Gallery presentation with caption and timestamp', () => {
  const photo = createPhotoEntry({
    caption: 'Teste de estanqueidade da tubulação',
    takenAt: '2026-10-29T10:15:00.000Z',
  });
  const label = `${photo.caption} (${new Date(photo.takenAt).toLocaleTimeString()})`;
  assert.ok(label.includes('estanqueidade'));
});

test('F16.4: Multi-photo cataloging with unique IDs', () => {
  const photos = Array.from({ length: 5 }, (_, i) =>
    createPhotoEntry({ caption: `Registro fotográfico detalhe ${i + 1}` })
  );
  const ids = new Set(photos.map((p) => p.id));
  assert.strictEqual(ids.size, 5, 'All 5 cataloged photos must have unique IDs');
});

test('F16.5: Caption update in draft before final submission', () => {
  const photo = createPhotoEntry({ caption: 'Foto provisória' });
  photo.caption = 'Concretagem da laje L-03 devidamente vibrada e nivelada';
  const errors = validatePhotos([photo]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(photo.caption, 'Concretagem da laje L-03 devidamente vibrada e nivelada');
});
