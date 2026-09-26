import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import type { ChartData } from '../../../types';
import { ChartContainer } from './styles';

interface DonutChartProps {
  data: ChartData[];
  total: number | string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const DonutChart = ({
  data,
  total,
  size = 110,
  strokeWidth = 12,
  label = 'Total',
}: DonutChartProps) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  let startAngle = 0;

  return (
    <ChartContainer $size={size}>
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

          {/* Segmentos */}
          {data.map((item, index) => {
            const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);
            const strokeDashoffset =
              circumference - (item.value / totalValue) * circumference;
            const angle = (item.value / totalValue) * 360;
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
                strokeLinecap="round"
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
          fontSize="24"
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
          fontSize="11"
          fill={theme.colors.text.secondary}
        >
          {label}
        </SvgText>
      </Svg>
    </ChartContainer>
  );
};
