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

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-constants', () => ({
  default: { expoConfig: {} },
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        return (props: any) =>
          React.createElement('span', { 'data-icon': String(prop), ...props });
      },
    },
  );
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement('div', props, children),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

const mockAlert = jest.fn();
(globalThis as any).__E2E_ALERT__ = mockAlert;
let mockSearchParams: Record<string, any> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock('react-native', () => {
  (globalThis as any).__DEV__ = true;
  const React = require('react');
  const platformObj = {
    OS: 'web',
    select: (obj: any) => obj?.[platformObj.OS] ?? obj?.default,
  };
  (globalThis as any).__E2E_PLATFORM__ = platformObj;
  return {
    Alert: { alert: (...args: any[]) => (globalThis as any).__E2E_ALERT__?.(...args) },
    Platform: platformObj,
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    Modal: ({ children, visible }: any) => (visible ? <div>{children}</div> : null),
    KeyboardAvoidingView: ({ children }: any) => <div>{children}</div>,
    Keyboard: { dismiss: jest.fn() },
    View: ({ children, testID, ...props }: any) => (
      <div data-testid={testID} {...props}>
        {children}
      </div>
    ),
    Text: ({ children, testID, ...props }: any) => (
      <span data-testid={testID} {...props}>
        {children}
      </span>
    ),
    TextInput: ({ testID, ...props }: any) => <input data-testid={testID} {...props} />,
    TouchableOpacity: ({ children, onPress, ...props }: any) => (
      <button onClick={onPress} {...props}>
        {children}
      </button>
    ),
    ScrollView: ({ children, ...props }: any) => <div>{children}</div>,
    Image: ({ source, src, testID, onError, ...props }: any) => (
      <img src={source?.uri || src} data-testid={testID} onError={onError} {...props} />
    ),
    ActivityIndicator: () => null,
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

// Stateful in-memory Supabase Storage + PostgREST simulation enforcing RLS & check constraints
const mockSupabaseState = {
  baseUrl: 'https://e2e-stacklab.supabase.co',
  currentUserId: '11111111-1111-4111-8111-111111111111',
  bucket: new Map<string, { bytes: Uint8Array; contentType: string }>(),
  forceUploadError: null as string | null,
  simulateMissingUrlColumn: false,
  seqNumber: 100,
  tables: {
    obras: [] as any[],
    profiles: [] as any[],
    rdos: [] as any[],
    rdo_clima: [] as any[],
    rdo_efetivo: [] as any[],
    rdo_maquinas: [] as any[],
    rdo_atividades: [] as any[],
    rdo_insumos: [] as any[],
    rdo_fatos: [] as any[],
    rdo_fotos: [] as any[],
  },
};

function resetMockSupabase() {
  mockSupabaseState.bucket.clear();
  mockSupabaseState.forceUploadError = null;
  mockSupabaseState.simulateMissingUrlColumn = false;
  mockSupabaseState.seqNumber = 100;
  mockSupabaseState.tables = {
    obras: [
      {
        id: '22222222-2222-4222-8222-222222222222',
        nome: 'Residencial Torre Horizonte',
        cliente: 'Horizonte Construtora',
        endereco: 'Av. Litorânea, 500',
        descricao: 'Torre residencial 18 pavimentos',
        ativa: true,
      },
    ],
    profiles: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        nome: 'Eng. Lucas Operacional',
        email: 'lucas@stacklab.com',
      },
      {
        id: '99999999-9999-4999-8999-999999999999',
        nome: 'Eng. Davi Master',
        email: 'master@stacklab.com',
      },
    ],
    rdos: [],
    rdo_clima: [],
    rdo_efetivo: [],
    rdo_maquinas: [],
    rdo_atividades: [],
    rdo_insumos: [],
    rdo_fatos: [],
    rdo_fotos: [],
  };
}

jest.mock('@/services/supabase', () => {
  const getTable = (name: string): any[] =>
    (mockSupabaseState.tables as Record<string, any[]>)[name] || [];

  const canEditRdo = (rdoId: string): boolean => {
    const rdo = mockSupabaseState.tables.rdos.find((r) => r.id === rdoId);
    if (!rdo) return false;
    return rdo.status === 'rascunho' || rdo.status === 'rejeitado';
  };

  const makeChannel = () => ({
    on: function () {
      return this;
    },
    subscribe: function () {
      return this;
    },
  });

  const supabaseMock = {
    auth: {
      getUser: async () => ({
        data: { user: { id: mockSupabaseState.currentUserId } },
        error: null,
      }),
    },
    channel: () => makeChannel(),
    removeChannel: jest.fn(),
    storage: {
      from: (bucketName: string) => ({
        upload: async (
          storagePath: string,
          fileBody: Uint8Array | ArrayBuffer,
          options?: { contentType?: string; upsert?: boolean },
        ) => {
          if (bucketName !== 'rdo-fotos') {
            return { data: null, error: { message: 'Bucket not found' } };
          }
          if (mockSupabaseState.forceUploadError) {
            return { data: null, error: { message: mockSupabaseState.forceUploadError } };
          }
          const rdoIdFromPath = storagePath.split('/')[0] || '';
          if (!canEditRdo(rdoIdFromPath)) {
            return {
              data: null,
              error: { message: 'new row violates row-level security policy (can_edit_rdo)' },
            };
          }
          const bytes =
            fileBody instanceof Uint8Array ? new Uint8Array(fileBody) : new Uint8Array(fileBody);
          if (bytes.byteLength > 10 * 1024 * 1024) {
            return { data: null, error: { message: 'Payload too large' } };
          }
          mockSupabaseState.bucket.set(storagePath, {
            bytes,
            contentType: options?.contentType || 'application/octet-stream',
          });
          return { data: { path: storagePath }, error: null };
        },
        getPublicUrl: (storagePath: string) => ({
          data: {
            publicUrl: `${mockSupabaseState.baseUrl}/storage/v1/object/public/${bucketName}/${storagePath}`,
          },
        }),
      }),
    },
    from: (tableName: string) => {
      const api: any = {
        _filters: [] as any[],
        _orderAsc: true,
        _limit: Infinity,
        _selected: false,
        select: () => {
          api._selected = true;
          return api;
        },
        eq: (col: string, val: any) => {
          api._filters.push((row: any) => row?.[col] === val);
          return api;
        },
        ilike: (col: string, pattern: string) => {
          const clean = pattern.replace(/%/g, '').toLowerCase();
          api._filters.push((row: any) => String(row?.[col] || '').toLowerCase().includes(clean));
          return api;
        },
        order: (_col: string, opts?: { ascending?: boolean }) => {
          api._orderAsc = opts?.ascending ?? true;
          return api;
        },
        limit: (n: number) => {
          api._limit = n;
          return api;
        },
        _execSelect: () => {
          let rows = [...getTable(tableName)];
          for (const fn of api._filters) {
            rows = rows.filter(fn);
          }
          if (tableName === 'rdos') {
            rows = rows.map((r) => ({
              ...r,
              obras: mockSupabaseState.tables.obras.find((o) => o.id === r.obra_id) || null,
              rdo_clima: mockSupabaseState.tables.rdo_clima.filter((c) => c.rdo_id === r.id),
              rdo_efetivo: mockSupabaseState.tables.rdo_efetivo.filter((c) => c.rdo_id === r.id),
              rdo_maquinas: mockSupabaseState.tables.rdo_maquinas.filter((c) => c.rdo_id === r.id),
              rdo_atividades: mockSupabaseState.tables.rdo_atividades.filter((c) => c.rdo_id === r.id),
              rdo_insumos: mockSupabaseState.tables.rdo_insumos.filter((c) => c.rdo_id === r.id),
              rdo_fatos: mockSupabaseState.tables.rdo_fatos.filter((c) => c.rdo_id === r.id),
              rdo_fotos: mockSupabaseState.tables.rdo_fotos.filter((c) => c.rdo_id === r.id),
            }));
          }
          return rows.slice(0, api._limit);
        },
        then: (resolve: any) => resolve({ data: api._execSelect(), error: null }),
        maybeSingle: async () => ({ data: api._execSelect()[0] ?? null, error: null }),
        single: async () => ({ data: api._execSelect()[0] ?? null, error: null }),
        upsert: (payload: any) => {
          const rows = Array.isArray(payload) ? payload : [payload];
          const table = getTable(tableName);
          const upserted: any[] = [];
          for (const row of rows) {
            const id =
              row.id && /^[0-9a-f]{8}-/i.test(row.id)
                ? row.id
                : '33333333-3333-4333-8333-333333333333';
            const existingIdx = table.findIndex((r) => r.id === id);
            const nextRow = {
              ...row,
              id,
              numero: row.numero ?? ++mockSupabaseState.seqNumber,
              versao: row.versao ?? 1,
              created_at: row.created_at || '2026-11-18T12:00:00.000Z',
            };
            if (existingIdx >= 0) {
              table[existingIdx] = { ...table[existingIdx], ...nextRow };
            } else {
              table.push(nextRow);
            }
            upserted.push(nextRow);
          }
          return {
            select: () => ({
              single: async () => ({ data: upserted[0], error: null }),
            }),
          };
        },
        insert: async (payload: any) => {
          const rows = Array.isArray(payload) ? payload : [payload];
          const table = getTable(tableName);
          if (tableName === 'rdo_fotos') {
            for (const row of rows) {
              if (mockSupabaseState.simulateMissingUrlColumn && 'url' in row) {
                return {
                  data: null,
                  error: { message: 'column "url" of relation "rdo_fotos" does not exist' },
                };
              }
              if (!row.storage_path || !String(row.storage_path).startsWith(`${row.rdo_id}/`)) {
                return {
                  data: null,
                  error: { message: 'new row for relation "rdo_fotos" violates check constraint "rdo_fotos_path_chk"' },
                };
              }
              if (!canEditRdo(row.rdo_id)) {
                return {
                  data: null,
                  error: { message: 'new row violates row-level security policy (can_edit_rdo)' },
                };
              }
            }
          }
          rows.forEach((row, i) => {
            table.push({
              id: row.id || `${tableName}-${table.length + i + 1}`,
              ...row,
            });
          });
          return { data: rows, error: null };
        },
        update: (patch: any) => ({
          eq: async (col: string, val: any) => {
            const table = getTable(tableName);
            for (let i = 0; i < table.length; i++) {
              if (table[i][col] === val) {
                table[i] = { ...table[i], ...patch };
              }
            }
            return { data: null, error: null };
          },
        }),
        delete: () => ({
          eq: async (col: string, val: any) => {
            const table = getTable(tableName);
            (mockSupabaseState.tables as Record<string, any[]>)[tableName] = table.filter(
              (r) => r[col] !== val,
            );
            return { data: null, error: null };
          },
        }),
      };
      return api;
    },
  };

  return {
    supabase: supabaseMock,
    isSupabaseConfigured: true,
  };
});

import React, { act } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '@/contexts/AuthContext';
import { RDOProvider } from '@/contexts/RDOContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { NewRDOView } from '@/screens/NewRDO/NewRDOView';
import { RDOReviewView } from '@/screens/master/RDOReview/RDOReviewView';
import { RdoPdfPreviewModal } from '@/components/rdo/RdoPdfPreviewModal';
import { fetchRdosFromSupabase, saveRdoToSupabase } from '@/services/modules/supabaseDataService';
import { generateRdoReportHtml, generateRdoPdfBytesAsync } from '@/utils/rdoPdfTemplate';
import {
  decodeBase64,
  encodeBase64,
  isEphemeralLocalUri,
  readPhotoBinaryForUpload,
  resolvePhotoUri,
} from '@/utils/rdoPhotoUtils';
import type { User } from '@/types';

if (typeof (globalThis as any).IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}

/**
 * Gera um binário JPEG válido com dimensões explícitas (SOF0) para testar bytes reais
 * sem depender de imagens externas ou placeholders.
 */
function buildRealTestJpeg(width: number, height: number, pixelPayload: number[]): Uint8Array {
  return new Uint8Array([
    0xff, 0xd8, // SOI
    0xff, 0xe0, 0x00, 0x10, // APP0 JFIF
    0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0xff, 0xc0, // SOF0
    0x00, 0x0b, // length 11
    0x08, // 8-bit precision
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x03, // 3 components (RGB / YCbCr)
    0x01, 0x11, 0x00,
    0xff, 0xda, // SOS
    0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
    ...pixelPayload,
    0xff, 0xd9, // EOI
  ]);
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const len = data.length;
  chunk[0] = (len >>> 24) & 0xff;
  chunk[1] = (len >>> 16) & 0xff;
  chunk[2] = (len >>> 8) & 0xff;
  chunk[3] = len & 0xff;
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  chunk.set(data, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk[8 + len] = (crc >>> 24) & 0xff;
  chunk[9 + len] = (crc >>> 16) & 0xff;
  chunk[10 + len] = (crc >>> 8) & 0xff;
  chunk[11 + len] = crc & 0xff;
  return chunk;
}

function buildRealTestPng(width: number, height: number, colorType: 2 | 6): Uint8Array {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const zlib = require('node:zlib');
  const channels = colorType === 6 ? 4 : 3;
  const rawScanlines = new Uint8Array(height * (1 + width * channels));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * channels);
    rawScanlines[rowStart] = y % 2 === 0 ? 0 : 1; // mix None and Sub filters
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * channels;
      rawScanlines[px] = (x * 40 + y * 10) & 0xff;
      rawScanlines[px + 1] = 120;
      rawScanlines[px + 2] = 200;
      if (colorType === 6) {
        rawScanlines[px + 3] = 180;
      }
    }
  }
  const idatPayload = new Uint8Array(zlib.deflateSync(rawScanlines));
  const ihdr = new Uint8Array(13);
  ihdr[0] = (width >>> 24) & 0xff;
  ihdr[1] = (width >>> 16) & 0xff;
  ihdr[2] = (width >>> 8) & 0xff;
  ihdr[3] = width & 0xff;
  ihdr[4] = (height >>> 24) & 0xff;
  ihdr[5] = (height >>> 16) & 0xff;
  ihdr[6] = (height >>> 8) & 0xff;
  ihdr[7] = height & 0xff;
  ihdr[8] = 8; // bitDepth
  ihdr[9] = colorType;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const c1 = makePngChunk('IHDR', ihdr);
  const c2 = makePngChunk('IDAT', idatPayload);
  const c3 = makePngChunk('IEND', new Uint8Array(0));
  const out = new Uint8Array(sig.length + c1.length + c2.length + c3.length);
  let pos = 0;
  for (const part of [sig, c1, c2, c3]) {
    out.set(part, pos);
    pos += part.length;
  }
  return out;
}

function validatePdfStructure(pdfBytes: Uint8Array): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const raw = Array.from(pdfBytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  if (!raw.startsWith('%PDF-1.4')) {
    issues.push('Missing %PDF-1.4 header');
  }
  const startxrefMatch = raw.match(/startxref\s+(\d+)\s+%%EOF/);
  if (!startxrefMatch) {
    issues.push('Missing startxref / %%EOF');
    return { valid: false, issues };
  }
  const xrefPos = Number(startxrefMatch[1]);
  if (!raw.slice(xrefPos).startsWith('xref\n')) {
    issues.push(`startxref offset ${xrefPos} does not point to xref`);
  }
  const xrefSection = raw.slice(xrefPos, startxrefMatch.index);
  const entryRegex = /^(\d{10}) (\d{5}) ([fn]) $/gm;
  const entries: { offset: number; flag: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = entryRegex.exec(xrefSection)) !== null) {
    entries.push({ offset: Number(m[1]), flag: m[3] });
  }
  for (let i = 1; i < entries.length; i++) {
    const expectedPrefix = `${i} 0 obj\n`;
    if (entries[i].flag !== 'n' || !raw.startsWith(expectedPrefix, entries[i].offset)) {
      issues.push(`xref object ${i} offset mismatch at ${entries[i].offset}`);
    }
  }
  const streamRegex = /\/Length (\d+)\s*>>\nstream\n/g;
  while ((m = streamRegex.exec(raw)) !== null) {
    const declaredLen = Number(m[1]);
    const streamStart = m.index + m[0].length;
    const endMarker = '\nendstream';
    if (!raw.startsWith(endMarker, streamStart + declaredLen)) {
      issues.push(`Stream /Length ${declaredLen} mismatch at ${streamStart}`);
    }
  }
  return { valid: issues.length === 0, issues };
}

const mockOperator: User = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Eng. Lucas Operacional',
  profile: 'common',
  role: 'Engenheiro de Campo',
  email: 'lucas@stacklab.com',
  assignedWorkIds: ['22222222-2222-4222-8222-222222222222'],
};

const mockMaster: User = {
  id: '99999999-9999-4999-8999-999999999999',
  name: 'Eng. Davi Master',
  profile: 'master',
  role: 'Diretor Técnico',
  crea: 'CREA-MA 12345',
  email: 'master@stacklab.com',
  assignedWorkIds: ['22222222-2222-4222-8222-222222222222'],
};

describe('E2E Photo Persistence & Master Review Flow (R1 & R2)', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  const origFetch = globalThis.fetch;

  beforeEach(async () => {
    resetMockSupabase();
    mockAlert.mockClear();
    mockSearchParams = {};
    delete (globalThis as any).__EXPO_IMAGE_PICKER_MOCK__;
    await AsyncStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    globalThis.fetch = origFetch;
    if (root) {
      await act(async () => {
        root!.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  it('uploads real Web & Native photos to Supabase Storage, persists in rdo_fotos, and displays exact photos in Master Review & PDF', async () => {
    const workId = '22222222-2222-4222-8222-222222222222';
    const webJpegBytes = buildRealTestJpeg(320, 240, [0xaa, 0xbb, 0xcc, 0x11, 0x22]);
    const nativeJpegBytes = buildRealTestJpeg(640, 480, [0xde, 0xad, 0xbe, 0xef, 0x42]);
    const nativeFileUri = 'file:///var/mobile/Containers/Data/Application/camera_laje_real.jpg';

    // Mock fetch to serve native file:// bytes on upload AND serve rdo-fotos publicUrl bytes on Master PDF prefetch
    globalThis.fetch = jest.fn(async (input: any) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url === nativeFileUri) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => 'image/jpeg' },
          arrayBuffer: async () =>
            nativeJpegBytes.buffer.slice(
              nativeJpegBytes.byteOffset,
              nativeJpegBytes.byteOffset + nativeJpegBytes.byteLength,
            ),
        } as any;
      }
      const storagePrefix = `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/`;
      if (url.startsWith(storagePrefix)) {
        const storagePath = url.slice(storagePrefix.length);
        const stored = mockSupabaseState.bucket.get(storagePath);
        if (stored) {
          return {
            ok: true,
            status: 200,
            headers: { get: () => stored.contentType },
            arrayBuffer: async () =>
              stored.bytes.buffer.slice(
                stored.bytes.byteOffset,
                stored.bytes.byteOffset + stored.bytes.byteLength,
              ),
          } as any;
        }
      }
      return { ok: false, status: 404, headers: { get: () => '' }, arrayBuffer: async () => new ArrayBuffer(0) } as any;
    }) as any;

    // ------------------------------------------------------------------------
    // FASE 1: PERFIL OPERACIONAL — Anexa fotos reais no NewRDOView e submete
    // ------------------------------------------------------------------------
    await AsyncStorage.setItem(
      `@stacklab:rdo_draft_${workId}`,
      JSON.stringify({
        id: 'draft-e2e-local-01',
        number: 0,
        version: 1,
        workId,
        workName: 'Residencial Torre Horizonte',
        date: '18/11/2026',
        authorId: mockOperator.id,
        authorName: mockOperator.name,
        status: 'rascunho',
        locked: false,
        weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
        labor: [{ role: 'Pedreiro', quantity: 4, hours: 8, isContractor: false }],
        equipment: [{ name: 'Betoneira', activeHours: 6, idleHours: 0 }],
        activities: [
          {
            description: 'Concretagem de pilares do 3º pavimento',
            location: 'Torre A',
            unit: 'm³',
            quantity: 12,
            progress: 80,
            status: 'Em andamento',
          },
        ],
        materials: [],
        occurrences: [],
        photos: [],
        comments: [],
      }),
    );

    mockSearchParams = { workId };
    (globalThis as any).__E2E_PLATFORM__.OS = 'web';

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockOperator,
            token: 'op-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider>
            <NewRDOView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    // Navega para Passo 6: Fotos
    const fotoStepBtn = Array.from(container!.querySelectorAll('*')).find(
      (el) =>
        el.getAttribute('accessibilitylabel')?.includes('Passo 6: Fotos') ||
        el.getAttribute('aria-label')?.includes('Passo 6: Fotos'),
    ) as HTMLElement | undefined;
    expect(fotoStepBtn).toBeDefined();

    await act(async () => {
      fotoStepBtn!.click();
    });

    // 1A. Operacional seleciona foto real via Web file input (FileReader -> data:image/jpeg;base64,...)
    const galleryInput = container!.querySelector(
      'input[data-testid="gallery-file-input"]',
    ) as HTMLInputElement;
    expect(galleryInput).not.toBeNull();

    const realWebFile = new File([webJpegBytes.buffer as ArrayBuffer], 'pilar_torre_a.jpg', {
      type: 'image/jpeg',
      lastModified: 1795000000000,
    });
    Object.defineProperty(galleryInput, 'files', {
      value: [realWebFile],
      configurable: true,
    });

    await act(async () => {
      galleryInput.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 120));
    });

    // 1B. Operacional também captura foto nativa (file://) via câmera
    (globalThis as any).__E2E_PLATFORM__.OS = 'ios';
    (globalThis as any).__EXPO_IMAGE_PICKER_MOCK__ = {
      requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
      launchCameraAsync: jest.fn().mockResolvedValue({
        canceled: false,
        assets: [{ uri: nativeFileUri }],
      }),
    };

    const cameraBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Tirar Foto Agora'),
    );
    expect(cameraBtn).toBeDefined();

    await act(async () => {
      cameraBtn!.click();
      await new Promise((r) => setTimeout(r, 60));
    });

    expect(container!.textContent).toContain('Fotos Anexadas (2)');

    // Avança para Passo 7: Revisão e submete o RDO
    const reviewStepBtn = Array.from(container!.querySelectorAll('*')).find(
      (el) =>
        el.getAttribute('accessibilitylabel')?.includes('Passo 7: Revisão') ||
        el.getAttribute('aria-label')?.includes('Passo 7: Revisão'),
    ) as HTMLElement | undefined;
    expect(reviewStepBtn).toBeDefined();

    await act(async () => {
      reviewStepBtn!.click();
    });

    const submitBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Concluir/Salvar'),
    );
    expect(submitBtn).toBeDefined();

    await act(async () => {
      submitBtn!.click();
      await new Promise((r) => setTimeout(r, 120));
    });

    // Verifica que o diálogo de sucesso apareceu e que o RDO foi persistido no Supabase
    expect(container!.textContent).toContain('RDO Submetido com Sucesso!');
    expect(mockSupabaseState.tables.rdos).toHaveLength(1);
    const persistedRdoRow = mockSupabaseState.tables.rdos[0];
    expect(persistedRdoRow.status).toBe('pendente_aprovacao');

    // Verifica bucket Storage 'rdo-fotos' e tabela 'rdo_fotos'
    expect(mockSupabaseState.bucket.size).toBe(2);
    expect(mockSupabaseState.tables.rdo_fotos).toHaveLength(2);

    const dbPhoto1 = mockSupabaseState.tables.rdo_fotos[0];
    const dbPhoto2 = mockSupabaseState.tables.rdo_fotos[1];

    expect(dbPhoto1.storage_path).toMatch(new RegExp(`^${persistedRdoRow.id}/`));
    expect(dbPhoto2.storage_path).toMatch(new RegExp(`^${persistedRdoRow.id}/`));
    expect(dbPhoto1.url).toBe(
      `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/${dbPhoto1.storage_path}`,
    );
    expect(dbPhoto2.url).toBe(
      `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/${dbPhoto2.storage_path}`,
    );

    // Garante correspondência binária exata entre os bytes enviados e os armazenados no Storage
    const storedObj1 = mockSupabaseState.bucket.get(dbPhoto1.storage_path);
    const storedObj2 = mockSupabaseState.bucket.get(dbPhoto2.storage_path);
    expect(storedObj1?.bytes).toEqual(webJpegBytes);
    expect(storedObj2?.bytes).toEqual(nativeJpegBytes);

    // ------------------------------------------------------------------------
    // FASE 2: PERFIL MASTER (novo dispositivo/sessão limpa) — Visualiza & PDF
    // ------------------------------------------------------------------------
    await act(async () => {
      root!.unmount();
    });
    root = createRoot(container!);
    await AsyncStorage.clear();
    mockSearchParams = { id: persistedRdoRow.id, workId };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockMaster,
            token: 'master-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider>
            <AdminProvider>
              <RDOReviewView />
            </AdminProvider>
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 120));
    });

    const masterImg1 = container!.querySelector(
      `img[data-testid="rdo-photo-${dbPhoto1.id}"]`,
    ) as HTMLImageElement | null;
    const masterImg2 = container!.querySelector(
      `img[data-testid="rdo-photo-${dbPhoto2.id}"]`,
    ) as HTMLImageElement | null;

    expect(masterImg1).not.toBeNull();
    expect(masterImg2).not.toBeNull();
    expect(masterImg1?.src).toBe(dbPhoto1.url);
    expect(masterImg2?.src).toBe(dbPhoto2.url);
    expect(container!.innerHTML).not.toContain('images.unsplash.com');
    expect(container!.innerHTML).not.toContain('file://');
    expect(container!.innerHTML).not.toContain('blob:');

    // Confirma via fetchRdosFromSupabase que o objeto RDO recebido pelo Master tem os URLs reais
    const masterRdos = await fetchRdosFromSupabase();
    expect(masterRdos).toHaveLength(1);
    const masterRdo = masterRdos[0]!;
    expect(masterRdo.photos).toHaveLength(2);
    expect(masterRdo.photos[0]?.uri).toBe(dbPhoto1.url);
    expect(masterRdo.photos[1]?.uri).toBe(dbPhoto2.url);

    // Verifica HTML e PDF Preview Modal + geração binária %PDF-1.4 com as fotos reais
    const reportHtml = generateRdoReportHtml(masterRdo);
    expect(reportHtml).toContain(dbPhoto1.url);
    expect(reportHtml).toContain(dbPhoto2.url);
    expect(reportHtml).not.toContain('images.unsplash.com');

    const pdfBytes = await generateRdoPdfBytesAsync(masterRdo);
    const rawPdf = Array.from(pdfBytes)
      .map((b) => String.fromCharCode(b))
      .join('');
    expect(rawPdf).toContain('/Im1');
    expect(rawPdf).toContain('/Im2');
    expect(rawPdf).toContain('/Width 320 /Height 240');
    expect(rawPdf).toContain('/Width 640 /Height 480');
    expect(rawPdf).toContain('/Filter /DCTDecode');
    expect(validatePdfStructure(pdfBytes)).toEqual({ valid: true, issues: [] });

    // Verifica também o fluxo direto do botão Exportar -> PDF Oficial -> Baixar no RDOReviewView na Web
    (globalThis as any).__E2E_PLATFORM__.OS = 'web';
    let capturedBlob: Blob | null = null;
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn((blob: any) => {
      capturedBlob = blob;
      return 'blob:e2e-web-pdf-download';
    });
    URL.revokeObjectURL = jest.fn();

    try {
      const exportHeaderBtn = Array.from(container!.querySelectorAll('button')).find(
        (el) =>
          el.getAttribute('accessibilitylabel') === 'Exportar ativos do RDO' ||
          el.getAttribute('aria-label') === 'Exportar ativos do RDO',
      ) as HTMLElement | undefined;
      expect(exportHeaderBtn).toBeDefined();
      await act(async () => {
        exportHeaderBtn!.click();
      });
      const baixarBtn = Array.from(container!.querySelectorAll('button')).find(
        (el) =>
          el.getAttribute('accessibilitylabel') === 'Baixar' ||
          el.getAttribute('aria-label') === 'Baixar' ||
          el.textContent?.trim() === 'Baixar',
      ) as HTMLElement | undefined;
      expect(baixarBtn).toBeDefined();
      await act(async () => {
        baixarBtn!.click();
        await new Promise((r) => setTimeout(r, 80));
      });

      expect(capturedBlob).not.toBeNull();
      const downloadedBuf = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(capturedBlob!);
      });
      const downloadedBytes = new Uint8Array(downloadedBuf);
      const downloadedRaw = Array.from(downloadedBytes)
        .map((b) => String.fromCharCode(b))
        .join('');
      expect(downloadedRaw).toContain('/Im1');
      expect(downloadedRaw).toContain('/Im2');
      expect(downloadedRaw).toContain('/Filter /DCTDecode');
      expect(downloadedRaw).toContain('/Width 320 /Height 240');
      expect(downloadedRaw).toContain('/Width 640 /Height 480');
      expect(downloadedRaw).not.toContain('Foto indisponivel para incorporacao');
      expect(downloadedRaw).not.toContain('images.unsplash.com');
      expect(validatePdfStructure(downloadedBytes)).toEqual({ valid: true, issues: [] });
      expect(mockAlert).toHaveBeenCalledWith(
        'Exportação Concluída',
        'Relatório Final PDF emitido com padrão oficial StackLab.',
      );
    } finally {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    }

    // Renderiza RdoPdfPreviewModal com o RDO carregado pelo Master
    await act(async () => {
      root!.render(
        <RdoPdfPreviewModal visible={true} rdo={masterRdo} onClose={jest.fn()} />,
      );
    });
    const previewImg1 = container!.querySelector(
      `img[data-testid="preview-photo-${dbPhoto1.id}"]`,
    ) as HTMLImageElement | null;
    const previewImg2 = container!.querySelector(
      `img[data-testid="preview-photo-${dbPhoto2.id}"]`,
    ) as HTMLImageElement | null;
    expect(previewImg1?.src).toBe(dbPhoto1.url);
    expect(previewImg2?.src).toBe(dbPhoto2.url);
    expect(container!.innerHTML).not.toContain('images.unsplash.com');

    // FASE 3 (R2): Simula falha de carregamento de imagem no Master -> estado honesto, ZERO Unsplash
    await act(async () => {
      previewImg1!.dispatchEvent(new Event('error'));
    });
    expect(
      container!.querySelector(`img[data-testid="preview-photo-${dbPhoto1.id}"]`),
    ).toBeNull();
    const unavailable = container!.querySelector(
      `[data-testid="preview-photo-${dbPhoto1.id}-unavailable"]`,
    );
    expect(unavailable).not.toBeNull();
    expect(unavailable?.textContent).toContain('Foto indisponível');
    expect(container!.innerHTML).not.toContain('images.unsplash.com');
  });

  it('propagates Storage upload failure cleanly to operator without silent success or discarding draft', async () => {
    const workId = '22222222-2222-4222-8222-222222222222';
    const webJpegBytes = buildRealTestJpeg(100, 100, [0x12, 0x34]);

    mockSupabaseState.forceUploadError = 'Falha simulada no bucket rdo-fotos';

    await AsyncStorage.setItem(
      `@stacklab:rdo_draft_${workId}`,
      JSON.stringify({
        id: 'draft-e2e-fail-01',
        number: 0,
        version: 1,
        workId,
        workName: 'Residencial Torre Horizonte',
        date: '18/11/2026',
        authorId: mockOperator.id,
        authorName: mockOperator.name,
        status: 'rascunho',
        locked: false,
        weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
        labor: [{ role: 'Pedreiro', quantity: 2, hours: 8, isContractor: false }],
        equipment: [],
        activities: [
          {
            description: 'Alvenaria bloco estrutural',
            location: 'Térreo',
            unit: 'm²',
            quantity: 10,
            progress: 50,
          },
        ],
        materials: [],
        occurrences: [],
        photos: [
          {
            id: 'photo-fail-1',
            caption: 'Foto teste falha',
            uri: `data:image/jpeg;base64,${encodeBase64(webJpegBytes)}`,
            watermarkedUri: `data:image/jpeg;base64,${encodeBase64(webJpegBytes)}`,
            takenAt: '2026-11-18T10:00:00.000Z',
            author: mockOperator.name,
          },
        ],
        comments: [],
      }),
    );

    mockSearchParams = { workId };
    (globalThis as any).__E2E_PLATFORM__.OS = 'web';

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockOperator,
            token: 'op-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider>
            <NewRDOView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    const reviewStepBtn = Array.from(container!.querySelectorAll('*')).find(
      (el) =>
        el.getAttribute('accessibilitylabel')?.includes('Passo 7: Revisão') ||
        el.getAttribute('aria-label')?.includes('Passo 7: Revisão'),
    ) as HTMLElement | undefined;

    await act(async () => {
      reviewStepBtn!.click();
    });

    const submitBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Concluir/Salvar'),
    );
    await act(async () => {
      submitBtn!.click();
      await new Promise((r) => setTimeout(r, 80));
    });

    expect(container!.textContent).not.toContain('RDO Submetido com Sucesso!');
    expect(container!.textContent).toContain('Falha simulada no bucket rdo-fotos');
    expect(mockSupabaseState.tables.rdo_fotos).toHaveLength(0);
    // Draft must remain preserved in AsyncStorage so operator does not lose work
    const savedDraft = await AsyncStorage.getItem(`@stacklab:rdo_draft_${workId}`);
    expect(savedDraft).not.toBeNull();
  });

  it('recovers publicUrl from storage_path even when DB lacks url column or has polluted local/Unsplash url', async () => {
    mockSupabaseState.simulateMissingUrlColumn = true;
    const rdoId = '44444444-4444-4444-8444-444444444444';
    const workId = '22222222-2222-4222-8222-222222222222';
    mockSupabaseState.tables.rdos.push({
      id: rdoId,
      numero: 77,
      versao: 1,
      obra_id: workId,
      operador_id: mockOperator.id,
      status: 'pendente_aprovacao',
      created_at: '2026-11-18T12:00:00.000Z',
    });
    mockSupabaseState.tables.rdo_fotos.push(
      {
        id: 'db-no-url',
        rdo_id: rdoId,
        storage_path: `${rdoId}/foto-sem-url.jpg`,
        url: null,
        legenda: 'Sem coluna URL',
        ordem: 0,
      },
      {
        id: 'db-local-url',
        rdo_id: rdoId,
        storage_path: `${rdoId}/foto-local-poluida.jpg`,
        url: 'file:///data/user/0/app/cache/ephemeral.jpg',
        legenda: 'URL local poluída',
        ordem: 1,
      },
      {
        id: 'db-unsplash-url',
        rdo_id: rdoId,
        storage_path: `${rdoId}/foto-unsplash-poluida.jpg`,
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563',
        legenda: 'URL Unsplash poluída',
        ordem: 2,
      },
    );

    const rdos = await fetchRdosFromSupabase();
    expect(rdos).toHaveLength(1);
    const photos = rdos[0]!.photos;
    expect(photos).toHaveLength(3);
    expect(photos[0]?.uri).toBe(
      `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/${rdoId}/foto-sem-url.jpg`,
    );
    expect(photos[1]?.uri).toBe(
      `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/${rdoId}/foto-local-poluida.jpg`,
    );
    expect(photos[2]?.uri).toBe(
      `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/${rdoId}/foto-unsplash-poluida.jpg`,
    );
  });

  it('embeds uploaded PNG (RGB & RGBA via /FlateDecode) and WebP (via Canvas JPEG transcode) in valid %PDF-1.4', async () => {
    const workId = '22222222-2222-4222-8222-222222222222';
    const pngRgbBytes = buildRealTestPng(24, 16, 2);
    const pngRgbaBytes = buildRealTestPng(32, 20, 6);
    const webpBytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00,
      0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
      0x0e, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d,
      0x01, 0x2a, 0x10, 0x00, 0x10, 0x00, 0x00, 0x00,
    ]);
    const canvasTranscodedJpeg = buildRealTestJpeg(160, 120, [0xfe, 0xca]);

    globalThis.fetch = jest.fn(async (input: any) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      const storagePrefix = `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/`;
      if (url.startsWith(storagePrefix)) {
        const storagePath = url.slice(storagePrefix.length);
        const stored = mockSupabaseState.bucket.get(storagePath);
        if (stored) {
          return {
            ok: true,
            status: 200,
            headers: { get: () => stored.contentType },
            arrayBuffer: async () =>
              stored.bytes.buffer.slice(
                stored.bytes.byteOffset,
                stored.bytes.byteOffset + stored.bytes.byteLength,
              ),
          } as any;
        }
      }
      return { ok: false, status: 404, headers: { get: () => '' }, arrayBuffer: async () => new ArrayBuffer(0) } as any;
    }) as any;

    // 1. Upload PNG RGB + PNG RGBA sem Canvas (headless Node/Jest) e valida /FlateDecode + xref
    const pngSaveRes = await saveRdoToSupabase({
      id: 'draft-png-1',
      number: 201,
      version: 1,
      workId,
      workName: 'Residencial Torre Horizonte',
      date: '18/11/2026',
      status: 'submetido',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [{ role: 'Pedreiro', quantity: 2, hours: 8 }],
      equipment: [],
      activities: [{ description: 'Fôrma', location: 'Bloco A', quantity: 10, unit: 'm²' }],
      materials: [],
      occurrences: [],
      comments: [],
      photos: [
        {
          id: 'png-rgb',
          uri: `data:image/png;base64,${encodeBase64(pngRgbBytes)}`,
          watermarkedUri: `data:image/png;base64,${encodeBase64(pngRgbBytes)}`,
          caption: 'PNG RGB real',
          takenAt: '2026-11-18T10:00:00.000Z',
          author: mockOperator.name,
        },
        {
          id: 'png-rgba',
          uri: `data:image/png;base64,${encodeBase64(pngRgbaBytes)}`,
          watermarkedUri: `data:image/png;base64,${encodeBase64(pngRgbaBytes)}`,
          caption: 'PNG RGBA real',
          takenAt: '2026-11-18T10:05:00.000Z',
          author: mockOperator.name,
        },
      ],
    });
    expect(pngSaveRes.success).toBe(true);

    const fetched = await fetchRdosFromSupabase();
    expect(fetched).toHaveLength(1);
    const pngPdfBytes = await generateRdoPdfBytesAsync(fetched[0]!);
    const pngPdfRaw = Array.from(pngPdfBytes)
      .map((b) => String.fromCharCode(b))
      .join('');
    expect(pngPdfRaw).toContain('/Im1');
    expect(pngPdfRaw).toContain('/Im2');
    expect(pngPdfRaw).toContain('/Filter /FlateDecode');
    expect(pngPdfRaw).toContain('/Width 24 /Height 16');
    expect(pngPdfRaw).toContain('/Width 32 /Height 20');
    expect(pngPdfRaw).not.toContain('Foto indisponivel para incorporacao');
    expect(validatePdfStructure(pngPdfBytes)).toEqual({ valid: true, issues: [] });

    // 2. WebP via offscreen <canvas> transcoding fallback -> /Filter /DCTDecode
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const origImage = globalThis.Image;
    try {
      HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        fillStyle: '#FFFFFF',
        fillRect: jest.fn(),
        drawImage: jest.fn(),
      })) as any;
      HTMLCanvasElement.prototype.toDataURL = jest.fn(
        () => `data:image/jpeg;base64,${encodeBase64(canvasTranscodedJpeg)}`,
      ) as any;
      (globalThis as any).Image = class MockWebImage {
        width = 160;
        height = 120;
        naturalWidth = 160;
        naturalHeight = 120;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_v: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      };

      const webpPdfBytes = await generateRdoPdfBytesAsync({
        ...fetched[0]!,
        photos: [
          {
            id: 'webp-1',
            uri: `data:image/webp;base64,${encodeBase64(webpBytes)}`,
            watermarkedUri: `data:image/webp;base64,${encodeBase64(webpBytes)}`,
            caption: 'WebP via Canvas',
            takenAt: '2026-11-18T11:00:00.000Z',
            author: mockOperator.name,
          },
        ],
      });
      const webpPdfRaw = Array.from(webpPdfBytes)
        .map((b) => String.fromCharCode(b))
        .join('');
      expect(webpPdfRaw).toContain('/Im1');
      expect(webpPdfRaw).toContain('/Filter /DCTDecode');
      expect(webpPdfRaw).toContain('/Width 160 /Height 120');
      expect(webpPdfRaw).not.toContain('Foto indisponivel para incorporacao');
      expect(validatePdfStructure(webpPdfBytes)).toEqual({ valid: true, issues: [] });
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
      HTMLCanvasElement.prototype.toDataURL = origToDataURL;
      globalThis.Image = origImage;
    }
  });

  it('hardens stale file:// re-submission, non-image magic byte rejection, ephemeral OS paths, decodeBase64, and Unsplash camera guard', async () => {
    const workId = '22222222-2222-4222-8222-222222222222';
    const rdoId = '55555555-5555-4555-8555-555555555555';
    const keptJpeg = buildRealTestJpeg(100, 100, [0x01, 0x02]);
    const replacementJpeg = buildRealTestJpeg(200, 150, [0x03, 0x04]);

    mockSupabaseState.tables.rdos.push({
      id: rdoId,
      numero: 88,
      versao: 1,
      obra_id: workId,
      operador_id: mockOperator.id,
      status: 'rejeitado',
      created_at: '2026-11-18T12:00:00.000Z',
    });
    const keptStoragePath = `${rdoId}/kept-0.jpg`;
    const keptPublicUrl = `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/${keptStoragePath}`;
    mockSupabaseState.bucket.set(keptStoragePath, {
      bytes: keptJpeg,
      contentType: 'image/jpeg',
    });

    // 1. Re-submissão com uri local stale (file://) coexistindo com storage_path + url válidos
    const resubmitRes = await saveRdoToSupabase({
      id: rdoId,
      number: 88,
      version: 1,
      workId,
      workName: 'Residencial Torre Horizonte',
      date: '18/11/2026',
      status: 'submetido',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      locked: false,
      weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
      labor: [{ role: 'Pedreiro', quantity: 2, hours: 8 }],
      equipment: [],
      activities: [{ description: 'Reboco', location: 'Bloco A', quantity: 10, unit: 'm²' }],
      materials: [],
      occurrences: [],
      comments: [],
      photos: [
        {
          id: 'kept',
          uri: 'file:///expired/missing_stale.jpg',
          watermarkedUri: 'file:///expired/missing_stale.jpg',
          url: keptPublicUrl,
          storage_path: keptStoragePath,
          caption: 'Foto mantida',
          takenAt: '2026-11-18T10:00:00.000Z',
          author: mockOperator.name,
        },
        {
          id: 'replaced',
          uri: `data:image/jpeg;base64,${encodeBase64(replacementJpeg)}`,
          watermarkedUri: `data:image/jpeg;base64,${encodeBase64(replacementJpeg)}`,
          caption: 'Foto substituída',
          takenAt: '2026-11-18T10:30:00.000Z',
          author: mockOperator.name,
        },
      ],
    });
    expect(resubmitRes.success).toBe(true);
    expect(resubmitRes.savedRdo?.photos).toHaveLength(2);
    expect(resubmitRes.savedRdo?.photos?.[0]?.uri).toBe(keptPublicUrl);
    expect(mockSupabaseState.tables.rdo_fotos).toHaveLength(2);

    // 2. Rejeita payloads não-imagem disfarçados e evita linhas rascunho órfãs no saveRdoToSupabase
    const pdfBytes = Uint8Array.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj', (c) => c.charCodeAt(0));
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'application/octet-stream' },
      arrayBuffer: async () =>
        pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength),
    })) as any;

    await expect(readPhotoBinaryForUpload('blob:https://app.local/fake-pdf')).rejects.toThrow(
      /não suportado|inválido/i,
    );
    const svgBytes = Uint8Array.from('<svg><script>alert(1)</script></svg>', (c) => c.charCodeAt(0));
    const svgAsJpeg = `data:image/jpeg;base64,${encodeBase64(svgBytes)}`;
    await expect(readPhotoBinaryForUpload(svgAsJpeg)).rejects.toThrow(/não suportado|inválido/i);

    const rdosBeforeFailedInsert = mockSupabaseState.tables.rdos.length;
    const failedNewSave = await saveRdoToSupabase({
      id: 'draft-disguised-fail',
      number: 0,
      version: 1,
      workId,
      workName: 'Residencial Torre Horizonte',
      date: '18/11/2026',
      status: 'submetido',
      authorId: mockOperator.id,
      authorName: mockOperator.name,
      locked: false,
      weather: [],
      labor: [],
      equipment: [],
      activities: [],
      materials: [],
      occurrences: [],
      comments: [],
      photos: [
        {
          id: 'bad-svg',
          uri: svgAsJpeg,
          watermarkedUri: svgAsJpeg,
          caption: 'SVG malicioso',
          takenAt: '2026-11-18T11:00:00.000Z',
          author: mockOperator.name,
        },
      ],
    });
    expect(failedNewSave.success).toBe(false);
    expect(mockSupabaseState.tables.rdos.length).toBe(rdosBeforeFailedInsert);

    // 3. isEphemeralLocalUri & resolvePhotoUri para caminhos locais POSIX/Windows + decodeBase64 estrito
    expect(isEphemeralLocalUri('/var/mobile/Containers/e.jpg')).toBe(true);
    expect(isEphemeralLocalUri('C:\\Users\\pedro\\foto.jpg')).toBe(true);
    expect(
      resolvePhotoUri(
        {
          uri: '/var/mobile/Containers/e.jpg',
          storage_path: keptStoragePath,
        },
        0,
        {
          isConfigured: true,
          supabaseClient: {
            storage: {
              from: () => ({
                getPublicUrl: (p: string) => ({
                  data: { publicUrl: `${mockSupabaseState.baseUrl}/storage/v1/object/public/rdo-fotos/${p}` },
                }),
              }),
            },
          },
        },
      ),
    ).toBe(keptPublicUrl);

    const origBuffer = (globalThis as any).Buffer;
    const origAtob = (globalThis as any).atob;
    try {
      (globalThis as any).Buffer = undefined;
      (globalThis as any).atob = undefined;
      expect(() => decodeBase64('!!!')).toThrow();
      expect(() => decodeBase64('abcde')).toThrow();
      expect(Array.from(decodeBase64('SGk='))).toEqual([72, 105]);
    } finally {
      (globalThis as any).Buffer = origBuffer;
      (globalThis as any).atob = origAtob;
    }

    // 4. NewRDOView câmera nativa retornando URL Unsplash não exibe banner de sucesso
    await AsyncStorage.setItem(
      `@stacklab:rdo_draft_${workId}`,
      JSON.stringify({
        id: 'draft-unsplash-camera',
        number: 0,
        version: 1,
        workId,
        workName: 'Residencial Torre Horizonte',
        date: '18/11/2026',
        authorId: mockOperator.id,
        authorName: mockOperator.name,
        status: 'rascunho',
        locked: false,
        weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
        labor: [{ role: 'Pedreiro', quantity: 2, hours: 8, isContractor: false }],
        equipment: [],
        activities: [{ description: 'Frente', location: 'Bloco A', unit: 'm²', quantity: 10 }],
        materials: [],
        occurrences: [],
        photos: [],
        comments: [],
      }),
    );
    mockSearchParams = { workId };
    (globalThis as any).__E2E_PLATFORM__.OS = 'ios';
    (globalThis as any).__EXPO_IMAGE_PICKER_MOCK__ = {
      requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
      launchCameraAsync: jest.fn().mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563' }],
      }),
    };

    await act(async () => {
      root!.render(
        <AuthContext.Provider
          value={{
            user: mockOperator,
            token: 'op-token',
            loading: false,
            signIn: jest.fn(),
            signOut: jest.fn(),
            setUser: jest.fn(),
          } as any}
        >
          <RDOProvider>
            <NewRDOView />
          </RDOProvider>
        </AuthContext.Provider>,
      );
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });
    const fotoStepBtn = Array.from(container!.querySelectorAll('*')).find(
      (el) =>
        el.getAttribute('accessibilitylabel')?.includes('Passo 6: Fotos') ||
        el.getAttribute('aria-label')?.includes('Passo 6: Fotos'),
    ) as HTMLElement;
    await act(async () => {
      fotoStepBtn.click();
    });
    const cameraBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Tirar Foto Agora'),
    );
    await act(async () => {
      cameraBtn!.click();
      await new Promise((r) => setTimeout(r, 40));
    });
    expect(container!.textContent).toContain('Fotos Anexadas (0)');
    expect(container!.textContent).not.toContain('Foto registrada com sucesso!');
  });
});
