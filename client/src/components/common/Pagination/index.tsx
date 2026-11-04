import React from 'react';
import { useTheme } from 'styled-components/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { strings } from '@/constants/strings';
import { getVisiblePages, getItemRangeLabel } from '@/utils/pagination';
import {
  Container,
  ControlsRow,
  NavButton,
  PageButton,
  PageText,
  EllipsisBox,
  EllipsisText,
  InfoText,
} from './styles';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  showInfo?: boolean;
  hideOnSinglePage?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 3,
  onPageChange,
  itemName = 'obras',
  showInfo = true,
  hideOnSinglePage = false,
}: PaginationProps) => {
  const theme = useTheme();

  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <Container accessibilityRole="navigation" accessibilityLabel="Paginação">
      <ControlsRow>
        <NavButton
          $disabled={isFirstPage}
          disabled={isFirstPage}
          onPress={() => onPageChange(currentPage - 1)}
          activeOpacity={0.7}
          hitSlop={theme.touchTarget.hitSlop}
          accessibilityRole="button"
          accessibilityLabel={strings.pagination.previousPage}
          accessibilityState={{ disabled: isFirstPage }}
        >
          <ChevronLeft
            size={20}
            color={isFirstPage ? theme.colors.text.secondary : theme.colors.text.primary}
            strokeWidth={2.2}
          />
        </NavButton>

        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <EllipsisBox key={`ellipsis-${index}`}>
                <EllipsisText>…</EllipsisText>
              </EllipsisBox>
            );
          }

          const isActive = page === currentPage;
          return (
            <PageButton
              key={`page-${page}`}
              $active={isActive}
              onPress={() => onPageChange(page)}
              disabled={isActive}
              activeOpacity={0.75}
              hitSlop={theme.touchTarget.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={strings.pagination.pageNumber(page)}
              accessibilityState={{ selected: isActive }}
            >
              <PageText $active={isActive}>{page}</PageText>
            </PageButton>
          );
        })}

        <NavButton
          $disabled={isLastPage}
          disabled={isLastPage}
          onPress={() => onPageChange(currentPage + 1)}
          activeOpacity={0.7}
          hitSlop={theme.touchTarget.hitSlop}
          accessibilityRole="button"
          accessibilityLabel={strings.pagination.nextPage}
          accessibilityState={{ disabled: isLastPage }}
        >
          <ChevronRight
            size={20}
            color={isLastPage ? theme.colors.text.secondary : theme.colors.text.primary}
            strokeWidth={2.2}
          />
        </NavButton>
      </ControlsRow>

      {showInfo && totalItems !== undefined ? (
        <InfoText>
          {getItemRangeLabel(currentPage, pageSize, totalItems, itemName)}
        </InfoText>
      ) : null}
    </Container>
  );
};

export default Pagination;
