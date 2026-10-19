import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components/native';
import { CloudOff, RefreshCcw, WifiOff } from 'lucide-react-native';

import { useSyncQueue } from './useSyncQueue';
import {
  QueueCard,
  InfoContainer,
  TitleRow,
  ItemTitle,
  ItemSubtitle,
  StatusRow,
  HeaderCardWrapper,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { ListContent } from '@/components/common/Layout';
import { EmptyState } from '@/components/common/EmptyState';
import { Chip } from '@/components/common/Chip';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { strings } from '@/constants/strings';
import type { SyncQueueItem } from '@/types';

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
          <ItemTitle>{item.title}</ItemTitle>
          <Chip label={item.size} variant="surface" />
        </TitleRow>
        <ItemSubtitle>{item.subtitle}</ItemSubtitle>
        <StatusRow>
          <Chip
            icon={
              <WifiOff
                color={theme.colors.status.warning.base}
                size={theme.icon.size.sm}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            label={strings.syncQueue.waitingConnection}
            variant="dark"
          />
        </StatusRow>
      </InfoContainer>
    </QueueCard>
  );

  return (
    <>
      <Header
        title={strings.syncQueue.title}
        rightContent={
          <HeaderAction
            icon={
              isSyncing ? (
                <ActivityIndicator color={theme.colors.tintText} size="small" />
              ) : (
                <RefreshCcw
                  color={theme.colors.text.primary}
                  size={theme.icon.size.lg}
                  strokeWidth={theme.icon.strokeWidth}
                />
              )
            }
            onPress={handleSyncAll}
            disabled={isSyncing || queue.length === 0}
            accessibilityLabel={strings.accessibility.syncNowButton}
          />
        }
      />

      {queue.length === 0 ? (
        <ListContent<SyncQueueItem>
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <EmptyState
              icon={
                <CloudOff
                  color={theme.colors.text.secondary}
                  size={theme.icon.size.empty}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              title={strings.syncQueue.emptyTitle}
              message={strings.syncQueue.emptyMessage}
            />
          }
        />
      ) : (
        <ListContent<SyncQueueItem>
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <HeaderCardWrapper>
              <InteractiveCard
                title="Sincronização em Segundo Plano"
                supportingText="Os diários e fotos gravados offline serão transmitidos ao servidor central assim que a rede estiver estável."
                actions={[
                  { label: 'Verificar Fila', onPress: () => {}, secondary: true },
                  { label: 'Transmitir Tudo', onPress: handleSyncAll, primary: true },
                ]}
              />
            </HeaderCardWrapper>
          }
        />
      )}
    </>
  );
};

export default SyncQueueView;
