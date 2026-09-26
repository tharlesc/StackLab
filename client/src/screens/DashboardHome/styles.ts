import styled from 'styled-components/native';

export const Section = styled.View`
  margin-top: 1px;
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SeeAllText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.secondary};
  min-height: 44px;
  line-height: 44px;
`;

export const AvatarBadge = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;
