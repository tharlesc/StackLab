import React from 'react';
import styled from 'styled-components/native';
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
  label = 'TOTAL',
}: DonutChartProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const totalValue = data.reduce((acc, item) => acc + item.value, 0) || 1;

  let currentOffset = 0;

  return (
    <ChartContainer $size={size}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {data.map((item, index) => {
            const strokeDasharray = `${(item.value / totalValue) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (item.value / totalValue) * circumference;

            return (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
        <SvgText
          x={size / 2}
          y={size / 2 - 2}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#0B2240"
        >
          {total}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#64748B"
        >
          {label}
        </SvgText>
      </Svg>
    </ChartContainer>
  );
};
