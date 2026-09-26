import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const ActionButton = styled(TouchableOpacity)`
  position: relative;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
`;

export const NotificationDot = styled.View`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
  border: 1px solid ${({ theme }) => theme.colors.surface};
`;

export const Badge = styled.View`
  position: absolute;
  top: 0px;
  right: -2px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1px solid ${({ theme }) => theme.colors.surface};
`;

export const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-size: 9px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;
