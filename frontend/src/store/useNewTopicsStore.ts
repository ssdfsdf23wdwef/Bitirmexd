import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
// import { createTrackedStore } from "./zustand.middleware"; // Şimdilik bunu yorum satırına alın
import { LearningTarget } from "@/types/learningTarget.type";
import learningTargetService from "@/services/learningTarget.service";
import { StateCreator, StoreApi } from "zustand";

/**
 * Yeni Konular State arayüzü
 */
interface NewTopicsState {
  // AI'dan gelen önerilen yeni konu başlıkları
  suggestedNewTopics: string[];
  // Kullanıcının onaylamak üzere seçtiği yeni konu başlıkları  
  selectedNewTopicsForConfirmation: string[];
  // Backend'den dönen, onaylanmış ve kaydedilmiş yeni öğrenme hedefleri
  confirmedNewLearningTargets: LearningTarget[];
  
  // Loading states
  isLoadingSuggestedTopics: boolean;
  errorLoadingSuggestedTopics: string | null;
  isConfirmingTopics: boolean;
  errorConfirmingTopics: string | null;

  // Bekleyen konular
  pendingTopics: PendingTopic[];
}

/**
 * Yeni Konular Actions arayüzü
 */
interface NewTopicsActions {
  // Yeni konu önerileri yükle
  loadSuggestedNewTopics: (
    courseId: string, 
    lessonContext: string, 
    existingTopicNames: string[]
  ) => Promise<void>;
  
  // Bir konuyu onay listesine ekle/çıkar
  toggleTopicForConfirmation: (topicName: string) => void;
  
  // Önerilen konuları temizle
  clearSuggestedTopics: () => void;
  
  // Seçilen konuları onayla ve kaydet
  confirmSelectedTopics: (courseId: string) => Promise<boolean>;
  
  // Tüm state'i sıfırla
  resetNewTopicsState: () => void;

  // Bekleyen konuları ayarla
  setPendingTopics: (topicNames: string[]) => void;

  // Bekleyen konuları temizle
  clearPendingTopics: () => void;
}

// PendingTopic arayüzü
export interface PendingTopic {
  name: string;
  status: 'BEKLEMEDE';
}

// Define type for extended API with trackAction
interface ExtendedApi extends StoreApi<NewTopicsStore> {
  trackAction?: <F extends (...args: any[]) => any>(
    actionName: string,
    fn: F
  ) => F;
}

/**
 * Combined interface (State + Actions)
 */
interface NewTopicsStore extends NewTopicsState, NewTopicsActions {}

// NewTopicsStore implementasyonu
const newTopicsStoreImpl: StateCreator<
  NewTopicsStore,
  [],
  [["zustand/immer", never]],
  NewTopicsStore
> = (set, get, api: ExtendedApi) => {
  return {
    // Initial state
    suggestedNewTopics: [],
    selectedNewTopicsForConfirmation: [],
    confirmedNewLearningTargets: [],
    isLoadingSuggestedTopics: false,
    errorLoadingSuggestedTopics: null,
    isConfirmingTopics: false,
    errorConfirmingTopics: null,
    pendingTopics: [],

    // Actions
    loadSuggestedNewTopics: async (
      courseId: string,
      lessonContext: string,
      existingTopicNames: string[] = []
    ) => {
      try {
        // API call
        const suggestedTopics = await learningTargetService.detectNewTopics(
          courseId,
          lessonContext,
          existingTopicNames
        );

        set((state) => ({
          ...state,
          suggestedNewTopics: suggestedTopics,
          isLoadingSuggestedTopics: false
        }));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';

        set((state) => ({
          ...state,
          suggestedNewTopics: [],
          isLoadingSuggestedTopics: false,
          errorLoadingSuggestedTopics: errorMessage
        }));
      }
    },    
    
    toggleTopicForConfirmation: (topicName: string) => {
      const currentSelected = get().selectedNewTopicsForConfirmation;
      const isCurrentlySelected = currentSelected.includes(topicName);

      set((state) => {
        // Create a new array based on whether the topic is already selected
        const newSelectedTopics = isCurrentlySelected 
          // Konu seçili ise, listeden çıkar (If selected, remove from list)
          ? state.selectedNewTopicsForConfirmation.filter(name => name !== topicName)
          // Konu seçili değilse, listeye ekle (If not selected, add to list)
          : [...state.selectedNewTopicsForConfirmation, topicName];
          
        return {
          ...state,
          selectedNewTopicsForConfirmation: newSelectedTopics
        };
      });
    },

    // Use simple function instead of trackAction for type safety
    clearSuggestedTopics: () => {
      set((state) => ({
        ...state,
        suggestedNewTopics: [],
        selectedNewTopicsForConfirmation: []
      }));
    },

    // Use simple function instead of trackAction for type safety
    confirmSelectedTopics: async (courseId: string): Promise<boolean> => {
      const selectedTopics = get().selectedNewTopicsForConfirmation;
      
      if (selectedTopics.length === 0) {
        const errorMessage = 'Onaylanacak konu seçilmedi';
        set((state) => ({
          ...state,
          errorConfirmingTopics: errorMessage
        }));

        return false;
      }

      // Loading state başlat (Start loading state)
      set((state) => ({
        ...state,
        isConfirmingTopics: true,
        errorConfirmingTopics: null
      }));

      try {
        const confirmedTargets = await learningTargetService.confirmNewTopics(
          courseId,
          selectedTopics
        );

        // Return the updated state object as required by Zustand
        set((state) => ({
          ...state,
          confirmedNewLearningTargets: confirmedTargets,
          selectedNewTopicsForConfirmation: [],
          suggestedNewTopics: [],
          isConfirmingTopics: false,
          errorConfirmingTopics: null
          // Başarılı onaylama sonrası temizlik (cleanup after successful confirmation)
        }));

        return true;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        
        set((state) => ({
          ...state,
          isConfirmingTopics: false,
          errorConfirmingTopics: errorMessage
        }));

        return false;
      }
    },

    // Use simple function instead of trackAction for type safety
    resetNewTopicsState: () => {
      set((state) => ({
        ...state,
        suggestedNewTopics: [],
        selectedNewTopicsForConfirmation: [],
        confirmedNewLearningTargets: [],
        isLoadingSuggestedTopics: false,
        errorLoadingSuggestedTopics: null,
        isConfirmingTopics: false,
        errorConfirmingTopics: null,
        pendingTopics: []
      }));
    },

    // Bekleyen konuları ayarla
    setPendingTopics: (topicNames) =>
      set((state) => {
        state.pendingTopics = topicNames.map((name) => ({
          name,
          status: 'BEKLEMEDE',
        }));
      }),

    // Bekleyen konuları temizle
    clearPendingTopics: () =>
      set((state) => {
        state.pendingTopics = [];
      }),
  };
};

// Immer ile TrackedStore oluştur
export const useNewTopicsStore = create<NewTopicsStore>()(immer(newTopicsStoreImpl as any));

// Selector hooks
export const useNewTopicsLoading = () => {
  const { isLoadingSuggestedTopics, isConfirmingTopics } = useNewTopicsStore();
  return isLoadingSuggestedTopics || isConfirmingTopics;
};

export const useNewTopicsErrors = () => {
  const { errorLoadingSuggestedTopics, errorConfirmingTopics } = useNewTopicsStore();
  return {
    loadingError: errorLoadingSuggestedTopics,
    confirmingError: errorConfirmingTopics,
    hasError: !!(errorLoadingSuggestedTopics || errorConfirmingTopics)
  };
};

export const useSelectedTopicsCount = () => {
  const { selectedNewTopicsForConfirmation } = useNewTopicsStore();
  return selectedNewTopicsForConfirmation.length;
};

export const useCanConfirmTopics = () => {
  const { selectedNewTopicsForConfirmation, isConfirmingTopics } = useNewTopicsStore();
  return selectedNewTopicsForConfirmation.length > 0 && !isConfirmingTopics;
};
