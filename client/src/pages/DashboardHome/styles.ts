import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const PageTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 20px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const PageSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 1px;
`;

export const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const OnlineBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.status.success.bg};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.status.success.border};
`;

export const OnlineDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.status.success.base};
  margin-right: 4px;
`;

export const OnlineText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.status.success.text};
`;

export const Avatar = styled(TouchableOpacity)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

export const AvatarText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 700;
  font-size: 14px;
`;

export const Section = styled.View`
  margin-top: 8px;
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const SeeAllText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const NotificationButton = styled(TouchableOpacity)`
  position: relative;
  padding: 4px;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
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
