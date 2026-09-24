import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, UserRound } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Screen, Header, BackButton, BackText, PageTitle, HeaderSpacer, PhotoSection, PhotoPlaceholder, PhotoText, EditPhotoButton, EditPhotoText, ActionsSection, ActionItem, ActionItemText, LogoutText } from './styles';






const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 16,
  },
})``;































export const Profile = () => {
  const { signOut } = useAuth();
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
          <ActionItem $isLast onPress={() => signOut()}>
            <LogoutText>Sair do Aplicativo</LogoutText>
          </ActionItem>
        </ActionsSection>
      </ScrollContent>
    </Screen>
  );
};
