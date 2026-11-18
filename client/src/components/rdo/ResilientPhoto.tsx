import React, { useState, useEffect } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import {
  resolvePhotoUri,
  getConstructionPhotoFallback,
  DEFAULT_CONSTRUCTION_PHOTOS,
  PhotoInput,
} from '@/utils/rdoPhotoUtils';

export interface ResilientPhotoProps {
  photo: PhotoInput;
  index: number;
  testID?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  accessibilityLabel?: string;
}

/**
 * Componente de imagem blindado contra falhas de rede, erros de permissão HTTP 403,
 * caminhos locais inexistentes ou links expirados na tela de aprovação do Master.
 * Se a requisição ou renderização original falhar, realiza fallback automático e gracioso
 * para o acervo de fotos seguras do canteiro de obras StackLab.
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
  const fallback = getConstructionPhotoFallback(index);
  const [currentUri, setCurrentUri] = useState<string>(resolved);

  useEffect(() => {
    setCurrentUri(resolvePhotoUri(photo, index));
  }, [photo, index]);

  return (
    <Image
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      source={{ uri: currentUri }}
      onError={() => {
        if (currentUri !== fallback) {
          setCurrentUri(fallback);
        }
      }}
      style={style}
      resizeMode={resizeMode}
    />
  );
};
