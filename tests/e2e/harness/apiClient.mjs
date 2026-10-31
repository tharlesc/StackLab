/**
 * Server REST API Client Simulation for StackLab E2E Suite
 * Strictly adheres to Interface Contracts in PROJECT.md and TEST_INFRA.md.
 */

import { generateId, RDO_STATUS } from './contracts.mjs';
import { validatePreSubmission } from './validation.mjs';

export class ApiError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class MockServerApi {
  constructor() {
    this.photos = new Map();
    this.rdos = new Map();
    this.auditLogs = [];
    this.rdoSequence = 100;
  }

  reset() {
    this.photos.clear();
    this.rdos.clear();
    this.auditLogs = [];
    this.rdoSequence = 100;
  }

  /**
   * Endpoint: POST /api/v1/photos/upload
   * Interface Contract (PROJECT.md §Interface Contracts)
   */
  async uploadPhoto(data) {
    const {
      photo,
      caption,
      workId,
      takenAt,
      latitude,
      longitude,
      accuracy,
      watermarkText,
      rdoId,
      authorName,
      authorId,
      rdoNumber,
      hash,
    } = data;

    if (!photo) {
      throw new ApiError('Arquivo de foto ausente.', 400);
    }
    if (!workId) {
      throw new ApiError('workId é obrigatório.', 400);
    }
    if (latitude === undefined || latitude < -90 || latitude > 90) {
      throw new ApiError(`Latitude inválida: ${latitude}`, 400);
    }
    if (longitude === undefined || longitude < -180 || longitude > 180) {
      throw new ApiError(`Longitude inválida: ${longitude}`, 400);
    }
    if (accuracy === undefined || accuracy <= 0) {
      throw new ApiError(`Precisão GPS inválida: ${accuracy}`, 400);
    }
    if (!watermarkText || typeof watermarkText !== 'string' || watermarkText.trim() === '') {
      throw new ApiError('watermarkText é obrigatório para comprovação de presença.', 400);
    }

    const photoId = generateId('photo-uuid');
    const photoRecord = {
      id: photoId,
      caption: caption || '',
      fileUrl: `/uploads/photos/${photoId}.jpg`,
      takenAt: takenAt || new Date().toISOString(),
      authorName: authorName || 'Operário Responsável',
      authorId: authorId || 'usr-001',
      workId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracy: Number(accuracy),
      watermarkText,
      rdoNumber: rdoNumber || 1,
      hash: hash || '',
      rdoId: rdoId || null,
      createdAt: new Date().toISOString(),
    };

    this.photos.set(photoId, photoRecord);
    return { status: 201, data: photoRecord };
  }

  /**
   * Endpoint: POST /api/v1/rdos
   * Interface Contract (PROJECT.md §Interface Contracts)
   */
  async submitRDO(payload) {
    const {
      workId,
      date,
      weather = [],
      labor = [],
      equipment = [],
      activities = [],
      materials = [],
      occurrences = [],
      photoIds = [],
      authorId = 'usr-001',
      authorName = 'Eng. Responsável',
      workName = 'Obra Cadastrada',
      workCode = 'OB-101',
    } = payload;

    const rdoDraft = {
      workId,
      workName,
      workCode,
      date,
      authorId,
      authorName,
      weather,
      labor,
      equipment,
      activities,
      materials,
      occurrences,
      photos: photoIds.map((id) => this.photos.get(id) || { id, caption: 'Foto Anexa', takenAt: new Date().toISOString() }),
    };

    // Pre-submission domain validation
    const validation = validatePreSubmission(rdoDraft);
    if (!validation.valid) {
      throw new ApiError(
        `Falha na validação do RDO: ${validation.errors.join('; ')}`,
        422,
        validation.errors,
      );
    }

    const rdoNumber = payload.number || (++this.rdoSequence);
    const rdoId = generateId('rdo-uuid');

    // Attach full photo objects with public URLs
    const attachedPhotos = photoIds.map((pid) => {
      const p = this.photos.get(pid);
      if (p) {
        p.rdoId = rdoId;
        return {
          id: p.id,
          caption: p.caption,
          uri: p.fileUrl,
          watermarkedUri: p.fileUrl,
          watermarkText: p.watermarkText,
          takenAt: p.takenAt,
          author: p.authorName,
          metadata: {
            workId: p.workId,
            authorId: p.authorId,
            authorName: p.authorName,
            capturedAt: p.takenAt,
            latitude: p.latitude,
            longitude: p.longitude,
            accuracy: p.accuracy,
            watermarkText: p.watermarkText,
            rdoNumber: p.rdoNumber || rdoNumber,
            hash: p.hash,
          },
        };
      }
      return { id: pid, caption: '', takenAt: new Date().toISOString(), author: authorName };
    });

    const newRdo = {
      id: rdoId,
      number: rdoNumber,
      version: 1,
      workId,
      workName,
      workCode,
      date,
      authorId,
      authorName,
      status: RDO_STATUS.SUBMETIDO,
      submittedAt: new Date().toISOString(),
      weather,
      labor,
      equipment,
      activities,
      materials,
      occurrences,
      photos: attachedPhotos,
      comments: [],
      signature: null,
      locked: false,
    };

    this.rdos.set(rdoId, newRdo);
    return { status: 201, data: newRdo };
  }

  /**
   * Endpoint: GET /api/v1/rdos/:id
   * Interface Contract (PROJECT.md §Interface Contracts)
   */
  async getRDO(id) {
    const rdo = this.rdos.get(id);
    if (!rdo) {
      throw new ApiError(`RDO com ID "${id}" não encontrado.`, 404);
    }
    return { status: 200, data: JSON.parse(JSON.stringify(rdo)) };
  }
}
