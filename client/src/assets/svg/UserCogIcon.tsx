import React from 'react';
import Svg, { Path, Circle, SvgProps } from 'react-native-svg';

export const UserCogIcon = (props: SvgProps) => (
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
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M22 11l-3 3" />
    <Path d="M19 14v3" />
    <Path d="M19 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </Svg>
);
