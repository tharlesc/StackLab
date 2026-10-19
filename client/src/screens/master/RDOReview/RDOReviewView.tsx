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
  CheckCircle2,
} from 'lucide-react-native';

import { useRDOReview } from './useRDOReview';
import {
  SectionCard,
  SectionHeader,
  SectionTitleContainer,
  SectionTitle,
  SubSectionTitle,
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
  WarningSubtitle,
  PhotoThumbnail,
  PhotoCaption,
  WatermarkText,
  CommentBox,
  CommentAuthor,
  CommentText,
  ActionButtonBar,
  SecondaryActionsRow,
  SignatureCertificateBox,
  SignatureTitleRow,
  SignatureTitle,
  SignatureText,
  ExportOptionsGroup,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { Button } from '@/components/common/Button';
import { Dialog } from '@/components/common/Dialog';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { getWeatherIcon } from '@/components/ui/WeatherIcon';
import { formatDateTime } from '@/utils';
import { strings } from '@/constants/strings';

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
          title={strings.rdoReview.title}
          leftContent={
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
          }
        />
        <EmptyState
          icon={
            <FileText
              size={theme.icon.size.empty}
              color={theme.colors.text.secondary}
              strokeWidth={theme.icon.strokeWidth}
            />
          }
          message={strings.rdoReview.notFoundMessage}
        />
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
        }
        rightContent={
          <>
            <HeaderAction
              icon={
                <Download
                  color={theme.colors.text.primary}
                  size={theme.icon.size.md}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              onPress={() => setExportDialogOpen(true)}
              accessibilityLabel="Exportar ativos do RDO"
            />
            <HeaderAction
              icon={
                <History
                  color={theme.colors.text.primary}
                  size={theme.icon.size.lg}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              onPress={navigateToAuditTrail}
              accessibilityLabel="Ver trilha de auditoria"
            />
          </>
        }
      />

      <ScrollContent showsVerticalScrollIndicator={false}>
        {/* Selo de Assinatura se Aprovado — com ícone em vez de emoji de texto (F4.8) */}
        {isApproved && rdo.signature && (
          <SignatureCertificateBox>
            <SignatureTitleRow>
              <CheckCircle2
                color={theme.colors.status.success.text}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
              <SignatureTitle>Aprovado & Assinado Digitalmente (Imutável)</SignatureTitle>
            </SignatureTitleRow>
            <SignatureText>
              Assinado por: {rdo.signature.signedByName}{'\n'}
              Data: {formatDateTime(rdo.signature.signedAt)}{'\n'}
              IP / Dispositivo: {rdo.signature.ip} ({rdo.signature.deviceId}){'\n'}
              Hash SHA-Integridade: {rdo.signature.hash}
            </SignatureText>
          </SignatureCertificateBox>
        )}

        {/* 1. Identificação e Clima */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleContainer>
              <SectionTitle>1. Identificação & Clima</SectionTitle>
              <SectionSubtitle>Registro de turno e frente de trabalho</SectionSubtitle>
            </SectionTitleContainer>

            {!isApproved && (
              <SectionAction
                onPress={() => handleOpenCommentDialog('identificacao')}
                hitSlop={theme.touchTarget.hitSlop}
                accessibilityRole="button"
                accessibilityLabel={`${strings.rdoReview.commentAction} Identificação e Clima`}
              >
                <MessageSquare
                  size={theme.icon.size.sm}
                  color={theme.colors.tintText}
                  strokeWidth={theme.icon.strokeWidth}
                />
                <SectionActionText>{strings.rdoReview.commentAction}</SectionActionText>
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
                  {getWeatherIcon(w.condition, theme.icon.size.sm, theme.colors.tintText)}
                  <WeatherBadgeText>
                    {w.shift.toUpperCase()}: {w.condition}
                  </WeatherBadgeText>
                </WeatherBadge>
              ))}
            </WeatherBadgesRow>
          </WeatherContainer>

          {rdo.comments
            .filter((c) => c.section === 'identificacao')
            .map((c) => (
              <CommentBox key={c.id}>
                <CommentAuthor>
                  {c.authorName} ({formatDateTime(c.createdAt)})
                </CommentAuthor>
                <CommentText>{c.text}</CommentText>
              </CommentBox>
            ))}
        </SectionCard>

        {/* 2. Mão de Obra e Equipamentos */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleContainer>
              <SectionTitle>2. Mão de Obra & Equipamentos</SectionTitle>
              <SectionSubtitle>
                {headcount} operários • {manHours} Homem-Hora total
              </SectionSubtitle>
            </SectionTitleContainer>

            {!isApproved && (
              <SectionAction
                onPress={() => handleOpenCommentDialog('maoDeObra')}
                hitSlop={theme.touchTarget.hitSlop}
                accessibilityRole="button"
                accessibilityLabel={`${strings.rdoReview.commentAction} Mão de Obra`}
              >
                <MessageSquare
                  size={theme.icon.size.sm}
                  color={theme.colors.tintText}
                  strokeWidth={theme.icon.strokeWidth}
                />
                <SectionActionText>{strings.rdoReview.commentAction}</SectionActionText>
              </SectionAction>
            )}
          </SectionHeader>

          {rdo.labor.map((l, index) => (
            <ItemCard key={index}>
              <ItemTitle>
                {l.role}: {l.quantity} profissionais
              </ItemTitle>
              <ItemSubtitle>
                Jornada: {l.hours}h ({l.quantity * l.hours} Homem-Hora total)
              </ItemSubtitle>
            </ItemCard>
          ))}

          <SubSectionTitle>Equipamentos no Canteiro:</SubSectionTitle>
          {rdo.equipment.map((e, index) => (
            <ItemCard key={index}>
              <ItemTitle>{e.name}</ItemTitle>
              <ItemSubtitle>
                Horas Ativas: {e.activeHours}h | Horas Paradas: {e.idleHours}h
              </ItemSubtitle>
              {e.idleJustification ? (
                <WarningSubtitle>
                  Justificativa inatividade: {e.idleJustification}
                </WarningSubtitle>
              ) : null}
            </ItemCard>
          ))}

          {rdo.comments
            .filter((c) => c.section === 'maoDeObra')
            .map((c) => (
              <CommentBox key={c.id}>
                <CommentAuthor>
                  {c.authorName} ({formatDateTime(c.createdAt)})
                </CommentAuthor>
                <CommentText>{c.text}</CommentText>
              </CommentBox>
            ))}
        </SectionCard>

        {/* 3. Atividades & Materiais */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleContainer>
              <SectionTitle>3. Atividades & Materiais</SectionTitle>
              <SectionSubtitle>
                {rdo.activities.length} atividades • {rdo.materials.length} insumos
              </SectionSubtitle>
            </SectionTitleContainer>

            {!isApproved && (
              <SectionAction
                onPress={() =>
                  handleOpenEditDialog(
                    'atividades',
                    'Descrição de Atividade',
                    rdo.activities[0]?.description ?? '',
                  )
                }
                hitSlop={theme.touchTarget.hitSlop}
                accessibilityRole="button"
                accessibilityLabel={strings.rdoReview.auditedEditAction}
              >
                <Edit3
                  size={theme.icon.size.sm}
                  color={theme.colors.tintText}
                  strokeWidth={theme.icon.strokeWidth}
                />
                <SectionActionText>{strings.rdoReview.auditedEditAction}</SectionActionText>
              </SectionAction>
            )}
          </SectionHeader>

          {rdo.activities.map((a, index) => (
            <ItemCard key={index}>
              <ItemTitle>{a.description}</ItemTitle>
              <ItemSubtitle>
                Local: {a.location} • Quantidade: {a.quantity} {a.unit}
              </ItemSubtitle>
            </ItemCard>
          ))}

          <SubSectionTitle>Materiais Recebidos:</SubSectionTitle>
          {rdo.materials.map((m, index) => (
            <ItemCard key={index}>
              <ItemTitle>{m.name}</ItemTitle>
              <ItemSubtitle>
                Fornecedor: {m.supplier} • {m.invoice}
              </ItemSubtitle>
            </ItemCard>
          ))}
        </SectionCard>

        {/* 4. Ocorrências & Fotos */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleContainer>
              <SectionTitle>4. Ocorrências & Fotos</SectionTitle>
              <SectionSubtitle>
                {rdo.occurrences.length} ocorrências • {rdo.photos.length} registros
              </SectionSubtitle>
            </SectionTitleContainer>

            {!isApproved && (
              <SectionAction
                onPress={() => handleOpenCommentDialog('fotos')}
                hitSlop={theme.touchTarget.hitSlop}
                accessibilityRole="button"
                accessibilityLabel={`${strings.rdoReview.commentAction} Ocorrências e Fotos`}
              >
                <MessageSquare
                  size={theme.icon.size.sm}
                  color={theme.colors.tintText}
                  strokeWidth={theme.icon.strokeWidth}
                />
                <SectionActionText>{strings.rdoReview.commentAction}</SectionActionText>
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
              <Camera
                size={theme.icon.size.md}
                color={theme.colors.tintText}
                strokeWidth={theme.icon.strokeWidth}
              />
              <PhotoCaption>{p.caption}</PhotoCaption>
              <WatermarkText>
                [Marca d&apos;Água]: {formatDateTime(p.takenAt)} • Autor: {p.author} • Obra:{' '}
                {rdo.workName}
              </WatermarkText>
            </PhotoThumbnail>
          ))}

          {rdo.comments
            .filter((c) => c.section === 'fotos')
            .map((c) => (
              <CommentBox key={c.id}>
                <CommentAuthor>
                  {c.authorName} ({formatDateTime(c.createdAt)})
                </CommentAuthor>
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
              title={strings.rdoReview.approveAction}
              variant="primary"
              fullWidth
              icon={
                <ShieldCheck
                  size={theme.icon.size.md}
                  color={theme.colors.text.inverse}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              onPress={handleOpenApproveDialog}
            />
            <SecondaryActionsRow>
              <View style={{ flex: 1 }}>
                <Button
                  title={strings.rdoReview.returnAction}
                  variant="outline"
                  fullWidth
                  icon={
                    <Undo2
                      size={theme.icon.size.sm}
                      color={theme.colors.status.error.text}
                      strokeWidth={theme.icon.strokeWidth}
                    />
                  }
                  onPress={handleOpenReturnDialog}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Comentar Geral"
                  variant="outline"
                  fullWidth
                  icon={
                    <MessageSquare
                      size={theme.icon.size.sm}
                      color={theme.colors.text.primary}
                      strokeWidth={theme.icon.strokeWidth}
                    />
                  }
                  onPress={() => handleOpenCommentDialog('ocorrencias')}
                />
              </View>
            </SecondaryActionsRow>
          </>
        ) : (
          <Button
            title={strings.rdoReview.rectifyAction}
            variant="secondary"
            fullWidth
            icon={
              <Edit3
                size={theme.icon.size.md}
                color={theme.colors.onSecondary}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={handleOpenRectifyDialog}
          />
        )}
      </ActionButtonBar>

      {/* Dialog 1: Devolução Motivada */}
      <Dialog
        visible={returnDialogOpen}
        title={strings.rdoReview.returnDialogTitle}
        description={strings.rdoReview.returnDialogDesc}
        primaryAction={{
          label: strings.rdoReview.returnDialogConfirm,
          onPress: handleConfirmReturn,
          destructive: true,
        }}
        secondaryAction={{ label: strings.common.cancel, onPress: () => setReturnDialogOpen(false) }}
        onClose={() => setReturnDialogOpen(false)}
      >
        <Input
          placeholder={strings.rdoReview.returnDialogPlaceholder}
          value={returnReason}
          onChangeText={setReturnReason}
          multiline
          numberOfLines={3}
          accessibilityLabel={strings.rdoReview.returnDialogPlaceholder}
        />
      </Dialog>

      {/* Dialog 2: Aprovação com Assinatura 2FA */}
      <Dialog
        visible={approveDialogOpen}
        title={strings.rdoReview.approveDialogTitle}
        description="A assinatura final gera imutabilidade jurídica do documento, hash criptográfico e metadados de IP/dispositivo. Insira o seu PIN de 2 fatores (Teste: 1234):"
        primaryAction={{
          label: strings.rdoReview.approveDialogConfirm,
          onPress: handleConfirmApprove,
        }}
        secondaryAction={{ label: strings.common.cancel, onPress: () => setApproveDialogOpen(false) }}
        onClose={() => setApproveDialogOpen(false)}
      >
        <Input
          placeholder="PIN de 4 dígitos"
          value={signPin}
          onChangeText={setSignPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          error={pinError || undefined}
          accessibilityLabel="PIN de 4 dígitos para assinatura"
        />
      </Dialog>

      {/* Dialog 3: Comentário por Seção */}
      <Dialog
        visible={commentDialogOpen}
        title={strings.rdoReview.commentDialogTitle}
        description={strings.rdoReview.commentDialogDesc(targetSection)}
        primaryAction={{
          label: strings.rdoReview.commentDialogConfirm,
          onPress: handleConfirmComment,
        }}
        secondaryAction={{
          label: strings.common.cancel,
          onPress: () => setCommentDialogOpen(false),
        }}
        onClose={() => setCommentDialogOpen(false)}
      >
        <Input
          placeholder={strings.rdoReview.commentDialogPlaceholder}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          numberOfLines={2}
          accessibilityLabel={strings.rdoReview.commentDialogPlaceholder}
        />
      </Dialog>

      {/* Dialog 4: Edição Auditável */}
      <Dialog
        visible={editDialogOpen}
        title={strings.rdoReview.editDialogTitle}
        description="Toda modificação direta pelo Master gera um registro perene na trilha de auditoria contendo autor, valor anterior, valor novo e justificativa."
        primaryAction={{
          label: strings.rdoReview.editDialogConfirm,
          onPress: handleConfirmAuditedEdit,
        }}
        secondaryAction={{ label: strings.common.cancel, onPress: () => setEditDialogOpen(false) }}
        onClose={() => setEditDialogOpen(false)}
      >
        <Input
          placeholder={strings.rdoReview.editDialogValuePlaceholder}
          value={editNewValue}
          onChangeText={setEditNewValue}
          accessibilityLabel="Novo valor do campo"
        />
        <Input
          placeholder={strings.rdoReview.editDialogReasonPlaceholder}
          value={editJustification}
          onChangeText={setEditJustification}
          multiline
          accessibilityLabel="Justificativa formal da alteração"
        />
      </Dialog>

      {/* Dialog 5: Retificação Oficial */}
      <Dialog
        visible={rectifyDialogOpen}
        title={strings.rdoReview.rectifyDialogTitle}
        description={strings.rdoReview.rectifyDialogDesc}
        primaryAction={{
          label: strings.rdoReview.rectifyDialogConfirm,
          onPress: handleConfirmRectify,
        }}
        secondaryAction={{
          label: strings.common.cancel,
          onPress: () => setRectifyDialogOpen(false),
        }}
        onClose={() => setRectifyDialogOpen(false)}
      >
        <Input
          placeholder="Motivo formal da retificação pós-aprovação..."
          value={rectifyReason}
          onChangeText={setRectifyReason}
          multiline
          accessibilityLabel="Motivo formal da retificação"
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
        <ExportOptionsGroup>
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
        </ExportOptionsGroup>
      </Dialog>
    </Screen>
  );
};

export default RDOReviewView;
