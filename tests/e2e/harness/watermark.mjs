/**
 * Security Watermark Engine for StackLab RDO Native Photos
 * Strictly implements Section 5 of Spec Miner Survey & ORIGINAL_REQUEST R2, R3.
 */

import crypto from 'node:crypto';
import { generateId } from './contracts.mjs';

export class WatermarkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WatermarkError';
  }
}

/** Formats date into Brasília standard DD/MM/YYYY HH:mm:ss */
export const formatBrasiliaTimestamp = (dateInput) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new WatermarkError(`Data/hora inválida para marca d'água: ${dateInput}`);
  }
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getUTCDate());
  const month = pad(d.getUTCMonth() + 1);
  const year = d.getUTCFullYear();
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/** Validates geographic GPS coordinates */
export const validateGpsCoordinates = (coords) => {
  if (!coords) {
    throw new WatermarkError('Coordenadas de GPS ausentes para marca d\'água de segurança.');
  }
  const lat = Number(coords.latitude);
  const lng = Number(coords.longitude);
  const acc = Number(coords.accuracy);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new WatermarkError(`Latitude GPS inválida: ${coords.latitude}. Deve estar entre -90 e +90.`);
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    throw new WatermarkError(`Longitude GPS inválida: ${coords.longitude}. Deve estar entre -180 e +180.`);
  }
  if (isNaN(acc) || acc <= 0) {
    throw new WatermarkError(`Precisão GPS inválida: ${coords.accuracy}. Deve ser um valor positivo.`);
  }

  return { latitude: lat, longitude: lng, accuracy: acc, address: coords.address || 'Localização da Obra' };
};

/** Generates SHA-256 integrity hash for the photo stamp */
export const generatePhotoHash = (payload) => {
  const str = `${payload.workId}|${payload.authorId}|${payload.capturedAt}|${payload.latitude}|${payload.longitude}|${payload.rdoNumber || 0}`;
  const sha = crypto.createHash('sha256').update(str).digest('hex').toUpperCase();
  return `SL-${sha.slice(0, 8)}`;
};

/**
 * Builds the high-contrast 4-line security watermark overlay text
 */
export const composeWatermarkText = ({ work, author, coords, timestamp, rdoNumber, hash }) => {
  const line1 = `🏗️ OBRA: ${work.name} • CÓD: ${work.code || 'OB-000'} • CLIENTE: ${work.client || 'Particular'}`;
  const line2 = `📅 ${timestamp} (Horário de Brasília) • 👷 RESPONSÁVEL: ${author.name} (${author.role || 'Operário'})`;
  const line3 = `📍 GPS: Lat ${coords.latitude.toFixed(6)}°, Long ${coords.longitude.toFixed(6)}° (Precisão: ±${coords.accuracy.toFixed(1)}m) • ${coords.address}`;
  const line4 = `🔒 SEGURANÇA: RDO #${rdoNumber} • HASH: ${hash}`;

  return [line1, line2, line3, line4].join('\n');
};

/**
 * Applies security watermark to an in-app photo capture
 */
export const applySecurityWatermark = ({
  rawPhotoUri,
  work,
  author,
  gps,
  caption = '',
  rdoNumber = 1,
  capturedAt = new Date().toISOString(),
}) => {
  if (!rawPhotoUri) {
    throw new WatermarkError('URI da foto capturada é obrigatória.');
  }
  if (!work || !work.id || !work.name) {
    throw new WatermarkError('Dados da obra são obrigatórios para gravação da marca d\'água.');
  }
  if (!author || !author.id || !author.name) {
    throw new WatermarkError('Identificação do autor/operário é obrigatória para marca d\'água.');
  }

  const validatedGps = validateGpsCoordinates(gps);
  const formattedTime = formatBrasiliaTimestamp(capturedAt);

  const hash = generatePhotoHash({
    workId: work.id,
    authorId: author.id,
    capturedAt,
    latitude: validatedGps.latitude,
    longitude: validatedGps.longitude,
    rdoNumber,
  });

  const watermarkText = composeWatermarkText({
    work,
    author,
    coords: validatedGps,
    timestamp: formattedTime,
    rdoNumber,
    hash,
  });

  const photoId = generateId('photo');
  const watermarkedUri = rawPhotoUri.replace(/\.([^.]+)$/, `_watermarked_${hash}.$1`);

  const metadata = {
    latitude: validatedGps.latitude,
    longitude: validatedGps.longitude,
    accuracy: validatedGps.accuracy,
    address: validatedGps.address,
    capturedAt,
    formattedBrasiliaTime: formattedTime,
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role,
    workId: work.id,
    workName: work.name,
    workCode: work.code,
    rdoNumber,
    hash,
  };

  return {
    id: photoId,
    caption: caption.trim(),
    rawUri: rawPhotoUri,
    watermarkedUri,
    uri: watermarkedUri,
    watermarkText,
    takenAt: capturedAt,
    author: author.name,
    authorId: author.id,
    metadata,
    // Overlay visual properties for high-contrast inspection
    overlay: {
      position: 'bottom',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      heightRatio: 0.15,
      textColor: '#FFFFFF',
      accentColor: '#FFD700',
      lines: watermarkText.split('\n'),
    },
  };
};

/**
 * Master Verification & Inspection Engine for Security Watermarks
 */
export const verifyPhotoWatermark = (photo, rdo) => {
  const anomalies = [];

  if (!photo) {
    return { verified: false, anomalies: ['Foto nula ou indefinida.'] };
  }

  if (!photo.watermarkedUri && !photo.watermarkText) {
    anomalies.push('Foto sem marca d\'água de segurança aplicada.');
  }

  if (!photo.metadata) {
    anomalies.push('Metadados estruturados de segurança ausentes.');
    return { verified: false, anomalies };
  }

  const { metadata } = photo;

  // Verify GPS bounds
  if (metadata.latitude === undefined || metadata.latitude < -90 || metadata.latitude > 90) {
    anomalies.push(`Coordenada de latitude inválida: ${metadata.latitude}`);
  }
  if (metadata.longitude === undefined || metadata.longitude < -180 || metadata.longitude > 180) {
    anomalies.push(`Coordenada de longitude inválida: ${metadata.longitude}`);
  }
  if (metadata.accuracy === undefined || metadata.accuracy <= 0) {
    anomalies.push(`Precisão GPS inválida: ${metadata.accuracy}`);
  }

  // Cross-reference with RDO if provided
  if (rdo) {
    if (metadata.workId && rdo.workId && metadata.workId !== rdo.workId) {
      anomalies.push(`Obra da foto (${metadata.workId}) diverge da obra do RDO (${rdo.workId}).`);
    }
    if (rdo.number && metadata.rdoNumber && metadata.rdoNumber !== rdo.number) {
      anomalies.push(`Número de RDO na foto (${metadata.rdoNumber}) diverge do documento (${rdo.number}).`);
    }
  }

  // Re-verify hash integrity
  const expectedHash = generatePhotoHash({
    workId: metadata.workId,
    authorId: metadata.authorId,
    capturedAt: metadata.capturedAt,
    latitude: metadata.latitude,
    longitude: metadata.longitude,
    rdoNumber: metadata.rdoNumber,
  });

  if (metadata.hash !== expectedHash) {
    anomalies.push(`Hash criptográfico corrompido: encontrado ${metadata.hash}, esperado ${expectedHash}.`);
  }

  return {
    verified: anomalies.length === 0,
    anomalies,
    metadata,
  };
};
