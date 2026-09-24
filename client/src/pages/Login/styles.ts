import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 32px;
  color: ${({ theme }) => theme.colors.surface};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.inverseSecondary};
  text-align: center;
  margin-bottom: 48px;
`;

export const UserList = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const UserCard = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  flex-direction: row;
  align-items: center;
`;

export const UserAvatar = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const UserInfo = styled.View`
  flex: 1;
`;

export const UserName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const UserRole = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const FormContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const Input = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const LoginButton = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export const LoginButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.surface};
`;
