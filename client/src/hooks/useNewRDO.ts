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
  { id: 4, label: 'Insumos', title: '5. Materiais Recebidos' },
  { id: 5, label: 'Fatos', title: '6. Ocorrências & DDS' },
  { id: 6, label: 'Fotos', title: '7. Fotos na Obra' },
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

  // Navegação entre passos
  const handleNextStep = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      if (activeDraft && activeDraft.workId) {
        saveDraft(activeDraft.workId, activeDraft).catch(console.warn);
      }
    }
  }, [currentStep, activeDraft, saveDraft]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
  }, []);

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

    // 1. Validação de pré-submissão
    const validation = validateDraftForSubmission(activeDraft);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsValidationDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitDraft(activeDraft, currentUser);
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
