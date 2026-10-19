import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container, Row } from './styles';

export interface BottomNavigationProps {
  children: React.ReactNode;
}

export const BottomNavigation = ({ children }: BottomNavigationProps) => {
  const insets = useSafeAreaInsets();
  return (
    <Container $bottomInset={insets.bottom}>
      <Row accessibilityRole="tablist">{children}</Row>
    </Container>
  );
};
