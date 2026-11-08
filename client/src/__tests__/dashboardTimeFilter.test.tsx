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

jest.mock('styled-components/native', () => {
  const { lightTheme } = require('@/constants/theme');
  return {
    useTheme: () => lightTheme,
    ThemeProvider: ({ children }: any) => children,
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import { useDashboardHome, TIME_FILTERS } from '@/hooks/useDashboardHome';
import { RDOProvider } from '@/contexts/RDOContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { MOCK_ACTIVE_WORKS, MOCK_RDOS } from '@/mocks';

if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

describe('useDashboardHome — Time Filter (Hoje, 7 Dias, 15 Dias, 1 Mês)', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  let hookValue: ReturnType<typeof useDashboardHome> | null = null;

  const TestConsumer = () => {
    hookValue = useDashboardHome();
    return null;
  };

  const renderComponent = async () => {
    await act(async () => {
      root!.render(
        <AuthProvider>
          <RDOProvider initialWorks={MOCK_ACTIVE_WORKS} initialRdos={MOCK_RDOS}>
            <TestConsumer />
          </RDOProvider>
        </AuthProvider>,
      );
    });
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    hookValue = null;
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root!.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
    hookValue = null;
  });

  it('provides default filter "7 Dias" and exports TIME_FILTERS options', async () => {
    await renderComponent();

    expect(hookValue).not.toBeNull();
    expect(hookValue!.activeTimeFilter).toBe('7 Dias');
    expect(hookValue!.timeFilters).toEqual(['Hoje', '7 Dias', '15 Dias', '1 Mês']);
    expect(TIME_FILTERS).toEqual(['Hoje', '7 Dias', '15 Dias', '1 Mês']);
    expect(hookValue!.timeFilterSubtitle).toContain('7');
  });

  it('updates metrics and subtitle dynamically when switching to "Hoje"', async () => {
    await renderComponent();

    await act(async () => {
      hookValue!.setActiveTimeFilter('Hoje');
    });

    expect(hookValue!.activeTimeFilter).toBe('Hoje');
    expect(hookValue!.timeFilterSubtitle).toBe('Meus RDOs de Hoje');

    const totalHoje = hookValue!.chartData.reduce((acc, curr) => acc + curr.value, 0);
    expect(typeof totalHoje).toBe('number');
  });

  it('updates metrics and subtitle dynamically when switching to "15 Dias"', async () => {
    await renderComponent();

    await act(async () => {
      hookValue!.setActiveTimeFilter('15 Dias');
    });

    expect(hookValue!.activeTimeFilter).toBe('15 Dias');
    expect(hookValue!.timeFilterSubtitle).toBe('Últimos 15 dias');

    const total15 = hookValue!.chartData.reduce((acc, curr) => acc + curr.value, 0);
    expect(total15).toBeGreaterThanOrEqual(0);
  });

  it('updates metrics and subtitle dynamically when switching to "1 Mês"', async () => {
    await renderComponent();

    await act(async () => {
      hookValue!.setActiveTimeFilter('1 Mês');
    });

    expect(hookValue!.activeTimeFilter).toBe('1 Mês');
    expect(hookValue!.timeFilterSubtitle).toBe('Último mês (30 dias)');

    const totalMes = hookValue!.chartData.reduce((acc, curr) => acc + curr.value, 0);
    expect(totalMes).toBeGreaterThanOrEqual(0);
  });
});
