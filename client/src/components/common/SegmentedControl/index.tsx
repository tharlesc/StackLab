import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[] | readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** `dark` para uso sobre o Hero Card escuro. */
  tone?: 'light' | 'dark';
}

/** Controle segmentado (filtros de período, filtros de inbox etc.). */
export function SegmentedControl<T extends string>({ options, value, onChange, tone = 'light' }: SegmentedControlProps<T>) {
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)) as SegmentOption<T>[];
  return (
    <Container $tone={tone} accessibilityRole="tablist">
      {normalized.map((opt) => {
        const active = opt.value === value;
        return (
          <Segment
            key={opt.value}
            $active={active}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
          >
            <SegmentText $active={active} $tone={tone}>{opt.label}</SegmentText>
          </Segment>
        );
      })}
    </Container>
  );
}

const Container = styled.View<{ $tone: 'light' | 'dark' }>`
  flex-direction: row;
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background-color: ${({ theme, $tone }) => ($tone === 'dark' ? theme.colors.tag.timeFilterBg : theme.colors.surfaceVariant)};
`;

const Segment = styled(TouchableOpacity)<{ $active: boolean }>`
  flex: 1;
  min-height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme, $active }) => ($active ? theme.colors.secondary : 'transparent')};
`;

const SegmentText = styled.Text<{ $active: boolean; $tone: 'light' | 'dark' }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 12px;
  color: ${({ theme, $active, $tone }) =>
    $active ? theme.colors.text.inverse : $tone === 'dark' ? theme.colors.hero.textSecondary : theme.colors.text.secondary};
`;

export default SegmentedControl;
