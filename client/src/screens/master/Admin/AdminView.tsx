import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  ChevronLeft,
  Plus,
  Check,
} from 'lucide-react-native';

import { useAdminScreen, AdminTab } from './useAdminScreen';
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
    filteredUsers,
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
    handleOpenAddWork,
    handleConfirmAddWork,
    handleOpenAddUser,
    handleConfirmAddUser,
    toggleWorkActive,
    toggleUserActive,
    toggleAssignment,
    goBack,
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
            <AdminCard>
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
            </ListHeaderWrapper>
          }
          renderItem={({ item }) => (
            <AdminCard>
              <CardHeader>
                <HeaderMainInfo>
                  <ItemTitle>{item.name}</ItemTitle>
                  <ItemSubtitle>
                    {item.email} • {item.role}
                  </ItemSubtitle>
                </HeaderMainInfo>
                <Chip
                  label={item.profile === 'master' ? strings.common.master : 'OPERACIONAL'}
                  variant={item.profile === 'master' ? 'accent' : 'dark'}
                />
              </CardHeader>
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
            <ItemSubtitle>{user.role} — Toque para vincular ou desvincular obras:</ItemSubtitle>
            <MatrixWorkList>
              {works.map((work) => {
                const assigned = user.assignedWorkIds.includes(work.id);
                return (
                  <MatrixWorkItem
                    key={work.id}
                    $assigned={assigned}
                    onPress={() => toggleAssignment(user.id, work.id)}
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
          placeholder="Cargo (ex: Estagiário de Obras)"
          value={newUserRole}
          onChangeText={setNewUserRole}
          accessibilityLabel="Cargo"
        />
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
    </ContainerWrapper>
  );
};

export default AdminView;
