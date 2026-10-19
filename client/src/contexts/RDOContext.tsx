import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import type { AuditLogEntry, RDO, RDOSectionKey, User } from '@/types';
import { MOCK_RDOS } from '@/mocks';
import * as workflow from '@/services/modules/rdoWorkflow';

/**
 * 📄 RDOContext — estado em memória dos RDOs + trilha de auditoria.
 * As regras de negócio vivem em `services/modules/rdoWorkflow` (puras);
 * este contexto apenas aplica as transições. Trocar por API/offline-store no futuro.
 */
interface RDOContextData {
  rdos: RDO[];
  auditLogs: AuditLogEntry[];
  getRdo: (id: string) => RDO | undefined;
  getAuditTrail: (rdoId: string) => AuditLogEntry[];
  submitRdo: (id: string, actor: User) => RDO;
  returnRdo: (id: string, actor: User, reason: string) => void;
  approveRdo: (id: string, actor: User) => RDO;
  addComment: (id: string, actor: User, section: RDOSectionKey, text: string) => void;
  auditedEdit: (id: string, actor: User, params: Parameters<typeof workflow.auditedEdit>[2]) => void;
  rectifyRdo: (id: string, actor: User, reason: string) => RDO;
}

const RDOContext = createContext<RDOContextData>({} as RDOContextData);

/** Device/IP — MOCK. Em produção usar expo-device / expo-application e IP vindo do backend. */
const getDeviceInfo = () => ({ ip: '177.12.40.8', deviceId: 'device-mock-001' });

export const RDOProvider = ({ children }: { children: ReactNode }) => {
  const [rdos, setRdos] = useState<RDO[]>(MOCK_RDOS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const getRdo = useCallback((id: string) => rdos.find((r) => r.id === id), [rdos]);

  const getAuditTrail = useCallback(
    (rdoId: string) => {
      const base = rdoId.split('-v')[0];
      return auditLogs
        .filter((l) => l.rdoId === rdoId || l.rdoId.split('-v')[0] === base)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    },
    [auditLogs],
  );

  /** Executa a transição pura, substitui o RDO e registra o log (append-only). */
  const commit = useCallback(
    (id: string, fn: (rdo: RDO) => workflow.TransitionResult): RDO => {
      const current = rdos.find((r) => r.id === id);
      if (!current) throw new workflow.WorkflowError('RDO não encontrado.');
      const { rdo, log } = fn(current);
      setRdos((prev) => prev.map((r) => (r.id === id ? rdo : r)));
      setAuditLogs((prev) => [...prev, log]);
      return rdo;
    },
    [rdos],
  );

  const value = useMemo<RDOContextData>(
    () => ({
      rdos,
      auditLogs,
      getRdo,
      getAuditTrail,
      submitRdo: (id, actor) => commit(id, (r) => workflow.submitRdo(r, actor)),
      returnRdo: (id, actor, reason) => {
        commit(id, (r) => workflow.returnRdo(r, actor, reason));
      },
      approveRdo: (id, actor) => commit(id, (r) => workflow.approveRdo(r, actor, getDeviceInfo())),
      addComment: (id, actor, section, text) => {
        commit(id, (r) => workflow.addComment(r, actor, section, text));
      },
      auditedEdit: (id, actor, params) => {
        commit(id, (r) => workflow.auditedEdit(r, actor, params));
      },
      rectifyRdo: (id, actor, reason) => {
        const current = rdos.find((r) => r.id === id);
        if (!current) throw new workflow.WorkflowError('RDO não encontrado.');
        const { newVersion, rdos: nextRdos, log } = workflow.rectifyRdo(current, actor, reason, rdos);
        setRdos(nextRdos);
        setAuditLogs((prev) => [...prev, log]);
        return newVersion;
      },
    }),
    [rdos, auditLogs, getRdo, getAuditTrail, commit],
  );

  return <RDOContext.Provider value={value}>{children}</RDOContext.Provider>;
};

export const useRDOs = () => {
  const context = useContext(RDOContext);
  if (!context) throw new Error('useRDOs must be used within an RDOProvider');
  return context;
};
