import React from 'react';
import { useTheme } from 'styled-components/native';
import { ChevronLeft, UserRound, Bell, Shield, LogOut } from 'lucide-react-native';

import { useProfile } from './useProfile';
import {
  PhotoSection,
  ProfileName,
  ProfileEmail,
  ChipsRow,
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
            icon={
              <ChevronLeft
                color={theme.colors.text.secondary}
                size={theme.icon.size.lg}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={goBack}
            accessibilityLabel={strings.accessibility.backButton}
          />
        }
      />

      <ScrollContent showsVerticalScrollIndicator={false}>
        <PhotoSection>
          <Avatar name={user?.name} size={96} highlighted={isMasterUser} />
          <ProfileName>{user?.name || 'Profissional'}</ProfileName>
          <ProfileEmail>{user?.email || 'usuario@stacklab.com'}</ProfileEmail>

          <ChipsRow>
            <Chip
              label={isMasterUser ? 'MASTER (GESTOR)' : 'OPERACIONAL'}
              variant={isMasterUser ? 'accent' : 'dark'}
            />
            <Chip label={user?.crea || user?.role || 'Ativo'} variant="surface" />
          </ChipsRow>

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
              ? 'Chave digital Master configurada para chancela, aprovação com 2 fatores e geração de hash criptográfico nos RDOs aprovados.'
              : 'Assinatura vinculada e válida para preenchimento e submissão diária no aplicativo de campo.'
          }
          actions={[
            { label: 'Verificar Validade', onPress: () => {} },
            { label: 'Renovar Chave', onPress: () => {}, primary: true },
          ]}
        />

        <ActionsSection>
          <ActionItem
            title={strings.profile.myData}
            leftIcon={
              <UserRound
                color={theme.colors.text.secondary}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={() => {}}
          />
          <ActionItem
            title={strings.navigation.notifications}
            leftIcon={
              <Bell
                color={theme.colors.text.secondary}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={navigateToNotifications}
          />
          <ActionItem
            title={strings.security.title}
            leftIcon={
              <Shield
                color={theme.colors.text.secondary}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={() => {}}
          />
          <ActionItem
            title={strings.profile.logout}
            leftIcon={
              <LogOut
                color={theme.colors.status.error.text}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={handleOpenSignOutDialog}
            variant="danger"
            isLast={true}
          />
        </ActionsSection>
      </ScrollContent>

      <Dialog
        visible={isSignOutDialogOpen}
        title={strings.profile.logoutDialogTitle}
        description={strings.profile.logoutDialogDesc}
        primaryAction={{
          label: strings.profile.logout,
          onPress: handleConfirmSignOut,
          destructive: true,
        }}
        secondaryAction={{
          label: strings.common.cancel,
          onPress: handleCloseSignOutDialog,
        }}
        onClose={handleCloseSignOutDialog}
      />
    </Screen>
  );
};

export default ProfileView;
