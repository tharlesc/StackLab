import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawKey &&
    !rawUrl.includes('SEU-PROJETO') &&
    !rawKey.includes('sua-anon-key'),
);

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-stacklab.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key';

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase URL ou Anon Key não configuradas no client/.env! O app funcionará com dados locais de fallback.',
  );
}

// Wrapper resiliente de storage com timeout para evitar deadlocks de AsyncStorage no mobile/web
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await Promise.race([
        AsyncStorage.getItem(key),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
      ]);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await Promise.race([
        AsyncStorage.setItem(key, value),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 2500)),
      ]);
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await Promise.race([
        AsyncStorage.removeItem(key),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 2500)),
      ]);
    } catch {}
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
