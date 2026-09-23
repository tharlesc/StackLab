import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { ShieldCheckIcon } from '../../../assets/svg';

interface EngineerProfileCardProps {
  name: string;
  greeting?: string;
  crea: string;
  hasNotifications?: boolean;
  onNotificationPress?: () => void;
  activeTimeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  timeFilters?: string[];
  lastSync?: string;
}

// --- Styled Components ---

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const InfoContainer = styled.View`
  flex: 1;
`;

const Greeting = styled.Text`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const NameRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 18px;
  font-weight: 700;
`;

const MasterTag = styled.View`
  background-color: ${({ theme }) => theme.colors.tag.masterBg};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.secondary};
`;

const MasterTagText = styled.Text`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
`;

const CreaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const CreaText = styled.Text`
  color: ${({ theme }) => theme.colors.text.inverseSecondary};
  font-size: 11px;
  font-weight: 500;
`;

const NotificationButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  background-color: ${({ theme }) => theme.colors.tag.notificationBg};
  justify-content: center;
  align-items: center;
`;

const NotificationIcon = styled.Text`
  font-size: 16px;
`;

const NotificationDot = styled.View`
  position: absolute;
  top: 10px;
  right: 12px;
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
`;

const Footer = styled.View`
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.tag.notificationBg};
  padding-top: ${({ theme }) => theme.spacing.md}px;
`;

const SyncText = styled.Text`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 500;
`;

const TimeFilterContainer = styled.View`
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.tag.timeFilterBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: 4px;
`;

const TimeFilterButton = styled(TouchableOpacity)<{ $isActive: boolean }>`
  flex: 1;
  padding: 6px 0;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.secondary : 'transparent'};
`;

const TimeFilterText = styled.Text<{ $isActive: boolean }>`
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.text.inverse : theme.colors.text.secondary};
  font-size: 11px;
  font-weight: ${({ $isActive }) => ($isActive ? '700' : '600')};
`;

// --- Component ---

export const EngineerProfileCard = ({
  name,
  greeting = 'Olá, Engenheiro',
  crea,
  hasNotifications = false,
  onNotificationPress,
  activeTimeFilter,
  onTimeFilterChange,
  timeFilters = ['Hoje', '7 dias', '15 dias', '1 mês'],
  lastSync = '100% Sincronizado - 09:41',
}: EngineerProfileCardProps) => {
  return (
    <Card>
      <Header>
        <InfoContainer>
          <Greeting>{greeting}</Greeting>
          <NameRow>
            <Name>{name}</Name>
            <MasterTag>
              <MasterTagText>MASTER</MasterTagText>
            </MasterTag>
          </NameRow>

          <CreaRow>
            <ShieldCheckIcon stroke="#10B981" />
            <CreaText>{crea}</CreaText>
          </CreaRow>
        </InfoContainer>

        <NotificationButton onPress={onNotificationPress} activeOpacity={0.7}>
          <NotificationIcon>🔔</NotificationIcon>
          {hasNotifications && <NotificationDot />}
        </NotificationButton>
      </Header>

      <Footer>
        <SyncText>Última Sincronização: {lastSync}</SyncText>
        <TimeFilterContainer>
          {timeFilters.map((filter) => {
            const isActive = activeTimeFilter === filter;
            return (
              <TimeFilterButton
                key={filter}
                $isActive={isActive}
                onPress={() => onTimeFilterChange(filter)}
                activeOpacity={0.7}
              >
                <TimeFilterText $isActive={isActive}>
                  {filter}
                </TimeFilterText>
              </TimeFilterButton>
            );
          })}
        </TimeFilterContainer>
      </Footer>
    </Card>
  );
};
