import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const ActionContainer = styled.View`
  width: 25%;
  align-items: center;
  justify-content: center;
`;

export const ActionButton = styled(TouchableOpacity)`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.colors.secondary};
  align-items: center;
  justify-content: center;
  margin-top: -24px;
  margin-bottom: 4px;
  elevation: 4;
  shadow-color: ${({ theme }) => theme.colors.secondary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 6px;
`;

export const ActionLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.secondary};
`;
