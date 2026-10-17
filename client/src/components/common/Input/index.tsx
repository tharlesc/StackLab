import React, { useState } from 'react';
import { TextInputProps } from 'react-native';
import { useTheme } from 'styled-components/native';
import { InputWrapper, InputLabel, StyledInput, HelperText } from './styles';

export { Field } from './styles';

export interface InputProps extends Omit<TextInputProps, 'accessibilityLabel'> {
  accessibilityLabel: string;
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
}

export const Input = ({
  accessibilityLabel,
  label,
  helper,
  error,
  disabled = false,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: InputProps) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled || !editable;
  const hasError = Boolean(error);

  const inputElement = (
    <StyledInput
      placeholderTextColor={theme.colors.text.secondary}
      editable={!isDisabled}
      $focused={focused}
      $hasError={hasError}
      $disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );

  if (!label && !helper && !error) {
    return inputElement;
  }

  return (
    <InputWrapper>
      {label ? <InputLabel>{label}</InputLabel> : null}
      {inputElement}
      {error ? (
        <HelperText $isError accessibilityRole="alert">
          {error}
        </HelperText>
      ) : helper ? (
        <HelperText>{helper}</HelperText>
      ) : null}
    </InputWrapper>
  );
};
