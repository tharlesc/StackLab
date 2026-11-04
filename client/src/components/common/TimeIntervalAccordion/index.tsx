import React, { useState } from 'react';
import { useTheme } from 'styled-components/native';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Input } from '../Input';
import {
  Container,
  AccordionHeader,
  HeaderLeft,
  AccordionTitle,
  AccordionBody,
  TimeInputsRow,
  TimeInputCol,
} from './styles';

export interface TimeIntervalAccordionProps {
  title?: string;
  horaInicio: string;
  horaFim: string;
  onChangeHoraInicio: (value: string) => void;
  onChangeHoraFim: (value: string) => void;
  children?: React.ReactNode;
}

export const TimeIntervalAccordion: React.FC<TimeIntervalAccordionProps> = ({
  title = 'Registrar horário (opcional)',
  horaInicio,
  horaFim,
  onChangeHoraInicio,
  onChangeHoraFim,
  children,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(Boolean(horaInicio || horaFim));

  const formatTime = (text: string) => {
    // Permite digitação amigável de HH:mm
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  };

  return (
    <Container>
      <AccordionHeader
        $isOpen={isOpen}
        onPress={() => setIsOpen((prev) => !prev)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <HeaderLeft>
          <Clock size={16} color={isOpen ? theme.colors.secondary : theme.colors.text.secondary} />
          <AccordionTitle $isOpen={isOpen}>{title}</AccordionTitle>
        </HeaderLeft>
        {isOpen ? (
          <ChevronUp size={16} color={theme.colors.secondary} />
        ) : (
          <ChevronDown size={16} color={theme.colors.text.secondary} />
        )}
      </AccordionHeader>

      {isOpen && (
        <AccordionBody>
          <TimeInputsRow>
            <TimeInputCol>
              <Input
                label="Início"
                placeholder="08:00"
                value={horaInicio}
                onChangeText={(t) => onChangeHoraInicio(formatTime(t))}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
                accessibilityLabel="Horário de início (HH:mm)"
              />
            </TimeInputCol>
            <TimeInputCol>
              <Input
                label="Fim"
                placeholder="17:00"
                value={horaFim}
                onChangeText={(t) => onChangeHoraFim(formatTime(t))}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
                accessibilityLabel="Horário de fim (HH:mm)"
              />
            </TimeInputCol>
          </TimeInputsRow>
          {children}
        </AccordionBody>
      )}
    </Container>
  );
};

