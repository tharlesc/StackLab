import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { ActiveWork } from '../../types';

type WorkStatus = 'ok' | 'warn';

const getWeatherIcon = (weather: string): string => {
  const key = weather.toLowerCase().trim();
  if (key.includes('ensolarado') || key.includes('sol') || key.includes('limpo')) return '☀️';
  if (key.includes('parcialmente nublado') || key.includes('parcial')) return '⛅';
  if (key.includes('nublado') || key.includes('nuvens') || key.includes('encoberto')) return '☁️';
  if (key.includes('chuva') || key.includes('chuvoso')) return '🌧️';
  if (key.includes('tempestade') || key.includes('trovoada') || key.includes('raio')) return '⛈️';
  if (key.includes('garoa') || key.includes('chuvisco')) return '🌦️';
  if (key.includes('neve') || key.includes('nevando')) return '❄️';
  if (key.includes('vento') || key.includes('ventania')) return '💨';
  if (key.includes('neblina') || key.includes('névoa') || key.includes('cerração')) return '🌫️';
  return '🌤️';
};

// --- Styled Components ---

const Card = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const IconPlaceholder = styled.View`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background-color: ${({ theme }) => theme.colors.border};
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

const HeaderTextContainer = styled.View`
  flex: 1;
  margin-right: 8px;
`;

const Title = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Subtitle = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

const QuickData = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const DataColumn = styled.View`
  flex: 1;
`;

const DataLabel = styled.Text`
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const DataValue = styled.Text<{ $isLate?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $isLate, theme }) =>
    $isLate ? theme.colors.status.error.base : theme.colors.text.primary};
`;

const WeatherIcon = styled.Text`
  font-size: 22px;
`;

const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const RdoStatusBox = styled.View<{ $status: WorkStatus }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ $status, theme }) =>
    $status === 'ok'
      ? theme.colors.status.success.bg
      : theme.colors.status.warning.bg};
`;

const RdoStatusText = styled.Text<{ $status: WorkStatus }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $status, theme }) =>
    $status === 'ok'
      ? theme.colors.status.success.text
      : theme.colors.status.warning.text};
`;

const ActionButton = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
`;

const ActionButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 13px;
  font-weight: 700;
`;

const ArrowPlaceholder = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.border};
  justify-content: center;
  align-items: center;
`;

const ArrowText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 700;
`;

// --- Component ---

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
            <ArrowText>→</ArrowText>
          </ArrowPlaceholder>
        )}
      </Footer>
    </Card>
  );
};
