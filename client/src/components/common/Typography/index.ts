import styled from 'styled-components/native';

export const SectionTitle = styled.Text.attrs({ accessibilityRole: 'header' })`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Title = styled.Text.attrs({ accessibilityRole: 'header' })`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 28px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const PageDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  line-height: 20px;
`;
