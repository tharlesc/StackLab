import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { MetricItem, StatusVariant } from '../../../types';
import { Container, Card, IconBox, IconText, Title, Value, Subtitle } from './styles';

interface MetricsGridProps {
  metrics: MetricItem[];
}
export const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <Container>
      {metrics.map((metric) => (
        <Card key={metric.id} activeOpacity={0.7}>
          <IconBox $variant={metric.variant}>
            <IconText>{metric.icon}</IconText>
          </IconBox>
          <Title>{metric.title}</Title>
          <Value $variant={metric.variant}>{metric.value}</Value>
          <Subtitle>{metric.subtitle}</Subtitle>
        </Card>
      ))}
    </Container>
  );
};
