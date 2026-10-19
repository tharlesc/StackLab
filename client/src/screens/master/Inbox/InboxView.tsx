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
  ReviewIndicator,
  ReviewButtonText,
  SlaWarningBanner,
  SlaWarningText,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ListContent } from '@/components/common/Layout';
import { SearchBar } from '@/components/common/SearchBar';
import { SegmentedControl, SegmentOption } from '@/components/common/SegmentedControl';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { isOverdue, RDO_STATUS_META, getDisplayStatus } from '@/utils/rdo';
import { formatRelative } from '@/utils';
import { strings } from '@/constants/strings';
import type { RDO } from '@/types';

const FILTER_OPTIONS: readonly SegmentOption<InboxFilter>[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'atrasados', label: strings.status.plural.atrasado },
  { value: 'submetidos', label: strings.status.plural.submetido },
  { value: 'devolvidos', label: strings.status.plural.devolvido },
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
        accessibilityLabel={`Analisar RDO número ${item.number}, Obra ${item.workName}, Status ${meta.label}`}
      >
        {overdue && (
          <SlaWarningBanner>
            <AlertTriangle
              color={theme.colors.status.error.text}
              size={theme.icon.size.sm}
              strokeWidth={theme.icon.strokeWidth}
            />
            <SlaWarningText>
              {strings.status.atrasado}: Mais de 24h sem aprovação
            </SlaWarningText>
          </SlaWarningBanner>
        )}

        <CardHeader>
          <CardTitleContainer>
            <RdoNumber>
              RDO #{item.number} (v{item.version})
            </RdoNumber>
            <WorkName numberOfLines={1}>{item.workName}</WorkName>
          </CardTitleContainer>
          <StatusBadge label={meta.label} variant={meta.variant} />
        </CardHeader>

        <MetaRow>
          <MetaItem>
            <Calendar
              color={theme.colors.text.secondary}
              size={theme.icon.size.sm}
              strokeWidth={theme.icon.strokeWidth}
            />
            <MetaText>{item.date}</MetaText>
          </MetaItem>

          {item.submittedAt ? (
            <MetaItem>
              <Clock
                color={overdue ? theme.colors.status.error.text : theme.colors.text.secondary}
                size={theme.icon.size.sm}
                strokeWidth={theme.icon.strokeWidth}
              />
              <MetaText $highlight={overdue}>
                {overdue ? `${strings.status.atrasado} ` : `${strings.status.submetido} `}
                {formatRelative(item.submittedAt)}
              </MetaText>
            </MetaItem>
          ) : null}
        </MetaRow>

        <CardFooter>
          <AuthorText>Por: {item.authorName}</AuthorText>
          <ReviewIndicator importantForAccessibility="no-hide-descendants">
            <ReviewButtonText>{strings.inbox.reviewAction}</ReviewButtonText>
            <ChevronRight
              color={theme.colors.onSecondary}
              size={theme.icon.size.sm}
              strokeWidth={theme.icon.strokeWidth}
            />
          </ReviewIndicator>
        </CardFooter>
      </InboxCard>
    );
  };

  const ContainerWrapper = isTab ? View : Screen;

  return (
    <ContainerWrapper style={isTab ? { flex: 1 } : undefined}>
      <Header
        title={strings.inbox.title}
        leftContent={
          isTab ? undefined : (
            <HeaderAction
              icon={
                <ChevronLeft
                  color={theme.colors.text.secondary}
                  size={theme.icon.size.lg}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              onPress={goBack}
              accessibilityLabel={strings.accessibility.backButton}
            />
          )
        }
      />

      <ControlsHeader>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={strings.inbox.searchPlaceholder}
        />

        <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </ControlsHeader>

      {filteredRdos.length === 0 ? (
        <EmptyState
          icon={
            <InboxIcon
              color={theme.colors.text.secondary}
              size={theme.icon.size.empty}
              strokeWidth={theme.icon.strokeWidth}
            />
          }
          title={strings.inbox.emptyTitle}
          message={strings.inbox.emptyFilteredMessage}
        />
      ) : (
        <ListContent<RDO>
          data={filteredRdos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ContainerWrapper>
  );
};

export default InboxView;
