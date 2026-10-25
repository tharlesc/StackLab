import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
} from 'react-native-svg';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronRight,
} from 'lucide-react-native';

import { useLogin } from './useLogin';
import {
  LoginScreen,
  BackgroundLayer,
  LoginScrollContent,
  ContentContainer,
  BrandHeader,
  LogoWrapper,
  BrandLogo,
  BrandTitle,
  BrandSubtitle,
  FormContainer,
  FieldGroup,
  FieldLabel,
  InputShell,
  InputIconWrapper,
  PasswordToggleButton,
  SubmitButton,
  SubmitButtonText,
  SubmitButtonIcon,
  QuickAccessHeader,
  DividerLine,
  QuickAccessTitle,
  UserList,
  UserCardItem,
  UserInfo,
  UserName,
  UserRole,
  ChipWrapper,
  CardChevronWrapper,
} from './styles';

import { Input } from '@/components/common/Input';
import { Avatar } from '@/components/common/Avatar';
import { Chip } from '@/components/common/Chip';
import { darkTheme } from '@/constants/theme';
import { R } from '@/constants/R';

const loginTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    avatarBg: '#1A6BFF',
    buttonPrimaryBg: '#1A6BFF',
    tintText: '#FB923C',
    tag: {
      ...darkTheme.colors.tag,
      masterBg: 'rgba(249, 115, 22, 0.18)',
    },
    chip: {
      background: '#1E232D',
      text: '#CBD5E1',
    },
  },
};

export const LoginView = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    loading,
    mockUsers,
    handleLogin,
    handleQuickLogin,
  } = useLogin();

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [submitPressed, setSubmitPressed] = useState(false);

  const { width, height } = useWindowDimensions();
  const svgWidth = Math.max(width, 360);
  const svgHeight = Math.max(height, 720);

  const bottomTopY = svgHeight - 84;
  const bottomCornerY = svgHeight - 68;

  const inputOverlayStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingHorizontal: 0,
      paddingVertical: 12,
      minHeight: 48,
      color: '#F8FAFC',
      fontSize: 15,
    }),
    [],
  );

  return (
    <ThemeProvider theme={loginTheme}>
      <StatusBar style="light" />
      <LoginScreen>
        <BackgroundLayer>
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <Defs>
              <RadialGradient
                id="topRightGlow"
                cx="88%"
                cy="6%"
                rx="75%"
                ry="38%"
                fx="88%"
                fy="6%"
              >
                <Stop offset="0%" stopColor="#EA580C" stopOpacity="0.38" />
                <Stop offset="45%" stopColor="#C2410C" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#07080C" stopOpacity="0" />
              </RadialGradient>

              <RadialGradient
                id="logoAmbientGlow"
                cx="50%"
                cy="18%"
                rx="46%"
                ry="18%"
                fx="50%"
                fy="18%"
              >
                <Stop offset="0%" stopColor="#F97316" stopOpacity="0.16" />
                <Stop offset="60%" stopColor="#EA580C" stopOpacity="0.05" />
                <Stop offset="100%" stopColor="#07080C" stopOpacity="0" />
              </RadialGradient>

              <LinearGradient id="topLeftFill" x1="1" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#0B0D13" stopOpacity="0.95" />
                <Stop offset="65%" stopColor="#120E0C" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#2A1308" stopOpacity="0.85" />
              </LinearGradient>

              <LinearGradient id="topLeftStroke" x1="1" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.04" />
                <Stop offset="42%" stopColor="#EA580C" stopOpacity="0.25" />
                <Stop offset="75%" stopColor="#FB923C" stopOpacity="0.85" />
                <Stop offset="100%" stopColor="#F97316" stopOpacity="0.65" />
              </LinearGradient>

              <LinearGradient id="bottomLeftFill" x1="0.7" y1="0" x2="0.1" y2="1">
                <Stop offset="0%" stopColor="#4A1D08" stopOpacity="0.55" />
                <Stop offset="55%" stopColor="#241007" stopOpacity="0.75" />
                <Stop offset="100%" stopColor="#09080A" stopOpacity="0.95" />
              </LinearGradient>

              <LinearGradient id="bottomLeftStroke" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#EA580C" stopOpacity="0.35" />
                <Stop offset="55%" stopColor="#FB923C" stopOpacity="0.88" />
                <Stop offset="100%" stopColor="#EA580C" stopOpacity="0.4" />
              </LinearGradient>
            </Defs>

            <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#07080C" />
            <Rect
              x="0"
              y="0"
              width={svgWidth}
              height={svgHeight}
              fill="url(#topRightGlow)"
            />
            <Rect
              x="0"
              y="0"
              width={svgWidth}
              height={svgHeight}
              fill="url(#logoAmbientGlow)"
            />

            {/* Elemento geométrico decorativo superior esquerdo */}
            <Path
              d="M 0 0 L 128 0 L 128 84 Q 128 124 98 154 L 0 252 Z"
              fill="url(#topLeftFill)"
            />
            <Path
              d="M 128 0 L 128 84 Q 128 124 98 154 L 0 252"
              fill="none"
              stroke="url(#topLeftStroke)"
              strokeWidth="5"
              strokeOpacity="0.2"
            />
            <Path
              d="M 128 0 L 128 84 Q 128 124 98 154 L 0 252"
              fill="none"
              stroke="url(#topLeftStroke)"
              strokeWidth="1.5"
            />

            {/* Elemento geométrico decorativo inferior esquerdo */}
            <Path
              d={`M 0 ${bottomTopY} L 106 ${bottomTopY} Q 128 ${bottomTopY} 144 ${bottomCornerY} L 212 ${svgHeight} L 0 ${svgHeight} Z`}
              fill="url(#bottomLeftFill)"
            />
            <Path
              d={`M 0 ${bottomTopY} L 106 ${bottomTopY} Q 128 ${bottomTopY} 144 ${bottomCornerY} L 212 ${svgHeight}`}
              fill="none"
              stroke="url(#bottomLeftStroke)"
              strokeWidth="5"
              strokeOpacity="0.2"
            />
            <Path
              d={`M 0 ${bottomTopY} L 106 ${bottomTopY} Q 128 ${bottomTopY} 144 ${bottomCornerY} L 212 ${svgHeight}`}
              fill="none"
              stroke="url(#bottomLeftStroke)"
              strokeWidth="1.5"
            />
          </Svg>
        </BackgroundLayer>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <LoginScrollContent
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ContentContainer>
              <BrandHeader>
                <LogoWrapper>
                  <BrandLogo
                    source={R.images.logo}
                    resizeMode="cover"
                    accessibilityRole="image"
                    accessibilityLabel={R.strings.common.appName}
                  />
                </LogoWrapper>
                <BrandTitle>{R.strings.login.title}</BrandTitle>
                <BrandSubtitle>{R.strings.login.subtitle}</BrandSubtitle>
              </BrandHeader>

              <FormContainer>
                <FieldGroup>
                  <FieldLabel>{R.strings.login.emailLabel}</FieldLabel>
                  <InputShell $focused={emailFocused}>
                    <InputIconWrapper>
                      <Mail
                        size={20}
                        color={emailFocused ? '#60A5FA' : '#94A3B8'}
                        strokeWidth={1.8}
                      />
                    </InputIconWrapper>
                    <Input
                      placeholder={R.strings.login.emailPlaceholder}
                      placeholderTextColor="#6E7B8B"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                      keyboardType="email-address"
                      returnKeyType="next"
                      accessibilityLabel={R.strings.login.emailPlaceholder}
                      style={inputOverlayStyle}
                    />
                  </InputShell>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>{R.strings.login.passwordLabel}</FieldLabel>
                  <InputShell $focused={passwordFocused}>
                    <InputIconWrapper>
                      <Lock
                        size={20}
                        color={passwordFocused ? '#60A5FA' : '#94A3B8'}
                        strokeWidth={1.8}
                      />
                    </InputIconWrapper>
                    <Input
                      placeholder={R.strings.login.passwordPlaceholder}
                      placeholderTextColor="#6E7B8B"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      accessibilityLabel={R.strings.login.passwordPlaceholder}
                      style={inputOverlayStyle}
                    />
                    <PasswordToggleButton
                      onPress={toggleShowPassword}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      {showPassword ? (
                        <Eye size={20} color="#94A3B8" strokeWidth={1.8} />
                      ) : (
                        <EyeOff size={20} color="#94A3B8" strokeWidth={1.8} />
                      )}
                    </PasswordToggleButton>
                  </InputShell>
                </FieldGroup>

                <SubmitButton
                  onPress={handleLogin}
                  onPressIn={() => setSubmitPressed(true)}
                  onPressOut={() => setSubmitPressed(false)}
                  disabled={loading}
                  $pressed={submitPressed}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={R.strings.login.enterButton}
                  accessibilityState={{ disabled: loading, busy: loading }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <SubmitButtonText>
                        {R.strings.login.enterButton}
                      </SubmitButtonText>
                      <SubmitButtonIcon>
                        <ArrowRight
                          size={20}
                          color="#FFFFFF"
                          strokeWidth={2.2}
                        />
                      </SubmitButtonIcon>
                    </>
                  )}
                </SubmitButton>
              </FormContainer>

              <QuickAccessHeader>
                <DividerLine />
                <QuickAccessTitle>{R.strings.login.quickAccess}</QuickAccessTitle>
                <DividerLine />
              </QuickAccessHeader>

              <UserList>
                {mockUsers.map((u) => {
                  const isMasterUser = u.profile === 'master';
                  return (
                    <UserCardItem
                      key={u.id}
                      activeOpacity={0.75}
                      onPress={() => handleQuickLogin(u)}
                      accessibilityRole="button"
                      accessibilityLabel={`Selecionar usuário de teste: ${u.name}, ${u.role}`}
                    >
                      <Avatar
                        name={u.name}
                        size={46}
                        highlighted={isMasterUser}
                      />
                      <UserInfo>
                        <UserName numberOfLines={1}>{u.name}</UserName>
                        <UserRole numberOfLines={1}>{u.role}</UserRole>
                        <ChipWrapper>
                          <Chip
                            label={
                              isMasterUser
                                ? R.strings.common.master
                                : 'OPERACIONAL'
                            }
                            variant={isMasterUser ? 'accent' : 'dark'}
                            style={{
                              paddingVertical: 3,
                              paddingHorizontal: 10,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: isMasterUser
                                ? 'rgba(249, 115, 22, 0.3)'
                                : 'rgba(255, 255, 255, 0.08)',
                            }}
                          />
                        </ChipWrapper>
                      </UserInfo>
                      <CardChevronWrapper>
                        <ChevronRight
                          size={18}
                          color="#8E9BAE"
                          strokeWidth={2}
                        />
                      </CardChevronWrapper>
                    </UserCardItem>
                  );
                })}
              </UserList>
            </ContentContainer>
          </LoginScrollContent>
        </KeyboardAvoidingView>
      </LoginScreen>
    </ThemeProvider>
  );
};

export default LoginView;
