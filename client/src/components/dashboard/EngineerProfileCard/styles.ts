import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Card = styled.View`
  background-color: #0A1C38;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const InfoContainer = styled.View`
  flex: 1;
`;

export const Greeting = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: #94A3B8;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const NameRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 700;
`;

export const MasterTag = styled.View`
  background-color: rgba(249, 115, 22, 0.2);
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border-width: 1px;
  border-color: #F97316;
`;

export const MasterTagText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: #F97316;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
`;

export const CreaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const CreaText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: #94A3B8;
  font-size: 11px;
  font-weight: 500;
`;

export const Footer = styled.View`
  border-top-width: 1px;
  border-top-color: rgba(255, 255, 255, 0.1);
  padding-top: ${({ theme }) => theme.spacing.md}px;
`;

export const SyncText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: #94A3B8;
  font-size: 11px;
  font-weight: 500;
`;

export const TimeFilterContainer = styled.View`
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: 4px;
`;

export const TimeFilterButton = styled(TouchableOpacity)<{ $isActive: boolean }>`
  flex: 1;
  min-height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ $isActive }) => ($isActive ? '#F97316' : 'transparent')};
`;

export const TimeFilterText = styled.Text<{ $isActive: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ $isActive }) => ($isActive ? '#FFFFFF' : '#94A3B8')};
  font-size: 12px;
`;

