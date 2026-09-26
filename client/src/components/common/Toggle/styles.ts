import styled from 'styled-components/native';
import { TouchableOpacity, Animated } from 'react-native';

export const ToggleContainer = styled(TouchableOpacity)`
  min-width: 52px;
  min-height: 44px;
  justify-content: center;
  align-items: center;
`;

export const Track = styled.View<{ $checked: boolean }>`
  width: 52px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.toggle.trackActive : theme.colors.toggle.trackInactive};
  padding: 4px;
  justify-content: center;
`;

export const Thumb = styled(Animated.View)`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.toggle.thumb};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  elevation: 3;
`;
