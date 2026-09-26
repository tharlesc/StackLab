import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ChevronLeft, UserRound, Bell, Shield, LogOut } from 'lucide-react-native';

import { useProfile } from './useProfile';
import {
  PhotoSection,
  PhotoPlaceholder,
  ProfileName,
  ProfileEmail,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Button } from '@/components/common/Button';
import { ActionItem } from '@/components/common/ActionItem';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { Card as ActionsSection } from '@/components/common/Card';
import { Dialog } from '@/components/common/Dialog';
import { Chip } from '@/components/common/Chip';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { strings } from '@/constants/strings';

export const ProfileView = () => {
  const theme = useTheme();
  const {
    user,
    goBack,
    navigateToNotifications,
    handleEditPhoto,
    isSignOutDialogOpen,
    handleOpenSignOutDialog,
    handleCloseSignOutDialog,
    handleConfirmSignOut,
  } = useProfile();

  return (
    <Screen>
      <Header
        title={strings.profile.title}
        leftContent={
          <HeaderAction
            icon={<ChevronLeft color={theme.colors.text.secondary} size={24} />}
            onPress={goBack}
            accessibilityLabel={strings.accessibility.backButton}
          />
        }
      />

      <ScrollContent showsVerticalScrollIndicator={false}>
        <PhotoSection>
          <PhotoPlaceholder>
            <UserRound color={theme.colors.text.inverse} size={56} />
          </PhotoPlaceholder>
          <ProfileName>{user?.name || 'Engenheiro'}</ProfileName>
          <ProfileEmail>{user?.email || 'usuario@stacklab.com'}</ProfileEmail>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 14 }}>
            <Chip label="CREA-SP Ativo" variant="dark" />
            <Chip label="Eng. Residente" variant="surface" />
          </View>

          <Button
            title={strings.profile.editPhoto}
            variant="outline"
            size="small"
            onPress={handleEditPhoto}
            accessibilityLabel={strings.profile.editPhoto}
          />
        </PhotoSection>

        <InteractiveCard
          title="Certificado Digital e ART"
          supportingText="Assinatura eletrônica vinculada e válida para emissão de relatórios diários de obra conforme as normas CONFEA/CREA."
          actions={[
            { label: 'Verificar Validade', onPress: () => console.log('Verificar validade') },
            { label: 'Renovar Chave', onPress: () => console.log('Renovar chave'), primary: true },
          ]}
        />

        <ActionsSection>
          <ActionItem
            title={strings.profile.myData}
            leftIcon={<UserRound color={theme.colors.text.secondary} size={20} />}
            onPress={() => { }}
          />
          <ActionItem
            title={strings.navigation.notifications}
            leftIcon={<Bell color={theme.colors.text.secondary} size={20} />}
            onPress={navigateToNotifications}
          />
          <ActionItem
            title={strings.security.title}
            leftIcon={<Shield color={theme.colors.text.secondary} size={20} />}
            onPress={() => { }}
          />
          <ActionItem
            title={strings.profile.logout}
            leftIcon={<LogOut color={theme.colors.status.error.base} size={20} />}
            onPress={handleOpenSignOutDialog}
            variant="danger"
            isLast={true}
          />
        </ActionsSection>
      </ScrollContent>

      <Dialog
        visible={isSignOutDialogOpen}
        title="Sair da Conta"
        description="Deseja realmente sair da sua sessão? Os dados salvos localmente e os rascunhos de diários permanecerão protegidos neste aparelho."
        primaryAction={{
          label: 'Sair',
          onPress: handleConfirmSignOut,
          destructive: true,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: handleCloseSignOutDialog,
        }}
        onClose={handleCloseSignOutDialog}
      />
    </Screen>
  );
};

export default ProfileView;
