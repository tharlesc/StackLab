import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { theme } from '../../constants/theme';
import type { ChartData } from '../../types';

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
  const totalValue = data.reduce((acc, item) => acc + item.value, 0) || 1; // Prevent div by 0

  let currentOffset = 0;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.border}
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
          fill={theme.colors.text.primary}
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
          fill={theme.colors.text.secondary}
        >
          {label}
        </SvgText>
      </Svg>
    </View>
  );
};
