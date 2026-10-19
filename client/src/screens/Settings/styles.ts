import styled from 'styled-components/native';

export const ThemeSectionRow = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px 0;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ThemeLabelRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const ThemeLabelText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

export const BrandAboutHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const BrandSymbol = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme }) => theme.colors.secondary};
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const BrandAboutInfo = styled.View`
  flex: 1;
`;

export const BrandAboutTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const BrandAboutVersion = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const VersionContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;
