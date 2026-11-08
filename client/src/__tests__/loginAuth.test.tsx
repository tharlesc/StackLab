/**
 * @jest-environment jsdom
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native', () => {
  (globalThis as any).__DEV__ = true;
  return {
    Alert: { alert: jest.fn() },
    Platform: { OS: 'ios', select: (obj: any) => obj?.ios ?? obj?.default },
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/services', () => {
  const actual = jest.requireActual('@/services');
  return {
    ...actual,
    isSupabaseConfigured: true,
  };
});

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogin } from '@/hooks/useLogin';
import { AuthProvider } from '@/contexts/AuthContext';
import * as authService from '@/services/modules/authService';

if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

describe('Login Authentication and Real Database Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates empty email and password without calling login API', async () => {
    let hookValue: ReturnType<typeof useLogin> | null = null;
    function TestComponent() {
      hookValue = useLogin();
      return null;
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await hookValue!.handleLogin();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Por favor, informe seu e-mail.');
    expect(hookValue!.loading).toBe(false);
  });

  it('never falls back to mock users and properly displays real Supabase errors', async () => {
    const loginSpy = jest.spyOn(authService, 'loginWithEmail').mockResolvedValue({
      user: null,
      error: 'E-mail ou senha incorretos no Supabase. Verifique suas credenciais.',
    });

    let hookValue: ReturnType<typeof useLogin> | null = null;
    function TestComponent() {
      hookValue = useLogin();
      return null;
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    await act(async () => {
      hookValue!.setEmail('davi@stacklab.com'); // E-mail que antes caía em mock
      hookValue!.setPassword('incorrect');
    });

    await act(async () => {
      await hookValue!.handleLogin();
    });

    expect(loginSpy).toHaveBeenCalledWith('davi@stacklab.com', 'incorrect');
    // Deve rejeitar e JAMAIS logar como mock user:
    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      'E-mail ou senha incorretos no Supabase. Verifique suas credenciais.',
    );
    expect(hookValue!.loading).toBe(false);

    loginSpy.mockRestore();
  });

  it('successfully redirects and stores user session when Supabase authentication succeeds', async () => {
    const mockUser = {
      id: 'supabase-user-123',
      name: 'Engenheiro Teste',
      email: 'master@stacklab.com',
      role: 'Engenheiro Master',
      profile: 'master' as const,
      assignedWorkIds: ['w1'],
      active: true,
      isOnline: true,
      lastSyncAt: new Date().toISOString(),
    };

    const loginSpy = jest.spyOn(authService, 'loginWithEmail').mockResolvedValue({
      user: mockUser,
      error: null,
    });

    let hookValue: ReturnType<typeof useLogin> | null = null;
    function TestComponent() {
      hookValue = useLogin();
      return null;
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    await act(async () => {
      hookValue!.setEmail('master@stacklab.com');
      hookValue!.setPassword('SecretPassword123');
    });

    await act(async () => {
      await hookValue!.handleLogin();
    });

    expect(loginSpy).toHaveBeenCalledWith('master@stacklab.com', 'SecretPassword123');
    expect(hookValue!.loading).toBe(false);

    loginSpy.mockRestore();
  });
});
