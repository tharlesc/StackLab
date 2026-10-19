import styled, { css } from 'styled-components/native';
import { TouchableOpacity, Animated } from 'react-native';

export const Tab = styled(TouchableOpacity)`
  flex: 1;
  height: 48px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 2px;
  overflow: visible;
`;

export const IconSlot = styled.View`
  height: 24px;
  width: 100%;
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

export const IconContainer = styled(Animated.View)<{ $isActive: boolean }>`
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.secondary : 'transparent'};

  ${({ theme, $isActive }) =>
    $isActive
      ? css`
          elevation: 6;
          shadow-color: ${theme.colors.secondary};
          shadow-offset: 0px 4px;
          shadow-opacity: 0.35;
          shadow-radius: 8px;
        `
      : css`
          elevation: 0;
          shadow-color: transparent;
          shadow-offset: 0px 0px;
          shadow-opacity: 0;
          shadow-radius: 0px;
        `}
`;

export const IconWrapper = styled.View`
  position: relative;
  align-items: center;
  justify-content: center;
`;

export const TabLabel = styled.Text<{ $isActive: boolean }>`
  font-family: ${({ theme, $isActive }) => ($isActive ? theme.fonts.bold : theme.fonts.regular)};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.tintText : theme.colors.text.secondary)};
  margin-top: 2px;
  text-align: center;
`;

export const Badge = styled.View`
  position: absolute;
  top: -6px;
  right: -10px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  min-width: 18px;
  min-height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1.5px solid ${({ theme }) => theme.colors.surface};
`;

export const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;
