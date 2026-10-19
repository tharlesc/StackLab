import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const ActionContainer = styled.View`
  flex: 1;
  height: 48px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 2px;
`;

export const ActionButton = styled(TouchableOpacity)`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.colors.secondary};
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -26px;
  elevation: 4;
  shadow-color: ${({ theme }) => theme.colors.secondary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.35;
  shadow-radius: 6px;
`;

export const ActionLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.tintText};
  margin-top: 10px;
  text-align: center;
`;
