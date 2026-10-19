import React from 'react';
import { FlatList, FlatListProps } from 'react-native';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ScrollContent = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.scrollBottom,
  },
}))``;

const BaseListContent = styled(FlatList).attrs(({ theme }) => ({
  contentContainerStyle: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.scrollBottom,
  },
}))``;

export const ListContent = BaseListContent as unknown as <T>(
  props: FlatListProps<T>,
) => React.ReactElement;
