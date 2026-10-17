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
  containerStyle?: StyleProp<ViewStyle>;
  /** Define se o input está visualmente estendido com um painel inferior */
  isExpanded?: boolean;
  /** Conteúdo exibido como extensão inferior integrada, sem separador visual */
  children?: React.ReactNode;
}

/**
 * 🔍 SearchBar — Componente de busca acessível, responsivo e extensível (Apple HIG).
 * Reutilizável no Dashboard do Master, na Caixa de Validação e nos Cadastros.
 * Quando possui resultados ou conteúdo dinâmico (children), remove a borda inferior e se
 * estende perfeitamente como um único elemento contínuo integrado.
 */
export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Buscar por obra, número ou autor...',
  onClear,
  style,
  containerStyle,
  isExpanded,
  children,
}: SearchBarProps) => {
  const theme = useTheme();

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const hasChildren = Boolean(children);
  const expanded = isExpanded ?? hasChildren;

  return (
    <Wrapper style={containerStyle}>
      <InputBox $isExpanded={expanded} style={style}>
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
      </InputBox>

      {hasChildren && (
        <ExtensionContainer>
          {children}
        </ExtensionContainer>
      )}
    </Wrapper>
  );
};

export const Wrapper = styled.View`
  width: 100%;
`;

export const InputBox = styled.View<{ $isExpanded?: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};

  ${({ $isExpanded }) =>
    $isExpanded &&
    `
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    border-bottom-width: 0px;
  `}
`;

export const ExtensionContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius.xl}px;
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.xl}px;
  border-width: 1px;
  border-top-width: 0px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 8px 16px 14px 16px;
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
