import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px  ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const TitleContainer = styled.View`
  flex: 1;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const ContentContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ActionButton = styled(TouchableOpacity)`
  position: relative;
  padding: 2px;
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
