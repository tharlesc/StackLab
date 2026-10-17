import React from 'react';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from 'styled-components/native';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import {
  Card,
  Header,
  InfoContainer,
  Greeting,
  NameRow,
  Name,
  ProfileTag,
  ProfileTagText,
  CreaRow,
  CreaText,
  Footer,
  SyncRow,
  StatusDot,
  SyncText,
} from './styles';

export interface EngineerProfileCardProps {
  name: string;
  greeting?: string;
  crea?: string;
  isMaster?: boolean;
  isOnline?: boolean;
  activeTimeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  timeFilters?: string[];
  lastSync?: string;
}

export const EngineerProfileCard = ({
  name,
  greeting = 'Olá, Engenheiro',
  crea,
  isMaster = false,
  isOnline = true,
  activeTimeFilter,
  onTimeFilterChange,
  timeFilters = ['Hoje', '7 dias', '15 dias', '1 mês'],
  lastSync = '100% Sincronizado - 09:41',
}: EngineerProfileCardProps) => {
  const theme = useTheme();

  return (
    <Card>
      <Header>
        <InfoContainer>
          <Greeting>{greeting}</Greeting>
          <NameRow>
            <Name>{name}</Name>
            <ProfileTag $isMaster={isMaster}>
              <ProfileTagText $isMaster={isMaster}>
                {isMaster ? 'MASTER' : 'OPERACIONAL'}
              </ProfileTagText>
            </ProfileTag>
          </NameRow>

          {crea ? (
            <CreaRow>
              <ShieldCheck
                color={theme.colors.hero.success}
                size={theme.icon.size.sm}
                strokeWidth={theme.icon.strokeWidth}
              />
              <CreaText>{crea}</CreaText>
            </CreaRow>
          ) : null}
        </InfoContainer>
      </Header>

      <Footer>
        <SyncRow>
          <StatusDot $isOnline={isOnline} />
          <SyncText>
            {isOnline ? 'Online • ' : 'Modo Offline • '}
            {lastSync}
          </SyncText>
        </SyncRow>

        <SegmentedControl
          options={timeFilters}
          value={activeTimeFilter}
          onChange={onTimeFilterChange}
          tone="dark"
        />
      </Footer>
    </Card>
  );
};

export default EngineerProfileCard;
