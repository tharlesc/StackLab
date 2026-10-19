import React from 'react';
import {
  Container,
  HeaderRow,
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
  icon?: React.ReactNode;
  actions?: CardAction[];
  children?: React.ReactNode;
}

export const InteractiveCard = ({
  title,
  supportingText,
  icon,
  actions,
  children,
}: InteractiveCardProps) => {
  return (
    <Container accessibilityRole="summary" accessibilityLabel={`${title}. ${supportingText}`}>
      <HeaderRow>
        {icon}
        <Title>{title}</Title>
      </HeaderRow>
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
