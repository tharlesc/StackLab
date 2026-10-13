import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { User } from '../types';
import { hasPermission, isMaster as checkIsMaster, type Permission } from '../constants/permissions';

interface AuthContextData {
  user: User | null;
  isMaster: boolean;
  can: (permission: Permission) => boolean;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback((selectedUser: User) => {
    setUser(selectedUser);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const can = useCallback((permission: Permission) => hasPermission(user, permission), [user]);

  const value = useMemo(
    () => ({ user, isMaster: checkIsMaster(user), can, signIn, signOut }),
    [user, can, signIn, signOut],
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
