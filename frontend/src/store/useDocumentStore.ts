import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createTrackedStore } from "./zustand.middleware";
import { getLogger, getFlowTracker } from "../lib/logger.utils";
import type { LoggerService } from "../services/logger.service";
import type { FlowTrackerService } from "../services/flow-tracker.service";
interface DocumentState {
  // State
  isLoading: boolean; // Sadece UI state (örn: mutation loading) için kullanılabilir
  selectedDocumentId: string | null;

  // Actions
  setSelectedDocument: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  resetStore: () => void;
}

// Logger ve flowTracker nesnelerini lazy-load et (SSR safe)
let logger: LoggerService | null = null;
let flowTracker: FlowTrackerService | null = null;

function getLoggerInstance() {
  if (!logger) {
    logger = getLogger();
  }
  return logger;
}

function getFlowTrackerInstance() {
  if (!flowTracker) {
    flowTracker = getFlowTracker();
  }
  return flowTracker;
}

// DocumentStore implementasyonu
const documentStoreImpl = (set, get, api) => {
  // İzlenen aksiyonlar
  return {
    // Initial state
    isLoading: false,
    selectedDocumentId: null,

    // Actions
    setSelectedDocument: api.trackAction('setSelectedDocument', (id) => {
      getLoggerInstance().debug(
        `Seçili belge değiştiriliyor: ${id}`,
        'DocumentStore.setSelectedDocument',
        'useDocumentStore.ts',
        30
      );
      
      getFlowTrackerInstance().trackStateChange(
        'selectedDocumentId', 
        'DocumentStore', 
        get().selectedDocumentId, 
        id
      );
      
      set((state) => {
        state.selectedDocumentId = id;
      });
    }),

    setIsLoading: api.trackAction('setIsLoading', (loading) => {
      getLoggerInstance().debug(
        `Yükleme durumu değiştiriliyor: ${loading}`,
        'DocumentStore.setIsLoading',
        'useDocumentStore.ts',
        47
      );
      
      set((state) => {
        state.isLoading = loading;
      });
    }),

    resetStore: api.trackAction('resetStore', () => {
      getLoggerInstance().debug(
        'Document store sıfırlanıyor',
        'DocumentStore.resetStore',
        'useDocumentStore.ts',
        58
      );
      
      getFlowTrackerInstance().trackStep(
        'State', 
        'Belge store sıfırlandı', 
        'DocumentStore'
      );
      
      set((state) => {
        state.isLoading = false;
        state.selectedDocumentId = null;
      });
    }),
  };
};

// Immer ile TrackedStore oluştur
export const useDocumentStore = createTrackedStore<DocumentState, typeof create>(
  create,
  'DocumentStore',
  {
    enableLogging: true,
    enablePerformance: true,
    additionalMiddlewares: [immer]
  }
)(documentStoreImpl);
