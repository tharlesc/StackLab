/**
 * Tier 2: Boundary & Corner Cases — Features 14 to 16 (Photos, GPS Watermark, Cataloging)
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
  validateGpsCoordinates,
  WatermarkError,
} from '../harness/watermark.mjs';
import { validatePhotos } from '../harness/validation.mjs';

/* ========================================================================== */
/* Feature 14 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B14.1: Missing rawPhotoUri throws WatermarkError', () => {
  const work = createMockWork();
  const author = createMockUser();
  const gps = { latitude: -2.5, longitude: -44.3, accuracy: 5 };

  assert.throws(
    () => applySecurityWatermark({ rawPhotoUri: '', work, author, gps }),
    /URI da foto capturada é obrigatória/
  );
});

test('B14.2: Photo entry with empty caption rejects', () => {
  const photo = createPhotoEntry({ caption: '   ' });
  const errors = validatePhotos([photo]);
  assert.ok(errors.some((e) => e.includes('Legenda da foto')));
});

test('B14.3: Photo entry with invalid takenAt timestamp rejects', () => {
  const photo = createPhotoEntry({ takenAt: 'data-invalida' });
  const errors = validatePhotos([photo]);
  assert.ok(errors.some((e) => e.includes('Data/hora da captura')));
});

test('B14.4: Maximum photo attachment limit (e.g. 50 photos in a single RDO)', () => {
  const photos = Array.from({ length: 50 }, (_, i) =>
    createPhotoEntry({ caption: `Foto de inspeção ${i + 1}` })
  );
  const errors = validatePhotos(photos);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(photos.length, 50);
});

test('B14.5: Photo capture missing work parameter throws WatermarkError', () => {
  const author = createMockUser();
  const gps = { latitude: -2.5, longitude: -44.3, accuracy: 5 };

  assert.throws(
    () => applySecurityWatermark({ rawPhotoUri: 'file:///photo.jpg', work: null, author, gps }),
    /Dados da obra são obrigatórios/
  );
});

/* ========================================================================== */
/* Feature 15 Boundaries: GPS & Security Watermark (5 tests)                  */
/* ========================================================================== */

test('B15.1: Latitude > 90 (e.g. 91.5) rejects with WatermarkError', () => {
  assert.throws(
    () => validateGpsCoordinates({ latitude: 91.5, longitude: -44.3, accuracy: 5 }),
    /Latitude GPS inválida: 91.5/
  );
});

test('B15.2: Latitude < -90 (e.g. -95.0) rejects with WatermarkError', () => {
  assert.throws(
    () => validateGpsCoordinates({ latitude: -95.0, longitude: -44.3, accuracy: 5 }),
    /Latitude GPS inválida: -95/
  );
});

test('B15.3: Longitude > 180 (e.g. 185.0) rejects with WatermarkError', () => {
  assert.throws(
    () => validateGpsCoordinates({ latitude: -2.5, longitude: 185.0, accuracy: 5 }),
    /Longitude GPS inválida: 185/
  );
});

test('B15.4: Longitude < -180 (e.g. -190.0) rejects with WatermarkError', () => {
  assert.throws(
    () => validateGpsCoordinates({ latitude: -2.5, longitude: -190.0, accuracy: 5 }),
    /Longitude GPS inválida: -190/
  );
});

test('B15.5: GPS accuracy <= 0 (e.g. 0 or -5) rejects with WatermarkError', () => {
  assert.throws(
    () => validateGpsCoordinates({ latitude: -2.5, longitude: -44.3, accuracy: 0 }),
    /Precisão GPS inválida: 0/
  );
  assert.throws(
    () => validateGpsCoordinates({ latitude: -2.5, longitude: -44.3, accuracy: -4 }),
    /Precisão GPS inválida: -4/
  );
});

/* ========================================================================== */
/* Feature 16 Boundaries (5 tests)                                            */
/* ========================================================================== */

test('B16.1: Extremely long photo caption (1000 chars) handled cleanly', () => {
  const longCaption = 'Vistoria detalhada de fissura capilar na viga V-12. '.repeat(20);
  const photo = createPhotoEntry({ caption: longCaption });
  const errors = validatePhotos([photo]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(photo.caption, longCaption);
});

test('B16.2: Caption with special symbols and emojis preserves fidelity', () => {
  const caption = '🏗️ Vistoria de concretagem: FCK ≥ 30 MPa & Armadura CA-50 #12.5mm @ 15cm [100% OK]';
  const photo = createPhotoEntry({ caption });
  const errors = validatePhotos([photo]);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(photo.caption, caption);
});

test('B16.3: Missing author in photo capture throws WatermarkError', () => {
  const work = createMockWork();
  const gps = { latitude: -2.5, longitude: -44.3, accuracy: 5 };

  assert.throws(
    () => applySecurityWatermark({ rawPhotoUri: 'file:///photo.jpg', work, author: null, gps }),
    /Identificação do autor\/operário é obrigatória/
  );
});

test('B16.4: Null GPS coordinates object throws WatermarkError', () => {
  assert.throws(
    () => validateGpsCoordinates(null),
    /Coordenadas de GPS ausentes/
  );
});

test('B16.5: NaN GPS coordinates reject with WatermarkError', () => {
  assert.throws(
    () => validateGpsCoordinates({ latitude: 'norte', longitude: -44.3, accuracy: 5 }),
    /Latitude GPS inválida/
  );
});
