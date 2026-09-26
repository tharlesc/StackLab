import React from 'react';
import { useTheme } from 'styled-components/native';
import { UserRound } from 'lucide-react-native';

import { useLogin } from './useLogin';
import {
  UserList,
  UserAvatar,
  UserInfo,
  UserName,
  UserRole,
  FormContainer,
} from './styles';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { Title, Subtitle, SectionTitle } from '@/components/common/Typography';
import { TouchableCard as UserCard } from '@/components/common/Card';
import { strings } from '@/constants/strings';

export const LoginView = () => {
  const theme = useTheme();
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    mockUsers,
    handleLogin,
    handleQuickLogin,
  } = useLogin();

  return (
    <Screen>
      <ScrollContent showsVerticalScrollIndicator={false}>
        <Title style={{ marginTop: 24, marginBottom: 4 }}>{strings.login.title}</Title>
        <Subtitle style={{ marginBottom: 28 }}>{strings.login.subtitle}</Subtitle>

        <FormContainer>
          <Input
            placeholder={strings.login.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel={strings.login.emailPlaceholder}
          />
          <Input
            placeholder={strings.login.passwordPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel={strings.login.passwordPlaceholder}
          />
          <Button
            title={strings.login.enterButton}
            onPress={handleLogin}
            loading={loading}
            fullWidth
            accessibilityLabel={strings.login.enterButton}
          />
        </FormContainer>

        <SectionTitle>{strings.login.quickAccess}</SectionTitle>
        <UserList>
          {mockUsers.map((u) => (
            <UserCard
              key={u.id}
              activeOpacity={0.7}
              onPress={() => handleQuickLogin(u)}
              style={{ width: 220, marginRight: 12, padding: 14 }}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar usuário de teste: ${u.name}, ${u.role}`}
            >
              <UserAvatar>
                <UserRound color={theme.colors.text.inverse} size={22} />
              </UserAvatar>
              <UserInfo>
                <UserName numberOfLines={1}>{u.name}</UserName>
                <UserRole numberOfLines={1}>{u.role}</UserRole>
              </UserInfo>
            </UserCard>
          ))}
        </UserList>
      </ScrollContent>
    </Screen>
  );
};

export default LoginView;
