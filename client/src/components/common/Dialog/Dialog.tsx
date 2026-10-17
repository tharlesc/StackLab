import React, { useState, useEffect } from 'react';
import {
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  useWindowDimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';
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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (Platform.OS === 'android') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (Platform.OS === 'android') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
    }
  }, [visible]);

  const isKeyboardOpen = keyboardHeight > 0;
  // Maximum dialog height dynamically responsive to available space above keyboard
  const maxDialogHeight = Math.min(
    windowHeight - (isKeyboardOpen ? keyboardHeight + 36 : 96),
    580
  );

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
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Backdrop
          onPress={handleBackdropPress}
          style={{
            paddingBottom: Platform.OS === 'android' && isKeyboardOpen ? keyboardHeight + 8 : 16,
          }}
          accessibilityRole="none"
        >
          <DialogContainer
            style={{ maxHeight: maxDialogHeight }}
            onPress={(e) => e.stopPropagation()}
            accessibilityRole="alert"
            accessibilityLabel={title}
          >
            <DialogTitle numberOfLines={2}>{title}</DialogTitle>

            <BodyScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}

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
