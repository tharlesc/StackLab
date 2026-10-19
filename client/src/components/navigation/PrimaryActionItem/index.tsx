import React from 'react';
import { NavigationItem, NavigationItemProps } from '../NavigationItem';

export type PrimaryActionItemProps = NavigationItemProps;

export const PrimaryActionItem = (props: PrimaryActionItemProps) => {
  return <NavigationItem {...props} />;
};
