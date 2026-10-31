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

jest.mock('styled-components/native', () => ({
  useTheme: () => ({}),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNewRDO } from '@/hooks';
import { RDOProvider } from '../contexts/RDOContext';
import { AuthProvider } from '../contexts/AuthContext';
import { MOCK_ACTIVE_WORKS } from '../mocks';

if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

describe('useNewRDO Hook — Worker RDO Filling Multi-Step Form', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  let hookValue: ReturnType<typeof useNewRDO> | null = null;

  const TestConsumer = () => {
    hookValue = useNewRDO();
    return null;
  };

  const renderHookComponent = async () => {
    await act(async () => {
      root!.render(
        <AuthProvider>
          <RDOProvider>
            <TestConsumer />
          </RDOProvider>
        </AuthProvider>,
      );
    });
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    hookValue = null;
    await renderHookComponent();
  });

  afterEach(async () => {
    if (root && container) {
      await act(async () => {
        root!.unmount();
      });
      container.remove();
      container = null;
      root = null;
    }
  });

  it('initializes with active works and no active draft', () => {
    expect(hookValue!.works.length).toBeGreaterThan(0);
    expect(hookValue!.selectedWork).toBeNull();
    expect(hookValue!.activeDraft).toBeNull();
    expect(hookValue!.currentStep).toBe(0);
  });

  it('selects a work and starts a new draft with 7 steps', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });

    expect(hookValue!.selectedWork?.id).toBe(MOCK_ACTIVE_WORKS[0]!.id);
    expect(hookValue!.isStartDialogOpen).toBe(true);

    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    expect(hookValue!.activeDraft).not.toBeNull();
    expect(hookValue!.activeDraft?.workId).toBe(MOCK_ACTIVE_WORKS[0]!.id);
    expect(hookValue!.activeDraft?.status).toBe('rascunho');
    expect(hookValue!.currentStep).toBe(0);
  });

  it('adds and removes labor entries with real-time headcount & man-hours calculation', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });
    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    expect(hookValue!.headcount).toBe(0);
    expect(hookValue!.manHours).toBe(0);

    await act(async () => {
      hookValue!.addLaborEntry({
        role: 'Pedreiro',
        quantity: 3,
        hours: 8,
        isContractor: false,
      });
      hookValue!.addLaborEntry({
        role: 'Carpinteiro',
        quantity: 2,
        hours: 8,
        isContractor: true,
      });
    });

    expect(hookValue!.headcount).toBe(5);
    expect(hookValue!.manHours).toBe(40); // (3*8) + (2*8) = 24 + 16 = 40
    expect(hookValue!.activeDraft?.labor).toHaveLength(2);

    await act(async () => {
      hookValue!.removeLaborEntry(0);
    });

    expect(hookValue!.headcount).toBe(2);
    expect(hookValue!.manHours).toBe(16);
    expect(hookValue!.activeDraft?.labor).toHaveLength(1);
  });

  it('adds equipment and captures photos with security watermark metadata', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });
    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    await act(async () => {
      hookValue!.addEquipmentEntry({
        name: 'Betoneira 400L',
        quantity: 1,
        activeHours: 6,
        idleHours: 2,
        idleJustification: 'Aguardando entrega de agregados',
        isRented: false,
      });
    });

    expect(hookValue!.activeDraft?.equipment).toHaveLength(1);
    expect(hookValue!.activeDraft?.equipment[0]?.idleJustification).toBe(
      'Aguardando entrega de agregados',
    );

    await act(async () => {
      hookValue!.handleCapturePhoto('Concretagem de laje do bloco A');
    });

    expect(hookValue!.activeDraft?.photos).toHaveLength(1);
    const photo = hookValue!.activeDraft?.photos[0]!;
    expect(photo.caption).toBe('Concretagem de laje do bloco A');
    expect(photo.metadata).toBeDefined();
    expect(photo.metadata?.latitude).toBe(-2.5307);
    expect(photo.metadata?.longitude).toBe(-44.3068);
  });

  it('rejects submission if requirements are missing and submits cleanly when valid', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });
    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    // Tentativa de submissão sem efetivo e sem atividades
    await act(async () => {
      await hookValue!.handleSubmit();
    });

    expect(hookValue!.isValidationDialogOpen).toBe(true);
    expect(hookValue!.validationErrors.length).toBeGreaterThanOrEqual(2);

    // Preenche requisitos mínimos válidos
    await act(async () => {
      hookValue!.addLaborEntry({
        role: 'Pedreiro',
        quantity: 2,
        hours: 8,
      });
      hookValue!.addActivityEntry({
        description: 'Alvenaria de vedação',
        location: '1º Pavimento',
        unit: 'm²',
        quantity: 40,
        progress: 30,
      });
    });

    await act(async () => {
      await hookValue!.handleSubmit();
    });

    expect(hookValue!.isSuccessDialogOpen).toBe(true);
  });
});
