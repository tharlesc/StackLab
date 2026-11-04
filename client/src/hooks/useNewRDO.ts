import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { MOCK_ACTIVE_WORKS, MOCK_USERS } from '@/mocks';
import { useRDO } from '@/contexts/RDOContext';
import { useAuth } from '@/contexts/AuthContext';
import { calcHeadcount, calcManHours } from '@/utils/rdo';
import { validateDraftForSubmission } from '@/services/modules/rdoWorkflow';
import type {
  ActiveWork,
  RDO,
  WeatherEntry,
  LaborEntry,
  EquipmentEntry,
  ActivityEntry,
  MaterialEntry,
  OccurrenceEntry,
  PhotoEntry,
  Shift,
} from '@/types';

export const STEPS = [
  { id: 0, label: 'Clima', title: '1. Identificação & Clima' },
  { id: 1, label: 'Efetivo', title: '2. Mão de Obra' },
  { id: 2, label: 'Máquinas', title: '3. Equipamentos' },
  { id: 3, label: 'Atividades', title: '4. Atividades Executadas' },
  { id: 4, label: 'Fatos', title: '5. Ocorrências & DDS' },
  { id: 5, label: 'Fotos', title: '6. Fotos na Obra' },
  { id: 6, label: 'Revisão', title: '7. Revisão & Prévia' },
] as const;

export const useNewRDO = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { createDraft, saveDraft, loadDraft, discardDraft, submitDraft } = useRDO();

  const currentUser = user || MOCK_USERS[1] || {
    id: 'usr-default',
    name: 'Operário Responsável',
    email: 'operario@stacklab.com',
    role: 'Encarregado',
    profile: 'common',
    assignedWorkIds: [],
  };

  const [works] = useState<ActiveWork[]>(MOCK_ACTIVE_WORKS);
  const [selectedWork, setSelectedWork] = useState<ActiveWork | null>(null);
  const [activeDraft, setActiveDraft] = useState<RDO | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Dialogs de controle
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Rascunho local pré-existente
  const [existingDraftWork, setExistingDraftWork] = useState<ActiveWork | null>(null);
  const [existingDraftData, setExistingDraftData] = useState<Partial<RDO> | null>(null);

  // Verifica rascunhos persistidos no AsyncStorage ao montar a tela
  const checkExistingDrafts = useCallback(async () => {
    for (const work of works) {
      try {
        const draft = await loadDraft(work.id);
        if (draft && draft.workId) {
          setExistingDraftWork(work);
          setExistingDraftData(draft);
          return;
        }
      } catch (err) {
        console.warn('Erro ao carregar rascunho de obra:', err);
      }
    }
    setExistingDraftWork(null);
    setExistingDraftData(null);
  }, [works, loadDraft]);

  useEffect(() => {
    checkExistingDrafts();
  }, [checkExistingDrafts]);

  // Selecionar obra para novo RDO
  const handleSelectWork = useCallback((work: ActiveWork) => {
    setSelectedWork(work);
    setIsStartDialogOpen(true);
  }, []);

  const handleCloseStartDialog = useCallback(() => {
    setIsStartDialogOpen(false);
  }, []);

  // Confirmar início do preenchimento
  const handleConfirmStart = useCallback(async () => {
    if (!selectedWork) return;

    // Se já havia rascunho salvo para esta obra, recupera-o
    const persisted = await loadDraft(selectedWork.id);
    if (persisted && persisted.workId === selectedWork.id) {
      setActiveDraft(persisted as RDO);
    } else {
      const newDraft = createDraft({
        workId: selectedWork.id,
        workName: selectedWork.name,
        author: currentUser,
      });
      setActiveDraft(newDraft);
      await saveDraft(selectedWork.id, newDraft);
    }

    setCurrentStep(0);
    setIsStartDialogOpen(false);
  }, [selectedWork, loadDraft, createDraft, currentUser, saveDraft]);

  // Continuar rascunho detectado
  const handleContinueExistingDraft = useCallback(() => {
    if (existingDraftWork && existingDraftData) {
      setSelectedWork(existingDraftWork);
      setActiveDraft(existingDraftData as RDO);
      setCurrentStep(0);
    }
  }, [existingDraftWork, existingDraftData]);

  // Descartar rascunho detectado
  const handleDiscardExistingDraft = useCallback(async () => {
    if (existingDraftWork) {
      await discardDraft(existingDraftWork.id);
      setExistingDraftWork(null);
      setExistingDraftData(null);
    }
  }, [existingDraftWork, discardDraft]);

  // Salvar rascunho manualmente
  const handleSaveDraft = useCallback(async () => {
    if (!activeDraft || !activeDraft.workId) return;
    try {
      await saveDraft(activeDraft.workId, activeDraft);
      setSavedFeedback('Rascunho salvo com sucesso localmente!');
      setTimeout(() => setSavedFeedback(null), 3000);
    } catch (err) {
      console.warn('Erro ao salvar rascunho:', err);
    }
  }, [activeDraft, saveDraft]);

  // Sair do assistente
  const handleExitWizard = useCallback(async () => {
    if (activeDraft && activeDraft.workId) {
      await saveDraft(activeDraft.workId, activeDraft);
    }
    setActiveDraft(null);
    setSelectedWork(null);
    checkExistingDrafts();
  }, [activeDraft, saveDraft, checkExistingDrafts]);

  // ============================================================================
  // Validação por Etapas (Step-by-Step Validation)
  // ============================================================================

  const validateStep = useCallback(
    (stepIndex: number, draft: RDO | null = activeDraft): { isValid: boolean; error: string | null } => {
      if (!draft) {
        return { isValid: false, error: 'Rascunho não inicializado.' };
      }

      switch (stepIndex) {
        case 0: {
          // 1. Identificação & Clima
          if (!draft.date || draft.date.trim().length < 8) {
            return {
              isValid: false,
              error: 'Preencha a data do relatório (DD/MM/AAAA) para avançar.',
            };
          }
          const rainWithoutImpact = draft.weather?.find((w) => {
            const isRain = w.condition ? /chuva|chuvoso/i.test(w.condition) : false;
            return isRain && (w.stoppageHours ?? 0) > 0 && (!w.impact || w.impact.trim().length < 3);
          });
          if (rainWithoutImpact) {
            return {
              isValid: false,
              error: `Informe a justificativa do impacto da chuva no turno ${rainWithoutImpact.shift} (mín. 3 caracteres).`,
            };
          }
          return { isValid: true, error: null };
        }

        case 1: {
          // 2. Efetivo & Mão de Obra
          if (!draft.labor || draft.labor.length === 0) {
            return {
              isValid: false,
              error: 'Adicione ao menos 1 colaborador à equipe para avançar.',
            };
          }
          const invalidLabor = draft.labor.find(
            (l) =>
              typeof l.quantity !== 'number' ||
              l.quantity < 1 ||
              !Number.isInteger(l.quantity) ||
              typeof l.hours !== 'number' ||
              l.hours < 0 ||
              l.hours > 24,
          );
          if (invalidLabor) {
            return {
              isValid: false,
              error: 'Verifique a quantidade e a jornada dos colaboradores adicionados.',
            };
          }
          return { isValid: true, error: null };
        }

        case 2: {
          // 3. Equipamentos & Maquinário
          if (!draft.equipment || draft.equipment.length === 0) {
            return { isValid: true, error: null };
          }
          const invalidEquip = draft.equipment.find(
            (eq) =>
              (eq.idleHours ?? 0) > 0 &&
              (!eq.idleJustification || eq.idleJustification.trim().length < 5),
          );
          if (invalidEquip) {
            return {
              isValid: false,
              error: `Informe a justificativa de ociosidade do equipamento "${invalidEquip.name}" (mín. 5 caracteres).`,
            };
          }
          return { isValid: true, error: null };
        }

        case 3: {
          // 4. Atividades Executadas
          if (!draft.activities || draft.activities.length === 0) {
            return {
              isValid: false,
              error: 'Cadastre ao menos 1 atividade executada para avançar.',
            };
          }
          const invalidAct = draft.activities.find(
            (a) => !a.description || a.description.trim().length < 3,
          );
          if (invalidAct) {
            return {
              isValid: false,
              error: 'A descrição da atividade deve possuir no mínimo 3 caracteres.',
            };
          }
          return { isValid: true, error: null };
        }

        case 4: {
          // 5. Ocorrências & DDS (opcional)
          return { isValid: true, error: null };
        }

        case 5: {
          // 6. Fotos na Obra (opcional)
          return { isValid: true, error: null };
        }

        case 6: {
          // 7. Revisão & Prévia
          return { isValid: true, error: null };
        }

        default:
          return { isValid: true, error: null };
      }
    },
    [activeDraft],
  );

  const isStepValid = useCallback(
    (stepIndex: number = currentStep): boolean => {
      return validateStep(stepIndex, activeDraft).isValid;
    },
    [validateStep, activeDraft, currentStep],
  );

  const getStepValidationError = useCallback(
    (stepIndex: number = currentStep): string | null => {
      return validateStep(stepIndex, activeDraft).error;
    },
    [validateStep, activeDraft, currentStep],
  );

  const canAdvance = useMemo(() => {
    return isStepValid(currentStep);
  }, [isStepValid, currentStep]);

  const stepError = useMemo(() => {
    return getStepValidationError(currentStep);
  }, [getStepValidationError, currentStep]);

  const canJumpToStep = useCallback(
    (targetStep: number): boolean => {
      if (targetStep <= currentStep) return true;
      for (let i = 0; i < targetStep; i++) {
        if (!validateStep(i, activeDraft).isValid) return false;
      }
      return true;
    },
    [currentStep, validateStep, activeDraft],
  );

  // Navegação entre passos com validação de etapa
  const handleNextStep = useCallback(
    (options?: { force?: boolean }) => {
      if (!options?.force && !isStepValid(currentStep)) {
        return false;
      }
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
        if (activeDraft && activeDraft.workId) {
          saveDraft(activeDraft.workId, activeDraft).catch(console.warn);
        }
        return true;
      }
      return false;
    },
    [currentStep, isStepValid, activeDraft, saveDraft],
  );

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (stepIndex: number, options?: { force?: boolean }) => {
      if (!options?.force && !canJumpToStep(stepIndex)) {
        return false;
      }
      setCurrentStep(stepIndex);
      return true;
    },
    [canJumpToStep],
  );

  // ============================================================================
  // Atualizações do RDO (Turnos, Equipe, Equipamento, Atividades, Insumos, Fotos)
  // ============================================================================

  const updateDate = useCallback((date: string) => {
    setActiveDraft((prev) => (prev ? { ...prev, date } : null));
  }, []);

  const updateWeatherShift = useCallback(
    (shift: Shift, patch: Partial<WeatherEntry>) => {
      setActiveDraft((prev) => {
        if (!prev) return null;
        const exists = prev.weather.some((w) => w.shift === shift);
        let updatedWeather: WeatherEntry[];
        if (exists) {
          updatedWeather = prev.weather.map((w) => (w.shift === shift ? { ...w, ...patch } : w));
        } else {
          updatedWeather = [
            ...prev.weather,
            { shift, condition: 'Ensolarado', practical: true, ...patch },
          ];
        }
        return { ...prev, weather: updatedWeather };
      });
    },
    [],
  );

  const addLaborEntry = useCallback((entry: LaborEntry) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, labor: [...prev.labor, entry] };
    });
  }, []);

  const removeLaborEntry = useCallback((index: number) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, labor: prev.labor.filter((_, idx) => idx !== index) };
    });
  }, []);

  const addEquipmentEntry = useCallback((entry: EquipmentEntry) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, equipment: [...prev.equipment, entry] };
    });
  }, []);

  const removeEquipmentEntry = useCallback((index: number) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, equipment: prev.equipment.filter((_, idx) => idx !== index) };
    });
  }, []);

  const addActivityEntry = useCallback((entry: ActivityEntry) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, activities: [...prev.activities, entry] };
    });
  }, []);

  const removeActivityEntry = useCallback((index: number) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, activities: prev.activities.filter((_, idx) => idx !== index) };
    });
  }, []);

  const addMaterialEntry = useCallback((entry: MaterialEntry) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, materials: [...prev.materials, entry] };
    });
  }, []);

  const removeMaterialEntry = useCallback((index: number) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, materials: prev.materials.filter((_, idx) => idx !== index) };
    });
  }, []);

  const addOccurrenceEntry = useCallback((entry: OccurrenceEntry) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, occurrences: [...prev.occurrences, entry] };
    });
  }, []);

  const removeOccurrenceEntry = useCallback((index: number) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, occurrences: prev.occurrences.filter((_, idx) => idx !== index) };
    });
  }, []);

  // Simulação / Adição de Foto com Marca d'Água de Segurança
  const handleCapturePhoto = useCallback(
    (caption = 'Registro fotográfico das atividades em campo') => {
      if (!activeDraft) return;

      const takenAt = new Date().toISOString();
      const lat = -2.5307;
      const lng = -44.3068;
      const acc = 3.8;
      const photoId = `photo-${Date.now()}`;

      const watermarkText = `[STACKLAB SECURITY] Obra: ${activeDraft.workName} | Data: ${takenAt.slice(
        0,
        10,
      )} | GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (±${acc}m) | Operário: ${currentUser.name}`;

      const newPhoto: PhotoEntry = {
        id: photoId,
        caption,
        takenAt,
        author: currentUser.name,
        watermarkedUri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563?q=80&w=600&auto=format&fit=crop',
        uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563?q=80&w=600&auto=format&fit=crop',
        metadata: {
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          capturedAt: takenAt,
          authorId: currentUser.id,
          authorName: currentUser.name,
          workId: activeDraft.workId,
          workName: activeDraft.workName,
          rdoNumber: activeDraft.number,
          hash: `SHA256-${Date.now().toString(16)}`,
        },
      };

      setActiveDraft((prev) => (prev ? { ...prev, photos: [...prev.photos, newPhoto] } : null));
    },
    [activeDraft, currentUser],
  );

  const removePhotoEntry = useCallback((index: number) => {
    setActiveDraft((prev) => {
      if (!prev) return null;
      return { ...prev, photos: prev.photos.filter((_, idx) => idx !== index) };
    });
  }, []);

  // Totalizadores em tempo real
  const headcount = useMemo(() => calcHeadcount(activeDraft?.labor || []), [activeDraft?.labor]);
  const manHours = useMemo(() => calcManHours(activeDraft?.labor || []), [activeDraft?.labor]);

  // Submissão final do RDO
  const handleSubmit = useCallback(async () => {
    if (!activeDraft) return;

    const payload: RDO = {
      ...activeDraft,
      materials: activeDraft.materials || [],
    };

    // 1. Validação de pré-submissão
    const validation = validateDraftForSubmission(payload);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsValidationDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitDraft(payload, currentUser);
      setIsSuccessDialogOpen(true);
    } catch (err: any) {
      setValidationErrors([err.message || 'Ocorreu um erro ao submeter o RDO.']);
      setIsValidationDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [activeDraft, submitDraft, currentUser]);

  const handleFinishSuccess = useCallback(() => {
    setIsSuccessDialogOpen(false);
    setActiveDraft(null);
    setSelectedWork(null);
    router.push('/');
  }, [router]);

  return {
    works,
    selectedWork,
    activeDraft,
    currentStep,
    isStartDialogOpen,
    isDiscardDialogOpen,
    isValidationDialogOpen,
    validationErrors,
    isSuccessDialogOpen,
    isSubmitting,
    savedFeedback,
    existingDraftWork,
    existingDraftData,
    headcount,
    manHours,
    handleSelectWork,
    handleCloseStartDialog,
    handleConfirmStart,
    handleContinueExistingDraft,
    handleDiscardExistingDraft,
    handleSaveDraft,
    handleExitWizard,
    handleNextStep,
    handlePrevStep,
    goToStep,
    validateStep,
    isStepValid,
    getStepValidationError,
    canAdvance,
    stepError,
    canJumpToStep,
    updateDate,
    updateWeatherShift,
    addLaborEntry,
    removeLaborEntry,
    addEquipmentEntry,
    removeEquipmentEntry,
    addActivityEntry,
    removeActivityEntry,
    addMaterialEntry,
    removeMaterialEntry,
    addOccurrenceEntry,
    removeOccurrenceEntry,
    handleCapturePhoto,
    removePhotoEntry,
    handleSubmit,
    handleFinishSuccess,
    setIsDiscardDialogOpen,
    setIsValidationDialogOpen,
  };
};

export default useNewRDO;
