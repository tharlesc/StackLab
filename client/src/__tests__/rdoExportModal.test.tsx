/**
 * @jest-environment jsdom
 */

try {
  const streamWeb = require('node:stream/web');
  Object.assign(globalThis, streamWeb);
  if (typeof window !== 'undefined') {
    Object.assign(window, streamWeb);
  }
} catch {}

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    SafeAreaView: ({ children, ...props }: any) => React.createElement('div', props, children),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const createIconMock = (name: string) => {
    const Icon = (props: any) => React.createElement('span', { 'data-testid': `icon-${name}`, ...props });
    Icon.displayName = name;
    return Icon;
  };
  return new Proxy(
    {},
    {
      get: (_target, prop: string) => createIconMock(prop),
    },
  );
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockShare = jest.fn().mockResolvedValue({ action: 'sharedAction' });
const mockAlert = jest.fn();

let mockCurrentPlatform = 'web';

jest.mock('react-native', () => {
  (globalThis as any).__DEV__ = true;
  const React = require('react');

  const View = ({ testID, children, accessibilityRole, accessibilityState, accessibilityLabel, ...props }: any) =>
    React.createElement(
      'div',
      {
        'data-testid': testID || 'view',
        role: accessibilityRole,
        'aria-selected': accessibilityState?.selected,
        'aria-label': accessibilityLabel,
        ...props,
      },
      children,
    );

  const Text = ({ testID, children, ...props }: any) =>
    React.createElement('span', { 'data-testid': testID || 'text', ...props }, children);

  const TouchableOpacity = ({ testID, onPress, children, accessibilityRole, accessibilityState, accessibilityLabel, ...props }: any) =>
    React.createElement(
      'button',
      {
        'data-testid': testID || 'touchable',
        role: accessibilityRole,
        'aria-selected': accessibilityState?.selected,
        'aria-label': accessibilityLabel,
        onClick: onPress,
        ...props,
      },
      children,
    );

  const Modal = ({ visible, testID, children }: any) =>
    visible ? React.createElement('div', { 'data-testid': testID || 'modal' }, children) : null;

  const ScrollView = ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'scroll-view', ...props }, children);

  const KeyboardAvoidingView = ({ children }: any) => React.createElement('div', null, children);

  const Keyboard = { dismiss: jest.fn() };

  return {
    Alert: { alert: jest.fn((...args: any[]) => mockAlert(...args)) },
    Platform: {
      get OS() {
        return mockCurrentPlatform;
      },
      select: (obj: any) => obj?.[mockCurrentPlatform] ?? obj?.default,
    },
    Share: {
      share: jest.fn((...args: any[]) => mockShare(...args)),
    },
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard,
    StyleSheet: { create: (s: any) => s, absoluteFill: {} },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
  };
});

jest.mock('styled-components/native', () => {
  const React = require('react');
  const { lightTheme } = require('@/constants/theme');

  const createStyledComponent = (tag: any) => {
    const fn: any = (strings: any, ...exprs: any) => {
      const Comp = React.forwardRef(({ children, ...props }: any, ref: any) => {
        const {
          $selected,
          $variant,
          $isPrimary,
          $isDestructive,
          activeOpacity,
          keyboardShouldPersistTaps,
          showsVerticalScrollIndicator,
          contentContainerStyle,
          numberOfLines,
          ...domProps
        } = props;
        const resolvedTag = typeof tag === 'string' && /^[A-Z]/.test(tag) ? 'div' : tag || 'div';
        return React.createElement(resolvedTag, { ...domProps, ref }, children);
      });
      Comp.displayName = `Styled(${typeof tag === 'string' ? tag : tag?.displayName || tag?.name || 'Component'})`;
      return Comp;
    };
    fn.attrs = (_attrs: any) => fn;
    return fn;
  };

  const styledTarget: any = (component: any) => createStyledComponent(component);
  const styled = new Proxy(styledTarget, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      return createStyledComponent(prop);
    },
  });

  return {
    __esModule: true,
    default: styled,
    css: (strings: any, ...exprs: any) => '',
    useTheme: () => lightTheme,
    ThemeProvider: ({ children }: any) => children,
  };
});

const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockRouterBack,
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
  useLocalSearchParams: () => ({ id: 'rdo-test-100' }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockMasterUser,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock('@/services', () => {
  const actual = jest.requireActual('@/services');
  return {
    ...actual,
    isSupabaseConfigured: false,
  };
});

jest.mock('@/utils/rdoPdfTemplate', () => {
  const actual = jest.requireActual('@/utils/rdoPdfTemplate');
  return {
    ...actual,
    triggerWebPdfDownload: jest.fn().mockReturnValue(true),
    triggerWebCsvDownload: jest.fn().mockReturnValue(true),
  };
});

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRDOReview } from '@/hooks/useRDOReview';
import { RDOReviewView } from '@/screens/master/RDOReview/RDOReviewView';
import { AuthProvider } from '@/contexts/AuthContext';
import { RDOProvider } from '@/contexts/RDOContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { triggerWebPdfDownload, triggerWebCsvDownload } from '@/utils/rdoPdfTemplate';
import type { RDO, User, ActiveWork } from '@/types';

if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

const mockMasterUser: User = {
  id: 'master-user-1',
  name: 'Engenheiro Master Teste',
  profile: 'master',
  role: 'Engenheiro Coordenador',
  crea: 'CREA-SP 998877',
  email: 'master@stacklab.com',
  assignedWorkIds: ['obra-export-1'],
};

const mockWork: ActiveWork = {
  id: 'obra-export-1',
  name: 'Residencial Horizonte',
  subtitle: 'Torre Residencial Alpha',
  statusType: '100% Em Dia',
  lastRdo: 'Hoje',
  weather: 'Ensolarado',
  team: '18 Operários',
  rdoStatus: 'Em Dia',
  actionText: 'Visualizar',
};

const mockRdo: RDO = {
  id: 'rdo-test-100',
  number: 100,
  version: 1,
  workId: 'obra-export-1',
  workName: 'Residencial Horizonte',
  date: '2026-11-12',
  status: 'submetido',
  authorId: 'worker-1',
  authorName: 'Encarregado Geral',
  submittedAt: '2026-11-12T08:00:00.000Z',
  weather: [{ shift: 'manha', condition: 'Sol' }],
  labor: [{ role: 'Pedreiro', quantity: 6, hours: 8 }],
  equipment: [{ name: 'Guincho de Coluna', activeHours: 7, idleHours: 1 }],
  activities: [{ description: 'Alvenaria de vedação no 4º pavimento', quantity: 24, unit: 'm²', location: '4º Pav' }],
  materials: [{ name: 'Bloco de Concreto', supplier: 'Blocos SP', invoice: 'NF-1002' }],
  occurrences: [{ type: 'dds', description: 'Diálogo diário de segurança sobre trabalho em altura' }],
  photos: [],
  comments: [],
  locked: false,
};

describe('RDO Export Modal Restructuring & Direct PDF Download', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    mockCurrentPlatform = 'web';
    container = document.createElement('div');
    document.body.appendChild(container);
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

  const renderWithProviders = async (ui: React.ReactNode) => {
    await act(async () => {
      root!.render(
        <AuthProvider>
          <RDOProvider initialWorks={[mockWork]} initialRdos={[mockRdo]}>
            <AdminProvider
              initialWorks={[
                {
                  id: mockWork.id,
                  name: mockWork.name,
                  subtitle: mockWork.subtitle,
                  address: 'Rua das Flores 100',
                  client: 'StackLab',
                  active: true,
                },
              ]}
            >
              {ui}
            </AdminProvider>
          </RDOProvider>
        </AuthProvider>,
      );
    });
  };

  describe('Requirement R1: Selectable Export Options in useRDOReview Hook', () => {
    it('initializes selectedExportFormat as "pdf" by default and keeps preview modal closed', async () => {
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await renderWithProviders(<TestComponent />);

      expect(hookValue.selectedExportFormat).toBe('pdf');
      expect(hookValue.pdfPreviewOpen).toBe(false);
      expect(hookValue.exportDialogOpen).toBe(false);
    });

    it('allows changing selectedExportFormat to "csv" and "photos"', async () => {
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await renderWithProviders(<TestComponent />);

      act(() => {
        hookValue.setSelectedExportFormat('csv');
      });
      expect(hookValue.selectedExportFormat).toBe('csv');

      act(() => {
        hookValue.setSelectedExportFormat('photos');
      });
      expect(hookValue.selectedExportFormat).toBe('photos');

      act(() => {
        hookValue.setSelectedExportFormat('pdf');
      });
      expect(hookValue.selectedExportFormat).toBe('pdf');
    });
  });

  describe('Requirement R2 & R3: Direct Download without Preview Modal in Hook', () => {
    it('on Web: triggers direct PDF download without opening RdoPdfPreviewModal', async () => {
      mockCurrentPlatform = 'web';
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await renderWithProviders(<TestComponent />);

      act(() => {
        hookValue.setExportDialogOpen(true);
      });
      expect(hookValue.exportDialogOpen).toBe(true);

      act(() => {
        hookValue.handleExport('pdf');
      });

      // Dialog is closed
      expect(hookValue.exportDialogOpen).toBe(false);
      // RdoPdfPreviewModal is strictly NOT opened
      expect(hookValue.pdfPreviewOpen).toBe(false);
      // triggerWebPdfDownload is invoked directly
      expect(triggerWebPdfDownload).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'rdo-test-100', number: 100 }),
        expect.anything(),
      );
      // Success alert is shown
      expect(mockAlert).toHaveBeenCalledWith(
        'Exportação Concluída',
        'Relatório Final PDF emitido com padrão oficial StackLab.',
      );
    });

    it('on Mobile (iOS): directly opens PDF preview modal without invoking Share.share or triggerWebPdfDownload', async () => {
      mockCurrentPlatform = 'ios';
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await renderWithProviders(<TestComponent />);

      act(() => {
        hookValue.setExportDialogOpen(true);
      });

      act(() => {
        hookValue.handleExport('pdf');
      });

      // Dialog is closed
      expect(hookValue.exportDialogOpen).toBe(false);
      // RdoPdfPreviewModal is directly opened
      expect(hookValue.pdfPreviewOpen).toBe(true);
      // Native Share.share is strictly NOT invoked
      expect(mockShare).not.toHaveBeenCalled();
      // Web download is strictly NOT invoked on mobile
      expect(triggerWebPdfDownload).not.toHaveBeenCalled();
      // Generic completion alert is NOT shown (preview modal opened directly)
      expect(mockAlert).not.toHaveBeenCalled();
    });

    it('on Mobile (Android): directly opens PDF preview modal without invoking Share.share or triggerWebPdfDownload', async () => {
      mockCurrentPlatform = 'android';
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await renderWithProviders(<TestComponent />);

      act(() => {
        hookValue.setExportDialogOpen(true);
      });

      act(() => {
        hookValue.handleExport('pdf');
      });

      // Dialog is closed
      expect(hookValue.exportDialogOpen).toBe(false);
      // RdoPdfPreviewModal is directly opened
      expect(hookValue.pdfPreviewOpen).toBe(true);
      // Native Share.share is strictly NOT invoked
      expect(mockShare).not.toHaveBeenCalled();
      // Web download is strictly NOT invoked on mobile
      expect(triggerWebPdfDownload).not.toHaveBeenCalled();
      // Generic completion alert is NOT shown
      expect(mockAlert).not.toHaveBeenCalled();
    });

    it('on Mobile: displays error alert and does not share when rdo is missing', async () => {
      mockCurrentPlatform = 'android';
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await act(async () => {
        root!.render(
          <AuthProvider>
            <RDOProvider initialWorks={[mockWork]} initialRdos={[]}>
              <AdminProvider initialWorks={[]}>
                <TestComponent />
              </AdminProvider>
            </RDOProvider>
          </AuthProvider>,
        );
      });

      act(() => {
        hookValue.handleExport('pdf');
      });

      expect(hookValue.pdfPreviewOpen).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith(
        'Erro ao Abrir PDF',
        'Relatório RDO não encontrado para visualização.',
      );
      expect(mockShare).not.toHaveBeenCalled();
      expect(triggerWebPdfDownload).not.toHaveBeenCalled();
    });

    it('on Web: displays error alert when rdo is missing', async () => {
      mockCurrentPlatform = 'web';
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await act(async () => {
        root!.render(
          <AuthProvider>
            <RDOProvider initialWorks={[mockWork]} initialRdos={[]}>
              <AdminProvider initialWorks={[]}>
                <TestComponent />
              </AdminProvider>
            </RDOProvider>
          </AuthProvider>,
        );
      });

      act(() => {
        hookValue.handleExport('pdf');
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Erro ao Baixar PDF',
        'Relatório RDO não encontrado para download.',
      );
      expect(triggerWebPdfDownload).not.toHaveBeenCalled();
      expect(mockShare).not.toHaveBeenCalled();
    });

    it('triggers CSV export on Web when CSV format is selected', async () => {
      mockCurrentPlatform = 'web';
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await renderWithProviders(<TestComponent />);

      act(() => {
        hookValue.handleExport('csv');
      });

      expect(hookValue.pdfPreviewOpen).toBe(false);
      expect(triggerWebCsvDownload).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'rdo-test-100', number: 100 }),
        expect.anything(),
      );
      expect(mockAlert).toHaveBeenCalledWith(
        'Exportação Concluída',
        'Planilha CSV com dados analíticos exportada para download.',
      );
    });

    it('triggers Photos export feedback when photos format is selected', async () => {
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await renderWithProviders(<TestComponent />);

      act(() => {
        hookValue.handleExport('photos');
      });

      expect(hookValue.pdfPreviewOpen).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith(
        'Exportação Concluída',
        'Acervo fotográfico compactado em lote com marcas d’água.',
      );
    });

    it('uses selectedExportFormat when handleExport is called without explicit parameter', async () => {
      mockCurrentPlatform = 'web';
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      await renderWithProviders(<TestComponent />);

      act(() => {
        hookValue.setSelectedExportFormat('csv');
      });

      act(() => {
        hookValue.handleExport();
      });

      expect(triggerWebCsvDownload).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith(
        'Exportação Concluída',
        'Planilha CSV com dados analíticos exportada para download.',
      );
    });

    it('handles mobile PDF preview opening failure gracefully with error alert', async () => {
      mockCurrentPlatform = 'android';
      let hookValue!: ReturnType<typeof useRDOReview>;
      const TestComponent = () => {
        hookValue = useRDOReview();
        return null;
      };

      let stateCount = 0;
      const originalUseState = React.useState;
      const useStateSpy = jest.spyOn(React, 'useState').mockImplementation(((initial: any) => {
        stateCount++;
        // The 18th useState inside useRDOReview is [pdfPreviewOpen, setPdfPreviewOpen]
        if (stateCount === 18) {
          return [
            false,
            () => {
              throw new Error('Falha simulada ao renderizar visualizador');
            },
          ];
        }
        return originalUseState(initial);
      }) as any);

      await renderWithProviders(<TestComponent />);

      act(() => {
        hookValue.handleExport('pdf');
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Erro ao Abrir PDF',
        'Falha simulada ao renderizar visualizador',
      );
      expect(mockShare).not.toHaveBeenCalled();
      expect(triggerWebPdfDownload).not.toHaveBeenCalled();

      useStateSpy.mockRestore();
    });
  });

  describe('UI Component: RDOReviewView Export Modal (R1, R2, R3)', () => {
    it('renders all 3 export options as selectable items inside the export dialog', async () => {
      await renderWithProviders(<RDOReviewView />);

      // Find and click the header export button to open the modal
      const exportHeaderBtn = container!.querySelector('[aria-label="Exportar ativos do RDO"]') as HTMLElement;
      expect(exportHeaderBtn).toBeTruthy();

      await act(async () => {
        exportHeaderBtn.click();
      });

      // Verify Dialog header and description
      expect(container!.textContent).toContain('Exportar Ativos do RDO');
      expect(container!.textContent).toContain('Selecione o formato de exportação desejado:');

      // Verify Option 1: PDF Oficial
      const pdfOption = container!.querySelector('[data-testid="export-option-pdf"]') as HTMLElement;
      expect(pdfOption).toBeTruthy();
      expect(pdfOption.textContent).toContain('PDF Oficial');
      expect(pdfOption.textContent).toContain('Relatório executivo homologado no padrão StackLab.');
      expect(pdfOption.getAttribute('aria-selected')).toBe('true');

      // Verify Option 2: CSV
      const csvOption = container!.querySelector('[data-testid="export-option-csv"]') as HTMLElement;
      expect(csvOption).toBeTruthy();
      expect(csvOption.textContent).toContain('Exportar Planilha Analítica (CSV)');
      expect(csvOption.textContent).toContain('Planilha detalhada de mão de obra, equipamentos e atividades.');
      expect(csvOption.getAttribute('aria-selected')).toBe('false');

      // Verify Option 3: Photos ZIP
      const photosOption = container!.querySelector('[data-testid="export-option-photos"]') as HTMLElement;
      expect(photosOption).toBeTruthy();
      expect(photosOption.textContent).toContain('Download em Lote de Fotos (ZIP)');
      expect(photosOption.textContent).toContain('Acervo fotográfico da obra com marcas d’água de segurança.');
      expect(photosOption.getAttribute('aria-selected')).toBe('false');

      // Verify bottom action buttons: "Baixar" and "Fechar"
      const baixarBtn = container!.querySelector('[aria-label="Baixar"]') as HTMLElement;
      expect(baixarBtn).toBeTruthy();
      expect(baixarBtn.textContent).toContain('Baixar');

      const fecharBtn = container!.querySelector('[aria-label="Fechar"]') as HTMLElement;
      expect(fecharBtn).toBeTruthy();
      expect(fecharBtn.textContent).toContain('Fechar');
    });

    it('updates selection when user clicks a different export option card', async () => {
      await renderWithProviders(<RDOReviewView />);

      const exportHeaderBtn = container!.querySelector('[aria-label="Exportar ativos do RDO"]') as HTMLElement;
      await act(async () => {
        exportHeaderBtn.click();
      });

      const pdfOption = container!.querySelector('[data-testid="export-option-pdf"]') as HTMLElement;
      const csvOption = container!.querySelector('[data-testid="export-option-csv"]') as HTMLElement;
      const photosOption = container!.querySelector('[data-testid="export-option-photos"]') as HTMLElement;

      expect(pdfOption.getAttribute('aria-selected')).toBe('true');
      expect(csvOption.getAttribute('aria-selected')).toBe('false');

      // Click CSV option
      await act(async () => {
        csvOption.click();
      });

      expect(pdfOption.getAttribute('aria-selected')).toBe('false');
      expect(csvOption.getAttribute('aria-selected')).toBe('true');
      expect(photosOption.getAttribute('aria-selected')).toBe('false');

      // Click Photos option
      await act(async () => {
        photosOption.click();
      });

      expect(pdfOption.getAttribute('aria-selected')).toBe('false');
      expect(csvOption.getAttribute('aria-selected')).toBe('false');
      expect(photosOption.getAttribute('aria-selected')).toBe('true');
    });

    it('clicking "Baixar" executes export for the currently selected format', async () => {
      mockCurrentPlatform = 'web';
      await renderWithProviders(<RDOReviewView />);

      const exportHeaderBtn = container!.querySelector('[aria-label="Exportar ativos do RDO"]') as HTMLElement;
      await act(async () => {
        exportHeaderBtn.click();
      });

      // Default selected format is PDF
      const baixarBtn = container!.querySelector('[aria-label="Baixar"]') as HTMLElement;
      await act(async () => {
        baixarBtn.click();
      });

      // Verify PDF download was called and alert shown
      expect(triggerWebPdfDownload).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'rdo-test-100' }),
        expect.anything(),
      );
      expect(mockAlert).toHaveBeenCalledWith(
        'Exportação Concluída',
        'Relatório Final PDF emitido com padrão oficial StackLab.',
      );

      // Verify preview modal was NOT rendered
      const previewModal = container!.querySelector('[data-testid="modal"]');
      expect(previewModal).toBeNull();
    });

    it('on mobile: clicking "Baixar" opens RdoPdfPreviewModal directly without native share', async () => {
      mockCurrentPlatform = 'android';
      await renderWithProviders(<RDOReviewView />);

      const exportHeaderBtn = container!.querySelector('[aria-label="Exportar ativos do RDO"]') as HTMLElement;
      await act(async () => {
        exportHeaderBtn.click();
      });

      // Default selected format is PDF
      const baixarBtn = container!.querySelector('[aria-label="Baixar"]') as HTMLElement;
      await act(async () => {
        baixarBtn.click();
      });

      // Verify PDF preview modal was rendered
      const previewModal = container!.querySelector('[data-testid="modal"]');
      expect(previewModal).toBeTruthy();
      expect(container!.textContent).toContain('Relatório Oficial RDO #100');

      // Native share and web download were not called
      expect(mockShare).not.toHaveBeenCalled();
      expect(triggerWebPdfDownload).not.toHaveBeenCalled();
    });

    it('selecting CSV and clicking "Baixar" exports CSV and closes modal', async () => {
      mockCurrentPlatform = 'web';
      await renderWithProviders(<RDOReviewView />);

      const exportHeaderBtn = container!.querySelector('[aria-label="Exportar ativos do RDO"]') as HTMLElement;
      await act(async () => {
        exportHeaderBtn.click();
      });

      const csvOption = container!.querySelector('[data-testid="export-option-csv"]') as HTMLElement;
      await act(async () => {
        csvOption.click();
      });

      const baixarBtn = container!.querySelector('[aria-label="Baixar"]') as HTMLElement;
      await act(async () => {
        baixarBtn.click();
      });

      expect(triggerWebCsvDownload).toHaveBeenCalled();
      expect(triggerWebPdfDownload).not.toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith(
        'Exportação Concluída',
        'Planilha CSV com dados analíticos exportada para download.',
      );
    });

    it('clicking "Fechar" dismisses the modal without triggering export', async () => {
      await renderWithProviders(<RDOReviewView />);

      const exportHeaderBtn = container!.querySelector('[aria-label="Exportar ativos do RDO"]') as HTMLElement;
      await act(async () => {
        exportHeaderBtn.click();
      });

      const fecharBtn = container!.querySelector('[aria-label="Fechar"]') as HTMLElement;
      expect(fecharBtn).toBeTruthy();

      await act(async () => {
        fecharBtn.click();
      });

      expect(triggerWebPdfDownload).not.toHaveBeenCalled();
      expect(triggerWebCsvDownload).not.toHaveBeenCalled();
      expect(mockShare).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });
});
