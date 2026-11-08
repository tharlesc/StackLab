import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  ChevronLeft,
  Plus,
  Check,
  Radio,
  Lock,
  Copy,
} from 'lucide-react-native';

import { useAdminScreen, AdminTab } from '@/hooks';
import {
  ControlsHeader,
  ListHeaderWrapper,
  AdminCard,
  CardHeader,
  HeaderMainInfo,
  CardActionsRow,
  UserFooterRow,
  ProfileToggleRow,
  ItemTitle,
  ItemSubtitle,
  MatrixWorkList,
  MatrixWorkItem,
  MatrixWorkName,
  OnlineBanner,
  OnlineBannerText,
  UserSyncMetaRow,
  OnlineDot,
  OnlineLabel,
  SyncTimeText,
  TempPasswordCard,
  TempPasswordTitle,
  TempPasswordCode,
  CreaSectionBox,
  CreaFieldRow,
  StateSelectorScroll,
  StateChipButton,
  StateChipText,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ListContent } from '@/components/common/Layout';
import { SearchBar } from '@/components/common/SearchBar';
import { SegmentedControl, SegmentOption } from '@/components/common/SegmentedControl';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Dialog } from '@/components/common/Dialog';
import { Input } from '@/components/common/Input';
import { Chip } from '@/components/common/Chip';
import { BRAZILIAN_STATES, isCreaExempt, formatRelative } from '@/utils';
import { strings } from '@/constants/strings';
import type { Work, User } from '@/types';

const TAB_OPTIONS: readonly SegmentOption<AdminTab>[] = [
  { value: 'obras', label: 'Obras' },
  { value: 'usuarios', label: 'Usuários' },
  { value: 'matriz', label: 'Matriz Acessos' },
];

export interface AdminViewProps {
  isTab?: boolean;
}

export const AdminView = ({ isTab = false }: AdminViewProps) => {
  const theme = useTheme();
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    works,
    filteredWorks,
    users,
    filteredUsers,
    onlineUsersCount,
    workDialogOpen,
    setWorkDialogOpen,
    newWorkName,
    setNewWorkName,
    newWorkSubtitle,
    setNewWorkSubtitle,
    newWorkClient,
    setNewWorkClient,
    newWorkAddress,
    setNewWorkAddress,
    userDialogOpen,
    setUserDialogOpen,
    newUserName,
    setNewUserName,
    newUserEmail,
    setNewUserEmail,
    newUserRole,
    setNewUserRole,
    newUserProfile,
    setNewUserProfile,
    newUserCreaNumber,
    setNewUserCreaNumber,
    newUserCreaUf,
    setNewUserCreaUf,
    createdUserSuccess,
    setCreatedUserSuccess,
    handleOpenAddWork,
    handleConfirmAddWork,
    handleOpenAddUser,
    handleConfirmAddUser,
    toggleWorkActive,
    toggleUserActive,
    toggleAssignment,
    handleToggleAssignment,
    handleSaveAssignments,
    isSavingAssignments,
    hasUnsavedAssignments,
    goBack,
    navigateToWorkFeed,
  } = useAdminScreen();

  const renderContent = () => {
    if (activeTab === 'obras') {
      return (
        <ListContent<Work>
          data={filteredWorks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <ListHeaderWrapper>
              <Button
                title="Cadastrar Nova Obra"
                variant="primary"
                icon={
                  <Plus
                    size={theme.icon.size.sm}
                    color={theme.colors.text.inverse}
                    strokeWidth={theme.icon.strokeWidth}
                  />
                }
                onPress={handleOpenAddWork}
              />
            </ListHeaderWrapper>
          }
          renderItem={({ item }) => (
            <AdminCard
              onPress={() => navigateToWorkFeed(item.id)}
              accessibilityLabel={`Obra ${item.name}. Toque para abrir o feed da obra`}
            >
              <CardHeader>
                <HeaderMainInfo>
                  <ItemTitle>{item.name}</ItemTitle>
                  <ItemSubtitle>{item.subtitle}</ItemSubtitle>
                  <ItemSubtitle>
                    Cliente: {item.client} • {item.address}
                  </ItemSubtitle>
                </HeaderMainInfo>
                <StatusBadge
                  label={item.active ? 'Ativa' : 'Inativa'}
                  variant={item.active ? 'success' : 'error'}
                />
              </CardHeader>
              <CardActionsRow>
                <Button
                  title={item.active ? 'Desativar Obra' : 'Ativar Obra'}
                  variant="outline"
                  size="small"
                  onPress={() => toggleWorkActive(item.id)}
                />
              </CardActionsRow>
            </AdminCard>
          )}
        />
      );
    }

    if (activeTab === 'usuarios') {
      return (
        <ListContent<User>
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <ListHeaderWrapper>

              <Button
                title="Novo Usuário"
                variant="primary"
                icon={
                  <Plus
                    size={theme.icon.size.sm}
                    color={theme.colors.text.inverse}
                    strokeWidth={theme.icon.strokeWidth}
                  />
                }
                onPress={handleOpenAddUser}
              />
              
              <OnlineBanner>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Radio size={16} color="#10B981" />
                  <OnlineBannerText>Usuários Conectados</OnlineBannerText>
                </View>
                <Chip label={`${onlineUsersCount} online`} variant="accent" />
              </OnlineBanner>
            </ListHeaderWrapper>
          }
          renderItem={({ item }) => (
            <AdminCard>
              <CardHeader>
                <HeaderMainInfo>
                  <ItemTitle>{item.name}</ItemTitle>
                  <ItemSubtitle>
                    {item.email} • {item.role} {item.crea ? `• ${item.crea}` : ''}
                  </ItemSubtitle>
                  <UserSyncMetaRow>
                    <OnlineDot $online={item.isOnline} />
                    <OnlineLabel $online={item.isOnline}>
                      {item.isOnline ? 'Online no momento' : 'Offline'}
                    </OnlineLabel>
                    <SyncTimeText>
                      {item.lastSyncAt ? `• Sincronizado ${formatRelative(item.lastSyncAt)}` : ''}
                    </SyncTimeText>
                  </UserSyncMetaRow>
                </HeaderMainInfo>
                <Chip
                  label={
                    item.profile === 'master'
                      ? strings.common.master
                      : item.profile === 'client'
                        ? 'CLIENTE'
                        : 'OPERACIONAL'
                  }
                  variant={item.profile === 'master' ? 'accent' : item.profile === 'client' ? 'surface' : 'dark'}
                />
              </CardHeader>

              {item.isFirstAccess && item.tempPassword && (
                <TempPasswordCard>
                  <View style={{ flex: 1 }}>
                    <TempPasswordTitle>Senha de 1º Acesso (Pendente de Login):</TempPasswordTitle>
                    <Text style={{ fontSize: 10, color: '#92400E' }}>
                      Visível para o Master até a troca pelo usuário
                    </Text>
                  </View>
                  <TempPasswordCode>{item.tempPassword}</TempPasswordCode>
                </TempPasswordCard>
              )}

              <UserFooterRow>
                <ItemSubtitle>{item.assignedWorkIds.length} obra(s) vinculada(s)</ItemSubtitle>
                <Button
                  title={item.active ? 'Suspender' : 'Ativar'}
                  variant="outline"
                  size="small"
                  onPress={() => toggleUserActive(item.id)}
                />
              </UserFooterRow>
            </AdminCard>
          )}
        />
      );
    }

    // Matriz de Acessos
    const commonUsers = filteredUsers.filter((u) => u.profile === 'common');
    return (
      <ListContent<User>
        data={commonUsers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: user }) => (
          <AdminCard>
            <ItemTitle>{user.name}</ItemTitle>
            <ItemSubtitle>{user.role} · Toque para vincular ou desvincular obras:</ItemSubtitle>
            <MatrixWorkList>
              {works.map((work) => {
                const assigned = user.assignedWorkIds.includes(work.id);
                return (
                  <MatrixWorkItem
                    key={work.id}
                    $assigned={assigned}
                    onPress={() => handleToggleAssignment(user.id, work.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: assigned }}
                    accessibilityLabel={`${work.name}, ${assigned ? 'vinculada' : 'não vinculada'}`}
                  >
                    <MatrixWorkName $assigned={assigned}>{work.name}</MatrixWorkName>
                    {assigned && (
                      <Check
                        size={theme.icon.size.sm}
                        color={theme.colors.tintText}
                        strokeWidth={theme.icon.strokeWidth}
                      />
                    )}
                  </MatrixWorkItem>
                );
              })}
            </MatrixWorkList>
            <CardActionsRow style={{ marginTop: 12 }}>
              <Button
                title={isSavingAssignments ? 'Salvando...' : 'Salvar Vínculos de Obras'}
                variant="primary"
                size="small"
                onPress={handleSaveAssignments}
                loading={isSavingAssignments}
              />
            </CardActionsRow>
          </AdminCard>
        )}
      />
    );
  };

  const ContainerWrapper = isTab ? View : Screen;

  return (
    <ContainerWrapper style={isTab ? { flex: 1 } : undefined}>
      <Header
        title="Administração & Cadastros"
        leftContent={
          isTab ? undefined : (
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
          )
        }
        rightContent={
          activeTab === 'matriz' ? (
            <HeaderAction
              icon={
                <Check
                  color={hasUnsavedAssignments ? theme.colors.primary : theme.colors.text.secondary}
                  size={theme.icon.size.md}
                  strokeWidth={2.5}
                />
              }
              onPress={handleSaveAssignments}
              accessibilityLabel="Salvar alterações de vínculos da matriz"
            />
          ) : undefined
        }
      />

      <ControlsHeader>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filtrar cadastros..."
        />

        <SegmentedControl options={TAB_OPTIONS} value={activeTab} onChange={setActiveTab} />
      </ControlsHeader>

      {renderContent()}

      {/* Dialog: Cadastrar Obra */}
      <Dialog
        visible={workDialogOpen}
        title="Cadastrar Nova Obra"
        description="Adicione um novo empreendimento ao acervo corporativo:"
        primaryAction={{ label: 'Salvar Obra', onPress: handleConfirmAddWork }}
        secondaryAction={{ label: strings.common.cancel, onPress: () => setWorkDialogOpen(false) }}
        onClose={() => setWorkDialogOpen(false)}
      >
        <Input
          placeholder="Nome da Obra (ex: Residencial Bellagio)"
          value={newWorkName}
          onChangeText={setNewWorkName}
          accessibilityLabel="Nome da Obra"
        />
        <Input
          placeholder="Frente / Descrição (ex: Torre 1 - Estrutura)"
          value={newWorkSubtitle}
          onChangeText={setNewWorkSubtitle}
          accessibilityLabel="Frente ou Descrição da Obra"
        />
        <Input
          placeholder="Cliente / Contratante"
          value={newWorkClient}
          onChangeText={setNewWorkClient}
          accessibilityLabel="Cliente ou Contratante"
        />
        <Input
          placeholder="Endereço / Localização"
          value={newWorkAddress}
          onChangeText={setNewWorkAddress}
          accessibilityLabel="Endereço ou Localização"
        />
      </Dialog>

      {/* Dialog: Cadastrar Usuário */}
      <Dialog
        visible={userDialogOpen}
        title="Novo Usuário"
        description="Defina dados de acesso e perfil funcional:"
        primaryAction={{ label: 'Criar Usuário', onPress: handleConfirmAddUser }}
        secondaryAction={{ label: strings.common.cancel, onPress: () => setUserDialogOpen(false) }}
        onClose={() => setUserDialogOpen(false)}
      >
        <Input
          placeholder="Nome Completo"
          value={newUserName}
          onChangeText={setNewUserName}
          accessibilityLabel="Nome Completo"
        />
        <Input
          placeholder="E-mail profissional"
          value={newUserEmail}
          onChangeText={setNewUserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="E-mail profissional"
        />
        <Input
          placeholder="Cargo (ex: Engenheiro Residente)"
          value={newUserRole}
          onChangeText={setNewUserRole}
          accessibilityLabel="Cargo"
        />

        {/* Seletor Estrito de CREA por Estado do Brasil */}
        {!isCreaExempt(newUserRole, newUserProfile) || newUserProfile === 'master' ? (
          <CreaSectionBox>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 4 }}>
              Estado do CREA (UF): {newUserCreaUf}
            </Text>
            <StateSelectorScroll>
              {BRAZILIAN_STATES.map((st) => (
                <StateChipButton
                  key={st.uf}
                  $selected={newUserCreaUf === st.uf}
                  onPress={() => setNewUserCreaUf(st.uf)}
                >
                  <StateChipText $selected={newUserCreaUf === st.uf}>
                    {st.uf}
                  </StateChipText>
                </StateChipButton>
              ))}
            </StateSelectorScroll>
            <Input
              placeholder={`Número do CREA-${newUserCreaUf} (apenas números)`}
              value={newUserCreaNumber}
              onChangeText={setNewUserCreaNumber}
              keyboardType="numeric"
              accessibilityLabel="Número de registro no CREA"
            />
          </CreaSectionBox>
        ) : (
          <Text style={{ fontSize: 11, color: theme.colors.text.secondary, marginVertical: 4 }}>
            ℹ️ Registro de CREA isento para estagiários e operacionais.
          </Text>
        )}

        <ProfileToggleRow>
          <Button
            title="Perfil Operacional"
            variant={newUserProfile === 'common' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setNewUserProfile('common')}
          />
          <Button
            title="Perfil Master"
            variant={newUserProfile === 'master' ? 'secondary' : 'outline'}
            size="small"
            onPress={() => setNewUserProfile('master')}
          />
        </ProfileToggleRow>
      </Dialog>

      {/* Dialog: Sucesso do Cadastro com Senha de 1º Acesso */}
      <Dialog
        visible={!!createdUserSuccess}
        title="Usuário Criado com Sucesso!"
        description="Uma senha provisória de 6 dígitos foi gerada automaticamente para o primeiro acesso:"
        primaryAction={{
          label: 'Concluir',
          onPress: () => setCreatedUserSuccess(null),
        }}
        onClose={() => setCreatedUserSuccess(null)}
      >
        {createdUserSuccess && (
          <View style={{ gap: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 13, color: theme.colors.text.primary }}>
              <Text style={{ fontWeight: 'bold' }}>Nome: </Text>
              {createdUserSuccess.name}
            </Text>
            <Text style={{ fontSize: 13, color: theme.colors.text.primary }}>
              <Text style={{ fontWeight: 'bold' }}>Login: </Text>
              {createdUserSuccess.email}
            </Text>
            {createdUserSuccess.crea ? (
              <Text style={{ fontSize: 13, color: theme.colors.text.primary }}>
                <Text style={{ fontWeight: 'bold' }}>Registro: </Text>
                {createdUserSuccess.crea}
              </Text>
            ) : null}

            <TempPasswordCard style={{ marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <TempPasswordTitle>Senha Fácil de 1º Acesso:</TempPasswordTitle>
                <Text style={{ fontSize: 10, color: '#92400E' }}>
                  A aplicação pedirá uma nova senha no 1º login
                </Text>
              </View>
              <TempPasswordCode>{createdUserSuccess.tempPassword}</TempPasswordCode>
            </TempPasswordCard>
          </View>
        )}
      </Dialog>
    </ContainerWrapper>
  );
};

export default AdminView;
