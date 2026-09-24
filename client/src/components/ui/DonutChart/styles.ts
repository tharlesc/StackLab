import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const ChartContainer = styled.View<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  justify-content: center;
  align-items: center;
`;
