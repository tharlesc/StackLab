import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { ArrowRight } from 'lucide-react-native';
import { getWeatherIcon } from '../../../utils/weather';
import type { ActiveWork } from '../../../types';
import { Card, Header, IconPlaceholder, HeaderTextContainer, Title, Subtitle, QuickData, DataColumn, DataLabel, DataValue, WeatherIcon, Footer, RdoStatusBox, RdoStatusText, ActionButton, ActionButtonText, ArrowPlaceholder, ArrowText } from './styles';

type WorkStatus = 'ok' | 'warn';









































export const ActiveWorkCard = ({
  name,
  subtitle,
  statusType,
  lastRdo,
  weather,
  team,
  rdoStatus,
  actionText,
}: Omit<ActiveWork, 'id'>) => {
  const status: WorkStatus = statusType === '100% Em Dia' ? 'ok' : 'warn';
  const isLate = lastRdo === 'Ontem';

  return (
    <Card activeOpacity={0.7}>
      <Header>
        <IconPlaceholder />
        <HeaderTextContainer>
          <Title numberOfLines={1}>{name}</Title>
          <Subtitle numberOfLines={1}>{subtitle}</Subtitle>
        </HeaderTextContainer>
      </Header>

      <QuickData>
        <DataColumn>
          <DataLabel>ÚLTIMO RDO</DataLabel>
          <DataValue $isLate={isLate}>{lastRdo}</DataValue>
        </DataColumn>
        <DataColumn>
          <DataLabel>CLIMA CANTEIRO</DataLabel>
          <WeatherIcon>{getWeatherIcon(weather)}</WeatherIcon>
        </DataColumn>
        <DataColumn>
          <DataLabel>EFETIVO</DataLabel>
          <DataValue>{team}</DataValue>
        </DataColumn>
      </QuickData>

      <Footer>
        <RdoStatusBox $status={status}>
          <RdoStatusText $status={status}>{rdoStatus}</RdoStatusText>
        </RdoStatusBox>
        {actionText ? (
          <ActionButton activeOpacity={0.8}>
            <ActionButtonText>{actionText}</ActionButtonText>
          </ActionButton>
        ) : (
          <ArrowPlaceholder>
            <ArrowRight color="#64748B" size={20} />
          </ArrowPlaceholder>
        )}
      </Footer>
    </Card>
  );
};
