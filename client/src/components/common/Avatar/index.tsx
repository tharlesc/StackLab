import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { UserRound } from 'lucide-react-native';
import { getInitials } from '@/utils/text';

export interface AvatarProps {
  name?: string;
  size?: number;
  /** Exibe borda de destaque (cor secundária). */
  highlighted?: boolean;
}

/** Avatar circular: iniciais do nome ou ícone padrão. */
export const Avatar = ({ name, size = 40, highlighted = false }: AvatarProps) => {
  const theme = useTheme();
  const initials = name ? getInitials(name) : '';
  return (
    <Circle $size={size} $highlighted={highlighted} accessibilityRole="image" accessibilityLabel={name ? `Avatar de ${name}` : 'Avatar'}>
      {initials ? (
        <Initials $size={size}>{initials}</Initials>
      ) : (
        <UserRound color={theme.colors.text.inverse} size={size * 0.5} />
      )}
    </Circle>
  );
};

const Circle = styled.View<{ $size: number; $highlighted: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  border-width: ${({ $highlighted }) => ($highlighted ? 3 : 0)}px;
  border-color: ${({ theme }) => theme.colors.secondary};
`;

const Initials = styled.Text<{ $size: number }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ $size }) => Math.round($size * 0.38)}px;
  color: ${({ theme }) => theme.colors.text.inverse};
`;

export default Avatar;
