import styled from 'styled-components/native';
import { Card } from '@/components/common/Card';

export const QueueCard = styled(Card)`
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.status.warning.base};
  flex-direction: row;
  align-items: center;
  min-height: 80px;
`;

export const InfoContainer = styled.View`
  flex: 1;
`;

export const TitleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

export const SizeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const StatusRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const StatusText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.status.warning.text};
  margin-left: 6px;
`;
