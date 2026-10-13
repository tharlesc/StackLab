import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ShieldCheck, History } from 'lucide-react-native';

import { useRDOs } from '@/contexts/RDOContext';
import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ListContent } from '@/components/common/Layout';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils';
import type { AuditLogEntry, StatusVariant } from '@/types';

import {
  LogCard,
  LogHeader,
  LogAction,
  LogTimestamp,
  LogActor,
  LogJustification,
  DiffRow,
  DiffText,
} from './styles';

const ACTION_VARIANTS: Record<string, StatusVariant> = {
  criado: 'info',
  submetido: 'warning',
  devolvido: 'error',
  editado: 'warning',
  comentado: 'info',
  aprovado: 'success',
  retificado: 'error',
};

export const AuditTrailView = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ rdoId?: string }>();
  const { getAuditTrail, getRdo } = useRDOs();

  const rdoId = params.rdoId || 'rdo-185';
  const rdo = getRdo(rdoId);
  const logs = getAuditTrail(rdoId);

  return (
    <Screen>
      <Header
        title={rdo ? `Trilha de Auditoria • RDO #${rdo.number}` : 'Trilha de Auditoria'}
        leftContent={
          <HeaderAction
            icon={<ChevronLeft color={theme.colors.text.secondary} size={24} />}
            onPress={() => router.back()}
            accessibilityLabel="Fechar"
          />
        }
      />

      {logs.length === 0 ? (
        <EmptyState
          icon={<History size={56} color={theme.colors.text.secondary} />}
          message="Nenhum registro de auditoria gerado para este RDO ainda."
        />
      ) : (
        <ListContent
          data={logs}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: any }) => {
            const variant = ACTION_VARIANTS[item.action] || 'info';
            return (
              <LogCard>
                <LogHeader>
                  <StatusBadge label={item.action.toUpperCase()} variant={variant} />
                  <LogTimestamp>{formatDateTime(item.timestamp)}</LogTimestamp>
                </LogHeader>

                <LogActor>Por: {item.actorName}</LogActor>

                {item.justification && (
                  <LogJustification>Justificativa: {item.justification}</LogJustification>
                )}

                {item.previousValue && item.newValue && (
                  <DiffRow>
                    <DiffText $type="old">[-] {item.previousValue}</DiffText>
                    <DiffText $type="new">[+] {item.newValue}</DiffText>
                  </DiffRow>
                )}
              </LogCard>
            );
          }}
        />
      )}
    </Screen>
  );
};

export default AuditTrailView;
