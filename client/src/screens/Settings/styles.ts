import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const ProfileHeaderCard = styled.View`
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? '#1C1C1E' : theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.cardLarge}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const ProfileAvatarWrapper = styled.View`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const OnlineBadgeDot = styled.View`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: #10B981;
  border-width: 2px;
  border-color: ${({ theme }) =>
    theme.name === 'dark' ? '#1C1C1E' : theme.colors.surface};
`;

export const ProfileName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 20px;
  line-height: 26px;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin-bottom: 2px;
`;

export const ProfileEmail = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const ProfileBadgesRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ThemeSectionRow = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px 0;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ThemeLabelRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const ThemeLabelText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

export const BrandAboutHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const BrandSymbol = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? '#2C2C2E' : theme.colors.surfaceVariant};
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const BrandAboutInfo = styled.View`
  flex: 1;
`;

export const BrandAboutTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const BrandAboutVersion = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const VersionContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

export const LogoutButtonRow = styled(TouchableOpacity).attrs({
  activeOpacity: 0.8,
  accessibilityRole: 'button',
})`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)'};
  border-width: 1px;
  border-color: ${({ theme }) =>
    theme.name === 'dark' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.25)'};
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  gap: 8px;
`;

export const LogoutButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme }) => (theme.name === 'dark' ? '#F87171' : '#DC2626')};
`;
