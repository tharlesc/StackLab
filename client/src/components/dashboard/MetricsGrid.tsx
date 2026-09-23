import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { MetricItem, StatusVariant } from '../../types';

interface MetricsGridProps {
  metrics: MetricItem[];
}

// --- Styled Components ---

const Container = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const Card = styled(TouchableOpacity)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

const IconBox = styled.View<{ $variant: StatusVariant }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ $variant, theme }) => theme.colors.status[$variant].bg};
`;

const IconText = styled.Text`
  font-size: 16px;
`;

const Title = styled.Text`
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const Value = styled.Text<{ $variant: StatusVariant }>`
  font-size: 24px;
  font-weight: 900;
  color: ${({ $variant, theme }) =>
    $variant === 'info'
      ? theme.colors.status.info.base
      : theme.colors.secondary};
`;

const Subtitle = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 8px;
  font-weight: 500;
`;

// --- Component ---

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
