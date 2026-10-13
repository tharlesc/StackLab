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
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.hero.textSecondary};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const NameRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.hero.text};
  font-size: 18px;
  font-weight: 700;
`;

export const ProfileTag = styled.View<{ $isMaster?: boolean }>`
  background-color: ${({ theme, $isMaster }) =>
    $isMaster ? theme.colors.tag.masterBg : 'rgba(255, 255, 255, 0.1)'};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border-width: 1px;
  border-color: ${({ theme, $isMaster }) =>
    $isMaster ? theme.colors.secondary : 'rgba(255, 255, 255, 0.2)'};
`;

export const ProfileTagText = styled.Text<{ $isMaster?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme, $isMaster }) =>
    $isMaster ? theme.colors.secondary : theme.colors.hero.textSecondary};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
`;

export const CreaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const CreaText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.hero.textSecondary};
  font-size: 11px;
  font-weight: 500;
`;

export const Footer = styled.View`
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.hero.divider};
  padding-top: ${({ theme }) => theme.spacing.md}px;
`;

export const SyncRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const StatusDot = styled.View<{ $isOnline: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 4px;
  background-color: ${({ theme, $isOnline }) =>
    $isOnline ? theme.colors.status.success.base : theme.colors.status.warning.base};
`;

export const SyncText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.hero.textSecondary};
  font-size: 11px;
  font-weight: 500;
`;
