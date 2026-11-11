/**
 * @jest-environment jsdom
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('react-native', () => {
  (globalThis as any).__DEV__ = true;
  const React = require('react');

  const View = ({ testID, children, ...rest }: any) =>
    React.createElement('div', { 'data-testid': testID || 'view' }, children);
  const Text = ({ testID, children, ...rest }: any) =>
    React.createElement('span', { 'data-testid': testID || 'text' }, children);
  const Modal = ({ visible, testID, children }: any) =>
    visible
      ? React.createElement('div', { 'data-testid': testID || 'modal' }, children)
      : null;
  const TouchableWithoutFeedback = ({ children }: any) => children;

  function AnimatedValue(this: any, val: number) {
    this.val = val;
    this.setValue = jest.fn((v: number) => {
      this.val = v;
    });
  }

  const createAnimation = () => ({
    start: jest.fn((cb?: any) => {
      if (cb) {
        Promise.resolve().then(() => cb({ finished: false }));
      }
    }),
    stop: jest.fn(),
  });

  const Animated = {
    Value: AnimatedValue,
    View,
    Text,
    timing: createAnimation,
    sequence: createAnimation,
    parallel: createAnimation,
    loop: createAnimation,
    delay: createAnimation,
  };

  return {
    Platform: { OS: 'ios', select: (obj: any) => obj?.ios ?? obj?.default },
    StyleSheet: {
      create: (s: any) => s,
      absoluteFill: {},
    },
    View,
    Text,
    Modal,
    TouchableWithoutFeedback,
    Animated,
    Easing: {
      in: () => ({}),
      out: () => ({}),
      inOut: () => ({}),
      quad: {},
      cubic: {},
      back: () => ({}),
    },
    StatusBar: { currentHeight: 44 },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
  };
});

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import {
  StackLabLoader,
  StackLabSplashScreen,
  StackLabLoadingOverlay,
} from '@/components/common/StackLabLoader';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';

if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

describe('StackLabLoader & SplashScreen System', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root!.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
  });

  it('renders StackLabLoader with default properties', async () => {
    await act(async () => {
      root!.render(<StackLabLoader size={100} testID="test-loader" />);
    });

    const loaderEl = container!.querySelector('[data-testid="test-loader"]');
    expect(loaderEl).not.toBeNull();
  });

  it('renders StackLabLoader in non-animated mode cleanly', async () => {
    await act(async () => {
      root!.render(<StackLabLoader size={80} animated={false} testID="static-loader" />);
    });

    const loaderEl = container!.querySelector('[data-testid="static-loader"]');
    expect(loaderEl).not.toBeNull();
  });

  it('renders StackLabSplashScreen with title and custom message', async () => {
    await act(async () => {
      root!.render(
        <StackLabSplashScreen
          message="Conectando aos servidores..."
          subtitle="Verificando integridade"
          testID="test-splash"
        />,
      );
    });

    const splashEl = container!.querySelector('[data-testid="test-splash"]');
    expect(splashEl).not.toBeNull();
    expect(container!.textContent).toContain('StackLab');
    expect(container!.textContent).toContain('Conectando aos servidores...');
    expect(container!.textContent).toContain('Verificando integridade');
  });

  it('renders StackLabLoadingOverlay when visible is true and hides when false', async () => {
    await act(async () => {
      root!.render(
        <StackLabLoadingOverlay
          visible={true}
          message="Autenticando usuário..."
          testID="test-overlay"
        />,
      );
    });

    const overlayEl = container!.querySelector('[data-testid="test-overlay"]');
    expect(overlayEl).not.toBeNull();
    expect(container!.textContent).toContain('Autenticando usuário...');

    // Oculta o overlay
    await act(async () => {
      root!.render(
        <StackLabLoadingOverlay
          visible={false}
          message="Autenticando usuário..."
          testID="test-overlay"
        />,
      );
    });

    const hiddenOverlay = container!.querySelector('[data-testid="test-overlay"]');
    expect(hiddenOverlay).toBeNull();
  });

  it('controls global loading state via LoadingProvider and useLoading hook', async () => {
    let hookValue: ReturnType<typeof useLoading> | null = null;

    const TestConsumer = () => {
      hookValue = useLoading();
      return null;
    };

    await act(async () => {
      root!.render(
        <LoadingProvider>
          <TestConsumer />
        </LoadingProvider>,
      );
    });

    expect(hookValue).not.toBeNull();
    expect(hookValue!.isLoading).toBe(false);
    expect(hookValue!.message).toBeNull();

    // Ativa loading com mensagem
    await act(async () => {
      hookValue!.showLoading('Sincronizando relatórios RDO...');
    });

    expect(hookValue!.isLoading).toBe(true);
    expect(hookValue!.message).toBe('Sincronizando relatórios RDO...');
    expect(container!.textContent).toContain('Sincronizando relatórios RDO...');

    // Desativa loading
    await act(async () => {
      hookValue!.hideLoading();
    });

    expect(hookValue!.isLoading).toBe(false);
    expect(hookValue!.message).toBeNull();
  });
});
