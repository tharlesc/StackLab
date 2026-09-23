import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


// --- Styled Components ---

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 16,
  },
})``;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const BackButton = styled(TouchableOpacity)`
  padding: ${({ theme }) => theme.spacing.sm}px;
  margin-left: -${({ theme }) => theme.spacing.sm}px;
`;

const BackText = styled.Text`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 16px;
  font-weight: 600;
`;

const PageTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const HeaderSpacer = styled.View`
  width: 60px;
`;

const PhotoSection = styled.View`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const PhotoPlaceholder = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 4px;
  border-color: ${({ theme }) => theme.colors.surface};
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

const PhotoText = styled.Text`
  font-size: 40px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.inverse};
`;

const EditPhotoButton = styled(TouchableOpacity)`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.md}px;
  background-color: rgba(11, 34, 64, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
`;

const EditPhotoText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 600;
`;

const ActionsSection = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

const ActionItem = styled(TouchableOpacity)<{ $isLast?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md}px 0;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  margin-top: ${({ $isLast, theme }) => ($isLast ? `${theme.spacing.sm}px` : '0px')};
`;

const ActionItemText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const LogoutText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-weight: 600;
`;

// --- Component ---

export const Profile = () => {
  const router = useRouter();

  return (
    <Screen>
      <ScrollContent>
        <Header>
          <BackButton onPress={() => router.back()}>
            <BackText>← Voltar</BackText>
          </BackButton>
          <PageTitle>Meu Perfil</PageTitle>
          <HeaderSpacer />
        </Header>

        <PhotoSection>
          <PhotoPlaceholder>
            <PhotoText>TH</PhotoText>
          </PhotoPlaceholder>
          <EditPhotoButton>
            <EditPhotoText>Alterar Foto</EditPhotoText>
          </EditPhotoButton>
        </PhotoSection>


        <ActionsSection>
          <ActionItem>
            <ActionItemText>Configurações de Conta</ActionItemText>
          </ActionItem>
          <ActionItem>
            <ActionItemText>Segurança e Privacidade</ActionItemText>
          </ActionItem>
          <ActionItem $isLast>
            <LogoutText>Sair do Aplicativo</LogoutText>
          </ActionItem>
        </ActionsSection>
      </ScrollContent>
    </Screen>
  );
};
