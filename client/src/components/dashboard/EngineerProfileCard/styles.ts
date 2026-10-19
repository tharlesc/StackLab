import styled from 'styled-components/native';

export const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.hero.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const InfoContainer = styled.View`
  flex: 1;
`;

export const Greeting = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  color: ${({ theme }) => theme.colors.hero.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const NameRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.hero.text};
  font-size: ${({ theme }) => theme.typography.headline.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headline.lineHeight}px;
`;

export const ProfileTag = styled.View<{ $isMaster?: boolean }>`
  background-color: ${({ theme, $isMaster }) =>
    $isMaster ? theme.colors.tag.masterBg : theme.colors.tag.commonBg};
  padding: ${({ theme }) => theme.spacing.xxs}px ${({ theme }) => theme.spacing.xsm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border-width: 1px;
  border-color: ${({ theme, $isMaster }) =>
    $isMaster ? theme.colors.secondary : theme.colors.tag.commonBorder};
`;

export const ProfileTagText = styled.Text<{ $isMaster?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme, $isMaster }) =>
    $isMaster ? theme.colors.secondary : theme.colors.hero.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  letter-spacing: 0.5px;
`;

export const CreaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const CreaText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  color: ${({ theme }) => theme.colors.hero.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

export const Footer = styled.View`
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.hero.divider};
  padding-top: ${({ theme }) => theme.spacing.md}px;
`;

export const SyncRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsm}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const StatusDot = styled.View<{ $isOnline: boolean }>`
  width: ${({ theme }) => theme.spacing.sm}px;
  height: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ theme, $isOnline }) =>
    $isOnline ? theme.colors.status.success.base : theme.colors.status.warning.base};
`;

export const SyncText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  color: ${({ theme }) => theme.colors.hero.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
