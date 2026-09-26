import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 16,
    paddingBottom: 100,
  },
})``;

export const ListContent = styled.FlatList.attrs({
  contentContainerStyle: {
    padding: 16,
    paddingBottom: 100,
  },
})``;
