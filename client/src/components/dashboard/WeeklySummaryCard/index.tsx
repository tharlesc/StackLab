import React from 'react';
import { View } from 'react-native';
import { DonutChart } from '@/components/ui/DonutChart';
import type { ChartData, IndicatorItem } from '@/types';
import {
  Card,
  Header,
  Title,
  Subtitle,
  Body,
  IndicatorsList,
  IndicatorRow,
  IndicatorLabelBox,
  IndicatorDot,
  IndicatorLabel,
  IndicatorValue,
} from './styles';

interface WeeklySummaryCardProps {
  title: string;
  subtitle: string;
  chartData: ChartData[];
  chartTotal: number;
  indicators: IndicatorItem[];
}

export const WeeklySummaryCard = ({
  title,
  subtitle,
  chartData,
  chartTotal,
  indicators,
}: WeeklySummaryCardProps) => {
  const chartSummary = `${title}: Total ${chartTotal}. ${indicators
    .map((i) => `${i.label}: ${i.value}`)
    .join(', ')}`;

  return (
    <Card>
      <Header>
        <View>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </View>
      </Header>

      <Body>
        <DonutChart data={chartData} total={chartTotal} accessibilityLabel={chartSummary} />

        <IndicatorsList>
          {indicators.map((indicator) => (
            <IndicatorRow key={indicator.id}>
              <IndicatorLabelBox>
                <IndicatorDot $color={indicator.color} />
                <IndicatorLabel>{indicator.label}</IndicatorLabel>
              </IndicatorLabelBox>
              <IndicatorValue>{indicator.value}</IndicatorValue>
            </IndicatorRow>
          ))}
        </IndicatorsList>
      </Body>
    </Card>
  );
};
