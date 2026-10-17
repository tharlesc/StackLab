import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Section = styled.View`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SeeAllText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ theme }) => theme.colors.tintText};
`;

export const AvatarButton = styled(TouchableOpacity)`
  min-width: ${({ theme }) => theme.touchTarget.minWidth}px;
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  align-items: center;
  justify-content: center;
`;

export const SearchWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.mdl}px;
`;

export const SlaCardWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SearchSectionHeader = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SearchResultItem = styled(TouchableOpacity)<{ $isLast?: boolean }>`
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm}px 0;
  border-bottom-width: ${({ $isLast }) => ($isLast ? '0px' : '1px')};
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const SearchResultTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.callout.fontSize}px;
  line-height: ${({ theme }) => theme.typography.callout.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const SearchResultSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;
