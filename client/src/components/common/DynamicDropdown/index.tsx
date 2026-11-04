import React, { useState, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Plus, ArrowLeft, ChevronDown, ChevronUp, Search } from 'lucide-react-native';
import {
  Container,
  Label,
  Row,
  SelectTrigger,
  SelectText,
  ManualInput,
  ActionButton,
  DropdownList,
  SearchInputContainer,
  SearchInput,
  OptionItem,
  OptionText,
  EmptyOptions,
  HelperText,
} from './styles';

export interface DynamicDropdownProps {
  label?: string;
  placeholder?: string;
  manualPlaceholder?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
}

export const DynamicDropdown: React.FC<DynamicDropdownProps> = ({
  label,
  placeholder = 'Selecione uma opção...',
  manualPlaceholder = 'Digite o nome manualmente...',
  options,
  value,
  onChange,
  accessibilityLabel,
  error,
  helper,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isManual, setIsManual] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((item) => item.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const handleSelectOption = (item: string) => {
    onChange(item);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggleManual = () => {
    if (disabled) return;
    setIsManual((prev) => !prev);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <Container>
      {label && <Label>{label}</Label>}

      <Row>
        {isManual ? (
          <>
            <ManualInput
              value={value}
              onChangeText={onChange}
              placeholder={manualPlaceholder}
              placeholderTextColor={theme.colors.text.secondary}
              accessibilityLabel={`${accessibilityLabel} - Entrada manual`}
              editable={!disabled}
              $hasError={Boolean(error)}
              $disabled={disabled}
              autoFocus
            />
            <ActionButton
              onPress={handleToggleManual}
              disabled={disabled}
              accessibilityLabel="Voltar para seleção em lista"
              accessibilityRole="button"
            >
              <ArrowLeft size={20} color={theme.colors.text.primary} />
            </ActionButton>
          </>
        ) : (
          <>
            <SelectTrigger
              onPress={() => !disabled && setIsOpen((prev) => !prev)}
              $isOpen={isOpen}
              $hasError={Boolean(error)}
              $disabled={disabled}
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <SelectText $hasValue={Boolean(value)}>
                {value || placeholder}
              </SelectText>
              {isOpen ? (
                <ChevronUp size={20} color={theme.colors.text.secondary} />
              ) : (
                <ChevronDown size={20} color={theme.colors.text.secondary} />
              )}
            </SelectTrigger>
            <ActionButton
              onPress={handleToggleManual}
              disabled={disabled}
              accessibilityLabel="Inserir manualmente"
              accessibilityRole="button"
            >
              <Plus size={20} color={theme.colors.text.primary} />
            </ActionButton>
          </>
        )}
      </Row>

      {!isManual && isOpen && (
        <DropdownList>
          <SearchInputContainer>
            <Search size={16} color={theme.colors.text.secondary} />
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar..."
              placeholderTextColor={theme.colors.text.secondary}
              autoCorrect={false}
            />
          </SearchInputContainer>
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <OptionItem
                $selected={item === value}
                onPress={() => handleSelectOption(item)}
              >
                <OptionText $selected={item === value}>{item}</OptionText>
              </OptionItem>
            )}
            ListEmptyComponent={
              <EmptyOptions>Nenhuma opção encontrada</EmptyOptions>
            }
          />
        </DropdownList>
      )}

      {error ? (
        <HelperText $isError>{error}</HelperText>
      ) : helper ? (
        <HelperText>{helper}</HelperText>
      ) : null}
    </Container>
  );
};

