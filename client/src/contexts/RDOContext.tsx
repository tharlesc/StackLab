import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ActiveWork, AuditLogEntry, RDO, RDOSectionKey, User } from '@/types';
import * as workflow from '@/services/modules/rdoWorkflow';
import { supabase, isSupabaseConfigured, supabaseDataService } from '@/services';
import { MOCK_ACTIVE_WORKS, MOCK_RDOS } from '@/mocks';

/**
 * 📄 RDOContext — estado dos RDOs e Obras (integrado ao Supabase com fallback local).
 */
interface RDOContextData {
  rdos: RDO[];
  works: ActiveWork[];
  loading: boolean;
  auditLogs: AuditLogEntry[];
  refreshData: () => Promise<void>;
  getRdo: (id: string, workId?: string) => RDO | undefined;
  getAuditTrail: (rdoId: string) => AuditLogEntry[];
  submitRdo: (id: string, actor: User) => RDO;
  returnRdo: (id: string, actor: User, reason: string) => void;
  approveRdo: (id: string, actor: User) => RDO;
  addComment: (id: string, actor: User, section: RDOSectionKey, text: string) => void;
  auditedEdit: (id: string, actor: User, params: Parameters<typeof workflow.auditedEdit>[2]) => void;
  rectifyRdo: (id: string, actor: User, reason: string) => RDO;

  // Operações de Ciclo de Vida de Rascunho (Milestone 1)
  createDraft: (params: workflow.CreateDraftParams) => RDO;
  saveDraft: (workId: string, draft: Partial<RDO>) => Promise<void>;
  loadDraft: (workId: string) => Promise<Partial<RDO> | null>;
  discardDraft: (workId: string) => Promise<void>;
  submitDraft: (draft: RDO, actor: User) => Promise<RDO>;
}

const RDOContext = createContext<RDOContextData>({} as RDOContextData);

/** Device/IP — MOCK. Em produção usar expo-device / expo-application e IP vindo do backend. */
const getDeviceInfo = () => ({ ip: '177.12.40.8', deviceId: 'device-mock-001' });

export interface RDOProviderProps {
  children: ReactNode;
  initialWorks?: ActiveWork[];
  initialRdos?: RDO[];
}

export const RDOProvider = ({
  children,
  initialWorks = MOCK_ACTIVE_WORKS,
  initialRdos = MOCK_RDOS,
}: RDOProviderProps) => {
  const [rdos, setRdos] = useState<RDO[]>(isSupabaseConfigured ? [] : initialRdos);
  const [works, setWorks] = useState<ActiveWork[]>(isSupabaseConfigured ? [] : initialWorks);
  const [loading, setLoading] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Carrega Obras e RDOs reais do Supabase
  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    try {
      const [fetchedWorks, fetchedRdos] = await Promise.all([
        supabaseDataService.fetchObrasFromSupabase(),
        supabaseDataService.fetchRdosFromSupabase(),
      ]);

      if (fetchedWorks) {
        setWorks(fetchedWorks);
      }
      if (fetchedRdos) {
        setRdos(fetchedRdos);
      }
    } catch (err) {
      console.warn('Erro ao sincronizar dados com o Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    if (!isSupabaseConfigured) return;

    // Escuta atualizações em tempo real no Supabase
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rdos' },
        () => {
          refreshData();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'obras' },
        () => {
          refreshData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  const getRdo = useCallback(
    (id: string, workId?: string) => {
      if (!id) return undefined;
      const cleanId = String(id).trim();

      // 1. Busca exata por ID
      const exact =
        rdos.find((r) => r.id === cleanId && (!workId || r.workId === workId)) ||
        rdos.find((r) => r.id === cleanId);
      if (exact) return exact;

      // 2. Busca com prefixo ou padding de ID (ex: 'rdo-004' vs '4' ou '004')
      const prefixed =
        rdos.find(
          (r) =>
            (!workId || r.workId === workId) &&
            (r.id === `rdo-${cleanId}` ||
              r.id === `rdo-${String(cleanId).padStart(3, '0')}` ||
              cleanId === `rdo-${r.id}` ||
              cleanId === `rdo-${String(r.id).padStart(3, '0')}`),
        ) ||
        rdos.find(
          (r) =>
            r.id === `rdo-${cleanId}` ||
            r.id === `rdo-${String(cleanId).padStart(3, '0')}` ||
            cleanId === `rdo-${r.id}` ||
            cleanId === `rdo-${String(r.id).padStart(3, '0')}`,
        );
      if (prefixed) return prefixed;

      // 3. Fallback estrito para busca por número sequencial (apenas se for puramente numérico ou no formato rdo-004)
      const numMatch = cleanId.match(/^(?:rdo-)?0*(\d+)$/i);
      if (numMatch) {
        const numVal = parseInt(numMatch[1], 10);
        if (numVal > 0) {
          return (
            rdos.find((r) => (!workId || r.workId === workId) && r.number === numVal) ||
            rdos.find((r) => r.number === numVal)
          );
        }
      }

      return undefined;
    },
    [rdos],
  );

  const getAuditTrail = useCallback(
    (rdoId: string) => {
      const base = rdoId.replace(/-v\d+$/, '');
      return auditLogs
        .filter((l) => l.rdoId === rdoId || l.rdoId.replace(/-v\d+$/, '') === base)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    },
    [auditLogs],
  );

  /** Executa a transição pura, substitui o RDO e registra o log (append-only). */
  const commit = useCallback(
    (id: string, fn: (rdo: RDO) => workflow.TransitionResult): RDO => {
      const current = getRdo(id);
      if (!current) throw new workflow.WorkflowError('RDO não encontrado.');
      const { rdo, log } = fn(current);
      setRdos((prev) => prev.map((r) => (r.id === current.id ? rdo : r)));
      setAuditLogs((prev) => [...prev, log]);
      return rdo;
    },
    [getRdo],
  );

  const createDraft = useCallback((params: workflow.CreateDraftParams) => {
    return workflow.createDraft(params);
  }, []);

  const saveDraft = useCallback(async (workId: string, draft: Partial<RDO>) => {
    const key = workflow.getDraftStorageKey(workId);
    await AsyncStorage.setItem(key, JSON.stringify(draft));
  }, []);

  const loadDraft = useCallback(async (workId: string): Promise<Partial<RDO> | null> => {
    const key = workflow.getDraftStorageKey(workId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Partial<RDO>;
    } catch {
      return null;
    }
  }, []);

  const discardDraft = useCallback(async (workId: string) => {
    const key = workflow.getDraftStorageKey(workId);
    await AsyncStorage.removeItem(key);
  }, []);

  const submitDraft = useCallback(
    async (draft: RDO, actor: User): Promise<RDO> => {
      const validation = workflow.validateDraftForSubmission(draft);
      if (!validation.isValid) {
        throw new workflow.WorkflowError(validation.errors.join('; '));
      }

      const { rdo: submitted, log } = workflow.submitRdo(draft, actor);

      // Garante número sequencial no estado local caso ainda seja 0
      let nextNumber = submitted.number;
      if (!nextNumber || nextNumber <= 0) {
        const workRdos = rdos.filter((r) => r.workId === submitted.workId);
        const maxNumber = workRdos.reduce((max, r) => Math.max(max, r.number || 0), 0);
        nextNumber = maxNumber + 1;
      }

      let finalSubmitted: RDO = {
        ...submitted,
        number: nextNumber,
      };

      if (isSupabaseConfigured) {
        try {
          const res = await supabaseDataService.saveRdoToSupabase(finalSubmitted);
          if (res.success && res.savedRdo) {
            finalSubmitted = {
              ...finalSubmitted,
              id: res.savedRdo.id,
              number: res.savedRdo.number || finalSubmitted.number,
            };
          }
        } catch (err) {
          console.warn('Falha ao persistir RDO no Supabase:', err);
        }
      }

      setRdos((prev) => {
        const exists = prev.some((r) => r.id === finalSubmitted.id || r.id === draft.id);
        if (exists) {
          return prev.map((r) => (r.id === finalSubmitted.id || r.id === draft.id ? finalSubmitted : r));
        }
        return [finalSubmitted, ...prev];
      });
      setAuditLogs((prev) => [...prev, log]);

      if (finalSubmitted.workId) {
        try {
          await discardDraft(finalSubmitted.workId);
        } catch (err) {
          console.warn('Falha ao limpar rascunho persistido após submissão:', err);
        }
      }

      return finalSubmitted;
    },
    [rdos, discardDraft],
  );

  const value = useMemo<RDOContextData>(
    () => ({
      rdos,
      works,
      loading,
      refreshData,
      auditLogs,
      getRdo,
      getAuditTrail,
      submitRdo: (id, actor) => {
        const submitted = commit(id, (r) => {
          const res = workflow.submitRdo(r, actor);
          if (!res.rdo.number || res.rdo.number <= 0) {
            const workRdos = rdos.filter((x) => x.workId === res.rdo.workId);
            const maxNumber = workRdos.reduce((max, x) => Math.max(max, x.number || 0), 0);
            return {
              ...res,
              rdo: { ...res.rdo, number: maxNumber + 1 },
            };
          }
          return res;
        });
        if (isSupabaseConfigured) {
          supabaseDataService.saveRdoToSupabase(submitted).catch((err) => {
            console.warn('Falha ao persistir RDO no Supabase:', err);
          });
        }
        if (submitted.workId) {
          discardDraft(submitted.workId).catch((err) => {
            console.warn('Falha ao limpar rascunho persistido:', err);
          });
        }
        return submitted;
      },
      returnRdo: (id, actor, reason) => {
        const returned = commit(id, (r) => workflow.returnRdo(r, actor, reason));
        if (isSupabaseConfigured) {
          supabaseDataService.updateRdoStatusInSupabase(returned.id, 'rejeitado', reason);
        }
      },
      approveRdo: (id, actor) => {
        const approved = commit(id, (r) => workflow.approveRdo(r, actor, getDeviceInfo()));
        if (isSupabaseConfigured) {
          supabaseDataService.updateRdoStatusInSupabase(approved.id, 'aprovado', undefined, approved.signature);
        }
        return approved;
      },
      addComment: (id, actor, section, text) => {
        commit(id, (r) => workflow.addComment(r, actor, section, text));
      },
      auditedEdit: (id, actor, params) => {
        commit(id, (r) => workflow.auditedEdit(r, actor, params));
      },
      rectifyRdo: (id, actor, reason) => {
        const current = getRdo(id);
        if (!current) throw new workflow.WorkflowError('RDO não encontrado.');
        const { newVersion, rdos: nextRdos, log } = workflow.rectifyRdo(current, actor, reason, rdos);
        setRdos(nextRdos);
        setAuditLogs((prev) => [...prev, log]);
        return newVersion;
      },
      createDraft,
      saveDraft,
      loadDraft,
      discardDraft,
      submitDraft,
    }),
    [
      rdos,
      works,
      loading,
      refreshData,
      auditLogs,
      getRdo,
      getAuditTrail,
      commit,
      createDraft,
      saveDraft,
      loadDraft,
      discardDraft,
      submitDraft,
    ],
  );

  return <RDOContext.Provider value={value}>{children}</RDOContext.Provider>;
};

export const useRDOs = () => {
  const context = useContext(RDOContext);
  if (!context) throw new Error('useRDOs must be used within an RDOProvider');
  return context;
};

export const useRDO = useRDOs;

