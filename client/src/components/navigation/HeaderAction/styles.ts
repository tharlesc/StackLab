import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const ActionButton = styled(TouchableOpacity)`
  position: relative;
  min-width: ${({ theme }) => theme.touchTarget.minWidth}px;
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  align-items: center;
  justify-content: center;
`;

export const NotificationDot = styled.View`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xs}px;
  right: ${({ theme }) => theme.spacing.xs}px;
  width: ${({ theme }) => theme.spacing.sm}px;
  height: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
  border: 1px solid ${({ theme }) => theme.colors.surface};
`;

export const Badge = styled.View`
  position: absolute;
  top: 0px;
  right: -${({ theme }) => theme.spacing.xxs}px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  min-width: 18px;
  min-height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.xs}px;
  border: 1px solid ${({ theme }) => theme.colors.surface};
`;

export const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;
