import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const AccordionHeader = styled(TouchableOpacity)<{ $isOpen: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme, $isOpen }) =>
    $isOpen ? theme.colors.surfaceVariant : 'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const AccordionTitle = styled.Text<{ $isOpen: boolean }>`
  font-family: ${({ theme, $isOpen }) =>
    $isOpen ? theme.fonts.semiBold : theme.fonts.medium};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  color: ${({ theme, $isOpen }) =>
    $isOpen ? theme.colors.secondary : theme.colors.text.secondary};
`;

export const AccordionBody = styled.View`
  padding-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const TimeInputsRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const TimeInputCol = styled.View`
  flex: 1;
`;

