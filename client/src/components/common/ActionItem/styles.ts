import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled(TouchableOpacity)<{ $isLast?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm}px 0;
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  margin-top: ${({ $isLast, theme }) => ($isLast ? `${theme.spacing.sm}px` : '0px')};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const LeftContent = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

export const Title = styled.Text<{ $variant?: 'default' | 'danger' }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme, $variant }) =>
    $variant === 'danger' ? theme.colors.status.error.text : theme.colors.text.primary};
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

export const RightContent = styled.View`
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;
