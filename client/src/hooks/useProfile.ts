import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export const useProfile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateToNotifications = useCallback(() => {
    router.push('/notifications');
  }, [router]);

  const handleEditPhoto = useCallback(() => {
    console.log('Editar foto de perfil selecionado');
  }, []);

  const handleOpenSignOutDialog = useCallback(() => {
    setIsSignOutDialogOpen(true);
  }, []);

  const handleCloseSignOutDialog = useCallback(() => {
    setIsSignOutDialogOpen(false);
  }, []);

  const handleConfirmSignOut = useCallback(() => {
    setIsSignOutDialogOpen(false);
    signOut();
  }, [signOut]);

  return {
    user,
    goBack,
    navigateToNotifications,
    handleEditPhoto,
    isSignOutDialogOpen,
    handleOpenSignOutDialog,
    handleCloseSignOutDialog,
    handleConfirmSignOut,
  };
};

export default useProfile;
