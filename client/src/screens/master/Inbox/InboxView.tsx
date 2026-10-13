import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  ChevronLeft,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Inbox as InboxIcon,
} from 'lucide-react-native';

import { useInbox, InboxFilter } from './useInbox';
import {
  ControlsHeader,
  InboxCard,
  CardHeader,
  CardTitleContainer,
  RdoNumber,
  WorkName,
  MetaRow,
  MetaItem,
  MetaText,
  CardFooter,
  AuthorText,
  ReviewButton,
  ReviewButtonText,
  SlaWarningBanner,
  SlaWarningText,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ListContent } from '@/components/common/Layout';
import { SearchBar } from '@/components/common/SearchBar';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { isOverdue, RDO_STATUS_META, getDisplayStatus } from '@/utils/rdo';
import { formatRelative } from '@/utils';
import type { RDO } from '@/types';

const FILTER_OPTIONS: { value: InboxFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'atrasados', label: 'Atrasados' },
  { value: 'submetidos', label: 'Em Análise' },
  { value: 'devolvidos', label: 'Devolvidos' },
];

export interface InboxViewProps {
  isTab?: boolean;
}

export const InboxView = ({ isTab = false }: InboxViewProps) => {
  const theme = useTheme();
  const {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filteredRdos,
    totalPending,
    overdueCount,
    navigateToReview,
    goBack,
  } = useInbox();

  const renderItem = ({ item }: { item: RDO }) => {
    const overdue = isOverdue(item);
    const displayStatus = getDisplayStatus(item);
    const meta = RDO_STATUS_META[displayStatus];

    return (
      <InboxCard
        $isOverdue={overdue}
        activeOpacity={0.8}
        onPress={() => navigateToReview(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`RDO número ${item.number}, Obra ${item.workName}, Status ${meta.label}`}
      >
        {overdue && (
          <SlaWarningBanner>
            <AlertTriangle color={theme.colors.status.error.text} size={14} />
            <SlaWarningText>Atrasado: Mais de 24h sem homologação</SlaWarningText>
          </SlaWarningBanner>
        )}

        <CardHeader>
          <CardTitleContainer>
            <RdoNumber>RDO #{item.number} (v{item.version})</RdoNumber>
            <WorkName numberOfLines={1}>{item.workName}</WorkName>
          </CardTitleContainer>
          <StatusBadge label={meta.label} variant={meta.variant} />
        </CardHeader>

        <MetaRow>
          <MetaItem>
            <Calendar color={theme.colors.text.secondary} size={13} />
            <MetaText>{item.date}</MetaText>
          </MetaItem>

          {item.submittedAt ? (
            <MetaItem>
              <Clock
                color={overdue ? theme.colors.status.error.base : theme.colors.text.secondary}
                size={13}
              />
              <MetaText $highlight={overdue}>
                {overdue ? 'Atrasado ' : 'Submetido '}
                {formatRelative(item.submittedAt)}
              </MetaText>
            </MetaItem>
          ) : null}
        </MetaRow>

        <CardFooter>
          <AuthorText>Por: {item.authorName}</AuthorText>
          <ReviewButton
            activeOpacity={0.8}
            onPress={() => navigateToReview(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Analisar RDO #${item.number}`}
          >
            <ReviewButtonText>Analisar</ReviewButtonText>
            <ChevronRight color={theme.colors.text.inverse} size={14} />
          </ReviewButton>
        </CardFooter>
      </InboxCard>
    );
  };

  const ContainerWrapper = isTab ? View : Screen;

  return (
    <ContainerWrapper style={isTab ? { flex: 1 } : undefined}>
      <Header
        title="Inbox de Validação"
        leftContent={
          isTab ? undefined : (
            <HeaderAction
              icon={<ChevronLeft color={theme.colors.text.secondary} size={24} />}
              onPress={goBack}
              accessibilityLabel="Voltar ao dashboard"
            />
          )
        }
      />

      <ControlsHeader>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por número, obra ou autor..."
        />

        <SegmentedControl
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
      </ControlsHeader>

      {filteredRdos.length === 0 ? (
        <EmptyState
          icon={<InboxIcon color={theme.colors.text.secondary} size={56} />}
          message="Nenhum RDO encontrado para os critérios selecionados."
        />
      ) : (
        <ListContent
          data={filteredRdos}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem as any}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 110,
          }}
        />
      )}
    </ContainerWrapper>
  );
};

export default InboxView;
