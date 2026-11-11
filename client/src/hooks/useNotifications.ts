import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRDOs } from '@/contexts/RDOContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatRelative } from '@/utils/date';
import type { AppNotification } from '@/types';

const READ_NOTIFICATIONS_STORAGE_KEY = '@stacklab:notifications_read_ids';
const DISMISSED_NOTIFICATIONS_STORAGE_KEY = '@stacklab:notifications_dismissed_ids';

export type NotificationFilter = 'todas' | 'nao_lidas' | 'rdos';

export const useNotifications = () => {
  const router = useRouter();
  const { rdos } = useRDOs();
  const { user, isMaster, isClient } = useAuth();

  const [readIds, setReadIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('todas');

  // Carrega IDs lidos e dispensados do AsyncStorage
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedRead, storedDismissed] = await Promise.all([
          AsyncStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY),
          AsyncStorage.getItem(DISMISSED_NOTIFICATIONS_STORAGE_KEY),
        ]);
        if (isMounted) {
          if (storedRead) setReadIds(JSON.parse(storedRead));
          if (storedDismissed) setDismissedIds(JSON.parse(storedDismissed));
        }
      } catch (err) {
        console.warn('Aviso: Falha ao carregar estado de notificações:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persiste IDs lidos
  const persistReadIds = useCallback(async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.warn('Aviso: Falha ao persistir notificações lidas:', err);
    }
  }, []);

  // Apaga / dispensa notificação deslizada
  const deleteNotification = useCallback(
    async (id: string) => {
      const next = [...dismissedIds, id];
      setDismissedIds(next);
      try {
        await AsyncStorage.setItem(
          DISMISSED_NOTIFICATIONS_STORAGE_KEY,
          JSON.stringify(next),
        );
      } catch (err) {
        console.warn('Aviso: Falha ao persistir notificação apagada:', err);
      }
    },
    [dismissedIds],
  );

  // Gera notificações dinâmicas baseadas nos RDOs reais do sistema
  const rawNotifications: AppNotification[] = useMemo(() => {
    const list: AppNotification[] = [];

    (rdos || []).forEach((rdo) => {
      // 1. Notificação de RDO Submetido (apenas para equipe interna: Master e Operador)
      if (rdo.status === 'submetido' && !isClient) {
        const notifId = `submetido-${rdo.id}`;
        const isUnread = !readIds.includes(notifId);
        list.push({
          id: notifId,
          title: isMaster ? 'RDO Aguardando Homologação' : 'RDO Enviado para Revisão',
          message: isMaster
            ? `RDO #${rdo.number} da ${rdo.workName} foi enviado por ${rdo.authorName} e aguarda sua aprovação.`
            : `Seu RDO #${rdo.number} da ${rdo.workName} foi transmitido e está em fila de aprovação.`,
          time: rdo.submittedAt ? formatRelative(rdo.submittedAt) : 'Recentemente',
          isUnread,
          variant: isMaster ? 'warning' : 'info',
          rdoId: rdo.id,
        });
      }

      // 2. Notificação de RDO Aprovado (quando Master aprova e assina, fica disponível ao cliente)
      if (rdo.status === 'aprovado') {
        const notifId = `aprovado-${rdo.id}`;
        const isUnread = !readIds.includes(notifId);
        list.push({
          id: notifId,
          title: isClient ? 'Novo RDO Disponível' : 'RDO Homologado com Sucesso',
          message: isClient
            ? `RDO #${rdo.number} da ${rdo.workName} foi homologado e assinado pelo Master e já está disponível para sua consulta.`
            : `RDO #${rdo.number} da ${rdo.workName} foi aprovado e chancelado digitalmente.`,
          time: rdo.submittedAt ? formatRelative(rdo.submittedAt) : 'Recentemente',
          isUnread,
          variant: 'success',
          rdoId: rdo.id,
        });
      }

      // 3. Notificação de RDO Devolvido para Correção (apenas equipe interna)
      if (rdo.status === 'devolvido' && !isClient) {
        const notifId = `devolvido-${rdo.id}`;
        const isUnread = !readIds.includes(notifId);
        list.push({
          id: notifId,
          title: 'RDO Devolvido para Ajustes',
          message: `RDO #${rdo.number} da ${rdo.workName} precisa de correção. Motivo: ${
            rdo.returnReason || 'Verifique as observações do gestor.'
          }`,
          time: rdo.submittedAt ? formatRelative(rdo.submittedAt) : 'Recentemente',
          isUnread,
          variant: 'error',
          rdoId: rdo.id,
        });
      }
    });

    // Notificação institucional de boas-vindas / segurança
    const welcomeId = `welcome-${user?.id || 'sys'}`;
    const welcomeUnread = !readIds.includes(welcomeId);
    list.push({
      id: welcomeId,
      title: isClient
        ? 'Portal do Cliente Ativo'
        : isMaster
        ? 'Painel Master Ativo'
        : 'Sincronização Pronta',
      message: isClient
        ? 'Acompanhe os diários de obra homologados e os relatórios chancelados em tempo real.'
        : isMaster
        ? 'Você tem acesso global a todas as obras, relatórios e homologação de RDOs.'
        : 'Suas obras estão sincronizadas. Todos os dados preenchidos offline serão enviados com segurança.',
      time: 'Hoje',
      isUnread: welcomeUnread,
      variant: 'info',
    });

    return list.filter((n) => !dismissedIds.includes(n.id));
  }, [rdos, readIds, dismissedIds, isMaster, isClient, user]);

  const unreadCount = useMemo(
    () => rawNotifications.filter((n) => n.isUnread).length,
    [rawNotifications],
  );

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'nao_lidas':
        return rawNotifications.filter((n) => n.isUnread);
      case 'rdos':
        return rawNotifications.filter((n) => Boolean(n.rdoId));
      case 'todas':
      default:
        return rawNotifications;
    }
  }, [rawNotifications, filter]);

  const markAllAsRead = useCallback(() => {
    const allIds = rawNotifications.map((n) => n.id);
    setReadIds(allIds);
    persistReadIds(allIds);
  }, [rawNotifications, persistReadIds]);

  const handlePressNotification = useCallback(
    (notification: AppNotification) => {
      if (!readIds.includes(notification.id)) {
        const next = [...readIds, notification.id];
        setReadIds(next);
        persistReadIds(next);
      }

      if (notification.rdoId) {
        if (isMaster) {
          router.push({
            pathname: '/rdo-review',
            params: { id: notification.rdoId },
          });
        } else {
          router.push({
            pathname: '/rdo-review',
            params: { id: notification.rdoId },
          });
        }
      }
    },
    [readIds, persistReadIds, isMaster, router],
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    notifications: filteredNotifications,
    rawCount: rawNotifications.length,
    unreadCount,
    filter,
    setFilter,
    markAllAsRead,
    handlePressNotification,
    deleteNotification,
    goBack,
  };
};

export default useNotifications;
