/**
 * 📷 StackLab RDO Photo Utilities
 * -----------------------------------------------------------------------------
 * Utilitários centralizados para resolução de URLs de fotos, fallbacks resilientes,
 * extração de metadados de imagem e geração de binários de imagem para incorporação no PDF (%PDF-1.4).
 */

import type { PhotoEntry, RDO } from '@/types';

declare const Buffer: any;

export const MAX_RDO_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB (limite do bucket rdo-fotos)

export const ALLOWED_RDO_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export type PhotoInput =
  | string
  | Partial<PhotoEntry>
  | {
      url?: string;
      storage_path?: string;
      storagePath?: string;
      uri?: string;
      watermarkedUri?: string;
      [key: string]: any;
    }
  | null
  | undefined;

export function isMockOrUnsplashUrl(uri?: string | null): boolean {
  return typeof uri === 'string' && /images\.unsplash\.com/i.test(uri);
}

export function isEphemeralLocalUri(uri?: string | null): boolean {
  if (typeof uri !== 'string') return false;
  return /^(?:file:\/\/|content:\/\/|blob:|ph:\/\/|assets-library:\/\/|\/(?:var|tmp|Users|storage|data|private|home|sdcard|mnt|emulated)\/|[a-zA-Z]:[\\/])/i.test(
    uri.trim(),
  );
}

export function extractSupabaseRdoFotoStoragePath(uri?: string | null): string {
  if (typeof uri !== 'string') return '';
  const match = uri.trim().match(/\/storage\/v1\/object\/(?:public|sign)\/rdo-fotos\/([^?#]+)/i);
  if (!match || !match[1]) return '';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function getStoragePathFromPhoto(photo: PhotoInput): string {
  if (!photo || typeof photo !== 'object') return '';
  const p = photo as Record<string, any>;
  for (const key of ['storage_path', 'storagePath']) {
    const val = p[key];
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed && trimmed !== 'null' && trimmed !== 'undefined') {
        return trimmed;
      }
    }
  }
  return '';
}

function resolveStoragePublicUrl(
  storagePath: string,
  options?: { supabaseClient?: any; isConfigured?: boolean },
): string {
  if (!storagePath) return '';
  try {
    let client = options?.supabaseClient;
    let configured = options?.isConfigured;
    if (!client || configured === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('@/services/supabase');
      client = client || mod.supabase;
      configured = configured ?? mod.isSupabaseConfigured;
    }
    if (configured && client?.storage) {
      const publicData = client.storage.from('rdo-fotos').getPublicUrl(storagePath)?.data;
      if (
        publicData?.publicUrl &&
        !publicData.publicUrl.endsWith('/undefined') &&
        !isMockOrUnsplashUrl(publicData.publicUrl)
      ) {
        return publicData.publicUrl;
      }
    }
  } catch {
    // Ignora erro de importação de serviço em ambientes isolados
  }
  return '';
}

/**
 * Extrai a primeira URI ou caminho válido presente nas propriedades do objeto de foto,
 * priorizando watermarkedUri -> uri -> url -> storage_path -> storagePath -> path -> publicUrl -> photo/image/file.
 * Descarta de forma segura strings vazias, apenas com espaços ou literais 'null'/'undefined'.
 */
export function extractRawPhotoCandidate(photo: PhotoInput): string {
  if (!photo) return '';
  if (typeof photo === 'string') {
    const trimmed = photo.trim();
    return trimmed !== 'null' && trimmed !== 'undefined' ? trimmed : '';
  }
  if (typeof photo !== 'object') return '';

  const p = photo as Record<string, any>;
  const candidateKeys = [
    'watermarkedUri',
    'uri',
    'url',
    'publicUrl',
    'storage_path',
    'storagePath',
    'path',
    'photo',
    'image',
    'file',
    'asset',
    'original',
  ];

  for (const key of candidateKeys) {
    const val = p[key];
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed && trimmed !== 'null' && trimmed !== 'undefined') {
        return trimmed;
      }
    } else if (Array.isArray(val) && val.length > 0) {
      const itemCandidate = extractRawPhotoCandidate(val[0]);
      if (itemCandidate) {
        return itemCandidate;
      }
    } else if (val && typeof val === 'object') {
      for (const nestedKey of [
        'uri',
        'url',
        'publicUrl',
        'watermarkedUri',
        'storage_path',
        'storagePath',
        'path',
        'photo',
        'image',
        'file',
        'asset',
        'original',
      ]) {
        const nestedVal = val[nestedKey];
        if (typeof nestedVal === 'string') {
          const trimmed = nestedVal.trim();
          if (trimmed && trimmed !== 'null' && trimmed !== 'undefined') {
            return trimmed;
          }
        }
      }
    }
  }

  return '';
}

/**
 * Resolve a URI real da foto para exibição na interface e exportação,
 * priorizando storage_path do Supabase Storage sempre que a URL estiver ausente,
 * for local/efêmera (file://, content://, blob:) ou for uma URL mockada do Unsplash.
 * Nunca substitui fotos ausentes ou quebradas por fotos fictícias de estoque.
 */
export const resolvePhotoUri = (
  photo?: PhotoInput,
  _index = 0,
  options?: { supabaseClient?: any; isConfigured?: boolean },
): string => {
  if (!photo) return '';

  const storagePath = getStoragePathFromPhoto(photo);
  const raw = extractRawPhotoCandidate(photo);

  // Se houver storage_path persistido e o candidato for ausente, o próprio storage_path,
  // um caminho efêmero/local de outro dispositivo ou URL mockada do Unsplash, resolve via Storage.
  if (
    storagePath &&
    (!raw ||
      raw === storagePath ||
      isEphemeralLocalUri(raw) ||
      isMockOrUnsplashUrl(raw))
  ) {
    const publicUrl = resolveStoragePublicUrl(storagePath, options);
    if (publicUrl) {
      return publicUrl;
    }
    return '';
  }

  if (!raw || isMockOrUnsplashUrl(raw)) {
    return '';
  }

  // 1. Raw Base64 JPEGs, PNGs, WebP ou GIFs (sem o prefixo data:image)
  if (raw.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${raw}`;
  }
  if (raw.startsWith('iVBORw0KGgo')) {
    return `data:image/png;base64,${raw}`;
  }
  if (raw.startsWith('UklGR')) {
    return `data:image/webp;base64,${raw}`;
  }
  if (raw.startsWith('R0lGOD')) {
    return `data:image/gif;base64,${raw}`;
  }

  // 2. URLs remotas completas (HTTP/HTTPS), Data URIs (Base64), caminhos locais (para pré-visualização local antes do upload) ou caminhos absolutos do SO
  if (
    /^(?:https?:\/\/|data:image\/|file:\/\/|content:\/\/|blob:|ph:\/\/|assets-library:\/\/|\/|\\\\|[a-zA-Z]:[\\/])/i.test(raw)
  ) {
    return raw;
  }

  // 3. Caminho relativo de storage do Supabase (ex: "{rdoId}/foto-1.jpg")
  const resolvedFromRaw = resolveStoragePublicUrl(raw, options);
  if (resolvedFromRaw) {
    return resolvedFromRaw;
  }

  return '';
};

export interface JpegMetadata {
  width: number;
  height: number;
  components: number;
  colorSpace: '/DeviceRGB' | '/DeviceGray' | '/DeviceCMYK';
}

/**
 * Extrai dimensões (largura e altura) e espaço de cores de um binário JPEG a partir dos marcadores SOF0/SOF1/SOF2.
 * Trata bytes de preenchimento (0xFF fill bytes) e marcadores stand-alone de acordo com a especificação JPEG/JFIF.
 * Retorna null se não for um binário JPEG válido ou se não possuir marcador de frame legível.
 */
export function getJpegDimensions(bytes: Uint8Array): JpegMetadata | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }
  let i = 2;
  while (i < bytes.length - 8) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    // Absorve bytes de preenchimento consecutivos (0xFF) antes do marcador
    while (i < bytes.length && bytes[i] === 0xff) {
      i++;
    }
    if (i >= bytes.length) break;
    const marker = bytes[i];
    i++;

    // Marcadores SOF (Start of Frame)
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb
    ) {
      if (i + 7 > bytes.length) break;
      const height = (bytes[i + 3] << 8) | bytes[i + 4];
      const width = (bytes[i + 5] << 8) | bytes[i + 6];
      const components = i + 7 < bytes.length ? bytes[i + 7] : 3;
      const colorSpace =
        components === 1 ? '/DeviceGray' : components === 4 ? '/DeviceCMYK' : '/DeviceRGB';
      if (width > 0 && height > 0) {
        return { width, height, components, colorSpace };
      }
    }

    // Marcadores stand-alone sem campo de tamanho
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      if (marker === 0xd9) break;
      continue;
    }

    // SOS (Start of Scan) - término dos cabeçalhos estruturados
    if (marker === 0xda) {
      break;
    }

    if (i + 2 > bytes.length) break;
    const len = (bytes[i] << 8) | bytes[i + 1];
    if (len < 2) break;
    i += len;
  }
  return null;
}

/**
 * Converte Uint8Array em uma string binária segura (onde charCodeAt(i) === byte).
 */
export function uint8ArrayToBinaryString(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return binary;
}

const B64_MAP: Record<string, number> = {};
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (let i = 0; i < B64_CHARS.length; i++) {
  B64_MAP[B64_CHARS.charAt(i)] = i;
}

/**
 * Decodifica Base64 em Uint8Array em qualquer ambiente (Node, Web, React Native Hermes).
 * Suporta Base64 padrão, URL-safe Base64 (- e _) e preenchimento ausente,
 * rejeitando caracteres inválidos ou comprimentos inválidos (len % 4 === 1).
 */
export function decodeBase64(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!cleanBase64) {
    return new Uint8Array(0);
  }
  if (cleanBase64.length % 4 === 1) {
    throw new Error('Base64 inválido: comprimento inválido.');
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleanBase64)) {
    throw new Error('Base64 inválido: caracteres não permitidos.');
  }
  if (cleanBase64.includes('=') && cleanBase64.length % 4 !== 0) {
    throw new Error('Base64 inválido: preenchimento incorreto.');
  }

  const padLen = (4 - (cleanBase64.length % 4)) % 4;
  const padded = cleanBase64 + '='.repeat(padLen);

  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(padded, 'base64'));
  }
  if (typeof atob === 'function') {
    try {
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      // Fallback para decodificador manual se atob falhar
    }
  }

  // Pure JavaScript Base64 decoder fallback (com validação estrita)
  const validLen = padded.indexOf('=') === -1 ? padded.length : padded.indexOf('=');
  const outLen = Math.floor((validLen * 3) / 4);
  const out = new Uint8Array(outLen);
  let outIdx = 0;
  for (let i = 0; i < validLen; i += 4) {
    const c0 = padded.charAt(i);
    const c1 = padded.charAt(i + 1);
    const c2 = padded.charAt(i + 2);
    const c3 = padded.charAt(i + 3);
    const b0 = B64_MAP[c0];
    const b1 = B64_MAP[c1];
    const b2 = c2 === '=' ? 0 : B64_MAP[c2];
    const b3 = c3 === '=' ? 0 : B64_MAP[c3];
    if (b0 === undefined || b1 === undefined || b2 === undefined || b3 === undefined) {
      throw new Error('Base64 inválido: caracteres não permitidos.');
    }

    if (outIdx < outLen) out[outIdx++] = (b0 << 2) | (b1 >> 4);
    if (outIdx < outLen) out[outIdx++] = ((b1 & 15) << 4) | (b2 >> 2);
    if (outIdx < outLen) out[outIdx++] = ((b2 & 3) << 6) | b3;
  }
  return out;
}

export function encodeBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  if (typeof btoa === 'function') {
    return btoa(uint8ArrayToBinaryString(bytes));
  }
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;

    output += B64_CHARS.charAt(b0 >> 2);
    output += B64_CHARS.charAt(((b0 & 3) << 4) | (b1 >> 4));
    output += hasB1 ? B64_CHARS.charAt(((b1 & 15) << 2) | (b2 >> 6)) : '=';
    output += hasB2 ? B64_CHARS.charAt(b2 & 63) : '=';
  }
  return output;
}

export function normalizePhotoMimeType(rawMime?: string | null): string {
  if (!rawMime || typeof rawMime !== 'string') return '';
  const base = rawMime.split(';')[0]?.trim().toLowerCase() || '';
  if (base === 'image/jpg' || base === 'image/pjpeg') return 'image/jpeg';
  return base;
}

export function detectImageMimeTypeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (brand === 'heic' || brand === 'heix' || brand === 'hevc' || brand === 'hevx') {
      return 'image/heic';
    }
    if (brand === 'mif1' || brand === 'msf1' || brand === 'heif') {
      return 'image/heif';
    }
  }
  return null;
}

export function detectImageMimeTypeFromUri(uri: string): string | null {
  const clean = uri.split('?')[0]?.split('#')[0]?.toLowerCase() || '';
  if (/\.jpe?g$/.test(clean)) return 'image/jpeg';
  if (/\.png$/.test(clean)) return 'image/png';
  if (/\.webp$/.test(clean)) return 'image/webp';
  if (/\.heic$/.test(clean)) return 'image/heic';
  if (/\.heif$/.test(clean)) return 'image/heif';
  return null;
}

export function mimeTypeToExtension(mimeType: string): string {
  switch (normalizePhotoMimeType(mimeType)) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    case 'image/jpeg':
    default:
      return 'jpg';
  }
}

export async function readPhotoBinaryForUpload(
  rawUri: string,
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const trimmed = rawUri.trim();
  if (!trimmed) {
    throw new Error('URI da foto está vazia.');
  }
  if (isMockOrUnsplashUrl(trimmed)) {
    throw new Error('URL fictícia de estoque (Unsplash) não é permitida.');
  }

  let normalizedUri = trimmed;
  if (normalizedUri.startsWith('/9j/')) {
    normalizedUri = `data:image/jpeg;base64,${normalizedUri}`;
  } else if (normalizedUri.startsWith('iVBORw0KGgo')) {
    normalizedUri = `data:image/png;base64,${normalizedUri}`;
  } else if (normalizedUri.startsWith('UklGR')) {
    normalizedUri = `data:image/webp;base64,${normalizedUri}`;
  }

  let bytes: Uint8Array | null = null;
  let declaredMime = '';

  const dataUriMatch = normalizedUri.match(/^data:([^;,]+)(?:;[^;,]+)*;base64,([\s\S]*)$/i);
  if (dataUriMatch) {
    declaredMime = normalizePhotoMimeType(dataUriMatch[1]);
    bytes = decodeBase64(dataUriMatch[2] || '');
  } else {
    if (typeof fetch === 'function') {
      try {
        const res = await fetch(normalizedUri);
        if (res && (res.ok || res.status === 0)) {
          const buf = await res.arrayBuffer();
          if (buf && buf.byteLength > 0) {
            bytes = new Uint8Array(buf);
            const contentType = normalizePhotoMimeType(res.headers?.get?.('content-type'));
            if (
              contentType &&
              contentType !== 'application/octet-stream' &&
              contentType !== 'binary/octet-stream'
            ) {
              declaredMime = contentType;
            }
          }
        }
      } catch {
        // Tenta fallback de leitura local do Expo FileSystem abaixo
      }
    }

    if ((!bytes || bytes.byteLength === 0) && /^(?:file:\/\/|content:\/\/|\/)/i.test(normalizedUri)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fsMod = require('expo-file-system');
        if (fsMod?.File) {
          const fsFile = new fsMod.File(normalizedUri);
          if (typeof fsFile.bytes === 'function') {
            bytes = await fsFile.bytes();
          } else if (typeof fsFile.arrayBuffer === 'function') {
            bytes = new Uint8Array(await fsFile.arrayBuffer());
          }
        }
      } catch {
        // Tenta fallback legado abaixo
      }

      if (!bytes || bytes.byteLength === 0) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const legacyFs = require('expo-file-system/legacy');
          if (typeof legacyFs?.readAsStringAsync === 'function') {
            const b64 = await legacyFs.readAsStringAsync(normalizedUri, { encoding: 'base64' });
            if (typeof b64 === 'string' && b64.length > 0) {
              bytes = decodeBase64(b64);
            }
          }
        } catch {
          // Sem leitura nativa disponível
        }
      }
    }
  }

  if (!bytes || bytes.byteLength === 0) {
    throw new Error('Não foi possível ler os dados binários da foto selecionada.');
  }

  if (bytes.byteLength > MAX_RDO_PHOTO_BYTES) {
    throw new Error('A foto excede o tamanho máximo permitido de 10 MB.');
  }

  const allowedSet = new Set<string>(ALLOWED_RDO_PHOTO_MIME_TYPES);
  if (declaredMime && !allowedSet.has(declaredMime)) {
    throw new Error(
      `Formato de imagem não suportado (${declaredMime}). Envie JPEG, PNG, WebP ou HEIC.`,
    );
  }

  const magicMime = detectImageMimeTypeFromBytes(bytes);
  if (!magicMime || !allowedSet.has(magicMime)) {
    throw new Error(
      'Formato de imagem não suportado ou conteúdo binário inválido. Envie JPEG, PNG, WebP ou HEIC.',
    );
  }

  return { bytes, mimeType: magicMime };
}

export interface PdfResolvedImage {
  width: number;
  height: number;
  colorSpace: string;
  filter?: string;
  decodeParms?: string;
  bytes: Uint8Array;
  binaryString: string;
}

interface HuffmanTree {
  left: Int32Array;
  right: Int32Array;
  sym: Int32Array;
}

function buildHuffmanTree(lengths: number[]): HuffmanTree {
  const MAX_BITS = 15;
  const blCount = new Int32Array(MAX_BITS + 1);
  let maxLen = 0;
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i] || 0;
    if (len > 0 && len <= MAX_BITS) {
      blCount[len]++;
      if (len > maxLen) maxLen = len;
    }
  }

  const nextCode = new Int32Array(MAX_BITS + 1);
  let code = 0;
  for (let bits = 1; bits <= MAX_BITS; bits++) {
    code = (code + blCount[bits - 1]) << 1;
    nextCode[bits] = code;
  }

  const maxNodes = Math.max(64, lengths.length * 16 + 16);
  const left = new Int32Array(maxNodes).fill(-1);
  const right = new Int32Array(maxNodes).fill(-1);
  const sym = new Int32Array(maxNodes).fill(-1);
  let nodeCount = 1;

  for (let n = 0; n < lengths.length; n++) {
    const len = lengths[n] || 0;
    if (len === 0) continue;
    const symCode = nextCode[len]++;
    let node = 0;
    for (let b = len - 1; b >= 0; b--) {
      const bit = (symCode >>> b) & 1;
      if (bit === 0) {
        if (left[node] === -1) {
          if (nodeCount >= maxNodes) return { left, right, sym };
          left[node] = nodeCount++;
        }
        node = left[node];
      } else {
        if (right[node] === -1) {
          if (nodeCount >= maxNodes) return { left, right, sym };
          right[node] = nodeCount++;
        }
        node = right[node];
      }
    }
    sym[node] = n;
  }

  return { left, right, sym };
}

const FIXED_LIT_LENGTHS: number[] = [];
for (let i = 0; i <= 143; i++) FIXED_LIT_LENGTHS.push(8);
for (let i = 144; i <= 255; i++) FIXED_LIT_LENGTHS.push(9);
for (let i = 256; i <= 279; i++) FIXED_LIT_LENGTHS.push(7);
for (let i = 280; i <= 287; i++) FIXED_LIT_LENGTHS.push(8);
const FIXED_DIST_LENGTHS: number[] = new Array(32).fill(5);
const FIXED_LIT_TREE = buildHuffmanTree(FIXED_LIT_LENGTHS);
const FIXED_DIST_TREE = buildHuffmanTree(FIXED_DIST_LENGTHS);

const DEFLATE_LEN_BASE = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131,
  163, 195, 227, 258,
];
const DEFLATE_LEN_EXTRA = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0,
];
const DEFLATE_DIST_BASE = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049,
  3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DEFLATE_DIST_EXTRA = [
  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
];
const DEFLATE_CL_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

function inflateZlib(data: Uint8Array, maxOutputBytes = 64 * 1024 * 1024): Uint8Array | null {
  if (data.length < 6) return null;
  const cmf = data[0];
  const flg = data[1];
  if ((cmf & 0x0f) !== 8 || (cmf >> 4) > 7) return null;
  if (((cmf << 8) | flg) % 31 !== 0) return null;
  if (flg & 0x20) return null; // Preset dictionary not supported by PNG spec

  let pos = 2;
  let bitBuf = 0;
  let bitCount = 0;

  const readBits = (n: number): number => {
    while (bitCount < n) {
      if (pos >= data.length) return -1;
      bitBuf |= data[pos++] << bitCount;
      bitCount += 8;
    }
    const val = bitBuf & ((1 << n) - 1);
    bitBuf >>>= n;
    bitCount -= n;
    return val;
  };

  const alignToByte = () => {
    const extraBytes = bitCount >> 3;
    pos -= extraBytes;
    bitBuf = 0;
    bitCount = 0;
  };

  const decodeSymbol = (tree: HuffmanTree): number => {
    let node = 0;
    while (true) {
      if (tree.sym[node] >= 0) return tree.sym[node];
      if (bitCount === 0) {
        if (pos >= data.length) return -1;
        bitBuf = data[pos++];
        bitCount = 8;
      }
      const bit = bitBuf & 1;
      bitBuf >>>= 1;
      bitCount--;
      node = bit === 0 ? tree.left[node] : tree.right[node];
      if (node < 0) return -1;
    }
  };

  let out = new Uint8Array(Math.min(maxOutputBytes, Math.max(1024, data.length * 4)));
  let outPos = 0;

  const ensureCapacity = (extra: number): boolean => {
    if (outPos + extra > maxOutputBytes) return false;
    if (outPos + extra <= out.length) return true;
    let nextLen = out.length * 2;
    while (nextLen < outPos + extra) nextLen *= 2;
    const grown = new Uint8Array(Math.min(maxOutputBytes, nextLen));
    grown.set(out.subarray(0, outPos));
    out = grown;
    return true;
  };

  let bfinal = 0;
  do {
    bfinal = readBits(1);
    const btype = readBits(2);
    if (bfinal < 0 || btype < 0 || btype === 3) return null;

    if (btype === 0) {
      alignToByte();
      if (pos + 4 > data.length) return null;
      const len = data[pos] | (data[pos + 1] << 8);
      const nlen = data[pos + 2] | (data[pos + 3] << 8);
      pos += 4;
      if ((len ^ nlen) !== 0xffff || pos + len > data.length) return null;
      if (!ensureCapacity(len)) return null;
      out.set(data.subarray(pos, pos + len), outPos);
      pos += len;
      outPos += len;
    } else {
      let litTree: HuffmanTree;
      let distTree: HuffmanTree;

      if (btype === 1) {
        litTree = FIXED_LIT_TREE;
        distTree = FIXED_DIST_TREE;
      } else {
        const hlit = readBits(5) + 257;
        const hdist = readBits(5) + 1;
        const hclen = readBits(4) + 4;
        if (hlit < 257 || hdist < 1 || hclen < 4) return null;

        const clLengths = new Array<number>(19).fill(0);
        for (let i = 0; i < hclen; i++) {
          const val = readBits(3);
          if (val < 0) return null;
          clLengths[DEFLATE_CL_ORDER[i]] = val;
        }
        const clTree = buildHuffmanTree(clLengths);

        const totalLengths = hlit + hdist;
        const allLengths = new Array<number>(totalLengths).fill(0);
        let idx = 0;
        while (idx < totalLengths) {
          const sym = decodeSymbol(clTree);
          if (sym < 0) return null;
          if (sym < 16) {
            allLengths[idx++] = sym;
          } else {
            let repeat = 0;
            let value = 0;
            if (sym === 16) {
              if (idx === 0) return null;
              const extra = readBits(2);
              if (extra < 0) return null;
              repeat = 3 + extra;
              value = allLengths[idx - 1];
            } else if (sym === 17) {
              const extra = readBits(3);
              if (extra < 0) return null;
              repeat = 3 + extra;
            } else {
              const extra = readBits(7);
              if (extra < 0) return null;
              repeat = 11 + extra;
            }
            if (idx + repeat > totalLengths) return null;
            for (let r = 0; r < repeat; r++) {
              allLengths[idx++] = value;
            }
          }
        }

        litTree = buildHuffmanTree(allLengths.slice(0, hlit));
        distTree = buildHuffmanTree(allLengths.slice(hlit));
      }

      while (true) {
        const sym = decodeSymbol(litTree);
        if (sym < 0) return null;
        if (sym < 256) {
          if (!ensureCapacity(1)) return null;
          out[outPos++] = sym;
        } else if (sym === 256) {
          break;
        } else {
          const lenIdx = sym - 257;
          if (lenIdx >= DEFLATE_LEN_BASE.length) return null;
          const lenExtra = DEFLATE_LEN_EXTRA[lenIdx];
          const extraLenBits = lenExtra > 0 ? readBits(lenExtra) : 0;
          if (extraLenBits < 0) return null;
          const length = DEFLATE_LEN_BASE[lenIdx] + extraLenBits;

          const distSym = decodeSymbol(distTree);
          if (distSym < 0 || distSym >= DEFLATE_DIST_BASE.length) return null;
          const distExtra = DEFLATE_DIST_EXTRA[distSym];
          const extraDistBits = distExtra > 0 ? readBits(distExtra) : 0;
          if (extraDistBits < 0) return null;
          const distance = DEFLATE_DIST_BASE[distSym] + extraDistBits;
          if (distance <= 0 || distance > outPos) return null;

          if (!ensureCapacity(length)) return null;
          for (let i = 0; i < length; i++) {
            out[outPos] = out[outPos - distance];
            outPos++;
          }
        }
      }
    }
  } while (bfinal === 0);

  return out.subarray(0, outPos);
}

function wrapZlibStored(raw: Uint8Array): Uint8Array {
  const maxBlock = 65535;
  const numBlocks = Math.max(1, Math.ceil(raw.length / maxBlock));
  const out = new Uint8Array(2 + raw.length + numBlocks * 5 + 4);
  out[0] = 0x78;
  out[1] = 0x01;
  let pos = 2;
  let offset = 0;
  for (let b = 0; b < numBlocks; b++) {
    const len = Math.min(maxBlock, raw.length - offset);
    out[pos++] = b === numBlocks - 1 ? 1 : 0;
    out[pos++] = len & 0xff;
    out[pos++] = (len >> 8) & 0xff;
    const nlen = (~len) & 0xffff;
    out[pos++] = nlen & 0xff;
    out[pos++] = (nlen >> 8) & 0xff;
    out.set(raw.subarray(offset, offset + len), pos);
    pos += len;
    offset += len;
  }
  let s1 = 1;
  let s2 = 0;
  for (let i = 0; i < raw.length; i++) {
    s1 = (s1 + raw[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  const adler = ((s2 << 16) | s1) >>> 0;
  out[pos++] = (adler >>> 24) & 0xff;
  out[pos++] = (adler >>> 16) & 0xff;
  out[pos++] = (adler >>> 8) & 0xff;
  out[pos++] = adler & 0xff;
  return out;
}

function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilterPngPass(
  inflated: Uint8Array,
  offset: number,
  passWidth: number,
  passHeight: number,
  bpp: number,
  rowBytes: number,
): { unfiltered: Uint8Array; nextOffset: number } | null {
  const stride = 1 + rowBytes;
  if (offset + passHeight * stride > inflated.length) return null;
  const unfiltered = new Uint8Array(passHeight * rowBytes);
  let prevRow: Uint8Array | null = null;

  for (let y = 0; y < passHeight; y++) {
    const srcStart = offset + y * stride;
    const filterType = inflated[srcStart];
    if (filterType > 4) return null;

    const dstStart = y * rowBytes;
    const currRow = unfiltered.subarray(dstStart, dstStart + rowBytes);
    for (let i = 0; i < rowBytes; i++) {
      const raw = inflated[srcStart + 1 + i];
      const left = i >= bpp ? currRow[i - bpp] : 0;
      const up = prevRow ? prevRow[i] : 0;
      const upLeft = prevRow && i >= bpp ? prevRow[i - bpp] : 0;

      if (filterType === 0) {
        currRow[i] = raw;
      } else if (filterType === 1) {
        currRow[i] = (raw + left) & 0xff;
      } else if (filterType === 2) {
        currRow[i] = (raw + up) & 0xff;
      } else if (filterType === 3) {
        currRow[i] = (raw + ((left + up) >> 1)) & 0xff;
      } else {
        currRow[i] = (raw + paethPredictor(left, up, upLeft)) & 0xff;
      }
    }
    prevRow = currRow;
  }

  return { unfiltered, nextOffset: offset + passHeight * stride };
}

function readPngSample(
  row: Uint8Array,
  rowOffset: number,
  sampleIndex: number,
  bitDepth: number,
): number {
  if (bitDepth === 8) return row[rowOffset + sampleIndex];
  if (bitDepth === 16) return row[rowOffset + sampleIndex * 2];
  const samplesPerByte = 8 / bitDepth;
  const byteVal = row[rowOffset + Math.floor(sampleIndex / samplesPerByte)];
  const shift = (samplesPerByte - 1 - (sampleIndex % samplesPerByte)) * bitDepth;
  const maxVal = (1 << bitDepth) - 1;
  const raw = (byteVal >> shift) & maxVal;
  return Math.round((raw * 255) / maxVal);
}

function readPngPaletteIndex(
  row: Uint8Array,
  rowOffset: number,
  pixelIndex: number,
  bitDepth: number,
): number {
  if (bitDepth === 8) return row[rowOffset + pixelIndex];
  const samplesPerByte = 8 / bitDepth;
  const byteVal = row[rowOffset + Math.floor(pixelIndex / samplesPerByte)];
  const shift = (samplesPerByte - 1 - (pixelIndex % samplesPerByte)) * bitDepth;
  return (byteVal >> shift) & ((1 << bitDepth) - 1);
}

export function parsePngForPdf(bytes: Uint8Array): PdfResolvedImage | null {
  if (detectImageMimeTypeFromBytes(bytes) !== 'image/png') {
    return null;
  }

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  let hasIhdr = false;
  let plte: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idatChunks: Uint8Array[] = [];

  let pos = 8;
  while (pos + 12 <= bytes.length) {
    const chunkLen =
      ((bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3]) >>> 0;
    const chunkType = String.fromCharCode(
      bytes[pos + 4],
      bytes[pos + 5],
      bytes[pos + 6],
      bytes[pos + 7],
    );
    const dataStart = pos + 8;
    const dataEnd = dataStart + chunkLen;
    if (dataEnd + 4 > bytes.length) return null;

    if (chunkType === 'IHDR') {
      if (chunkLen !== 13 || hasIhdr) return null;
      hasIhdr = true;
      width =
        ((bytes[dataStart] << 24) |
          (bytes[dataStart + 1] << 16) |
          (bytes[dataStart + 2] << 8) |
          bytes[dataStart + 3]) >>>
        0;
      height =
        ((bytes[dataStart + 4] << 24) |
          (bytes[dataStart + 5] << 16) |
          (bytes[dataStart + 6] << 8) |
          bytes[dataStart + 7]) >>>
        0;
      bitDepth = bytes[dataStart + 8];
      colorType = bytes[dataStart + 9];
      const compression = bytes[dataStart + 10];
      const filter = bytes[dataStart + 11];
      interlace = bytes[dataStart + 12];
      if (
        width === 0 ||
        height === 0 ||
        width > 20000 ||
        height > 20000 ||
        compression !== 0 ||
        filter !== 0 ||
        (interlace !== 0 && interlace !== 1)
      ) {
        return null;
      }
    } else if (chunkType === 'PLTE') {
      plte = bytes.subarray(dataStart, dataEnd);
    } else if (chunkType === 'tRNS') {
      trns = bytes.subarray(dataStart, dataEnd);
    } else if (chunkType === 'IDAT') {
      idatChunks.push(bytes.subarray(dataStart, dataEnd));
    } else if (chunkType === 'IEND') {
      break;
    }

    pos = dataEnd + 4;
  }

  if (!hasIhdr || idatChunks.length === 0) return null;

  const validDepths: Record<number, number[]> = {
    0: [1, 2, 4, 8, 16],
    2: [8, 16],
    3: [1, 2, 4, 8],
    4: [8, 16],
    6: [8, 16],
  };
  if (!validDepths[colorType]?.includes(bitDepth)) return null;
  if (colorType === 3 && (!plte || plte.length % 3 !== 0 || plte.length === 0)) return null;

  const samplesPerPixel =
    colorType === 0 ? 1 : colorType === 2 ? 3 : colorType === 3 ? 1 : colorType === 4 ? 2 : 4;
  const bpp = Math.max(1, Math.ceil((samplesPerPixel * bitDepth) / 8));

  let totalIdatLen = 0;
  for (const chunk of idatChunks) totalIdatLen += chunk.length;
  const idatBytes = new Uint8Array(totalIdatLen);
  let idatOffset = 0;
  for (const chunk of idatChunks) {
    idatBytes.set(chunk, idatOffset);
    idatOffset += chunk.length;
  }

  const maxUncompressed = Math.min(64 * 1024 * 1024, (1 + width * 8) * height * 2 + 4096);
  const inflated = inflateZlib(idatBytes, maxUncompressed);
  if (!inflated) return null;

  // Caminho rápido compacto para PNG RGB/Grayscale 8-bit não entrelaçado sem transparência:
  // usa o fluxo IDAT original com /Filter /FlateDecode e /DecodeParms /Predictor 15 após validar os scanlines.
  if (interlace === 0 && bitDepth === 8 && (colorType === 2 || colorType === 0) && !trns) {
    const rowBytes = width * samplesPerPixel;
    const expectedLen = height * (1 + rowBytes);
    if (inflated.length !== expectedLen) return null;
    for (let y = 0; y < height; y++) {
      if (inflated[y * (1 + rowBytes)] > 4) return null;
    }
    return {
      width,
      height,
      colorSpace: colorType === 0 ? '/DeviceGray' : '/DeviceRGB',
      filter: '/FlateDecode',
      decodeParms: `<< /Predictor 15 /Colors ${samplesPerPixel} /BitsPerComponent 8 /Columns ${width} >>`,
      bytes: idatBytes,
      binaryString: uint8ArrayToBinaryString(idatBytes),
    };
  }

  // Caminho completo: decodifica RGBA, Grayscale+Alpha, Paleta (PLTE/tRNS), 1/2/4/16-bit e Adam7 para RGB 8-bit sobre fundo branco
  const rgbOut = new Uint8Array(width * height * 3);
  const passes =
    interlace === 0
      ? [[0, 0, 1, 1]]
      : [
          [0, 0, 8, 8],
          [4, 0, 8, 8],
          [0, 4, 4, 8],
          [2, 0, 4, 4],
          [0, 2, 2, 4],
          [1, 0, 2, 2],
          [0, 1, 1, 2],
        ];

  let inflatedOffset = 0;
  for (const [x0, y0, dx, dy] of passes) {
    const pw = Math.ceil((width - x0) / dx);
    const ph = Math.ceil((height - y0) / dy);
    if (pw <= 0 || ph <= 0) continue;

    const rowBytes = Math.ceil((pw * samplesPerPixel * bitDepth) / 8);
    const passResult = unfilterPngPass(inflated, inflatedOffset, pw, ph, bpp, rowBytes);
    if (!passResult) return null;
    inflatedOffset = passResult.nextOffset;
    const { unfiltered } = passResult;

    for (let py = 0; py < ph; py++) {
      const rowOffset = py * rowBytes;
      const destY = y0 + py * dy;
      for (let px = 0; px < pw; px++) {
        const destX = x0 + px * dx;
        const outIdx = (destY * width + destX) * 3;
        let r = 255;
        let g = 255;
        let b = 255;

        if (colorType === 0) {
          const gray = readPngSample(unfiltered, rowOffset, px, bitDepth);
          const isTransparent =
            trns &&
            trns.length >= 2 &&
            ((bitDepth === 16 &&
              unfiltered[rowOffset + px * 2] === trns[0] &&
              unfiltered[rowOffset + px * 2 + 1] === trns[1]) ||
              (bitDepth <= 8 && gray === Math.round((trns[1] * 255) / ((1 << bitDepth) - 1))));
          if (!isTransparent) {
            r = gray;
            g = gray;
            b = gray;
          }
        } else if (colorType === 2) {
          const sBase = px * 3;
          const r0 = readPngSample(unfiltered, rowOffset, sBase, bitDepth);
          const g0 = readPngSample(unfiltered, rowOffset, sBase + 1, bitDepth);
          const b0 = readPngSample(unfiltered, rowOffset, sBase + 2, bitDepth);
          const isTransparent =
            trns &&
            trns.length >= 6 &&
            bitDepth === 8 &&
            r0 === trns[1] &&
            g0 === trns[3] &&
            b0 === trns[5];
          if (!isTransparent) {
            r = r0;
            g = g0;
            b = b0;
          }
        } else if (colorType === 3 && plte) {
          const pIdx = readPngPaletteIndex(unfiltered, rowOffset, px, bitDepth);
          if (pIdx * 3 + 2 < plte.length) {
            const pr = plte[pIdx * 3];
            const pg = plte[pIdx * 3 + 1];
            const pb = plte[pIdx * 3 + 2];
            const alpha = trns && pIdx < trns.length ? trns[pIdx] : 255;
            r = Math.round((pr * alpha + 255 * (255 - alpha)) / 255);
            g = Math.round((pg * alpha + 255 * (255 - alpha)) / 255);
            b = Math.round((pb * alpha + 255 * (255 - alpha)) / 255);
          }
        } else if (colorType === 4) {
          const sBase = px * 2;
          const gray = readPngSample(unfiltered, rowOffset, sBase, bitDepth);
          const alpha = readPngSample(unfiltered, rowOffset, sBase + 1, bitDepth);
          const blended = Math.round((gray * alpha + 255 * (255 - alpha)) / 255);
          r = blended;
          g = blended;
          b = blended;
        } else if (colorType === 6) {
          const sBase = px * 4;
          const pr = readPngSample(unfiltered, rowOffset, sBase, bitDepth);
          const pg = readPngSample(unfiltered, rowOffset, sBase + 1, bitDepth);
          const pb = readPngSample(unfiltered, rowOffset, sBase + 2, bitDepth);
          const alpha = readPngSample(unfiltered, rowOffset, sBase + 3, bitDepth);
          r = Math.round((pr * alpha + 255 * (255 - alpha)) / 255);
          g = Math.round((pg * alpha + 255 * (255 - alpha)) / 255);
          b = Math.round((pb * alpha + 255 * (255 - alpha)) / 255);
        }

        rgbOut[outIdx] = r;
        rgbOut[outIdx + 1] = g;
        rgbOut[outIdx + 2] = b;
      }
    }
  }

  const compressedRgb = wrapZlibStored(rgbOut);
  return {
    width,
    height,
    colorSpace: '/DeviceRGB',
    filter: '/FlateDecode',
    bytes: compressedRgb,
    binaryString: uint8ArrayToBinaryString(compressedRgb),
  };
}

async function transcodeDataUriToJpegViaCanvas(dataUri: string): Promise<string | null> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return null;
  }
  const probeCanvas = document.createElement('canvas');
  const probeCtx = probeCanvas?.getContext?.('2d');
  if (!probeCtx) {
    return null;
  }

  return new Promise<string | null>((resolve) => {
    let settled = false;
    const finish = (val: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(val);
    };
    const timer = setTimeout(() => finish(null), 3000);

    try {
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width || 0;
          const h = img.naturalHeight || img.height || 0;
          if (w <= 0 || h <= 0) {
            finish(null);
            return;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            finish(null);
            return;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const jpegDataUri = canvas.toDataURL('image/jpeg', 0.9);
          if (
            typeof jpegDataUri === 'string' &&
            /^data:image\/jpeg;base64,/i.test(jpegDataUri)
          ) {
            const b64 = jpegDataUri.replace(/^data:image\/jpeg;base64,/i, '');
            const jpegBytes = decodeBase64(b64);
            if (getJpegDimensions(jpegBytes)) {
              finish(jpegDataUri);
              return;
            }
          }
          finish(null);
        } catch {
          finish(null);
        }
      };
      img.onerror = () => finish(null);
      img.src = dataUri;
    } catch {
      finish(null);
    }
  });
}

/**
 * Resolve o payload binário de imagem para incorporação como XObject no PDF (%PDF-1.4).
 * Incorpora JPEGs reais válidos (/Filter /DCTDecode) e PNGs reais válidos (/Filter /FlateDecode).
 * Quando a imagem não estiver disponível localmente em formato incorporável válido (ex: URL remota não pré-carregada
 * ou dados inválidos), retorna null para que o gerador de PDF exiba um indicador honesto de indisponibilidade
 * sem jamais substituir por uma imagem sintética fictícia.
 */
export function resolvePdfImagePayload(photo: PhotoInput, _index = 0): PdfResolvedImage | null {
  let uri = extractRawPhotoCandidate(photo);

  if (!uri || isMockOrUnsplashUrl(uri)) {
    return null;
  }

  // Normalização de raw Base64 JPEG ou PNG sem o prefixo data:image
  if (uri.startsWith('/9j/')) {
    uri = `data:image/jpeg;base64,${uri}`;
  } else if (uri.startsWith('iVBORw0KGgo')) {
    uri = `data:image/png;base64,${uri}`;
  }

  const dataMatch = uri.match(/^data:image\/([a-z0-9.+-]+)(?:;[^;,]+)*;base64,\s*([\s\S]*)$/i);
  if (dataMatch) {
    try {
      const base64Data = dataMatch[2] || '';
      const bytes = decodeBase64(base64Data);
      const magicMime = detectImageMimeTypeFromBytes(bytes);

      if (magicMime === 'image/jpeg') {
        const dims = getJpegDimensions(bytes);
        if (!dims) return null;
        return {
          width: dims.width,
          height: dims.height,
          colorSpace: dims.colorSpace || '/DeviceRGB',
          filter: '/DCTDecode',
          bytes,
          binaryString: uint8ArrayToBinaryString(bytes),
        };
      }

      if (magicMime === 'image/png') {
        return parsePngForPdf(bytes);
      }

      return null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Pré-carrega fotos remotas (https://, blob:, file://) e converte/prepara imagens JPEG, PNG e WebP
 * das primeiras imagens exibidas no PDF para incorporação binária fiel no arquivo %PDF-1.4 gerado.
 */
export async function prefetchRdoPhotosForPdf(rdo: RDO): Promise<RDO> {
  if (!rdo?.photos || rdo.photos.length === 0) {
    return rdo;
  }

  const hydratedPhotos = await Promise.all(
    rdo.photos.map(async (photo, idx) => {
      if (!photo || idx >= 2) return photo;

      const existing = resolvePdfImagePayload(photo, idx);
      if (existing) return photo;

      const resolvedUri = resolvePhotoUri(photo, idx);
      if (!resolvedUri || isMockOrUnsplashUrl(resolvedUri)) {
        return photo;
      }

      try {
        const { bytes, mimeType } = await readPhotoBinaryForUpload(resolvedUri);

        if (mimeType === 'image/jpeg') {
          const dims = getJpegDimensions(bytes);
          if (!dims) {
            return photo;
          }
          const dataUri = `data:image/jpeg;base64,${encodeBase64(bytes)}`;
          return {
            ...photo,
            uri: dataUri,
            watermarkedUri: dataUri,
          };
        }

        const sourceDataUri = `data:${mimeType};base64,${encodeBase64(bytes)}`;

        // Para PNG: embed direto via /Filter /FlateDecode (sem perda e sem depender de Canvas)
        if (mimeType === 'image/png' && parsePngForPdf(bytes)) {
          return {
            ...photo,
            uri: sourceDataUri,
            watermarkedUri: sourceDataUri,
          };
        }

        // Para WebP, HEIC ou PNG não-padrão: transcodifica para JPEG via <canvas> na Web quando disponível
        const transcodedJpegUri = await transcodeDataUriToJpegViaCanvas(sourceDataUri);
        if (transcodedJpegUri) {
          return {
            ...photo,
            uri: transcodedJpegUri,
            watermarkedUri: transcodedJpegUri,
          };
        }

        return photo;
      } catch {
        return photo;
      }
    }),
  );

  return {
    ...rdo,
    photos: hydratedPhotos,
  };
}
