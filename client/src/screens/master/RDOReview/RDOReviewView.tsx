import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  ChevronLeft,
  ShieldCheck,
  Undo2,
  FileText,
  Download,
  History,
  MessageSquare,
  Edit3,
  Camera,
} from 'lucide-react-native';

import { useRDOReview } from './useRDOReview';
import {
  SectionCard,
  SectionHeader,
  SectionTitleContainer,
  SectionTitle,
  SectionSubtitle,
  SectionAction,
  SectionActionText,
  InfoRow,
  InfoLabel,
  InfoValue,
  WeatherContainer,
  WeatherBadgesRow,
  WeatherBadge,
  WeatherBadgeText,
  ItemCard,
  ItemTitle,
  ItemSubtitle,
  PhotoThumbnail,
  PhotoCaption,
  WatermarkText,
  CommentBox,
  CommentAuthor,
  CommentText,
  ActionButtonBar,
  SecondaryActionsRow,
  SignatureCertificateBox,
  SignatureTitle,
  SignatureText,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { Button } from '@/components/common/Button';
import { Dialog } from '@/components/common/Dialog';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { getWeatherIcon } from '@/utils/weather';
import { formatDateTime } from '@/utils';

export const RDOReviewView = () => {
  const theme = useTheme();
  const {
    rdo,
    manHours,
    headcount,
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
  } = useRDOReview();

  if (!rdo) {
    return (
      <Screen>
        <Header
          title="Análise de RDO"
          leftContent={<HeaderAction icon={<ChevronLeft color={theme.colors.text.secondary} size={24} />} onPress={goBack} />}
        />
        <EmptyState icon={<FileText size={48} color={theme.colors.text.secondary} />} message="RDO não encontrado." />
      </Screen>
    );
  }

  const isApproved = rdo.status === 'aprovado';

  return (
    <Screen>
      <Header
        title={`RDO #${rdo.number} (v${rdo.version})`}
        leftContent={
          <HeaderAction
            icon={<ChevronLeft color={theme.colors.text.secondary} size={24} />}
            onPress={goBack}
            accessibilityLabel="Voltar"
          />
        }
        rightContent={
          <>
            <HeaderAction
              icon={<Download color={theme.colors.text.primary} size={20} />}
              onPress={() => setExportDialogOpen(true)}
              accessibilityLabel="Exportar ativos do RDO"
            />
            <HeaderAction
              icon={<History color={theme.colors.text.primary} size={22} />}
              onPress={navigateToAuditTrail}
              accessibilityLabel="Ver trilha de auditoria"
            />
          </>
        }
      />

      <ScrollContent showsVerticalScrollIndicator={false}>
        {/* Selo de Assinatura se Aprovado */}
        {isApproved && rdo.signature && (
          <SignatureCertificateBox>
            <SignatureTitle>✓ Homologado & Assinado Digitalmente (Imutável)</SignatureTitle>
            <SignatureText>
              Assinado por: {rdo.signature.signedByName}{'\n'}
              Data: {formatDateTime(rdo.signature.signedAt)}{'\n'}
              IP / Dispositivo: {rdo.signature.ip} ({rdo.signature.deviceId}){'\n'}
              Hash SHA-Integridade: {rdo.signature.hash}
            </SignatureText>
          </SignatureCertificateBox>
        )}

        {/* 1. Identificação e Clima (Remodelado) */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleContainer>
              <SectionTitle>1. Identificação & Clima</SectionTitle>
              <SectionSubtitle>Registro de turno e frente de trabalho</SectionSubtitle>
            </SectionTitleContainer>

            {!isApproved && (
              <SectionAction onPress={() => handleOpenCommentDialog('identificacao')}>
                <MessageSquare size={13} color={theme.colors.secondary} />
                <SectionActionText>Comentar</SectionActionText>
              </SectionAction>
            )}
          </SectionHeader>

          <InfoRow>
            <InfoLabel>Data do Registro:</InfoLabel>
            <InfoValue>{rdo.date}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Responsável em Campo:</InfoLabel>
            <InfoValue>{rdo.authorName}</InfoValue>
          </InfoRow>

          <WeatherContainer>
            <InfoLabel>Condições Climáticas:</InfoLabel>
            <WeatherBadgesRow>
              {rdo.weather.map((w, idx) => (
                <WeatherBadge key={idx}>
                  {getWeatherIcon(w.condition, 16, theme.colors.secondary)}
                  <WeatherBadgeText>
                    {w.shift.toUpperCase()}: {w.condition}
                  </WeatherBadgeText>
                </WeatherBadge>
              ))}
            </WeatherBadgesRow>
          </WeatherContainer>

          {rdo.comments.filter((c) => c.section === 'identificacao').map((c) => (
            <CommentBox key={c.id}>
              <CommentAuthor>{c.authorName} ({formatDateTime(c.createdAt)})</CommentAuthor>
              <CommentText>{c.text}</CommentText>
            </CommentBox>
          ))}
        </SectionCard>

        {/* 2. Mão de Obra e Equipamentos (Remodelado) */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleContainer>
              <SectionTitle>2. Mão de Obra & Equipamentos</SectionTitle>
              <SectionSubtitle>{headcount} operários • {manHours} Homem-Hora total</SectionSubtitle>
            </SectionTitleContainer>

            {!isApproved && (
              <SectionAction onPress={() => handleOpenCommentDialog('maoDeObra')}>
                <MessageSquare size={13} color={theme.colors.secondary} />
                <SectionActionText>Comentar</SectionActionText>
              </SectionAction>
            )}
          </SectionHeader>

          {rdo.labor.map((l, index) => (
            <ItemCard key={index}>
              <ItemTitle>{l.role}: {l.quantity} profissionais</ItemTitle>
              <ItemSubtitle>Jornada: {l.hours}h ({l.quantity * l.hours} Homem-Hora total)</ItemSubtitle>
            </ItemCard>
          ))}

          <SectionTitle style={{ marginTop: 12, marginBottom: 8, fontSize: 13 }}>
            Equipamentos no Canteiro:
          </SectionTitle>
          {rdo.equipment.map((e, index) => (
            <ItemCard key={index}>
              <ItemTitle>{e.name}</ItemTitle>
              <ItemSubtitle>Horas Ativas: {e.activeHours}h | Horas Paradas: {e.idleHours}h</ItemSubtitle>
              {e.idleJustification ? (
                <ItemSubtitle style={{ color: theme.colors.status.warning.text, marginTop: 2 }}>
                  Justificativa inatividade: {e.idleJustification}
                </ItemSubtitle>
              ) : null}
            </ItemCard>
          ))}

          {rdo.comments.filter((c) => c.section === 'maoDeObra').map((c) => (
            <CommentBox key={c.id}>
              <CommentAuthor>{c.authorName} ({formatDateTime(c.createdAt)})</CommentAuthor>
              <CommentText>{c.text}</CommentText>
            </CommentBox>
          ))}
        </SectionCard>

        {/* 3. Atividades & Materiais (Remodelado) */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleContainer>
              <SectionTitle>3. Atividades & Materiais</SectionTitle>
              <SectionSubtitle>{rdo.activities.length} atividades • {rdo.materials.length} insumos</SectionSubtitle>
            </SectionTitleContainer>

            {!isApproved && (
              <SectionAction onPress={() => handleOpenEditDialog('atividades', 'Descrição de Atividade', '')}>
                <Edit3 size={13} color={theme.colors.secondary} />
                <SectionActionText>Edição Auditada</SectionActionText>
              </SectionAction>
            )}
          </SectionHeader>

          {rdo.activities.map((a, index) => (
            <ItemCard key={index}>
              <ItemTitle>{a.description}</ItemTitle>
              <ItemSubtitle>Local: {a.location} • Quantidade: {a.quantity} {a.unit}</ItemSubtitle>
            </ItemCard>
          ))}

          <SectionTitle style={{ marginTop: 12, marginBottom: 8, fontSize: 13 }}>
            Materiais Recebidos:
          </SectionTitle>
          {rdo.materials.map((m, index) => (
            <ItemCard key={index}>
              <ItemTitle>{m.name}</ItemTitle>
              <ItemSubtitle>Fornecedor: {m.supplier} • {m.invoice}</ItemSubtitle>
            </ItemCard>
          ))}
        </SectionCard>

        {/* 4. Ocorrências & Fotos (Remodelado) */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleContainer>
              <SectionTitle>4. Ocorrências & Fotos</SectionTitle>
              <SectionSubtitle>{rdo.occurrences.length} ocorrências • {rdo.photos.length} registros</SectionSubtitle>
            </SectionTitleContainer>

            {!isApproved && (
              <SectionAction onPress={() => handleOpenCommentDialog('fotos')}>
                <MessageSquare size={13} color={theme.colors.secondary} />
                <SectionActionText>Comentar</SectionActionText>
              </SectionAction>
            )}
          </SectionHeader>

          {rdo.occurrences.map((o, index) => (
            <ItemCard key={index}>
              <ItemTitle>[{o.type.toUpperCase()}]</ItemTitle>
              <ItemSubtitle>{o.description}</ItemSubtitle>
            </ItemCard>
          ))}

          {rdo.photos.map((p) => (
            <PhotoThumbnail key={p.id}>
              <Camera size={20} color={theme.colors.secondary} />
              <PhotoCaption>{p.caption}</PhotoCaption>
              <WatermarkText>
                [Marca d'Água]: {formatDateTime(p.takenAt)} • Autor: {p.author} • Obra: {rdo.workName}
              </WatermarkText>
            </PhotoThumbnail>
          ))}

          {rdo.comments.filter((c) => c.section === 'fotos').map((c) => (
            <CommentBox key={c.id}>
              <CommentAuthor>{c.authorName} ({formatDateTime(c.createdAt)})</CommentAuthor>
              <CommentText>{c.text}</CommentText>
            </CommentBox>
          ))}
        </SectionCard>
      </ScrollContent>

      {/* Barra de Ações Críticas do Master */}
      <ActionButtonBar>
        {!isApproved ? (
          <>
            <Button
              title="Validar e Assinar (Homologação)"
              variant="primary"
              fullWidth
              icon={<ShieldCheck size={18} color={theme.colors.text.inverse} />}
              onPress={handleOpenApproveDialog}
            />
            <SecondaryActionsRow>
              <View style={{ flex: 1 }}>
                <Button
                  title="Devolver para Campo"
                  variant="outline"
                  fullWidth
                  icon={<Undo2 size={16} color={theme.colors.status.error.base} />}
                  onPress={handleOpenReturnDialog}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Comentar Geral"
                  variant="outline"
                  fullWidth
                  icon={<MessageSquare size={16} color={theme.colors.text.primary} />}
                  onPress={() => handleOpenCommentDialog('ocorrencias')}
                />
              </View>
            </SecondaryActionsRow>
          </>
        ) : (
          <Button
            title="Emitir Termo de Retificação Oficial"
            variant="secondary"
            fullWidth
            icon={<Edit3 size={18} color={theme.colors.text.inverse} />}
            onPress={handleOpenRectifyDialog}
          />
        )}
      </ActionButtonBar>

      {/* Dialog 1: Devolução Motivada */}
      <Dialog
        visible={returnDialogOpen}
        title="Devolver RDO para Ajuste"
        description="A recusa motivada enviará notificação imediata à equipe de campo e desbloqueará pontualmente este relatório para correções."
        primaryAction={{ label: 'Confirmar Devolução', onPress: handleConfirmReturn, destructive: true }}
        secondaryAction={{ label: 'Cancelar', onPress: () => setReturnDialogOpen(false) }}
        onClose={() => setReturnDialogOpen(false)}
      >
        <Input
          placeholder="Ex: Refazer a foto 2 com boa luminosidade e justificar horas paradas."
          value={returnReason}
          onChangeText={setReturnReason}
          multiline
          numberOfLines={3}
          style={{ minHeight: 70 }}
        />
      </Dialog>

      {/* Dialog 2: Aprovação com Assinatura 2FA */}
      <Dialog
        visible={approveDialogOpen}
        title="Homologar e Assinar RDO"
        description="A assinatura final gera imutabilidade jurídica do documento, hash criptográfico e metadados de IP/dispositivo. Insira o seu PIN de 2 fatores (Teste: 1234):"
        primaryAction={{ label: 'Assinar e Concluir', onPress: handleConfirmApprove }}
        secondaryAction={{ label: 'Cancelar', onPress: () => setApproveDialogOpen(false) }}
        onClose={() => setApproveDialogOpen(false)}
      >
        <Input
          placeholder="PIN de 4 dígitos"
          value={signPin}
          onChangeText={setSignPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
        />
        {pinError ? (
          <SignatureText style={{ color: theme.colors.status.error.base, marginTop: -4 }}>
            {pinError}
          </SignatureText>
        ) : null}
      </Dialog>

      {/* Dialog 3: Comentário por Seção */}
      <Dialog
        visible={commentDialogOpen}
        title="Adicionar Apontamento Técnico"
        description={`Inserir nota do Master na seção "${targetSection}":`}
        primaryAction={{ label: 'Salvar Apontamento', onPress: handleConfirmComment }}
        secondaryAction={{ label: 'Cancelar', onPress: () => setCommentDialogOpen(false) }}
        onClose={() => setCommentDialogOpen(false)}
      >
        <Input
          placeholder="Observação técnica para o relatório..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
          numberOfLines={2}
        />
      </Dialog>

      {/* Dialog 4: Edição Auditável */}
      <Dialog
        visible={editDialogOpen}
        title="Edição Técnica Auditável"
        description="Toda modificação direta pelo Master gera um registro perene na trilha de auditoria contendo autor, valor anterior, valor novo e justificativa."
        primaryAction={{ label: 'Gravar com Auditoria', onPress: handleConfirmAuditedEdit }}
        secondaryAction={{ label: 'Cancelar', onPress: () => setEditDialogOpen(false) }}
        onClose={() => setEditDialogOpen(false)}
      >
        <Input
          placeholder="Novo texto ou valor ajustado..."
          value={editNewValue}
          onChangeText={setEditNewValue}
        />
        <Input
          placeholder="Justificativa formal obrigatória da alteração..."
          value={editJustification}
          onChangeText={setEditJustification}
          multiline
        />
      </Dialog>

      {/* Dialog 5: Retificação Oficial */}
      <Dialog
        visible={rectifyDialogOpen}
        title="Emissão de Retificação Oficial"
        description="A versão aprovada original (v1) será permanentemente congelada. Uma nova versão de trabalho (v2) será gerada mantendo a trilha auditável para fins legais."
        primaryAction={{ label: 'Criar Retificação', onPress: handleConfirmRectify }}
        secondaryAction={{ label: 'Cancelar', onPress: () => setRectifyDialogOpen(false) }}
        onClose={() => setRectifyDialogOpen(false)}
      >
        <Input
          placeholder="Motivo formal da retificação pós-aprovação..."
          value={rectifyReason}
          onChangeText={setRectifyReason}
          multiline
        />
      </Dialog>

      {/* Dialog 6: Painel de Exportações */}
      <Dialog
        visible={exportDialogOpen}
        title="Exportar Ativos do RDO"
        description="Selecione o formato de exportação desejado:"
        primaryAction={{ label: 'Gerar PDF Oficial', onPress: () => handleExport('pdf') }}
        secondaryAction={{ label: 'Fechar', onPress: () => setExportDialogOpen(false) }}
        onClose={() => setExportDialogOpen(false)}
      >
        <View style={{ gap: 8, marginTop: 4 }}>
          <Button
            title="Exportar Planilha Analítica (CSV)"
            variant="outline"
            size="small"
            onPress={() => handleExport('csv')}
          />
          <Button
            title="Download em Lote de Fotos (ZIP)"
            variant="outline"
            size="small"
            onPress={() => handleExport('photos')}
          />
        </View>
      </Dialog>
    </Screen>
  );
};

export default RDOReviewView;
