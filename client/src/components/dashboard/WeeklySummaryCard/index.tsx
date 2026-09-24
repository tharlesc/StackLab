import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { DonutChart } from '../../ui/DonutChart';
import type { ChartData, IndicatorItem } from '../../../types';
import { Card, Header, Title, Subtitle, Body, IndicatorsList, IndicatorRow, IndicatorLabelBox, IndicatorDot, IndicatorLabel, IndicatorValue } from './styles';

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
  return (
    <Card>
      <Header>
        <View>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </View>
      </Header>

      <Body>
        <DonutChart data={chartData} total={chartTotal} />

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
