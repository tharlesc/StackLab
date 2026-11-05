import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { strings } from '@/constants/strings';
import { authService, isSupabaseConfigured } from '@/services';

export const useLogin = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleLogin = useCallback(async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert('Atenção', 'Por favor, informe seu e-mail.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Atenção', 'Por favor, informe sua senha.');
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert(
        'Supabase não configurado',
        'Configure as credenciais do Supabase no arquivo client/.env para autenticação real.',
      );
      return;
    }

    setLoading(true);

    try {
      const { user: authUser, error } = await authService.loginWithEmail(cleanEmail, password);

      if (error || !authUser) {
        Alert.alert(strings.login.loginErrorTitle, error || strings.login.loginErrorMessage);
        return;
      }

      signIn(authUser);
      router.replace('/');
    } catch (err: any) {
      Alert.alert(strings.login.loginErrorTitle, err?.message || strings.login.loginErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, router]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    toggleShowPassword,
    loading,
    handleLogin,
  };
};

export default useLogin;
