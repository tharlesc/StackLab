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

export const BackButton = styled(TouchableOpacity)`
  padding: ${({ theme }) => theme.spacing.sm}px;
  margin-left: -${({ theme }) => theme.spacing.sm}px;
`;

export const BackText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 16px;
  font-weight: 600;
`;

export const PageTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const HeaderSpacer = styled.View`
  width: 60px;
`;

export const PhotoSection = styled.View`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const PhotoPlaceholder = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 4px;
  border-color: ${({ theme }) => theme.colors.surface};
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

export const PhotoText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 40px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.inverse};
`;

export const EditPhotoButton = styled(TouchableOpacity)`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.md}px;
  background-color: rgba(11, 34, 64, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
`;

export const EditPhotoText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 600;
`;

export const ActionsSection = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

export const ActionItem = styled(TouchableOpacity)<{ $isLast?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md}px 0;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  margin-top: ${({ $isLast, theme }) => ($isLast ? `${theme.spacing.sm}px` : '0px')};
`;

export const ActionItemText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

export const LogoutText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-weight: 600;
`;
