import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { UserRound, ChevronRight } from 'lucide-react-native';
import { useAuth, MOCK_USERS } from '../../contexts/AuthContext';
import {
  Screen,
  Title,
  Subtitle,
  UserList,
  UserCard,
  UserAvatar,
  UserInfo,
  UserName,
  UserRole,
  FormContainer,
  Input,
  LoginButton,
  LoginButtonText
} from './styles';
import { StatusBar } from 'expo-status-bar';

export const Login = () => {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
      signIn(user);
      router.replace('/');
    } else {
      alert('Usuário não encontrado!');
    }
  };

  const fillInputs = (user: typeof MOCK_USERS[0]) => {
    setEmail(user.email);
    setPassword('123456'); // Senha fictícia preenchida
  };

  return (
    <Screen>
      <StatusBar style="light" />
      <Title>StackLab</Title>
      <Subtitle>Faça login na sua conta</Subtitle>

      <FormContainer>
        <Input 
          placeholder="E-mail" 
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <Input 
          placeholder="Senha" 
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <LoginButton activeOpacity={0.8} onPress={handleLogin}>
          <LoginButtonText>Entrar</LoginButtonText>
        </LoginButton>
      </FormContainer>

      <Subtitle style={{ marginBottom: 16 }}>Usuários de Teste Rápidos:</Subtitle>

      <UserList>
        {MOCK_USERS.map((user) => (
          <UserCard key={user.id} activeOpacity={0.8} onPress={() => fillInputs(user)}>
            <UserAvatar>
              <UserRound color="#FFFFFF" size={24} />
            </UserAvatar>
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserRole>{user.role}</UserRole>
            </UserInfo>
            <ChevronRight color="#94A3B8" size={20} />
          </UserCard>
        ))}
      </UserList>
    </Screen>
  );
};
