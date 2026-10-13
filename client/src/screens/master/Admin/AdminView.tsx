import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  ChevronLeft,
  Building2,
  Users,
  Shield,
  Plus,
  Check,
  Power,
} from 'lucide-react-native';

import { useAdminScreen, AdminTab } from './useAdminScreen';
import {
  ControlsHeader,
  AdminCard,
  CardHeader,
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
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Dialog } from '@/components/common/Dialog';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { Chip } from '@/components/common/Chip';
import type { Work, User } from '@/types';

const TAB_OPTIONS: { value: AdminTab; label: string }[] = [
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
        <ListContent
          data={filteredWorks}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 110,
          }}
          ListHeaderComponent={
            <View style={{ marginBottom: 14 }}>
              <Button
                title="Cadastrar Nova Obra"
                variant="primary"
                icon={<Plus size={16} color={theme.colors.text.inverse} />}
                onPress={handleOpenAddWork}
              />
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <AdminCard>
              <CardHeader>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <ItemTitle>{item.name}</ItemTitle>
                  <ItemSubtitle>{item.subtitle}</ItemSubtitle>
                  <ItemSubtitle style={{ marginTop: 4 }}>
                    Cliente: {item.client} • {item.address}
                  </ItemSubtitle>
                </View>
                <StatusBadge
                  label={item.active ? 'Ativa' : 'Inativa'}
                  variant={item.active ? 'success' : 'error'}
                />
              </CardHeader>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button
                  title={item.active ? 'Desativar Obra' : 'Ativar Obra'}
                  variant="outline"
                  size="small"
                  onPress={() => toggleWorkActive(item.id)}
                />
              </View>
            </AdminCard>
          )}
        />
      );
    }

    if (activeTab === 'usuarios') {
      return (
        <ListContent
          data={filteredUsers}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 110,
          }}
          ListHeaderComponent={
            <View style={{ marginBottom: 14 }}>
              <Button
                title="Novo Usuário"
                variant="primary"
                icon={<Plus size={16} color={theme.colors.text.inverse} />}
                onPress={handleOpenAddUser}
              />
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <AdminCard>
              <CardHeader>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <ItemTitle>{item.name}</ItemTitle>
                  <ItemSubtitle>{item.email} • {item.role}</ItemSubtitle>
                </View>
                <Chip
                  label={item.profile === 'master' ? 'MASTER' : 'OPERACIONAL'}
                  variant={item.profile === 'master' ? 'accent' : 'dark'}
                />
              </CardHeader>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <ItemSubtitle>{item.assignedWorkIds.length} obra(s) vinculada(s)</ItemSubtitle>
                <Button
                  title={item.active ? 'Suspender' : 'Ativar'}
                  variant="outline"
                  size="small"
                  onPress={() => toggleUserActive(item.id)}
                />
              </View>
            </AdminCard>
          )}
        />
      );
    }

    // Matriz de Acessos
    const commonUsers = filteredUsers.filter((u) => u.profile === 'common');
    return (
      <ListContent
        data={commonUsers}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 110,
        }}
        renderItem={({ item: user }: { item: any }) => (
          <AdminCard>
            <ItemTitle>{user.name}</ItemTitle>
            <ItemSubtitle>{user.role} — Clique para vincular/desvincular obras:</ItemSubtitle>
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
                  >
                    <MatrixWorkName $assigned={assigned}>{work.name}</MatrixWorkName>
                    {assigned && <Check size={16} color={theme.colors.secondary} />}
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
              icon={<ChevronLeft color={theme.colors.text.secondary} size={24} />}
              onPress={goBack}
              accessibilityLabel="Voltar"
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

        <SegmentedControl
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
        />
      </ControlsHeader>

      {renderContent()}

      {/* Dialog: Cadastrar Obra */}
      <Dialog
        visible={workDialogOpen}
        title="Cadastrar Nova Obra"
        description="Adicione um novo empreendimento ao acervo corporativo:"
        primaryAction={{ label: 'Salvar Obra', onPress: handleConfirmAddWork }}
        secondaryAction={{ label: 'Cancelar', onPress: () => setWorkDialogOpen(false) }}
        onClose={() => setWorkDialogOpen(false)}
      >
        <Input
          placeholder="Nome da Obra (ex: Residencial Bellagio)"
          value={newWorkName}
          onChangeText={setNewWorkName}
        />
        <Input
          placeholder="Frente / Descrição (ex: Torre 1 - Estrutura)"
          value={newWorkSubtitle}
          onChangeText={setNewWorkSubtitle}
        />
        <Input
          placeholder="Cliente / Contratante"
          value={newWorkClient}
          onChangeText={setNewWorkClient}
        />
        <Input
          placeholder="Endereço / Localização"
          value={newWorkAddress}
          onChangeText={setNewWorkAddress}
        />
      </Dialog>

      {/* Dialog: Cadastrar Usuário */}
      <Dialog
        visible={userDialogOpen}
        title="Novo Usuário"
        description="Defina dados de acesso e perfil funcional:"
        primaryAction={{ label: 'Criar Usuário', onPress: handleConfirmAddUser }}
        secondaryAction={{ label: 'Cancelar', onPress: () => setUserDialogOpen(false) }}
        onClose={() => setUserDialogOpen(false)}
      >
        <Input
          placeholder="Nome Completo"
          value={newUserName}
          onChangeText={setNewUserName}
        />
        <Input
          placeholder="E-mail profissional"
          value={newUserEmail}
          onChangeText={setNewUserEmail}
          keyboardType="email-address"
        />
        <Input
          placeholder="Cargo (ex: Estagiário de Obras)"
          value={newUserRole}
          onChangeText={setNewUserRole}
        />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
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
        </View>
      </Dialog>
    </ContainerWrapper>
  );
};

export default AdminView;
