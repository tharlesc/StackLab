import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_USERS } from '@/mocks';
import { strings } from '@/constants/strings';
import type { User } from '@/types';

export const useLogin = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(() => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu e-mail.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const u = MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase());
      setLoading(false);

      if (u) {
        signIn(u);
        router.replace('/');
      } else {
        Alert.alert(strings.login.loginErrorTitle, strings.login.loginErrorMessage);
      }
    }, 400);
  }, [email, signIn, router]);

  const handleQuickLogin = useCallback((user: User) => {
    setEmail(user.email);
    setPassword('123456');
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    mockUsers: MOCK_USERS,
    handleLogin,
    handleQuickLogin,
  };
};

export default useLogin;
