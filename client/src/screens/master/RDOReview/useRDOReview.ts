import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRDOs } from '@/contexts/RDOContext';
import { calcManHours, calcHeadcount, isOverdue } from '@/utils/rdo';
import { getAvailableActions, applySectionFieldEdit } from '@/services/modules/rdoWorkflow';
import { MOCK_MASTER_PIN } from '@/mocks';
import type { RDOSectionKey } from '@/types';

export const useRDOReview = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { getRdo, returnRdo, approveRdo, addComment, auditedEdit, rectifyRdo } = useRDOs();

  const rdoId = params.id || 'rdo-185';
  const rdo = getRdo(rdoId);

  // Modais de ações
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [signPin, setSignPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [targetSection, setTargetSection] = useState<RDOSectionKey>('atividades');
  const [commentText, setCommentText] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState('atividades');
  const [editOldValue, setEditOldValue] = useState('');
  const [editNewValue, setEditNewValue] = useState('');
  const [editJustification, setEditJustification] = useState('');

  const [rectifyDialogOpen, setRectifyDialogOpen] = useState(false);
  const [rectifyReason, setRectifyReason] = useState('');

  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const manHours = useMemo(() => (rdo ? calcManHours(rdo.labor) : 0), [rdo]);
  const headcount = useMemo(() => (rdo ? calcHeadcount(rdo.labor) : 0), [rdo]);
  const overdue = useMemo(() => (rdo ? isOverdue(rdo) : false), [rdo]);
  const availableActions = useMemo(
    () => (rdo && user ? getAvailableActions(rdo, user.profile) : []),
    [rdo, user],
  );

  // Ações do Master
  const handleOpenReturnDialog = useCallback(() => {
    setReturnReason('');
    setReturnDialogOpen(true);
  }, []);

  const handleConfirmReturn = useCallback(() => {
    if (!rdo || !user) return;
    if (returnReason.trim().length < 5) {
      Alert.alert('Atenção', 'Informe uma justificativa de devolução válida (mínimo 5 caracteres).');
      return;
    }
    returnRdo(rdo.id, user, returnReason);
    setReturnDialogOpen(false);
    Alert.alert('RDO Devolvido', `O relatório #${rdo.number} foi devolvido para a equipe de campo para ajustes.`);
    router.back();
  }, [rdo, user, returnReason, returnRdo, router]);

  const handleOpenApproveDialog = useCallback(() => {
    setSignPin('');
    setPinError('');
    setApproveDialogOpen(true);
  }, []);

  const handleConfirmApprove = useCallback(() => {
    if (!rdo || !user) return;
    if (signPin !== MOCK_MASTER_PIN) {
      setPinError('PIN de assinatura incorreto. Verifique sua chave de 2 fatores.');
      return;
    }
    const updated = approveRdo(rdo.id, user);
    setApproveDialogOpen(false);
    Alert.alert(
      'RDO Aprovado e Assinado',
      `O relatório #${updated.number} foi assinado com sucesso!\n\nHash: ${updated.signature?.hash}\nData: ${updated.signature?.signedAt}`,
    );
  }, [rdo, user, signPin, approveRdo]);

  const handleOpenCommentDialog = useCallback((section: RDOSectionKey) => {
    setTargetSection(section);
    setCommentText('');
    setCommentDialogOpen(true);
  }, []);

  const handleConfirmComment = useCallback(() => {
    if (!rdo || !user) return;
    if (!commentText.trim()) return;
    addComment(rdo.id, user, targetSection, commentText);
    setCommentDialogOpen(false);
    Alert.alert('Comentário Registrado', 'O apontamento foi adicionado à seção.');
  }, [rdo, user, targetSection, commentText, addComment]);

  const handleOpenEditDialog = useCallback(
    (section: RDOSectionKey, field: string, currentValue: string) => {
      setTargetSection(section);
      setEditField(field);
      setEditOldValue(currentValue);
      setEditNewValue(currentValue);
      setEditJustification('');
      setEditDialogOpen(true);
    },
    [],
  );

  const handleConfirmAuditedEdit = useCallback(() => {
    if (!rdo || !user) return;
    if (editJustification.trim().length < 5) {
      Alert.alert(
        'Justificativa Obrigatória',
        'Toda alteração técnica pelo Master exige justificativa formal auditável.',
      );
      return;
    }
    auditedEdit(rdo.id, user, {
      section: targetSection,
      field: editField,
      previousValue: editOldValue,
      newValue: editNewValue,
      justification: editJustification,
      apply: (current) => applySectionFieldEdit(current, targetSection, editNewValue),
    });
    setEditDialogOpen(false);
    Alert.alert('Alteração Auditada Gravada', 'A modificação foi salva e gravada na trilha de auditoria.');
  }, [rdo, user, targetSection, editField, editOldValue, editNewValue, editJustification, auditedEdit]);

  const handleOpenRectifyDialog = useCallback(() => {
    setRectifyReason('');
    setRectifyDialogOpen(true);
  }, []);

  const handleConfirmRectify = useCallback(() => {
    if (!rdo || !user) return;
    if (rectifyReason.trim().length < 5) {
      Alert.alert('Atenção', 'Informe a justificativa formal para a emissão de retificação.');
      return;
    }
    const newVersion = rectifyRdo(rdo.id, user, rectifyReason);
    setRectifyDialogOpen(false);
    Alert.alert(
      'Termo de Retificação Gerado',
      `A Versão ${rdo.version} foi congelada e a nova cópia de trabalho (v${newVersion.version}) foi criada para nova aprovação.`,
    );
    router.replace({
      pathname: '/rdo-review',
      params: { id: newVersion.id },
    });
  }, [rdo, user, rectifyReason, rectifyRdo, router]);

  const handleExport = useCallback((type: 'pdf' | 'csv' | 'photos') => {
    setExportDialogOpen(false);
    const labels = {
      pdf: 'Relatório Final PDF emitido com QR Code e Hash de verificação.',
      csv: 'Planilha CSV com dados analíticos exportada para download.',
      photos: 'Acervo fotográfico compactado em lote com marcas d’água.',
    };
    Alert.alert('Exportação Concluída', labels[type]);
  }, []);

  const navigateToAuditTrail = useCallback(() => {
    if (!rdo) return;
    router.push({
      pathname: '/audit-trail',
      params: { rdoId: rdo.id },
    });
  }, [rdo, router]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    rdo,
    manHours,
    headcount,
    overdue,
    availableActions,
    returnDialogOpen,
    setReturnDialogOpen,
    returnReason,
    setReturnReason,
    approveDialogOpen,
    setApproveDialogOpen,
    signPin,
    setSignPin,
    pinError,
    commentDialogOpen,
    setCommentDialogOpen,
    targetSection,
    commentText,
    setCommentText,
    editDialogOpen,
    setEditDialogOpen,
    editField,
    editNewValue,
    setEditNewValue,
    editJustification,
    setEditJustification,
    rectifyDialogOpen,
    setRectifyDialogOpen,
    rectifyReason,
    setRectifyReason,
    exportDialogOpen,
    setExportDialogOpen,
    handleOpenReturnDialog,
    handleConfirmReturn,
    handleOpenApproveDialog,
    handleConfirmApprove,
    handleOpenCommentDialog,
    handleConfirmComment,
    handleOpenEditDialog,
    handleConfirmAuditedEdit,
    handleOpenRectifyDialog,
    handleConfirmRectify,
    handleExport,
    navigateToAuditTrail,
    goBack,
  };
};

export default useRDOReview;
