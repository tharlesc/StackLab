import React from 'react';
import { useTheme } from 'styled-components/native';
import { Wifi, Moon, Shield, HelpCircle } from 'lucide-react-native';

import { useSettings } from './useSettings';
import { VersionContainer } from './styles';

import { Header } from '@/components/navigation/Header';
import { ActionItem } from '@/components/common/ActionItem';
import { ScrollContent } from '@/components/common/Layout';
import { SectionTitle } from '@/components/common/Typography';
import { Card as CardGroup } from '@/components/common/Card';
import { Toggle } from '@/components/common/Toggle';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { Chip } from '@/components/common/Chip';
import { strings } from '@/constants/strings';

export const SettingsView = () => {
  const theme = useTheme();
  const {
    isDark,
    toggleTheme,
    syncOnlyWifi,
    toggleSyncWifi,
    openTerms,
    openHelp,
  } = useSettings();

  return (
    <>
      <Header title={strings.settings.title} subtitle={strings.settings.subtitle} />

      <ScrollContent showsVerticalScrollIndicator={false}>
        <SectionTitle>{strings.settings.preferences}</SectionTitle>
        <CardGroup>
          <ActionItem
            title={strings.settings.syncWifiOnly}
            leftIcon={<Wifi color={theme.colors.text.secondary} size={20} />}
            rightIcon={
              <Toggle
                value={syncOnlyWifi}
                onValueChange={toggleSyncWifi}
                accessibilityLabel={strings.settings.syncWifiOnly}
              />
            }
            onPress={toggleSyncWifi}
          />
          <ActionItem
            title={strings.settings.darkMode}
            leftIcon={<Moon color={theme.colors.text.secondary} size={20} />}
            rightIcon={
              <Toggle
                value={isDark}
                onValueChange={toggleTheme}
                accessibilityLabel={strings.settings.darkMode}
              />
            }
            onPress={toggleTheme}
            isLast
          />
        </CardGroup>

        <SectionTitle>Armazenamento & Diagnóstico</SectionTitle>
        <InteractiveCard
          title="Armazenamento Offline e Cache"
          supportingText="Existem 12 fotos compactadas e dados de 2 obras armazenados no dispositivo. Você pode sincronizar ou liberar espaço."
          actions={[
            { label: 'Limpar Cache', onPress: () => console.log('Limpar cache') },
            { label: 'Sincronizar', onPress: () => console.log('Sincronizar dados'), primary: true },
          ]}
        />

        <SectionTitle>{strings.settings.about}</SectionTitle>
        <CardGroup>
          <ActionItem
            title={strings.settings.terms}
            leftIcon={<Shield color={theme.colors.text.secondary} size={20} />}
            onPress={openTerms}
          />
          <ActionItem
            title={strings.settings.helpCenter}
            leftIcon={<HelpCircle color={theme.colors.text.secondary} size={20} />}
            onPress={openHelp}
            isLast
          />
        </CardGroup>

        <VersionContainer>
          <Chip label="StackLab RDO v1.2.0" variant="dark" />
          <Chip label="Build 42 • Canal Estável" variant="surface" />
        </VersionContainer>
      </ScrollContent>
    </>
  );
};

export default SettingsView;
