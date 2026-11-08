import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import type { User } from '@/types';
import {
  hasPermission,
  isMaster as checkIsMaster,
  isClient as checkIsClient,
  type Permission,
} from '@/constants/permissions';
import { authService, supabase, isSupabaseConfigured } from '@/services';

interface AuthContextData {
  user: User | null;
  isMaster: boolean;
  isClient: boolean;
  loading: boolean;
  can: (permission: Permission) => boolean;
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  completeFirstAccess: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restaura sessão existente do Supabase Auth ao inicializar o app
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const persisted = await authService.getPersistedSessionUser();
        if (isMounted && persisted) {
          setUser(persisted);
        }
      } catch (err) {
        console.warn('Erro ao verificar sessão do Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback((selectedUser: User) => {
    setUser({
      ...selectedUser,
      isOnline: true,
      lastSyncAt: new Date().toISOString(),
    });
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Erro ao efetuar logout no Supabase:', err);
    }
  }, []);

  const completeFirstAccess = useCallback(async (newPassword: string) => {
    if (isSupabaseConfigured && user) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
        await supabase
          .from('profiles')
          .update({ is_first_access: false, temp_password: null })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Aviso ao atualizar senha definitiva no Supabase:', err);
      }
    }
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isFirstAccess: false,
        tempPassword: undefined,
      };
    });
  }, [user]);

  const can = useCallback((permission: Permission) => hasPermission(user, permission), [user]);

  const value = useMemo(
    () => ({
      user,
      isMaster: checkIsMaster(user),
      isClient: checkIsClient(user),
      loading,
      can,
      signIn,
      signOut,
      completeFirstAccess,
    }),
    [user, loading, can, signIn, signOut, completeFirstAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

