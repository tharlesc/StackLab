import React from 'react';
import { Button } from '@/components/common/Button';
import { Container, Title, Message, ActionWrapper } from './styles';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon, title, message, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <Container>
      {icon}
      {title ? <Title>{title}</Title> : null}
      <Message>{message}</Message>
      {actionLabel && onAction ? (
        <ActionWrapper>
          <Button title={actionLabel} onPress={onAction} variant="outline" size="small" />
        </ActionWrapper>
      ) : null}
    </Container>
  );
};
