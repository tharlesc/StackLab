import React from 'react';
import {
  Container,
  Title,
  SupportingText,
  ActionsRow,
  ActionButton,
  ActionText,
} from './styles';

export interface CardAction {
  label: string;
  onPress: () => void;
  primary?: boolean;
  destructive?: boolean;
  secondary?: boolean;
}

export interface InteractiveCardProps {
  title: string;
  supportingText: string;
  actions?: CardAction[];
  children?: React.ReactNode;
}

export const InteractiveCard = ({
  title,
  supportingText,
  actions,
  children,
}: InteractiveCardProps) => {
  return (
    <Container accessibilityRole="summary" accessibilityLabel={`${title}. ${supportingText}`}>
      <Title>{title}</Title>
      <SupportingText>{supportingText}</SupportingText>

      {children}

      {actions && actions.length > 0 && (
        <ActionsRow>
          {actions.map((action, index) => (
            <ActionButton
              key={index}
              activeOpacity={0.7}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <ActionText $isPrimary={action.primary} $isDestructive={action.destructive}>
                {action.label}
              </ActionText>
            </ActionButton>
          ))}
        </ActionsRow>
      )}
    </Container>
  );
};

export default InteractiveCard;
