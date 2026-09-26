import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ToggleContainer, Track, Thumb } from './styles';

export interface ToggleProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const Toggle = ({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
}: ToggleProps) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <ToggleContainer
      activeOpacity={0.8}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel || 'Interruptor'}
    >
      <Track $checked={value}>
        <Thumb style={{ transform: [{ translateX }] }} />
      </Track>
    </ToggleContainer>
  );
};

export default Toggle;
