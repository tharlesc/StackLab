import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Davi Hudson',
    email: 'davi@stacklab.com',
    role: 'Engenheiro Master',
    crea: 'CREA-SP 123456/D',
    isMaster: true,
  },
  {
    id: '2',
    name: 'Tharles',
    email: 'tharles@stacklab.com',
    role: 'Engenheiro Residente',
    crea: 'CREA-SP 987654/D',
    isMaster: false,
  },
];

interface AuthContextData {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (selectedUser: User) => {
    setUser(selectedUser);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
