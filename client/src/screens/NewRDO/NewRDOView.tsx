import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Building2, ChevronRight } from 'lucide-react-native';

import { useNewRDO } from './useNewRDO';
import {
  WorkSelectCard,
  WorkIconContainer,
  WorkInfo,
  WorkName,
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
      <Header title={strings.newRDO.title} subtitle={strings.newRDO.subtitle} />

      <ScrollContent showsVerticalScrollIndicator={false}>
        <InteractiveCard
          title="Rascunho Local Disponível"
          supportingText="Você possui 1 diário em rascunho salvo offline aguardando preenchimento para a Torre Esmeralda."
          actions={[
            { label: 'Descartar', onPress: () => console.log('Descartar rascunho'), destructive: true },
            { label: 'Continuar', onPress: () => console.log('Continuar rascunho'), primary: true },
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
                color={theme.name === 'dark' ? theme.colors.secondary : theme.colors.primary}
                size={24}
              />
            </WorkIconContainer>
            <WorkInfo>
              <WorkName>{work.name}</WorkName>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <Chip label={work.subtitle} variant="dark" />
                <Chip label="Em Andamento" variant="surface" />
              </View>
            </WorkInfo>
            <ChevronRight color={theme.colors.text.secondary} size={20} />
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
          label: 'Iniciar',
          onPress: handleConfirmStart,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: handleCloseDialog,
        }}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default NewRDOView;
