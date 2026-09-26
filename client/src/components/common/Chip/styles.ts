import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export type ChipVariant = 'dark' | 'outline' | 'surface' | 'accent';

export const ChipContainer = styled(TouchableOpacity)<{ $variant: ChipVariant; $hasAction: boolean }>`
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  background-color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'surface':
        return theme.colors.surfaceVariant;
      case 'outline':
        return 'transparent';
      case 'accent':
        return theme.colors.tag.masterBg;
      case 'dark':
      default:
        return theme.colors.chip.background;
    }
  }};
  border-width: ${({ $variant }) => ($variant === 'outline' ? '1px' : '0px')};
  border-color: ${({ theme, $variant }) => ($variant === 'outline' ? theme.colors.border : 'transparent')};
`;

export const ChipText = styled.Text<{ $variant: ChipVariant }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'surface':
        return theme.colors.text.primary;
      case 'outline':
        return theme.colors.text.secondary;
      case 'accent':
        return theme.colors.secondary;
      case 'dark':
      default:
        return theme.colors.chip.text;
    }
  }};
`;
