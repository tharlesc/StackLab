import styled from 'styled-components/native';

export const UserList = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  flex-grow: 0;
  margin-bottom: 32px;
`;

export const UserAvatar = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const UserInfo = styled.View`
  flex: 1;
`;

export const UserName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const UserRole = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const FormContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;
