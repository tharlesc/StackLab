import React from 'react';
import { Container, Row } from './styles';

export interface BottomNavigationProps {
  children: React.ReactNode;
}

export const BottomNavigation = ({ children }: BottomNavigationProps) => {
  return (
    <Container>
      <Row>
        {children}
      </Row>
    </Container>
  );
};
