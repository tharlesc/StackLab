import React from 'react';
import { useTheme } from 'styled-components/native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import type { ChartData } from '@/types';
import { ChartContainer } from './styles';

export interface DonutChartProps {
  data: ChartData[];
  total: number | string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  accessibilityLabel?: string;
}

export const DonutChart = ({
  data,
  total,
  size = 110,
  strokeWidth = 12,
  label = 'Total',
  accessibilityLabel,
}: DonutChartProps) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  let startAngle = 0;

  const summaryLabel =
    accessibilityLabel ??
    `Gráfico de rosca: ${label} ${total}. Valores: ${data.map((d) => d.value).join(', ')}`;

  return (
    <ChartContainer
      $size={size}
      accessible
      accessibilityRole="image"
      accessibilityLabel={summaryLabel}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" originX={size / 2} originY={size / 2}>
          {/* Fundo do gráfico */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Segmentos — evita divisão por zero quando totalValue === 0 */}
          {totalValue > 0 &&
            data.map((item, index) => {
              if (item.value <= 0) return null;
              const ratio = item.value / totalValue;
              const strokeDashoffset = circumference - ratio * circumference;
              const angle = ratio * 360;
              const currentStartAngle = startAngle;
              startAngle += angle;

              return (
                <Circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  transform={`rotate(${currentStartAngle}, ${size / 2}, ${size / 2})`}
                />
              );
            })}
        </G>
        <SvgText
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={theme.typography.title.fontSize}
          fontFamily={theme.fonts.bold}
          fontWeight="bold"
          fill={theme.colors.text.primary}
        >
          {total}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 16}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={theme.typography.caption.fontSize}
          fontFamily={theme.fonts.regular}
          fill={theme.colors.text.secondary}
        >
          {label}
        </SvgText>
      </Svg>
    </ChartContainer>
  );
};
