import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ChevronLeft, UserRound, Bell, Shield, LogOut } from 'lucide-react-native';

import { useProfile } from './useProfile';
import {
  PhotoSection,
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
import { Avatar } from '@/components/common/Avatar';
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

  const isMasterUser = user?.profile === 'master';

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
          <Avatar name={user?.name} size={96} highlighted={isMasterUser} />
          <ProfileName style={{ marginTop: 12 }}>{user?.name || 'Profissional'}</ProfileName>
          <ProfileEmail>{user?.email || 'usuario@stacklab.com'}</ProfileEmail>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 14 }}>
            <Chip
              label={isMasterUser ? 'MASTER (GESTOR)' : 'OPERACIONAL'}
              variant={isMasterUser ? 'accent' : 'dark'}
            />
            <Chip
              label={user?.crea || user?.role || 'Ativo'}
              variant="surface"
            />
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
          supportingText={
            isMasterUser
              ? 'Chave digital Master configurada para chancela, aprovação com 2 fatores e geração de hash criptográfico nos RDOs homologados.'
              : 'Assinatura vinculada e válida para preenchimento e submissão diária no aplicativo de campo.'
          }
          actions={[
            { label: 'Verificar Validade', onPress: () => console.log('Verificar validade') },
            { label: 'Renovar Chave', onPress: () => console.log('Renovar chave'), primary: true },
          ]}
        />

        <ActionsSection>
          <ActionItem
            title={strings.profile.myData}
            leftIcon={<UserRound color={theme.colors.text.secondary} size={20} />}
            onPress={() => {}}
          />
          <ActionItem
            title={strings.navigation.notifications}
            leftIcon={<Bell color={theme.colors.text.secondary} size={20} />}
            onPress={navigateToNotifications}
          />
          <ActionItem
            title={strings.security.title}
            leftIcon={<Shield color={theme.colors.text.secondary} size={20} />}
            onPress={() => {}}
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
