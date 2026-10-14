import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { TextInput, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Search, X } from 'lucide-react-native';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * 🔍 SearchBar — Componente de busca acessível e responsivo (Apple HIG).
 * Reutilizável no Dashboard do Master, na Caixa de Validação e nos Cadastros.
 */
export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Buscar por obra, número ou autor...',
  onClear,
  style,
}: SearchBarProps) => {
  const theme = useTheme();

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <Container style={style}>
      <Search color={theme.colors.text.secondary} size={18} />
      <Field
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        returnKeyType="search"
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <ClearButton
          onPress={handleClear}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
        >
          <X color={theme.colors.text.secondary} size={16} />
        </ClearButton>
      )}
    </Container>
  );
};

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Field = styled(TextInput)`
  flex: 1;
  min-height: 44px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0;
`;

const ClearButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
`;

export default SearchBar;
