import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { User, UserProfile, Work } from '@/types';
import { isSupabaseConfigured, supabaseDataService } from '@/services';

/**
 * 🛠️ AdminContext — Cadastros (obras, usuários) e matriz de acessos (usuário ↔ obra).
 * Exclusivo do perfil Master. Integrado com as tabelas reais do Supabase (obras, profiles, obra_operadores).
 */
interface AdminContextData {
  works: Work[];
  users: User[];
  loading: boolean;
  refreshAdminData: () => Promise<void>;
  addWork: (data: Omit<Work, 'id' | 'active'>) => Promise<void>;
  toggleWorkActive: (workId: string) => Promise<void>;
  addUser: (data: { name: string; email: string; role: string; profile: UserProfile }) => Promise<void>;
  toggleUserActive: (userId: string) => Promise<void>;
  toggleAssignment: (userId: string, workId: string) => Promise<void>;
}

export interface AdminProviderProps {
  children: ReactNode;
  initialWorks?: Work[];
  initialUsers?: User[];
}

const AdminContext = createContext<AdminContextData>({} as AdminContextData);

export const AdminProvider = ({
  children,
  initialWorks = [],
  initialUsers = [],
}: AdminProviderProps) => {
  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  const refreshAdminData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    try {
      const [fetchedWorks, fetchedUsers] = await Promise.all([
        supabaseDataService.fetchAdminWorksFromSupabase(),
        supabaseDataService.fetchAdminUsersFromSupabase(),
      ]);

      setWorks(fetchedWorks || []);
      setUsers(fetchedUsers || []);
    } catch (err) {
      console.warn('Erro ao carregar dados administrativos do Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!isSupabaseConfigured) return;
      try {
        const [fetchedWorks, fetchedUsers] = await Promise.all([
          supabaseDataService.fetchAdminWorksFromSupabase(),
          supabaseDataService.fetchAdminUsersFromSupabase(),
        ]);
        if (isMounted) {
          setWorks(fetchedWorks || []);
          setUsers(fetchedUsers || []);
        }
      } catch (err) {
        console.warn('Erro ao carregar dados administrativos do Supabase:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const addWork = useCallback(
    async (data: Omit<Work, 'id' | 'active'>) => {
      if (isSupabaseConfigured) {
        const created = await supabaseDataService.createWorkInSupabase(data);
        if (created) {
          setWorks((prev) => [...prev, created]);
          return;
        }
      }
      setWorks((prev) => [...prev, { ...data, id: `w${Date.now()}`, active: true }]);
    },
    [],
  );

  const toggleWorkActive = useCallback(
    async (workId: string) => {
      const current = works.find((w) => w.id === workId);
      const nextActive = current ? !current.active : false;

      if (isSupabaseConfigured) {
        await supabaseDataService.toggleWorkActiveInSupabase(workId, nextActive);
      }

      setWorks((prev) =>
        prev.map((w) => (w.id === workId ? { ...w, active: nextActive } : w)),
      );
    },
    [works],
  );

  const addUser = useCallback(
    async (data: { name: string; email: string; role: string; profile: UserProfile }) => {
      // Criação local imediata para refletir na lista
      const newUser: User = {
        id: `u${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        profile: data.profile,
        assignedWorkIds: [],
        active: true,
      };
      setUsers((prev) => [...prev, newUser]);
    },
    [],
  );

  const toggleUserActive = useCallback(
    async (userId: string) => {
      const current = users.find((u) => u.id === userId);
      const nextActive = current ? !(current.active ?? true) : false;

      if (isSupabaseConfigured) {
        await supabaseDataService.toggleUserActiveInSupabase(userId, nextActive);
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: nextActive } : u)),
      );
    },
    [users],
  );

  const toggleAssignment = useCallback(
    async (userId: string, workId: string) => {
      const user = users.find((u) => u.id === userId);
      const has = user?.assignedWorkIds.includes(workId) ?? false;
      const willAssign = !has;

      if (isSupabaseConfigured) {
        await supabaseDataService.toggleAssignmentInSupabase(userId, workId, willAssign);
      }

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          return {
            ...u,
            assignedWorkIds: willAssign
              ? [...u.assignedWorkIds, workId]
              : u.assignedWorkIds.filter((id) => id !== workId),
          };
        }),
      );
    },
    [users],
  );

  const value = useMemo(
    () => ({
      works,
      users,
      loading,
      refreshAdminData,
      addWork,
      toggleWorkActive,
      addUser,
      toggleUserActive,
      toggleAssignment,
    }),
    [
      works,
      users,
      loading,
      refreshAdminData,
      addWork,
      toggleWorkActive,
      addUser,
      toggleUserActive,
      toggleAssignment,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
