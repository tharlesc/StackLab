import styled from 'styled-components/native';

export const PhotoSection = styled.View`
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const PhotoPlaceholder = styled.View`
  width: 104px;
  height: 104px;
  border-radius: 52px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 3px;
  border-color: ${({ theme }) => theme.colors.secondary};
`;

export const ProfileName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`;

export const ProfileEmail = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;
