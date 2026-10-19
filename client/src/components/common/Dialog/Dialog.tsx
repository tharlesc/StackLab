import React from 'react';
import {
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  useWindowDimensions,
  AccessibilityRole,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  Backdrop,
  DialogContainer,
  DialogTitle,
  DialogDescription,
  BodyScrollView,
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
  accessibilityRole?: AccessibilityRole;
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
  accessibilityRole,
}: DialogProps) => {
  const theme = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const maxDialogWidth = windowWidth - theme.spacing.lg * 2;
  const maxDialogHeight = windowHeight * 0.85;
  const resolvedRole: AccessibilityRole =
    accessibilityRole ?? (primaryAction?.destructive || !children ? 'alert' : 'none');

  const handleBackdropPress = () => {
    Keyboard.dismiss();
    if (dismissible && onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible && onClose ? onClose : undefined}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Backdrop onPress={handleBackdropPress} accessibilityRole="none">
          <DialogContainer
            style={{ maxWidth: maxDialogWidth, maxHeight: maxDialogHeight }}
            onPress={(e) => e.stopPropagation()}
            accessibilityViewIsModal
            accessibilityRole={resolvedRole}
            accessibilityLabel={title}
          >
            <DialogTitle numberOfLines={2}>{title}</DialogTitle>

            <BodyScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {description ? <DialogDescription>{description}</DialogDescription> : null}

              {children ? <ContentContainer>{children}</ContentContainer> : null}
            </BodyScrollView>

            {(primaryAction || secondaryAction) && (
              <ActionsContainer>
                {secondaryAction && (
                  <DialogActionButton
                    activeOpacity={0.7}
                    onPress={() => {
                      Keyboard.dismiss();
                      secondaryAction.onPress();
                    }}
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
                    onPress={() => {
                      Keyboard.dismiss();
                      primaryAction.onPress();
                    }}
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
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default Dialog;
