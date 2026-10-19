import React from 'react';
import { ArrowRight } from 'lucide-react-native';
import { useTheme } from 'styled-components/native';
import { getWeatherIcon } from '@/components/ui/WeatherIcon';
import { formatRdoLabel } from '@/utils/rdo';
import { strings } from '@/constants/strings';
import type { ActiveWork } from '@/types';
import {
  Card,
  Header,
  IconPlaceholder,
  HeaderTextContainer,
  Title,
  Subtitle,
  QuickData,
  DataColumn,
  DataLabel,
  DataValue,
  WeatherIconBox,
  Footer,
  RdoStatusBox,
  RdoStatusText,
  ActionButton,
  ActionButtonText,
  ArrowPlaceholder,
} from './styles';

type WorkStatus = 'ok' | 'warn';

export interface ActiveWorkCardProps extends Omit<ActiveWork, 'id'> {
  onPress?: () => void;
  onActionPress?: () => void;
}

export const ActiveWorkCard = ({
  name,
  subtitle,
  statusType,
  lastRdo,
  weather,
  team,
  rdoStatus,
  rdoDate,
  rdoNumber,
  actionText,
  onPress,
  onActionPress,
}: ActiveWorkCardProps) => {
  const theme = useTheme();
  const status: WorkStatus = statusType === '100% Em Dia' ? 'ok' : 'warn';
  const isLate = lastRdo === strings.common.yesterday;

  const rdoLabel = formatRdoLabel(rdoStatus, rdoDate, rdoNumber);

  return (
    <Card
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Obra: ${name}, ${subtitle}. Status: ${statusType}`}
    >
      <Header>
        <IconPlaceholder />
        <HeaderTextContainer>
          <Title numberOfLines={1}>{name}</Title>
          <Subtitle numberOfLines={1}>{subtitle}</Subtitle>
        </HeaderTextContainer>
      </Header>

      <QuickData>
        <DataColumn>
          <DataLabel>{strings.dashboard.lastRdoLabel}</DataLabel>
          <DataValue $isLate={isLate}>{lastRdo}</DataValue>
        </DataColumn>
        <DataColumn>
          <DataLabel>{strings.dashboard.weatherLabel}</DataLabel>
          <WeatherIconBox>
            {getWeatherIcon(weather, theme.icon.size.md, theme.colors.text.secondary)}
          </WeatherIconBox>
        </DataColumn>
        <DataColumn>
          <DataLabel>{strings.dashboard.effectiveLabel}</DataLabel>
          <DataValue>{team}</DataValue>
        </DataColumn>
      </QuickData>

      <Footer>
        <RdoStatusBox $status={status}>
          <RdoStatusText $status={status}>{rdoLabel}</RdoStatusText>
        </RdoStatusBox>
        {actionText ? (
          <ActionButton
            activeOpacity={0.8}
            onPress={onActionPress}
            accessibilityRole="button"
            accessibilityLabel={actionText}
          >
            <ActionButtonText>{actionText}</ActionButtonText>
          </ActionButton>
        ) : (
          <ArrowPlaceholder>
            <ArrowRight
              color={theme.colors.text.secondary}
              size={theme.icon.size.md}
              strokeWidth={theme.icon.strokeWidth}
            />
          </ArrowPlaceholder>
        )}
      </Footer>
    </Card>
  );
};
