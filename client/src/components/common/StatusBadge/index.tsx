import React from 'react';
import styled from 'styled-components/native';
import type { StatusVariant } from '@/types';

export interface StatusBadgeProps {
  label: string;
  variant: StatusVariant;
  icon?: React.ReactNode;
}

/** Tag de status semântica (success/warning/error/info) baseada nos tokens `status`. */
export const StatusBadge = ({ label, variant, icon }: StatusBadgeProps) => (
  <Container $variant={variant} accessibilityRole="text" accessibilityLabel={`Status: ${label}`}>
    {icon}
    <Label $variant={variant}>{label}</Label>
  </Container>
);

const Container = styled.View<{ $variant: StatusVariant }>`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  border-width: 1px;
  border-color: ${({ theme, $variant }) => theme.colors.status[$variant].border};
  background-color: ${({ theme, $variant }) => theme.colors.status[$variant].bg};
`;

const Label = styled.Text<{ $variant: StatusVariant }>`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 12px;
  color: ${({ theme, $variant }) => theme.colors.status[$variant].text};
`;

export default StatusBadge;
