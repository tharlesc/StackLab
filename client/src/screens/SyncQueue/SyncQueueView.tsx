import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components/native';
import { CloudOff, RefreshCcw, WifiOff } from 'lucide-react-native';

import { useSyncQueue, SyncQueueItem } from './useSyncQueue';
import {
  QueueCard,
  InfoContainer,
  TitleRow,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { ListContent } from '@/components/common/Layout';
import { Title, Subtitle } from '@/components/common/Typography';
import { EmptyState } from '@/components/common/EmptyState';
import { Chip } from '@/components/common/Chip';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { strings } from '@/constants/strings';

export const SyncQueueView = () => {
  const theme = useTheme();
  const { queue, isSyncing, handleSyncAll } = useSyncQueue();

  const renderItem = ({ item }: { item: SyncQueueItem }) => (
    <QueueCard
      accessibilityRole="text"
      accessibilityLabel={`Item da fila: ${item.title}, ${item.subtitle}, tamanho ${item.size}, aguardando conexão`}
    >
      <InfoContainer>
        <TitleRow>
          <Title style={{ fontSize: 16 }}>{item.title}</Title>
          <Chip label={item.size} variant="surface" />
        </TitleRow>
        <Subtitle style={{ marginBottom: 10, fontSize: 13 }}>{item.subtitle}</Subtitle>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Chip
            icon={<WifiOff color={theme.colors.status.warning.base} size={14} />}
            label={strings.syncQueue.waitingConnection}
            variant="dark"
          />
        </View>
      </InfoContainer>
    </QueueCard>
  );

  return (
    <>
      <Header
        title={strings.syncQueue.title}
        subtitle={`${queue.length} itens pendentes`}
        rightContent={
          <HeaderAction
            icon={
              isSyncing ? (
                <ActivityIndicator color={theme.colors.secondary} size="small" />
              ) : (
                <RefreshCcw color={theme.colors.text.primary} size={22} />
              )
            }
            onPress={handleSyncAll}
            disabled={isSyncing || queue.length === 0}
            accessibilityLabel={strings.accessibility.syncNowButton}
          />
        }
      />

      {queue.length === 0 ? (
        <ListContent
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <EmptyState
              icon={<CloudOff color={theme.colors.text.secondary} size={64} />}
              message={`${strings.syncQueue.emptyTitle}\n${strings.syncQueue.emptyMessage}`}
            />
          }
        />
      ) : (
        <ListContent
          data={queue}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem as any}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: 12 }}>
              <InteractiveCard
                title="Sincronização em Segundo Plano"
                supportingText="Os diários e fotos gravados offline serão transmitidos ao servidor central assim que a rede estiver estável."
                actions={[
                  { label: 'Verificar Fila', onPress: () => console.log('Verificar fila'), secondary: true },
                  { label: 'Transmitir Tudo', onPress: handleSyncAll, primary: true },
                ]}
              />
            </View>
          }
        />
      )}
    </>
  );
};

export default SyncQueueView;
