import React from 'react';
import { useTheme } from 'styled-components/native';
import { Minus, Plus } from 'lucide-react-native';
import {
  Container,
  Label,
  StepperWrapper,
  StepperButton,
  ValueDisplay,
  ValueText,
  UnitText,
  HelperText,
} from './styles';

export interface QuantityStepperProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  accessibilityLabel: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 9999,
  step = 1,
  unit,
  accessibilityLabel,
  error,
  helper,
  disabled = false,
}) => {
  const theme = useTheme();

  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange(Math.min(max, value + step));
  };

  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <Container>
      {label && <Label>{label}</Label>}

      <StepperWrapper $hasError={Boolean(error)} $disabled={disabled}>
        <StepperButton
          onPress={handleDecrement}
          disabled={disabled || isMin}
          $disabled={disabled || isMin}
          accessibilityLabel={`${accessibilityLabel} - Diminuir`}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Minus
            size={20}
            color={
              disabled || isMin
                ? theme.colors.text.secondary
                : theme.colors.text.primary
            }
          />
        </StepperButton>

        <ValueDisplay>
          <ValueText>{value}</ValueText>
          {unit && <UnitText>{unit}</UnitText>}
        </ValueDisplay>

        <StepperButton
          onPress={handleIncrement}
          disabled={disabled || isMax}
          $disabled={disabled || isMax}
          accessibilityLabel={`${accessibilityLabel} - Aumentar`}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Plus
            size={20}
            color={
              disabled || isMax
                ? theme.colors.text.secondary
                : theme.colors.text.primary
            }
          />
        </StepperButton>
      </StepperWrapper>

      {error ? (
        <HelperText $isError>{error}</HelperText>
      ) : helper ? (
        <HelperText>{helper}</HelperText>
      ) : null}
    </Container>
  );
};

