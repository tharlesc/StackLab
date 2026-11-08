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
import { MOCK_WORKS, MOCK_USERS } from '@/mocks';

/**
 * 🛠️ AdminContext — Cadastros (obras, usuários) e matriz de acessos (usuário ↔ obra).
 * Exclusivo do perfil Master. Integrado com as tabelas reais do Supabase (obras, profiles, obra_operadores).
 */
export interface AddUserData {
  name: string;
  email: string;
  role: string;
  profile: UserProfile;
  crea?: string;
  assignedWorkIds?: string[];
}

interface AdminContextData {
  works: Work[];
  users: User[];
  loading: boolean;
  refreshAdminData: () => Promise<void>;
  addWork: (data: Omit<Work, 'id' | 'active'>) => Promise<void>;
  updateWork: (workId: string, data: Partial<Omit<Work, 'id'>>) => Promise<void>;
  toggleWorkActive: (workId: string) => Promise<void>;
  addUser: (data: AddUserData) => Promise<User>;
  toggleUserActive: (userId: string) => Promise<void>;
  toggleAssignment: (userId: string, workId: string) => Promise<void>;
  completeUserFirstAccess: (userId: string) => void;
  resetUserPassword: (userId: string) => Promise<string>;
}

export interface AdminProviderProps {
  children: ReactNode;
  initialWorks?: Work[];
  initialUsers?: User[];
}

const AdminContext = createContext<AdminContextData>({} as AdminContextData);

export const AdminProvider = ({
  children,
  initialWorks = MOCK_WORKS,
  initialUsers = MOCK_USERS,
}: AdminProviderProps) => {
  const [works, setWorks] = useState<Work[]>(isSupabaseConfigured ? [] : initialWorks);
  const [users, setUsers] = useState<User[]>(isSupabaseConfigured ? [] : initialUsers);
  const [loading, setLoading] = useState(false);

  const refreshAdminData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    try {
      const [fetchedWorks, fetchedUsers] = await Promise.all([
        supabaseDataService.fetchAdminWorksFromSupabase(),
        supabaseDataService.fetchAdminUsersFromSupabase(),
      ]);

      if (fetchedWorks) {
        setWorks(fetchedWorks);
      }
      if (fetchedUsers) {
        setUsers(fetchedUsers);
      }
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
          if (fetchedWorks) {
            setWorks(fetchedWorks);
          }
          if (fetchedUsers) {
            setUsers(fetchedUsers);
          }
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

  const updateWork = useCallback(
    async (workId: string, data: Partial<Omit<Work, 'id'>>) => {
      if (isSupabaseConfigured) {
        await supabaseDataService.updateWorkInSupabase(workId, data);
      }
      setWorks((prev) =>
        prev.map((w) => (w.id === workId ? { ...w, ...data } : w)),
      );
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
    async (data: AddUserData): Promise<User> => {
      // Gera senha fácil aleatória de 6 dígitos numéricos
      const randomPassword = Math.floor(100000 + Math.random() * 900000).toString();

      let createdUser: User = {
        id: `u${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        crea: data.crea,
        profile: data.profile,
        assignedWorkIds: data.assignedWorkIds || [],
        active: true,
        isOnline: false,
        lastSyncAt: new Date().toISOString(),
        tempPassword: randomPassword,
        isFirstAccess: true,
      };

      if (isSupabaseConfigured) {
        const remote = await supabaseDataService.createUserInSupabase(data, randomPassword);
        if (remote) {
          createdUser = remote;
        } else {
          throw new Error('Falha ao registrar usuário no Supabase.');
        }
      }

      setUsers((prev) => [createdUser, ...prev]);
      return createdUser;
    },
    [],
  );

  const completeUserFirstAccess = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFirstAccess: false, tempPassword: undefined } : u)),
    );
  }, []);

  const resetUserPassword = useCallback(async (userId: string): Promise<string> => {
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    if (isSupabaseConfigured) {
      await supabaseDataService.resetUserPasswordInSupabase(userId, newPassword);
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, tempPassword: newPassword, isFirstAccess: true }
          : u,
      ),
    );
    return newPassword;
  }, []);

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
      updateWork,
      toggleWorkActive,
      addUser,
      toggleUserActive,
      toggleAssignment,
      completeUserFirstAccess,
      resetUserPassword,
    }),
    [
      works,
      users,
      loading,
      refreshAdminData,
      addWork,
      updateWork,
      toggleWorkActive,
      addUser,
      toggleUserActive,
      toggleAssignment,
      completeUserFirstAccess,
      resetUserPassword,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
