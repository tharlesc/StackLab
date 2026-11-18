/**
 * @jest-environment jsdom
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native', () => {
  (globalThis as any).__DEV__ = true;
  const React = require('react');
  const platformObj = {
    OS: 'ios',
    select: (obj: any) => obj?.[platformObj.OS] ?? obj?.default,
  };
  (globalThis as any).__MOCK_PLATFORM__ = platformObj;
  return {
    Alert: { alert: (...args: any[]) => (globalThis as any).__MOCK_ALERT__?.(...args) },
    Platform: platformObj,
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    Modal: ({ children, visible }: any) => (visible ? <div>{children}</div> : null),
    KeyboardAvoidingView: ({ children }: any) => <div>{children}</div>,
    Keyboard: { dismiss: jest.fn() },
    View: ({ children, testID, ...props }: any) => <div data-testid={testID} {...props}>{children}</div>,
    Text: ({ children, testID, ...props }: any) => <span data-testid={testID} {...props}>{children}</span>,
    TextInput: ({ testID, ...props }: any) => <input data-testid={testID} {...props} />,
    TouchableOpacity: ({ children, onPress, ...props }: any) => <button onClick={onPress} {...props}>{children}</button>,
    ScrollView: ({ children, ...props }: any) => <div>{children}</div>,
    Image: (props: any) => <img {...props} />,
    ActivityIndicator: () => null,
  };
});

const mockAlert = jest.fn();
(globalThis as any).__MOCK_ALERT__ = mockAlert;
let mockSearchParams: Record<string, any> = {};

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

jest.mock('styled-components/native', () => {
  const { lightTheme } = require('@/constants/theme');
  const React = require('react');

  const createComponent = (Comp: any) => {
    const fn: any = (..._args: any[]) => {
      const comp: any = (props: any) => {
        const cleanProps: any = {};
        for (const key of Object.keys(props)) {
          if (key === 'onPress') {
            cleanProps.onClick = props.onPress;
          } else if (!key.startsWith('$') && key !== 'activeOpacity') {
            cleanProps[key] = props[key];
          }
        }
        if (typeof Comp === 'function') {
          return React.createElement(Comp, { ...props, ...cleanProps });
        }
        return React.createElement(typeof Comp === 'string' ? Comp : 'div', cleanProps);
      };
      comp.attrs = (_attrs: any) => fn;
      return comp;
    };
    fn.attrs = (_attrs: any) => fn;
    return fn;
  };

  const styledFn: any = (Comp: any) => createComponent(Comp);
  const proxy = new Proxy(styledFn, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      if (prop === 'TouchableOpacity') return createComponent('button');
      return createComponent(String(prop).toLowerCase());
    },
  });

  return {
    __esModule: true,
    default: proxy,
    useTheme: () => lightTheme,
    ThemeProvider: ({ children }: any) => children,
    css: (..._args: any[]) => '',
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNewRDO, STEPS } from '@/hooks';
import { NewRDOView } from '../screens/NewRDO/NewRDOView';
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
          <RDOProvider initialWorks={MOCK_ACTIVE_WORKS}>
            <TestConsumer />
          </RDOProvider>
        </AuthProvider>,
      );
    });
  };

  beforeEach(async () => {
    (globalThis as any).__MOCK_PLATFORM__.OS = 'ios';
    mockSearchParams = {};
    delete (globalThis as any).__EXPO_IMAGE_PICKER_MOCK__;
    mockAlert.mockClear();
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

  it('selects a work and starts a new draft with 8 steps including preview', async () => {
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
      hookValue!.handleCapturePhoto('Armação de pilares do bloco B', {
        uri: 'blob:camera-photo-2',
        takenAt: '2026-04-20T14:30:00.000Z',
      });
    });

    expect(hookValue!.activeDraft?.photos).toHaveLength(2);
    const photo = hookValue!.activeDraft?.photos[0]!;
    expect(photo.caption).toBe('Concretagem de laje do bloco A');
    expect(photo.source).toBe('camera');
    expect(photo.metadata).toBeDefined();
    expect(photo.metadata?.source).toBe('camera');
    expect(photo.metadata?.latitude).toBe(-2.5307);
    expect(photo.metadata?.longitude).toBe(-44.3068);

    const secondPhoto = hookValue!.activeDraft?.photos[1]!;
    expect(secondPhoto.caption).toBe('Armação de pilares do bloco B');
    expect(secondPhoto.source).toBe('camera');
    expect(secondPhoto.uri).toBe('blob:camera-photo-2');
    expect(secondPhoto.metadata?.originalTakenAt).toBe('2026-04-20T14:30:00.000Z');
  });

  it('uploads multiple photos from gallery and updates photo captions', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });
    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    await act(async () => {
      hookValue!.handleUploadPhotos([
        {
          uri: 'blob:gallery-1',
          caption: 'Vista geral do canteiro',
          takenAt: '2026-04-19T10:00:00.000Z',
          fileName: 'canteiro_01.jpg',
        },
        {
          uri: 'blob:gallery-2',
          takenAt: '2026-04-19T11:15:00.000Z',
          fileName: 'fundacao_bloco_c.jpg',
        },
      ]);
    });

    expect(hookValue!.activeDraft?.photos).toHaveLength(2);

    const galleryPhoto1 = hookValue!.activeDraft?.photos[0]!;
    expect(galleryPhoto1.source).toBe('gallery');
    expect(galleryPhoto1.caption).toBe('Vista geral do canteiro');
    expect(galleryPhoto1.uri).toBe('blob:gallery-1');
    expect(galleryPhoto1.metadata?.source).toBe('gallery');
    expect(galleryPhoto1.metadata?.originalTakenAt).toBe('2026-04-19T10:00:00.000Z');
    expect(galleryPhoto1.metadata?.latitude).toBe(-2.5307);
    expect(galleryPhoto1.metadata?.longitude).toBe(-44.3068);

    const galleryPhoto2 = hookValue!.activeDraft?.photos[1]!;
    expect(galleryPhoto2.source).toBe('gallery');
    expect(galleryPhoto2.caption).toBe('fundacao_bloco_c.jpg');
    expect(galleryPhoto2.uri).toBe('blob:gallery-2');
    expect(galleryPhoto2.metadata?.source).toBe('gallery');

    await act(async () => {
      hookValue!.updatePhotoCaption(1, 'Fundação concluída no bloco C');
    });

    expect(hookValue!.activeDraft?.photos[1]?.caption).toBe('Fundação concluída no bloco C');

    await act(async () => {
      hookValue!.removePhotoEntry(0);
    });

    expect(hookValue!.activeDraft?.photos).toHaveLength(1);
    expect(hookValue!.activeDraft?.photos[0]?.caption).toBe('Fundação concluída no bloco C');
  });

  it('wires mobile Web file input overlays and Native expo-image-picker camera/gallery handlers in NewRDOView', () => {
    const fs = require('fs');
    const path = require('path');
    const candidatePaths = [
      path.resolve('src/screens/NewRDO/NewRDOView.tsx'),
      path.resolve('client/src/screens/NewRDO/NewRDOView.tsx'),
    ];
    const targetPath = candidatePaths.find((p: string) => fs.existsSync(p))!;
    const viewSource = fs.readFileSync(targetPath, 'utf8');

    // Web overlay style guarantees direct mobile browser tap without gesture/popup blocking
    expect(viewSource).toContain('WEB_FILE_INPUT_OVERLAY_STYLE');
    expect(viewSource).toContain("position: 'absolute'");
    expect(viewSource).toContain("width: '100%'");
    expect(viewSource).toContain("height: '100%'");
    expect(viewSource).toContain('opacity: 0');

    // Web camera & gallery inputs
    expect(viewSource).toContain("type: 'file'");
    expect(viewSource).toContain("accept: 'image/*'");
    expect(viewSource).toContain("capture: 'environment'");
    expect(viewSource).toContain("'data-testid': 'camera-file-input'");
    expect(viewSource).toContain("'data-testid': 'sequential-camera-file-input'");
    expect(viewSource).toContain("'data-testid': 'gallery-file-input'");
    expect(viewSource).toContain('readAsDataURL');

    // Native (iOS / Android) expo-image-picker camera & multi-select gallery
    expect(viewSource).toContain('launchCameraAsync');
    expect(viewSource).toContain('launchImageLibraryAsync');
    expect(viewSource).toContain('allowsMultipleSelection: true');
  });

  it('handles simultaneous camera and gallery uploads in the same draft without regression', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });
    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    // 1. Fotos tiradas pela câmera (individual e sequencial)
    await act(async () => {
      hookValue!.handleCapturePhoto('Concretagem piso 1', {
        uri: 'blob:camera-capture-1',
        takenAt: '2026-04-20T10:00:00.000Z',
        source: 'camera',
      });
      hookValue!.handleCapturePhoto('Armação pilar sul', {
        uri: 'blob:camera-capture-2',
        takenAt: '2026-04-20T10:05:00.000Z',
        source: 'camera',
      });
    });

    expect(hookValue!.activeDraft?.photos).toHaveLength(2);
    expect(hookValue!.activeDraft?.photos[0]?.source).toBe('camera');
    expect(hookValue!.activeDraft?.photos[0]?.metadata?.source).toBe('camera');
    expect(hookValue!.activeDraft?.photos[1]?.source).toBe('camera');
    expect(hookValue!.activeDraft?.photos[1]?.metadata?.source).toBe('camera');

    // 2. Fotos anexadas da galeria (múltipla seleção)
    await act(async () => {
      hookValue!.handleUploadPhotos([
        {
          uri: 'blob:gallery-img-1',
          caption: 'Fachada frontal do edifício',
          takenAt: '2026-04-20T08:00:00.000Z',
          fileName: 'fachada_frontal.jpg',
        },
        {
          uri: 'blob:gallery-img-2',
          fileName: 'bloco_b_estrutural.png',
        },
      ]);
    });

    expect(hookValue!.activeDraft?.photos).toHaveLength(4);

    // Valida preservação de dados e distinção de origem (Câmera vs Galeria)
    const camPhoto1 = hookValue!.activeDraft?.photos[0]!;
    expect(camPhoto1.source).toBe('camera');
    expect(camPhoto1.caption).toBe('Concretagem piso 1');
    expect(camPhoto1.metadata?.source).toBe('camera');
    expect(camPhoto1.metadata?.workId).toBe(MOCK_ACTIVE_WORKS[0]!.id);

    const camPhoto2 = hookValue!.activeDraft?.photos[1]!;
    expect(camPhoto2.source).toBe('camera');
    expect(camPhoto2.caption).toBe('Armação pilar sul');

    const galPhoto1 = hookValue!.activeDraft?.photos[2]!;
    expect(galPhoto1.source).toBe('gallery');
    expect(galPhoto1.caption).toBe('Fachada frontal do edifício');
    expect(galPhoto1.uri).toBe('blob:gallery-img-1');
    expect(galPhoto1.metadata?.source).toBe('gallery');
    expect(galPhoto1.metadata?.originalTakenAt).toBe('2026-04-20T08:00:00.000Z');
    expect(galPhoto1.metadata?.workId).toBe(MOCK_ACTIVE_WORKS[0]!.id);
    expect(galPhoto1.metadata?.workName).toBe(MOCK_ACTIVE_WORKS[0]!.name);
    expect(galPhoto1.metadata?.latitude).toBe(-2.5307);
    expect(galPhoto1.metadata?.longitude).toBe(-44.3068);
    expect(galPhoto1.metadata?.hash).toMatch(/^SHA256-/);

    const galPhoto2 = hookValue!.activeDraft?.photos[3]!;
    expect(galPhoto2.source).toBe('gallery');
    expect(galPhoto2.caption).toBe('bloco_b_estrutural.png');
    expect(galPhoto2.metadata?.source).toBe('gallery');

    // 3. Edição de legenda da foto de galeria sem afetar fotos da câmera
    await act(async () => {
      hookValue!.updatePhotoCaption(3, 'Estrutura metálica montada Bloco B');
    });
    expect(hookValue!.activeDraft?.photos[3]?.caption).toBe('Estrutura metálica montada Bloco B');
    expect(hookValue!.activeDraft?.photos[0]?.caption).toBe('Concretagem piso 1');

    // 4. Remoção de foto da câmera mantém as demais intactas
    await act(async () => {
      hookValue!.removePhotoEntry(0);
    });
    expect(hookValue!.activeDraft?.photos).toHaveLength(3);
    expect(hookValue!.activeDraft?.photos[0]?.caption).toBe('Armação pilar sul');
    expect(hookValue!.activeDraft?.photos[0]?.source).toBe('camera');
    expect(hookValue!.activeDraft?.photos[1]?.caption).toBe('Fachada frontal do edifício');
    expect(hookValue!.activeDraft?.photos[1]?.source).toBe('gallery');
  });

  it('validates mobile gallery trigger, multiple selection, permission handling and UI badges in NewRDOView', () => {
    const fs = require('fs');
    const path = require('path');
    const candidatePaths = [
      path.resolve('src/screens/NewRDO/NewRDOView.tsx'),
      path.resolve('client/src/screens/NewRDO/NewRDOView.tsx'),
    ];
    const targetPath = candidatePaths.find((p: string) => fs.existsSync(p))!;
    const viewSource = fs.readFileSync(targetPath, 'utf8');

    // Botão de upload da galeria
    expect(viewSource).toContain('🖼️ Enviar Fotos da Galeria (Upload)');
    expect(viewSource).toContain("'data-testid': 'gallery-file-input'");
    expect(viewSource).toContain('multiple: true');
    expect(viewSource).toContain("fontSize: '200px'");
    expect(viewSource).toContain('fullWidth');

    // Expo Image Picker nativo e permissões
    expect(viewSource).toContain('allowsMultipleSelection: true');
    expect(viewSource).toContain('requestMediaLibraryPermissionsAsync');
    expect(viewSource).toContain(
      'Permita o acesso à galeria de fotos nas configurações do celular para enviar imagens da obra.',
    );

    // Selos identificadores e marcas d'água de segurança
    expect(viewSource).toContain('PhotoOriginBadge');
    expect(viewSource).toContain('🖼️ Importada da Galeria');
    expect(viewSource).toContain('Importada da Galeria');
    expect(viewSource).toContain('🖼️ IMPORTADA DA GALERIA • StackLab Security Watermark');
    expect(viewSource).toContain('📷 CAPTURADA NA OBRA (CÂMERA) • StackLab Security Watermark');
  });

  it('adversarially probes gallery upload edge cases: empty array does not mutate, invalid date string safely falls back, and photo caption updates without side-effects', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });
    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    // 1. Calling handleUploadPhotos with empty array must NOT add any photo
    await act(async () => {
      hookValue!.handleUploadPhotos([]);
    });
    expect(hookValue!.activeDraft?.photos).toHaveLength(0);

    // 2. Calling with an invalid takenAt string must safely fall back without throwing
    await act(async () => {
      hookValue!.handleUploadPhotos([
        {
          uri: 'data:image/heic;base64,mockHeicBytes...',
          takenAt: 'not-a-valid-date-string',
          fileName: 'bloco_c_fachada.HEIC',
        },
      ]);
    });
    expect(hookValue!.activeDraft?.photos).toHaveLength(1);
    const photo = hookValue!.activeDraft?.photos[0]!;
    expect(photo.source).toBe('gallery');
    expect(photo.caption).toBe('bloco_c_fachada.HEIC');
    expect(photo.metadata?.source).toBe('gallery');
    expect(photo.metadata?.workId).toBe(MOCK_ACTIVE_WORKS[0]!.id);

    // 3. Updating caption with new string
    await act(async () => {
      hookValue!.updatePhotoCaption(0, 'Nova legenda corrigida da laje');
    });
    expect(hookValue!.activeDraft?.photos[0]?.caption).toBe('Nova legenda corrigida da laje');

    // 4. Removing the only photo leaves empty array
    await act(async () => {
      hookValue!.removePhotoEntry(0);
    });
    expect(hookValue!.activeDraft?.photos).toHaveLength(0);
  });

  it('empirically executes native image picker integration in NewRDOView: permission rejection, cancellation, and multi-selection', async () => {
    const work = MOCK_ACTIVE_WORKS[0]!;
    const draftKey = `@stacklab:rdo_draft_${work.id}`;

    // Seed draft with step 5 (Fotos na Obra) reachable
    const seededDraft = {
      id: `rdo-test-${Date.now()}`,
      number: 101,
      version: 1,
      workId: work.id,
      workName: work.name,
      date: '20/04/2026',
      authorId: 'user-test',
      authorName: 'Engenheiro Teste',
      weather: [{ shift: 'Manhã', condition: 'Ensolarado', stoppageHours: 0 }],
      labor: [{ role: 'Pedreiro', quantity: 2, hours: 8, isContractor: false }],
      equipment: [],
      activities: [{ description: 'Frente de alvenaria', location: 'Bloco A', unit: 'm²', quantity: 20, progress: 50, status: 'Em andamento' }],
      occurrences: [],
      photos: [],
      materials: [],
      status: 'rascunho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(draftKey, JSON.stringify(seededDraft));

    mockSearchParams = { workId: work.id };
    (globalThis as any).__MOCK_PLATFORM__.OS = 'ios';

    let viewRoot: ReturnType<typeof createRoot> | null = null;
    const viewContainer = document.createElement('div');
    document.body.appendChild(viewContainer);
    viewRoot = createRoot(viewContainer);

    await act(async () => {
      viewRoot!.render(
        <AuthProvider>
          <RDOProvider initialWorks={MOCK_ACTIVE_WORKS}>
            <NewRDOView />
          </RDOProvider>
        </AuthProvider>,
      );
    });

    // Allow async loadDraft and state initialization to settle
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Advance to step 5 (Fotos)
    const allElements = Array.from(viewContainer.querySelectorAll('*'));
    const fotoTab = allElements.find((el) =>
      el.getAttribute('accessibilitylabel')?.includes('Passo 6: Fotos') ||
      el.getAttribute('aria-label')?.includes('Passo 6: Fotos')
    );
    expect(fotoTab).toBeDefined();
    await act(async () => {
      (fotoTab as HTMLElement).click();
    });

    // A) Permission Denied -> triggers Alert, zero photos
    (globalThis as any).__EXPO_IMAGE_PICKER_MOCK__ = {
      requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, status: 'denied' }),
      launchImageLibraryAsync: jest.fn(),
    };

    const buttons = Array.from(viewContainer.querySelectorAll('button'));
    const galleryButton = buttons.find((btn) => btn.textContent?.includes('Enviar Fotos da Galeria'));
    expect(galleryButton).toBeDefined();

    await act(async () => {
      galleryButton!.click();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Permissão necessária',
      expect.stringContaining('Permita o acesso à galeria de fotos'),
    );
    expect((globalThis as any).__EXPO_IMAGE_PICKER_MOCK__.launchImageLibraryAsync).not.toHaveBeenCalled();

    // B) User cancels -> no alert, no photos added
    mockAlert.mockClear();
    (globalThis as any).__EXPO_IMAGE_PICKER_MOCK__ = {
      requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
      launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
    };

    await act(async () => {
      galleryButton!.click();
    });

    expect(mockAlert).not.toHaveBeenCalled();
    expect(viewContainer.textContent).not.toContain('🖼️ Importada da Galeria');

    // C) Multi-select -> photos added with badge and watermark
    (globalThis as any).__EXPO_IMAGE_PICKER_MOCK__ = {
      requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
      launchImageLibraryAsync: jest.fn().mockResolvedValue({
        canceled: false,
        assets: [
          { uri: 'file:///gallery/img1.jpg', fileName: 'fundacao_bloco_a.jpg' },
          { uri: 'file:///gallery/img2.jpg', fileName: 'fundacao_bloco_b.jpg' },
        ],
      }),
    };

    await act(async () => {
      galleryButton!.click();
    });

    // Verify both photos are rendered with the required badge and watermark
    expect(viewContainer.textContent).toContain('Fotos Anexadas (2)');
    expect(viewContainer.textContent).toContain('🖼️ Importada da Galeria');
    expect(viewContainer.textContent).toContain('IMPORTADA DA GALERIA • StackLab Security Watermark');

    // Check that captions are loaded into inputs
    const photoInputs = Array.from(viewContainer.querySelectorAll('input'));
    expect(photoInputs.some((inp) => (inp as HTMLInputElement).value === 'fundacao_bloco_a')).toBe(true);
    expect(photoInputs.some((inp) => (inp as HTMLInputElement).value === 'fundacao_bloco_b')).toBe(true);

    // D) Native picker exception handling -> caught gracefully without crash
    (globalThis as any).__EXPO_IMAGE_PICKER_MOCK__ = {
      requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
      launchImageLibraryAsync: jest.fn().mockRejectedValue(new Error('Hardware memory failure')),
    };

    await act(async () => {
      galleryButton!.click();
    });

    // Still has the 2 previous photos without duplicating or crashing
    expect(viewContainer.textContent).toContain('Fotos Anexadas (2)');

    await act(async () => {
      viewRoot!.unmount();
    });
    viewContainer.remove();
  });

  it('empirically executes web mobile file input overlay and photo removal in NewRDOView', async () => {
    const work = MOCK_ACTIVE_WORKS[0]!;
    const draftKey = `@stacklab:rdo_draft_${work.id}`;

    const seededDraft = {
      id: `rdo-test-web-${Date.now()}`,
      number: 102,
      version: 1,
      workId: work.id,
      workName: work.name,
      date: '20/04/2026',
      authorId: 'user-test',
      authorName: 'Engenheiro Teste',
      weather: [{ shift: 'Manhã', condition: 'Ensolarado', stoppageHours: 0 }],
      labor: [{ role: 'Pedreiro', quantity: 2, hours: 8, isContractor: false }],
      equipment: [],
      activities: [{ description: 'Frente de alvenaria', location: 'Bloco A', unit: 'm²', quantity: 20, progress: 50, status: 'Em andamento' }],
      occurrences: [],
      photos: [],
      materials: [],
      status: 'rascunho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(draftKey, JSON.stringify(seededDraft));

    mockSearchParams = { workId: work.id };
    (globalThis as any).__MOCK_PLATFORM__.OS = 'web';

    let viewRoot: ReturnType<typeof createRoot> | null = null;
    const viewContainer = document.createElement('div');
    document.body.appendChild(viewContainer);
    viewRoot = createRoot(viewContainer);

    await act(async () => {
      viewRoot!.render(
        <AuthProvider>
          <RDOProvider initialWorks={MOCK_ACTIVE_WORKS}>
            <NewRDOView />
          </RDOProvider>
        </AuthProvider>,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Advance to step 5 (Fotos)
    const allElements = Array.from(viewContainer.querySelectorAll('*'));
    const fotoTab = allElements.find((el) =>
      el.getAttribute('accessibilitylabel')?.includes('Passo 6: Fotos') ||
      el.getAttribute('aria-label')?.includes('Passo 6: Fotos')
    );
    expect(fotoTab).toBeDefined();
    await act(async () => {
      (fotoTab as HTMLElement).click();
    });

    // On web, verify transparent overlay input exists
    const galleryInput = viewContainer.querySelector('input[data-testid="gallery-file-input"]') as HTMLInputElement;
    expect(galleryInput).not.toBeNull();
    expect(galleryInput.type).toBe('file');
    expect(galleryInput.multiple).toBe(true);

    // Simulate file selection with HEIC and PNG files
    const mockFile1 = new File(['fake-bytes-1'], 'vistoria_terreno.heic', {
      type: 'image/heic',
      lastModified: 1776600000000,
    });
    const mockFile2 = new File(['fake-bytes-2'], 'canteiro_bloco_a.png', {
      type: 'image/png',
      lastModified: 1776600000000,
    });

    Object.defineProperty(galleryInput, 'files', {
      value: [mockFile1, mockFile2],
      configurable: true,
    });

    await act(async () => {
      galleryInput.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(viewContainer.textContent).toContain('Fotos Anexadas (2)');
    expect(viewContainer.textContent).toContain('🖼️ Importada da Galeria');
    expect(viewContainer.textContent).toContain('IMPORTADA DA GALERIA • StackLab Security Watermark');

    // Remove one photo
    const removeButtons = Array.from(viewContainer.querySelectorAll('button')).filter((b) =>
      b.getAttribute('accessibilitylabel')?.includes('Remover foto')
    );
    expect(removeButtons.length).toBe(2);

    await act(async () => {
      removeButtons[0]!.click();
    });

    expect(viewContainer.textContent).toContain('Fotos Anexadas (1)');

    await act(async () => {
      viewRoot!.unmount();
    });
    viewContainer.remove();
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

  it('navigates through all 7 steps including preview (Revisão) and allows jumping back to edit', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });
    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    expect(hookValue!.currentStep).toBe(0);

    // Passo 0 (Clima) é válido inicialmente -> avança para o passo 1 (Efetivo)
    await act(async () => {
      const advanced = hookValue!.handleNextStep();
      expect(advanced).toBe(true);
    });
    expect(hookValue!.currentStep).toBe(1);

    // Passo 1 (Efetivo) está vazio -> não permite avançar
    expect(hookValue!.canAdvance).toBe(false);
    expect(hookValue!.stepError).toContain('Adicione ao menos 1 colaborador');
    await act(async () => {
      const advanced = hookValue!.handleNextStep();
      expect(advanced).toBe(false);
    });
    expect(hookValue!.currentStep).toBe(1);

    // Preenche o efetivo obrigatório do passo 1
    await act(async () => {
      hookValue!.addLaborEntry({
        role: 'Pedreiro',
        quantity: 2,
        hours: 8,
      });
    });
    expect(hookValue!.canAdvance).toBe(true);
    expect(hookValue!.stepError).toBeNull();

    // Avança para o passo 2 (Máquinas)
    await act(async () => {
      const advanced = hookValue!.handleNextStep();
      expect(advanced).toBe(true);
    });
    expect(hookValue!.currentStep).toBe(2);

    // Passo 2 (Máquinas) é opcional -> avança para o passo 3 (Atividades)
    expect(hookValue!.canAdvance).toBe(true);
    await act(async () => {
      const advanced = hookValue!.handleNextStep();
      expect(advanced).toBe(true);
    });
    expect(hookValue!.currentStep).toBe(3);

    // Passo 3 (Atividades) está vazio -> não permite avançar
    expect(hookValue!.canAdvance).toBe(false);
    expect(hookValue!.stepError).toContain('Cadastre ao menos 1 atividade');
    await act(async () => {
      const advanced = hookValue!.handleNextStep();
      expect(advanced).toBe(false);
    });
    expect(hookValue!.currentStep).toBe(3);

    // Preenche atividade obrigatória
    await act(async () => {
      hookValue!.addActivityEntry({
        description: 'Concretagem de vigas',
        location: '2º Pavimento',
        unit: 'm³',
        quantity: 15,
        progress: 50,
      });
    });
    expect(hookValue!.canAdvance).toBe(true);

    // Avança passo a passo até o passo 6 (Revisão & Prévia)
    for (let i = 3; i < 6; i++) {
      await act(async () => {
        hookValue!.handleNextStep();
      });
    }

    expect(hookValue!.currentStep).toBe(6);

    // Permite voltar ao passo 5 (Fotos)
    await act(async () => {
      hookValue!.handlePrevStep();
    });
    expect(hookValue!.currentStep).toBe(5);

    // Permite saltar diretamente para editar o passo 1 (Mão de Obra) a partir da prévia
    await act(async () => {
      hookValue!.goToStep(1);
    });
    expect(hookValue!.currentStep).toBe(1);
  });

  it('blocks jumping to future steps when previous steps are incomplete', async () => {
    await act(async () => {
      hookValue!.handleSelectWork(MOCK_ACTIVE_WORKS[0]!);
    });
    await act(async () => {
      await hookValue!.handleConfirmStart();
    });

    // Passo 0 (Clima) -> avança para 1
    await act(async () => {
      hookValue!.handleNextStep();
    });
    expect(hookValue!.currentStep).toBe(1);

    // Sem efetivo preenchido, tentar saltar diretamente para passo 4 ou 6 deve ser bloqueado
    expect(hookValue!.canJumpToStep(4)).toBe(false);
    expect(hookValue!.canJumpToStep(6)).toBe(false);

    await act(async () => {
      const jumped = hookValue!.goToStep(4);
      expect(jumped).toBe(false);
    });
    expect(hookValue!.currentStep).toBe(1);

    // Saltar para trás (passo 0) é sempre permitido
    expect(hookValue!.canJumpToStep(0)).toBe(true);
    await act(async () => {
      const jumped = hookValue!.goToStep(0);
      expect(jumped).toBe(true);
    });
    expect(hookValue!.currentStep).toBe(0);
  });

  it('defines 7 sequential steps in STEPS to support complete progress indicator without truncation', () => {
    expect(STEPS).toHaveLength(7);
    expect(STEPS.map((s) => s.label)).toEqual([
      'Clima',
      'Efetivo',
      'Máquinas',
      'Atividades',
      'Fatos',
      'Fotos',
      'Revisão',
    ]);
  });
});
