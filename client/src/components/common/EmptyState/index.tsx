import React from 'react';
import { Container, Message } from './styles';

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
}

export const EmptyState = ({ icon, message }: EmptyStateProps) => {
  return (
    <Container>
      {icon}
      <Message>{message}</Message>
    </Container>
  );
};
