/**
 * Offline Persistence and Synchronization Queue Simulation
 * Emulates React Native AsyncStorage and offline queue behavior.
 */

import { generateId } from './contracts.mjs';

export class OfflineStore {
  constructor() {
    this.storage = new Map();
    this.syncQueue = [];
    this.online = true;
  }

  setOnline(status) {
    this.online = Boolean(status);
  }

  isOnline() {
    return this.online;
  }

  async saveDraft(rdo) {
    if (!rdo || !rdo.id) {
      throw new Error('RDO inválido para gravação de rascunho.');
    }
    const copy = JSON.parse(JSON.stringify(rdo));
    this.storage.set(`rdo_draft_${rdo.id}`, copy);
    return copy;
  }

  async getDraft(rdoId) {
    const raw = this.storage.get(`rdo_draft_${rdoId}`);
    return raw ? JSON.parse(JSON.stringify(raw)) : null;
  }

  async listDrafts() {
    const drafts = [];
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('rdo_draft_')) {
        drafts.push(JSON.parse(JSON.stringify(value)));
      }
    }
    return drafts;
  }

  async removeDraft(rdoId) {
    return this.storage.delete(`rdo_draft_${rdoId}`);
  }

  async clear() {
    this.storage.clear();
    this.syncQueue = [];
    this.online = true;
  }

  async enqueueSync(action, payload) {
    const item = {
      queueId: generateId('sync'),
      action, // 'SUBMIT_RDO' | 'UPLOAD_PHOTO'
      payload: JSON.parse(JSON.stringify(payload)),
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    this.syncQueue.push(item);
    return item;
  }

  getSyncQueue() {
    return [...this.syncQueue];
  }

  async processSyncQueue(apiClient) {
    if (!this.online) {
      return { syncedCount: 0, remainingCount: this.syncQueue.length, error: 'Dispositivo desconectado' };
    }

    const results = [];
    const remaining = [];

    for (const item of this.syncQueue) {
      try {
        if (item.action === 'UPLOAD_PHOTO') {
          const res = await apiClient.uploadPhoto(item.payload);
          results.push({ item, res, status: 'success' });
        } else if (item.action === 'SUBMIT_RDO') {
          const res = await apiClient.submitRDO(item.payload);
          results.push({ item, res, status: 'success' });
        }
      } catch (err) {
        item.attempts += 1;
        item.lastError = err.message;
        remaining.push(item);
      }
    }

    this.syncQueue = remaining;
    return {
      syncedCount: results.length,
      remainingCount: this.syncQueue.length,
      results,
    };
  }
}
