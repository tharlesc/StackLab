import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { ShieldCheck } from 'lucide-react-native';
import { ShieldCheckIcon } from '../../../../assets/svg';
import { Card, Header, InfoContainer, Greeting, NameRow, Name, MasterTag, MasterTagText, CreaRow, CreaText, NotificationButton, NotificationIcon, NotificationDot, Footer, SyncText, TimeFilterContainer, TimeFilterButton, TimeFilterText } from './styles';

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
