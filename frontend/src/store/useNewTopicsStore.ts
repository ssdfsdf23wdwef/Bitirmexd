import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { LearningTarget } from "@/types/learningTarget.type";
import learningTargetService from "@/services/learningTarget.service";

/**
 * Yeni Konular State arayüzü
 */
interface NewTopicsState {
  suggestedNewTopics: string[];
  selectedNewTopicsForConfirmation: string[];
  confirmedNewLearningTargets: LearningTarget[];
  
  isLoadingSuggestedTopics: boolean;
  errorLoadingSuggestedTopics: string | null;
  isConfirmingTopics: boolean;
  errorConfirmingTopics: string | null;

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

/**
 * Combined interface (State + Actions)
 */
interface NewTopicsStore extends NewTopicsState, NewTopicsActions {}

// Store exportu - Doğrudan create ile immer kullan
export const useNewTopicsStore = create<NewTopicsStore>()(
  immer((set, get) => ({
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
      set((state) => {
        state.isLoadingSuggestedTopics = true;
        state.errorLoadingSuggestedTopics = null;
      });

      try {
        const suggestedTopics = await learningTargetService.detectNewTopics(
          courseId,
          lessonContext,
          existingTopicNames
        );

        set((state) => {
          state.suggestedNewTopics = suggestedTopics;
          state.isLoadingSuggestedTopics = false;
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';

        set((state) => {
          state.suggestedNewTopics = [];
          state.isLoadingSuggestedTopics = false;
          state.errorLoadingSuggestedTopics = errorMessage;
        });
      }
    },
    
    toggleTopicForConfirmation: (topicName: string) => {
      set((state) => {
        const currentIndex = state.selectedNewTopicsForConfirmation.indexOf(topicName);
        if (currentIndex >= 0) {
          // Konu seçili ise, listeden çıkar
          state.selectedNewTopicsForConfirmation.splice(currentIndex, 1);
        } else {
          // Konu seçili değilse, listeye ekle
          state.selectedNewTopicsForConfirmation.push(topicName);
        }
      });
    },

    clearSuggestedTopics: () => {
      set((state) => {
        state.suggestedNewTopics = [];
        state.selectedNewTopicsForConfirmation = [];
      });
    },

    confirmSelectedTopics: async (courseId: string): Promise<boolean> => {
      const selectedTopics = get().selectedNewTopicsForConfirmation;
      
      if (selectedTopics.length === 0) {
        return false;
      }

      set((state) => {
        state.isConfirmingTopics = true;
        state.errorConfirmingTopics = null;
      });      try {
        const confirmedTargets = await learningTargetService.confirmNewTopics(
          courseId,
          selectedTopics
        );

        set((state) => {
          state.confirmedNewLearningTargets = confirmedTargets;
          state.selectedNewTopicsForConfirmation = [];
          state.isConfirmingTopics = false;
        });

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Onaylama sırasında hata oluştu';

        set((state) => {
          state.isConfirmingTopics = false;
          state.errorConfirmingTopics = errorMessage;
        });

        return false;
      }
    },

    resetNewTopicsState: () => {
      set((state) => {
        state.suggestedNewTopics = [];
        state.selectedNewTopicsForConfirmation = [];
        state.confirmedNewLearningTargets = [];
        state.isLoadingSuggestedTopics = false;
        state.errorLoadingSuggestedTopics = null;
        state.isConfirmingTopics = false;
        state.errorConfirmingTopics = null;
        state.pendingTopics = [];
      });
    },

    setPendingTopics: (topicNames: string[]) => {
      set((state) => {
        state.pendingTopics = topicNames.map(name => ({
          name,
          status: 'BEKLEMEDE' as const
        }));
      });
    },

    clearPendingTopics: () => {
      set((state) => {
        state.pendingTopics = [];
      });
    }
  }))
);

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
