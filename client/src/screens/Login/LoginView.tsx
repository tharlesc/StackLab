import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { useLogin } from './useLogin';
import {
  BrandHeader,
  BrandLogo,
  UserList,
  UserCardItem,
  UserInfo,
  UserName,
  UserRole,
  ChipWrapper,
  FormContainer,
} from './styles';

import { Button } from '@/components/common/Button';
import { Input, Field } from '@/components/common/Input';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { Title, Subtitle, SectionTitle } from '@/components/common/Typography';
import { Avatar } from '@/components/common/Avatar';
import { Chip } from '@/components/common/Chip';
import { R } from '@/constants/R';

export const LoginView = () => {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollContent showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <BrandHeader>
            <BrandLogo
              source={R.images.logo}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel={R.strings.common.appName}
            />
            <Title>{R.strings.login.title}</Title>
            <Subtitle>{R.strings.login.subtitle}</Subtitle>
          </BrandHeader>

          <FormContainer>
            <Field>
              <Input
                label={R.strings.login.emailLabel}
                placeholder={R.strings.login.emailPlaceholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                returnKeyType="next"
                accessibilityLabel={R.strings.login.emailPlaceholder}
              />
            </Field>
            <Field>
              <Input
                label={R.strings.login.passwordLabel}
                placeholder={R.strings.login.passwordPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                accessibilityLabel={R.strings.login.passwordPlaceholder}
              />
            </Field>
            <Button
              title={R.strings.login.enterButton}
              onPress={handleLogin}
              loading={loading}
              fullWidth
              accessibilityLabel={R.strings.login.enterButton}
            />
          </FormContainer>

          <SectionTitle>{R.strings.login.quickAccess}</SectionTitle>
          <UserList>
            {mockUsers.map((u) => {
              const isMasterUser = u.profile === 'master';
              return (
                <UserCardItem
                  key={u.id}
                  activeOpacity={0.7}
                  onPress={() => handleQuickLogin(u)}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar usuário de teste: ${u.name}, ${u.role}`}
                >
                  <Avatar name={u.name} size={42} highlighted={isMasterUser} />
                  <UserInfo>
                    <UserName numberOfLines={1}>{u.name}</UserName>
                    <UserRole numberOfLines={1}>{u.role}</UserRole>
                    <ChipWrapper>
                      <Chip
                        label={isMasterUser ? R.strings.common.master : 'OPERACIONAL'}
                        variant={isMasterUser ? 'accent' : 'dark'}
                      />
                    </ChipWrapper>
                  </UserInfo>
                </UserCardItem>
              );
            })}
          </UserList>
        </ScrollContent>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default LoginView;
