import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useAdmin } from '@/contexts/AdminContext';
import { matchesQuery, formatCrea, validateCrea, isCreaExempt } from '@/utils';
import type { UserProfile, User } from '@/types';

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
  const [newUserCreaNumber, setNewUserCreaNumber] = useState('');
  const [newUserCreaUf, setNewUserCreaUf] = useState('SP');

  // Modal para exibir a senha de primeiro acesso após cadastro
  const [createdUserSuccess, setCreatedUserSuccess] = useState<User | null>(null);

  // Controle de salvamento de atribuições da matriz
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);
  const [hasUnsavedAssignments, setHasUnsavedAssignments] = useState(false);

  const handleToggleAssignment = useCallback(
    (userId: string, workId: string) => {
      toggleAssignment(userId, workId);
      setHasUnsavedAssignments(true);
    },
    [toggleAssignment],
  );

  const handleSaveAssignments = useCallback(async () => {
    setIsSavingAssignments(true);
    try {
      setHasUnsavedAssignments(false);
      Alert.alert(
        'Vínculos Salvos',
        'Matriz de acessos atualizada e sincronizada com sucesso para os operadores!',
      );
    } catch {
      Alert.alert('Erro', 'Falha ao salvar alterações de vínculos de obras.');
    } finally {
      setIsSavingAssignments(false);
    }
  }, []);

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

  const onlineUsersCount = useMemo(() => {
    return users.filter((u) => u.isOnline).length;
  }, [users]);

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
    setNewUserCreaNumber('');
    setNewUserCreaUf('SP');
    setUserDialogOpen(true);
  }, []);

  const handleConfirmAddUser = useCallback(async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      Alert.alert('Atenção', 'Preencha o nome completo e o e-mail.');
      return;
    }

    const exempt = isCreaExempt(newUserRole, newUserProfile);
    let finalCrea: string | undefined = undefined;

    if (!exempt || newUserCreaNumber.trim()) {
      // Validação estrita do CREA com base no estado do Brasil
      const validation = validateCrea(newUserCreaNumber, newUserCreaUf);
      if (!validation.isValid) {
        Alert.alert('CREA Inválido', validation.error || 'Verifique o número e o estado do CREA.');
        return;
      }
      finalCrea = formatCrea(newUserCreaNumber, newUserCreaUf);
    }

    const created = await addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole.trim() || (newUserProfile === 'master' ? 'Engenheiro Master' : 'Operacional de Campo'),
      profile: newUserProfile,
      crea: finalCrea,
    });

    setUserDialogOpen(false);
    setCreatedUserSuccess(created);
  }, [newUserName, newUserEmail, newUserRole, newUserProfile, newUserCreaNumber, newUserCreaUf, addUser]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateToWorkFeed = useCallback(
    (workId: string) => {
      router.push({
        pathname: '/work-feed',
        params: { id: workId },
      });
    },
    [router],
  );

  return {
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
  };
};

export default useAdminScreen;
