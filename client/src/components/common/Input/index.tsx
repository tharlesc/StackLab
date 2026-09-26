import React from 'react';
import { TextInputProps } from 'react-native';
import { StyledInput } from './styles';
import { useTheme } from 'styled-components/native';

export interface InputProps extends TextInputProps {}

export const Input = (props: InputProps) => {
  const theme = useTheme();
  
  return (
    <StyledInput
      placeholderTextColor={theme.colors.text.secondary}
      {...props}
    />
  );
};
