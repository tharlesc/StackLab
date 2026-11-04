import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useAdmin } from '@/contexts/AdminContext';
import { matchesQuery } from '@/utils';
import type { UserProfile } from '@/types';

export type AdminTab = 'obras' | 'usuarios' | 'matriz';

export const useAdminScreen = () => {
  const router = useRouter();
  const {
    works,
    users,
    addWork,
    toggleWorkActive,
    addUser,
    toggleUserActive,
    toggleAssignment,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<AdminTab>('obras');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [newWorkName, setNewWorkName] = useState('');
  const [newWorkSubtitle, setNewWorkSubtitle] = useState('');
  const [newWorkClient, setNewWorkClient] = useState('');
  const [newWorkAddress, setNewWorkAddress] = useState('');

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserProfile, setNewUserProfile] = useState<UserProfile>('common');

  const filteredWorks = useMemo(() => {
    if (!searchQuery.trim()) return works;
    return works.filter((w) =>
      matchesQuery(searchQuery, w.name, w.subtitle, w.client, w.address)
    );
  }, [works, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter((u) =>
      matchesQuery(searchQuery, u.name, u.email, u.role, u.profile)
    );
  }, [users, searchQuery]);

  const handleOpenAddWork = useCallback(() => {
    setNewWorkName('');
    setNewWorkSubtitle('');
    setNewWorkClient('');
    setNewWorkAddress('');
    setWorkDialogOpen(true);
  }, []);

  const handleConfirmAddWork = useCallback(() => {
    if (!newWorkName.trim()) {
      Alert.alert('Atenção', 'Informe o nome da obra.');
      return;
    }
    addWork({
      name: newWorkName.trim(),
      subtitle: newWorkSubtitle.trim() || 'Fase Inicial',
      client: newWorkClient.trim() || 'Cliente Geral',
      address: newWorkAddress.trim() || 'Endereço em cadastramento',
    });
    setWorkDialogOpen(false);
    Alert.alert('Sucesso', 'Obra cadastrada com sucesso!');
  }, [newWorkName, newWorkSubtitle, newWorkClient, newWorkAddress, addWork]);

  const handleOpenAddUser = useCallback(() => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('');
    setNewUserProfile('common');
    setUserDialogOpen(true);
  }, []);

  const handleConfirmAddUser = useCallback(() => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      Alert.alert('Atenção', 'Preencha nome e e-mail.');
      return;
    }
    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole.trim() || 'Operacional de Campo',
      profile: newUserProfile,
    });
    setUserDialogOpen(false);
    Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
  }, [newUserName, newUserEmail, newUserRole, newUserProfile, addUser]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
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
  };
};

export default useAdminScreen;
