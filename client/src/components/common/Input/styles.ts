import styled from 'styled-components/native';
import { TextInput } from 'react-native';

export const StyledInput = styled(TextInput)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  min-height: 44px;
`;
