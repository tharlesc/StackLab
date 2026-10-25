import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { TouchableCard } from '@/components/common/Card';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { Title, Subtitle, SectionTitle } from '@/components/common/Typography';
import { Field } from '@/components/common/Input';

export const LoginScreen = styled(Screen)`
  flex: 1;
  background-color: #07080c;
  position: relative;
  overflow: hidden;
`;

export const BackgroundLayer = styled.View.attrs({
  pointerEvents: 'none',
})`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const LoginScrollContent = styled(ScrollContent).attrs({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
})``;

export const ContentContainer = styled.View`
  width: 100%;
  max-width: 420px;
  align-self: center;
`;

export const BrandHeader = styled.View`
  align-items: center;
  margin-top: 8px;
  margin-bottom: 28px;
`;

export const LogoWrapper = styled.View`
  width: 68px;
  height: 68px;
  border-radius: 16px;
  margin-bottom: 16px;
  shadow-color: #f97316;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.38;
  shadow-radius: 16px;
  elevation: 8;
`;

export const BrandLogo = styled.Image`
  width: 68px;
  height: 68px;
  border-radius: 16px;
`;

export const BrandTitle = styled(Title)`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 32px;
  line-height: 38px;
  color: #ffffff;
  text-align: center;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
`;

export const BrandSubtitle = styled(Subtitle)`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 15px;
  line-height: 21px;
  color: #94a3b8;
  text-align: center;
`;

export const FormContainer = styled.View`
  background-color: rgba(18, 20, 26, 0.92);
  border-radius: 22px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.08);
  padding: 22px 18px;
  margin-bottom: 28px;
  shadow-color: #000000;
  shadow-offset: 0px 12px;
  shadow-opacity: 0.5;
  shadow-radius: 24px;
  elevation: 10;
`;

export const FieldGroup = styled(Field)`
  margin-bottom: 18px;
`;

export const FieldLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 11.5px;
  line-height: 16px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
`;

export const InputShell = styled.View<{ $focused?: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: #181b22;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ $focused }) =>
    $focused ? '#2563eb' : 'rgba(255, 255, 255, 0.09)'};
  padding-left: 14px;
  padding-right: 12px;
  min-height: 52px;
`;

export const InputIconWrapper = styled.View`
  margin-right: 10px;
  align-items: center;
  justify-content: center;
`;

export const PasswordToggleButton = styled(TouchableOpacity)`
  padding: 6px;
  margin-left: 4px;
  align-items: center;
  justify-content: center;
`;

export const SubmitButton = styled(TouchableOpacity)<{
  $pressed?: boolean;
  disabled?: boolean;
}>`
  background-color: ${({ $pressed, disabled }) =>
    disabled ? '#1e293b' : $pressed ? '#1554cc' : '#1a6bff'};
  border-radius: 12px;
  min-height: 52px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 4px;
  padding-left: 20px;
  padding-right: 20px;
  shadow-color: #1a6bff;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.35;
  shadow-radius: 12px;
  elevation: 6;
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};
  transform: ${({ $pressed }) => ($pressed ? 'scale(0.99)' : 'scale(1)')};
`;

export const SubmitButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  line-height: 22px;
  color: #ffffff;
  text-align: center;
`;

export const SubmitButtonIcon = styled.View`
  position: absolute;
  right: 18px;
  align-items: center;
  justify-content: center;
`;

export const QuickAccessHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

export const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
`;

export const QuickAccessTitle = styled(SectionTitle)`
  margin-top: 0px;
  margin-bottom: 0px;
  margin-left: 12px;
  margin-right: 12px;
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 11.5px;
  line-height: 16px;
  color: #94a3b8;
  letter-spacing: 0.8px;
  text-transform: uppercase;
`;

export const UserList = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingRight: 8,
  },
})`
  flex-grow: 0;
  margin-bottom: 16px;
`;

export const UserCardItem = styled(TouchableCard)`
  width: 244px;
  margin-right: 12px;
  margin-bottom: 0px;
  padding: 14px;
  background-color: rgba(20, 23, 30, 0.92);
  border-radius: 16px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.08);
  flex-direction: row;
  align-items: center;
`;

export const UserInfo = styled.View`
  flex: 1;
  margin-left: 12px;
  margin-right: 6px;
`;

export const UserName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 15px;
  line-height: 20px;
  color: #f8fafc;
`;

export const UserRole = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  line-height: 16px;
  color: #94a3b8;
  margin-top: 1px;
`;

export const ChipWrapper = styled.View`
  margin-top: 6px;
  align-self: flex-start;
`;

export const CardChevronWrapper = styled.View`
  margin-left: 4px;
  align-items: center;
  justify-content: center;
`;
