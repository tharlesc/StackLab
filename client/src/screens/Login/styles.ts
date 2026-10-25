import styled from 'styled-components/native';
import { TouchableCard } from '@/components/common/Card';

export const BrandHeader = styled.View`
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const BrandTextContainer = styled.View`
  flex-direction: column;
  align-items: flex-start;
  `;

export const BrandLogo = styled.Image`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
`;

export const UserList = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  flex-grow: 0;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

export const UserCardItem = styled(TouchableCard)`
  width: 230px;
  margin-right: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.mdl}px;
`;

export const UserInfo = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

export const UserName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.callout.fontSize}px;
  line-height: ${({ theme }) => theme.typography.callout.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const UserRole = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ChipWrapper = styled.View`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const FormContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;
