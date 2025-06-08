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
    pendingTopics: [],    // Actions
    loadSuggestedNewTopics: async (
      courseId: string,
      lessonContext: string,
      existingTopicNames: string[] = []
    ) => {
      console.group('🎯 [NewTopicsStore] loadSuggestedNewTopics - BAŞLADI');
      console.log('📋 Parametreler:', {
        courseId,
        lessonContextLength: lessonContext.length,
        existingTopicNamesCount: existingTopicNames.length,
        existingTopicNames: existingTopicNames.slice(0, 5), // İlk 5 konu
        timestamp: new Date().toISOString()
      });

      set((state) => {
        console.log('🔄 State güncelleniyor: Loading başlatılıyor');
        state.isLoadingSuggestedTopics = true;
        state.errorLoadingSuggestedTopics = null;
      });

      try {
        console.log('🔍 API çağrısı yapılıyor...');
        const startTime = performance.now();
        
        const suggestedTopics = await learningTargetService.detectNewTopics(
          courseId,
          lessonContext,
          existingTopicNames
        );

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log('✅ API başarılı! Sonuçlar:', {
          suggestedTopicsCount: suggestedTopics.length,
          suggestedTopics: suggestedTopics.slice(0, 10), // İlk 10 konu
          duration: `${duration.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });

        set((state) => {
          console.log('🔄 State güncelleniyor: Başarılı sonuç kaydediliyor');
          state.suggestedNewTopics = suggestedTopics;
          state.isLoadingSuggestedTopics = false;
        });

        console.log('🎉 loadSuggestedNewTopics BAŞARIYLA TAMAMLANDI');

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        
        console.error('❌ API HATASI:', {
          error,
          errorMessage,
          errorStack: error instanceof Error ? error.stack : 'Stack yok',
          courseId,
          lessonContextLength: lessonContext.length,
          existingTopicNamesCount: existingTopicNames.length,
          timestamp: new Date().toISOString()
        });

        set((state) => {
          console.log('🔄 State güncelleniyor: Hata durumu kaydediliyor');
          state.suggestedNewTopics = [];
          state.isLoadingSuggestedTopics = false;
          state.errorLoadingSuggestedTopics = errorMessage;
        });

        console.error('💥 loadSuggestedNewTopics HATA İLE SONLANDI');
      } finally {
        console.groupEnd();
      }
    },
      toggleTopicForConfirmation: (topicName: string) => {
      console.group('🔄 [NewTopicsStore] toggleTopicForConfirmation - BAŞLADI');
      console.log('📋 Parametreler:', {
        topicName,
        timestamp: new Date().toISOString()
      });

      const currentState = get();
      const currentIndex = currentState.selectedNewTopicsForConfirmation.indexOf(topicName);
      const isCurrentlySelected = currentIndex >= 0;

      console.log('🔍 Mevcut durum:', {
        isCurrentlySelected,
        currentIndex,
        currentSelectedCount: currentState.selectedNewTopicsForConfirmation.length,
        currentSelectedTopics: currentState.selectedNewTopicsForConfirmation,
        allSuggestedTopics: currentState.suggestedNewTopics
      });

      set((state) => {
        const updatedIndex = state.selectedNewTopicsForConfirmation.indexOf(topicName);
        if (updatedIndex >= 0) {
          // Konu seçili ise, listeden çıkar
          console.log('➖ Konu listeden çıkarılıyor:', topicName);
          state.selectedNewTopicsForConfirmation.splice(updatedIndex, 1);
        } else {
          // Konu seçili değilse, listeye ekle
          console.log('➕ Konu listeye ekleniyor:', topicName);
          state.selectedNewTopicsForConfirmation.push(topicName);
        }

        console.log('✅ Güncellenmiş seçili konular:', {
          newSelectedCount: state.selectedNewTopicsForConfirmation.length,
          newSelectedTopics: state.selectedNewTopicsForConfirmation,
          action: updatedIndex >= 0 ? 'REMOVED' : 'ADDED'
        });
      });

      console.log('🎉 toggleTopicForConfirmation TAMAMLANDI');
      console.groupEnd();
    },    clearSuggestedTopics: () => {
      console.group('🧹 [NewTopicsStore] clearSuggestedTopics - BAŞLADI');
      
      const currentState = get();
      console.log('📋 Temizlenecek veriler:', {
        suggestedTopicsCount: currentState.suggestedNewTopics.length,
        suggestedTopics: currentState.suggestedNewTopics,
        selectedTopicsCount: currentState.selectedNewTopicsForConfirmation.length,
        selectedTopics: currentState.selectedNewTopicsForConfirmation,
        timestamp: new Date().toISOString()
      });

      set((state) => {
        console.log('🔄 State temizleniyor...');
        state.suggestedNewTopics = [];
        state.selectedNewTopicsForConfirmation = [];
        console.log('✅ State temizlendi');
      });

      console.log('🎉 clearSuggestedTopics TAMAMLANDI');
      console.groupEnd();
    },    confirmSelectedTopics: async (courseId: string): Promise<boolean> => {
      console.group('✅ [NewTopicsStore] confirmSelectedTopics - BAŞLADI');
      
      const selectedTopics = get().selectedNewTopicsForConfirmation;
      console.log('📋 Parametreler:', {
        courseId,
        selectedTopicsCount: selectedTopics.length,
        selectedTopics: selectedTopics,
        timestamp: new Date().toISOString()
      });
      
      if (selectedTopics.length === 0) {
        console.warn('⚠️ Hiç konu seçilmemiş, işlem iptal ediliyor');
        console.groupEnd();
        return false;
      }

      console.log('🔄 State güncelleniyor: Onaylama başlatılıyor');
      set((state) => {
        state.isConfirmingTopics = true;
        state.errorConfirmingTopics = null;
      });

      try {
        console.log('🔍 API çağrısı yapılıyor...');
        const startTime = performance.now();
        
        const confirmedTargets = await learningTargetService.confirmNewTopics(
          courseId,
          selectedTopics
        );

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log('✅ API başarılı! Sonuçlar:', {
          confirmedTargetsCount: confirmedTargets.length,
          confirmedTargets: confirmedTargets.map(t => ({ id: t.id, name: t.name })),
          duration: `${duration.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });

        set((state) => {
          console.log('🔄 State güncelleniyor: Başarılı sonuç kaydediliyor');
          state.confirmedNewLearningTargets = confirmedTargets;
          state.selectedNewTopicsForConfirmation = [];
          state.isConfirmingTopics = false;
        });

        console.log('🎉 confirmSelectedTopics BAŞARIYLA TAMAMLANDI');
        console.groupEnd();
        return true;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Onaylama sırasında hata oluştu';
        
        console.error('❌ ONAYLAMA HATASI:', {
          error,
          errorMessage,
          errorStack: error instanceof Error ? error.stack : 'Stack yok',
          courseId,
          selectedTopicsCount: selectedTopics.length,
          selectedTopics,
          timestamp: new Date().toISOString()
        });

        set((state) => {
          console.log('🔄 State güncelleniyor: Hata durumu kaydediliyor');
          state.isConfirmingTopics = false;
          state.errorConfirmingTopics = errorMessage;
        });

        console.error('💥 confirmSelectedTopics HATA İLE SONLANDI');
        console.groupEnd();
        return false;
      }
    },    resetNewTopicsState: () => {
      console.group('🔄 [NewTopicsStore] resetNewTopicsState - BAŞLADI');
      
      const currentState = get();
      console.log('📋 Sıfırlanacak state:', {
        suggestedTopicsCount: currentState.suggestedNewTopics.length,
        selectedTopicsCount: currentState.selectedNewTopicsForConfirmation.length,
        confirmedTargetsCount: currentState.confirmedNewLearningTargets.length,
        pendingTopicsCount: currentState.pendingTopics.length,
        isLoadingSuggestedTopics: currentState.isLoadingSuggestedTopics,
        isConfirmingTopics: currentState.isConfirmingTopics,
        hasLoadingError: !!currentState.errorLoadingSuggestedTopics,
        hasConfirmingError: !!currentState.errorConfirmingTopics,
        timestamp: new Date().toISOString()
      });

      set((state) => {
        console.log('🔄 Tüm state değerleri sıfırlanıyor...');
        state.suggestedNewTopics = [];
        state.selectedNewTopicsForConfirmation = [];
        state.confirmedNewLearningTargets = [];
        state.isLoadingSuggestedTopics = false;
        state.errorLoadingSuggestedTopics = null;
        state.isConfirmingTopics = false;
        state.errorConfirmingTopics = null;
        state.pendingTopics = [];
        console.log('✅ Tüm state değerleri sıfırlandı');
      });

      console.log('🎉 resetNewTopicsState TAMAMLANDI');
      console.groupEnd();
    },    setPendingTopics: (topicNames: string[]) => {
      console.group('📝 [NewTopicsStore] setPendingTopics - BAŞLADI');
      console.log('📋 Parametreler:', {
        topicNamesCount: topicNames.length,
        topicNames: topicNames,
        timestamp: new Date().toISOString()
      });

      const currentState = get();
      console.log('🔍 Mevcut pending topics:', {
        currentPendingCount: currentState.pendingTopics.length,
        currentPendingTopics: currentState.pendingTopics
      });

      set((state) => {
        console.log('🔄 Pending topics ayarlanıyor...');
        state.pendingTopics = topicNames.map(name => ({
          name,
          status: 'BEKLEMEDE' as const
        }));
        
        console.log('✅ Yeni pending topics:', {
          newPendingCount: state.pendingTopics.length,
          newPendingTopics: state.pendingTopics
        });
      });

      console.log('🎉 setPendingTopics TAMAMLANDI');
      console.groupEnd();
    },    clearPendingTopics: () => {
      console.group('🧹 [NewTopicsStore] clearPendingTopics - BAŞLADI');
      
      const currentState = get();
      console.log('📋 Temizlenecek pending topics:', {
        currentPendingCount: currentState.pendingTopics.length,
        currentPendingTopics: currentState.pendingTopics,
        timestamp: new Date().toISOString()
      });

      set((state) => {
        console.log('🔄 Pending topics temizleniyor...');
        state.pendingTopics = [];
        console.log('✅ Pending topics temizlendi');
      });

      console.log('🎉 clearPendingTopics TAMAMLANDI');
      console.groupEnd();
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
