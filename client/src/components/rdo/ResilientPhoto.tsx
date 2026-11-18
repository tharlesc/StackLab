import React, { useState } from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ImageOff, RefreshCw } from 'lucide-react-native';
import { resolvePhotoUri, PhotoInput } from '@/utils/rdoPhotoUtils';

export interface ResilientPhotoProps {
  photo: PhotoInput;
  index: number;
  testID?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  accessibilityLabel?: string;
}

/**
 * Exibe exclusivamente a foto real registrada pelo operador.
 * Caso a URI esteja ausente, seja inválida ou falhe ao carregar, exibe um estado
 * explícito de indisponibilidade com opção de nova tentativa — sem jamais substituir
 * a foto enviada por imagens fictícias de estoque.
 */
export const ResilientPhoto: React.FC<ResilientPhotoProps> = ({
  photo,
  index,
  testID,
  style,
  resizeMode = 'cover',
  accessibilityLabel,
}) => {
  const resolved = resolvePhotoUri(photo, index);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const hasError = !resolved || failedUri === resolved;

  if (hasError) {
    return (
      <View
        testID={testID ? `${testID}-unavailable` : undefined}
        accessibilityRole="text"
        accessibilityLabel={
          accessibilityLabel
            ? `${accessibilityLabel} — Foto indisponível`
            : 'Foto indisponível'
        }
        style={[styles.unavailableBox, style as StyleProp<ViewStyle>]}
      >
        <ImageOff size={28} color="#64748B" />
        <Text style={styles.unavailableTitle}>Foto indisponível</Text>
        <Text style={styles.unavailableSubtitle}>
          {resolved
            ? 'Não foi possível carregar a imagem enviada.'
            : 'Nenhuma imagem válida registrada para esta foto.'}
        </Text>
        {Boolean(resolved) && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setFailedUri(null);
              setRetryCount((prev) => prev + 1);
            }}
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar foto novamente"
          >
            <RefreshCw size={12} color="#0B2240" />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <Image
      key={`${resolved}-${retryCount}`}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      source={{ uri: resolved }}
      onError={() => {
        setFailedUri(resolved);
      }}
      style={style}
      resizeMode={resizeMode}
    />
  );
};

const styles = StyleSheet.create({
  unavailableBox: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 140,
    gap: 6,
  },
  unavailableTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  unavailableSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  retryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0B2240',
  },
});
