import React from 'react';
import Svg, { Rect, Path, SvgProps } from 'react-native-svg';

export const BuildingIcon = (props: SvgProps) => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <Path d="M9 22v-4h6v4" />
    <Path d="M8 6h.01" />
    <Path d="M16 6h.01" />
    <Path d="M8 10h.01" />
    <Path d="M16 10h.01" />
    <Path d="M8 14h.01" />
    <Path d="M16 14h.01" />
  </Svg>
);
