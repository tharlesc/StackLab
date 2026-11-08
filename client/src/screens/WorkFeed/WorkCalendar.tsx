import React, { useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { RDO } from '@/types';
import {
  CalendarCard,
  CalendarHeader,
  MonthTitle,
  MonthNavRow,
  MonthNavButton,
  WeekdaysRow,
  WeekdayText,
  DaysGrid,
  DayCell,
  DayNumber,
  DayIndicatorDot,
  CalendarLegendRow,
  LegendItem,
  LegendDot,
  LegendText,
} from './styles';

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'] as const;

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export interface WorkCalendarProps {
  rdos: RDO[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export const WorkCalendar = ({ rdos, selectedDate, onSelectDate }: WorkCalendarProps) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  // Mapeia os dias com RDOs para acesso O(1)
  const rdoMapByDate = useMemo(() => {
    const map = new Map<string, { approved: boolean; submitted: boolean; returned: boolean }>();
    rdos.forEach((r) => {
      if (!r.date) return;
      const cleanDate = r.date.split('T')[0];
      const current = map.get(cleanDate) || { approved: false, submitted: false, returned: false };
      if (r.status === 'aprovado') current.approved = true;
      if (r.status === 'submetido') current.submitted = true;
      if (r.status === 'devolvido') current.returned = true;
      map.set(cleanDate, current);
    });
    return map;
  }, [rdos]);

  // Dias do mês
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    const totalDays = new Date(year, month + 1, 0).getDate();

    const blanks: (number | null)[] = Array.from({ length: firstDayIndex }, () => null);
    const days: (number | null)[] = Array.from({ length: totalDays }, (_, i) => i + 1);

    return [...blanks, ...days];
  }, [year, month]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`;
  }, []);

  return (
    <CalendarCard>
      <CalendarHeader>
        <MonthTitle>
          {MONTH_NAMES[month]} {year}
        </MonthTitle>
        <MonthNavRow>
          <MonthNavButton
            onPress={handlePrevMonth}
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
          >
            <ChevronLeft size={18} color={theme.colors.text.primary} />
          </MonthNavButton>
          <MonthNavButton
            onPress={handleNextMonth}
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
          >
            <ChevronRight size={18} color={theme.colors.text.primary} />
          </MonthNavButton>
        </MonthNavRow>
      </CalendarHeader>

      <WeekdaysRow>
        {WEEKDAYS.map((w) => (
          <WeekdayText key={w}>{w}</WeekdayText>
        ))}
      </WeekdaysRow>

      <DaysGrid>
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <View key={`blank-${idx}`} style={{ width: '14.28%', height: 32 }} />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
            2,
            '0',
          )}`;
          const dayStatus = rdoMapByDate.get(dateStr);
          const hasApproved = dayStatus?.approved ?? false;
          const hasSubmitted = dayStatus?.submitted ?? false;
          const hasReturned = dayStatus?.returned ?? false;
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          return (
            <DayCell
              key={dateStr}
              $isSelected={isSelected}
              $hasApproved={hasApproved}
              $hasSubmitted={hasSubmitted}
              $hasReturned={hasReturned}
              $isToday={isToday}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              onPress={() => onSelectDate(isSelected ? null : dateStr)}
              accessibilityRole="button"
              accessibilityLabel={`Dia ${day} de ${MONTH_NAMES[month]}, ${
                hasApproved ? 'RDO Aprovado' : hasSubmitted ? 'RDO em análise' : 'Sem RDO'
              }`}
            >
              <DayNumber
                $isSelected={isSelected}
                $hasApproved={hasApproved}
                $hasSubmitted={hasSubmitted}
                $hasReturned={hasReturned}
                $isToday={isToday}
              >
                {day}
              </DayNumber>

              {hasApproved ? (
                <DayIndicatorDot $color="#10B981" />
              ) : hasSubmitted ? (
                <DayIndicatorDot $color="#F59E0B" />
              ) : hasReturned ? (
                <DayIndicatorDot $color="#EF4444" />
              ) : null}
            </DayCell>
          );
        })}
      </DaysGrid>

      <CalendarLegendRow>
        <LegendItem>
          <LegendDot $color="#10B981" />
          <LegendText>OK</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#F59E0B" />
          <LegendText>Em Análise</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#EF4444" />
          <LegendText>Devolvido</LegendText>
        </LegendItem>
      </CalendarLegendRow>
    </CalendarCard>
  );
};
