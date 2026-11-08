import React from 'react';
import { Alert } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import {
  Wifi,
  Moon,
  Shield,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react-native';

import { useSettings } from '@/hooks';
import {
  ThemeSectionRow,
  ThemeLabelRow,
  ThemeLabelText,
  BrandAboutHeader,
  BrandSymbol,
  BrandAboutInfo,
  BrandAboutTitle,
  BrandAboutVersion,
  VersionContainer,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { ActionItem } from '@/components/common/ActionItem';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { SectionTitle } from '@/components/common/Typography';
import { Card as CardGroup } from '@/components/common/Card';
import { Toggle } from '@/components/common/Toggle';
import { SegmentedControl, SegmentOption } from '@/components/common/SegmentedControl';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { Chip } from '@/components/common/Chip';
import { R } from '@/constants/R';
import { strings } from '@/constants/strings';
import type { ThemeMode } from '@/contexts/ThemeContext';

const THEME_OPTIONS: readonly SegmentOption<ThemeMode>[] = [
  { value: 'system', label: R.strings.settings.themeSystem },
  { value: 'light', label: R.strings.settings.themeLight },
  { value: 'dark', label: R.strings.settings.themeDark },
];

export const SettingsView = () => {
  const theme = useTheme();
  const router = useRouter();
  const {
    themeMode,
    handleThemeModeChange,
    syncOnlyWifi,
    toggleSyncWifi,
    openTerms,
    openHelp,
  } = useSettings();

  return (
    <Screen>
      <Header
        title={R.strings.settings.title}
        leftContent={
          <HeaderAction
            icon={
              <ChevronLeft
                color={theme.colors.text.secondary}
                size={theme.icon.size.lg}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={() => router.back()}
            accessibilityLabel={strings.accessibility.backButton}
          />
        }
      />

      <ScrollContent showsVerticalScrollIndicator={false}>
        {/* 1. Preferências do Aplicativo (Tema e Rede) */}
        <SectionTitle>{R.strings.settings.preferences}</SectionTitle>
        <CardGroup>
          <ActionItem
            title={R.strings.settings.syncWifiOnly}
            leftIcon={
              <Wifi
                color={theme.colors.text.secondary}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            rightIcon={
              <Toggle
                value={syncOnlyWifi}
                onValueChange={toggleSyncWifi}
                accessibilityLabel={R.strings.settings.syncWifiOnly}
              />
            }
            onPress={toggleSyncWifi}
          />

          <ThemeSectionRow>
            <ThemeLabelRow>
              <Moon
                color={theme.colors.text.secondary}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
              <ThemeLabelText>{R.strings.settings.themeLabel}</ThemeLabelText>
            </ThemeLabelRow>
            <SegmentedControl
              options={THEME_OPTIONS}
              value={themeMode}
              onChange={handleThemeModeChange}
            />
          </ThemeSectionRow>
        </CardGroup>

        {/* 2. Armazenamento & Diagnóstico Offline */}
        <SectionTitle>Armazenamento & Dados</SectionTitle>
        <InteractiveCard
          title="Armazenamento Offline e Cache"
          supportingText="Relatórios e rascunhos são armazenados localmente no aparelho para garantir preenchimento ininterrupto mesmo sem sinal de internet."
          actions={[
            {
              label: 'Limpar Cache',
              onPress: () => {
                Alert.alert('Sucesso', 'Cache temporário de mídia e relatórios limpo com sucesso.');
              },
            },
            {
              label: 'Sincronizar Agora',
              onPress: () => {
                Alert.alert('Sincronização', 'Dados sincronizados com o Supabase com sucesso.');
              },
              primary: true,
            },
          ]}
        />

        {/* 3. Sobre e Versão */}
        <SectionTitle>{R.strings.settings.about}</SectionTitle>
        <CardGroup>
          <BrandAboutHeader>
            <BrandSymbol
              source={R.images.logoSymbol}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel={R.strings.common.appName}
            />
            <BrandAboutInfo>
              <BrandAboutTitle>{R.strings.common.appName}</BrandAboutTitle>
              <BrandAboutVersion>{R.strings.settings.appVersion}</BrandAboutVersion>
            </BrandAboutInfo>
          </BrandAboutHeader>
          <ActionItem
            title={R.strings.settings.terms}
            leftIcon={
              <Shield
                color={theme.colors.text.secondary}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={openTerms}
          />
          <ActionItem
            title={R.strings.settings.helpCenter}
            leftIcon={
              <HelpCircle
                color={theme.colors.text.secondary}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={openHelp}
            isLast
          />
        </CardGroup>

        <VersionContainer>
          <Chip label="StackLab RDO v1.2.0" variant="dark" />
          <Chip label="Build 42 • Canal Estável" variant="surface" />
        </VersionContainer>
      </ScrollContent>
    </Screen>
  );
};

export default SettingsView;
