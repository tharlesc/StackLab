import React from 'react';
import { useTheme } from 'styled-components/native';
import { Building2, ChevronRight } from 'lucide-react-native';

import { useNewRDO } from './useNewRDO';
import {
  WorkSelectCard,
  WorkIconContainer,
  WorkInfo,
  WorkName,
  WorkChipsRow,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { ScrollContent } from '@/components/common/Layout';
import { Dialog } from '@/components/common/Dialog';
import { Chip } from '@/components/common/Chip';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { strings } from '@/constants/strings';

export const NewRDOView = () => {
  const theme = useTheme();
  const {
    works,
    selectedWork,
    isDialogOpen,
    handleSelectWork,
    handleCloseDialog,
    handleConfirmStart,
  } = useNewRDO();

  return (
    <>
      <Header title={strings.newRDO.title} />

      <ScrollContent showsVerticalScrollIndicator={false}>
        <InteractiveCard
          title="Rascunho Local Disponível"
          supportingText="Você possui 1 diário em rascunho salvo offline aguardando preenchimento para a Torre Esmeralda."
          actions={[
            { label: 'Descartar', onPress: () => {}, destructive: true },
            { label: 'Continuar', onPress: () => {}, primary: true },
          ]}
        />

        {works.map((work) => (
          <WorkSelectCard
            key={work.id}
            activeOpacity={0.7}
            onPress={() => handleSelectWork(work)}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar obra: ${work.name}, ${work.subtitle}`}
          >
            <WorkIconContainer>
              <Building2
                color={theme.name === 'dark' ? theme.colors.tintText : theme.colors.primary}
                size={theme.icon.size.lg}
                strokeWidth={theme.icon.strokeWidth}
              />
            </WorkIconContainer>
            <WorkInfo>
              <WorkName>{work.name}</WorkName>
              <WorkChipsRow>
                <Chip label={work.subtitle} variant="dark" />
                <Chip label="Em Andamento" variant="surface" />
              </WorkChipsRow>
            </WorkInfo>
            <ChevronRight
              color={theme.colors.text.secondary}
              size={theme.icon.size.md}
              strokeWidth={theme.icon.strokeWidth}
            />
          </WorkSelectCard>
        ))}
      </ScrollContent>

      <Dialog
        visible={isDialogOpen}
        title="Iniciar Diário de Obra"
        description={
          selectedWork
            ? `Deseja iniciar o preenchimento do RDO para a obra "${selectedWork.name}"? As informações de clima, data e equipe serão pré-carregadas automaticamente.`
            : ''
        }
        primaryAction={{
          label: strings.newRDO.startAction,
          onPress: handleConfirmStart,
        }}
        secondaryAction={{
          label: strings.common.cancel,
          onPress: handleCloseDialog,
        }}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default NewRDOView;
