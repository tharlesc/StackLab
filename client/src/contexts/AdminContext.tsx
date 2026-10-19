import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import type { User, UserProfile, Work } from '@/types';
import { MOCK_USERS, MOCK_WORKS } from '@/mocks';

/**
 * 🛠️ AdminContext — Cadastros (obras, usuários) e matriz de acessos (usuário ↔ obra).
 * Exclusivo do perfil Master. Estado em memória (MOCK) até a API RF03 existir.
 */
interface AdminContextData {
  works: Work[];
  users: User[];
  addWork: (data: Omit<Work, 'id' | 'active'>) => void;
  toggleWorkActive: (workId: string) => void;
  addUser: (data: { name: string; email: string; role: string; profile: UserProfile }) => void;
  toggleUserActive: (userId: string) => void;
  toggleAssignment: (userId: string, workId: string) => void;
}

const AdminContext = createContext<AdminContextData>({} as AdminContextData);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [works, setWorks] = useState<Work[]>(MOCK_WORKS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const addWork = useCallback((data: Omit<Work, 'id' | 'active'>) => {
    setWorks((prev) => [...prev, { ...data, id: `w${Date.now()}`, active: true }]);
  }, []);

  const toggleWorkActive = useCallback((workId: string) => {
    setWorks((prev) => prev.map((w) => (w.id === workId ? { ...w, active: !w.active } : w)));
  }, []);

  const addUser = useCallback((data: { name: string; email: string; role: string; profile: UserProfile }) => {
    setUsers((prev) => [...prev, { ...data, id: `u${Date.now()}`, assignedWorkIds: [], active: true }]);
  }, []);

  const toggleUserActive = useCallback((userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: !(u.active ?? true) } : u)));
  }, []);

  const toggleAssignment = useCallback((userId: string, workId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const has = u.assignedWorkIds.includes(workId);
        return {
          ...u,
          assignedWorkIds: has ? u.assignedWorkIds.filter((id) => id !== workId) : [...u.assignedWorkIds, workId],
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({ works, users, addWork, toggleWorkActive, addUser, toggleUserActive, toggleAssignment }),
    [works, users, addWork, toggleWorkActive, addUser, toggleUserActive, toggleAssignment],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
