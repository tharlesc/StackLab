import React from 'react';
import { Modal } from 'react-native';
import {
  Backdrop,
  DialogContainer,
  DialogTitle,
  DialogDescription,
  ContentContainer,
  ActionsContainer,
  DialogActionButton,
  DialogActionText,
} from './styles';

export interface DialogAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export interface DialogProps {
  visible: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  onClose?: () => void;
  dismissible?: boolean;
}

export const Dialog = ({
  visible,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  onClose,
  dismissible = true,
}: DialogProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible && onClose ? onClose : undefined}
      statusBarTranslucent
    >
      <Backdrop
        onPress={dismissible && onClose ? onClose : undefined}
        accessibilityRole="none"
      >
        <DialogContainer
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="alert"
          accessibilityLabel={title}
        >
          <DialogTitle>{title}</DialogTitle>

          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}

          {children ? <ContentContainer>{children}</ContentContainer> : null}

          {(primaryAction || secondaryAction) && (
            <ActionsContainer>
              {secondaryAction && (
                <DialogActionButton
                  activeOpacity={0.7}
                  onPress={secondaryAction.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={secondaryAction.label}
                >
                  <DialogActionText $isPrimary={false} $isDestructive={secondaryAction.destructive}>
                    {secondaryAction.label}
                  </DialogActionText>
                </DialogActionButton>
              )}

              {primaryAction && (
                <DialogActionButton
                  activeOpacity={0.7}
                  onPress={primaryAction.onPress}
                  $isPrimary={true}
                  $isDestructive={primaryAction.destructive}
                  accessibilityRole="button"
                  accessibilityLabel={primaryAction.label}
                >
                  <DialogActionText $isPrimary={true} $isDestructive={primaryAction.destructive}>
                    {primaryAction.label}
                  </DialogActionText>
                </DialogActionButton>
              )}
            </ActionsContainer>
          )}
        </DialogContainer>
      </Backdrop>
    </Modal>
  );
};

export default Dialog;
