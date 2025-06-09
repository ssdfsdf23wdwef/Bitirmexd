/**
 * @file logger.utils.ts
 * @description Frontend loglama yardımcı fonksiyonları
 */

import { FlowTrackerService, FlowCategory as TrackerFlowCategory } from '../services/flow-tracker.service';
import { LoggerService } from '../services/logger.service';
import { FlowCategory } from "@/constants/logging.constants";

let loggerInstance: any | null = null;
let flowTrackerInstance: FlowTrackerService | null = null;

export function mapToTrackerCategory(category: FlowCategory): TrackerFlowCategory {
  switch(category) {
    case FlowCategory.API:
      return TrackerFlowCategory.API;
    case FlowCategory.Auth:
      return TrackerFlowCategory.Auth;
    case FlowCategory.Error:
      return TrackerFlowCategory.Error;
    case FlowCategory.Navigation:
      return TrackerFlowCategory.Navigation;
    case FlowCategory.Component:
      return TrackerFlowCategory.Component;
    case FlowCategory.State:
      return TrackerFlowCategory.State;
    case FlowCategory.Render:
      return TrackerFlowCategory.Render;
    case FlowCategory.User:
      return TrackerFlowCategory.User;
    case FlowCategory.Business:
      return TrackerFlowCategory.Custom;
    case FlowCategory.Custom:
    default:
      return TrackerFlowCategory.Custom;
  }
}

/**
 * Dosya adını yoldan çıkarır
 * @param filePath Dosya yolu
 * @returns Dosya adı
 */
export function extractFileName(filePath: string): string {
  if (!filePath) return 'unknown';
  const parts = filePath.split(/[\/\\]/);
  return parts[parts.length - 1];
}

/**
 * Logger servisini kurar
 * @param options Logger servisi opsiyonları
 * @returns LoggerService instance
 */
export function setupLogger(options?: any): any {
  // Ensure we're in client-side environment
  if (typeof window === 'undefined') {
    // Return a mock logger for SSR
    return {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      logLearningTarget: () => {},
      setConfig: () => {},
      getConfig: () => ({}),
      getLogHistory: () => [],
      clearHistory: () => {},
      clearAllLogs: () => {},
      getAllErrorLogs: () => '',
    } as any;
  }

  try {
    // Use the imported LoggerService directly for client-side
    loggerInstance = LoggerService.getInstance();
    if (options && loggerInstance) {
      loggerInstance.setConfig(options);
    }
    return loggerInstance;
  } catch (error) {
    console.error('[setupLogger] Error initializing logger:', error);
    // Return a fallback logger
    return {
      info: (msg: string, ctx: string) => console.info(`[${ctx}] ${msg}`),
      warn: (msg: string, ctx: string) => console.warn(`[${ctx}] ${msg}`),
      error: (msg: string, ctx: string) => console.error(`[${ctx}] ${msg}`),
      debug: (msg: string, ctx: string) => console.debug(`[${ctx}] ${msg}`),
      logLearningTarget: (msg: string) => console.info(`[LEARNING] ${msg}`),
      setConfig: () => {},
      getConfig: () => ({}),
      getLogHistory: () => [],
      clearHistory: () => {},
      clearAllLogs: () => {},
      getAllErrorLogs: () => '',
    } as any;
  }
}

/**
 * FlowTracker servisini kurar
 * @param options FlowTracker servisi opsiyonları
 * @returns FlowTrackerService instance
 */
export function setupFlowTracker(options?: any): FlowTrackerService {
  // Ensure we're in client-side environment
  if (typeof window === 'undefined') {
    // Return a mock flow tracker for SSR
    return {
      trackStep: () => {},
      trackTiming: () => {},
      trackComponent: () => {},
      trackStateChange: () => {},
      trackApiCall: () => {},
      trackUserInteraction: () => {},
      startSequence: () => '',
      endSequence: () => undefined,
      markStart: () => {},
      markEnd: () => {},
      configure: () => {},
      getSteps: () => [],
      getSequences: () => [],
      clearHistory: () => {},
      getAllFlowLogs: () => '',
      clearAllLogs: () => {}
    } as any;
  }

  try {
    flowTrackerInstance = FlowTrackerService.getInstance();
    return flowTrackerInstance;
  } catch (error) {
    console.error('[setupFlowTracker] Error initializing flow tracker:', error);
    // Return a fallback flow tracker
    return {
      trackStep: (category: any, message: string, context: string) => 
        console.log(`[FLOW] [${category}] [${context}] ${message}`),
      trackTiming: () => {},
      trackComponent: () => {},
      trackStateChange: () => {},
      trackApiCall: () => {},
      trackUserInteraction: () => {},
      startSequence: () => '',
      endSequence: () => undefined,
      markStart: () => {},
      markEnd: () => {},
      configure: () => {},
      getSteps: () => [],
      getSequences: () => [],
      clearHistory: () => {},
      getAllFlowLogs: () => '',
      clearAllLogs: () => {}
    } as any;
  }
}

/**
 * Logger ve FlowTracker servislerini yükler
 * @returns Logger ve FlowTracker instanları
 */
export function setupLogging(options?: {
  loggerOptions?: any;
  flowTrackerOptions?: any;
}) {
  // Sırayla LoggerService ve FlowTrackerService'i başlat
  const logger = setupLogger(options?.loggerOptions);
  const flowTracker = setupFlowTracker(options?.flowTrackerOptions);
  
  return { logger, flowTracker };
}

/**
 * Logger instance alır, yoksa oluşturur
 * @returns LoggerService instance
 */
export function getLogger(): any | null {
  if (!loggerInstance) {
    try {
      // Check if we're in SSR environment
      if (typeof window === 'undefined') {
        // Server-side: create a mock logger that just console logs
        loggerInstance = {
          info: (msg: string, ctx: string, file?: string, line?: string, meta?: any) => {
            // Silent in SSR to avoid noise
          },
          warn: (msg: string, ctx: string, file?: string, line?: string, meta?: any) => {
            // Silent in SSR to avoid noise
          },
          error: (msg: string, ctx: string, file?: string, line?: string, meta?: any) => {
            // Silent in SSR to avoid noise
          },
          debug: (msg: string, ctx: string, file?: string, line?: string, meta?: any) => {
            // Silent in SSR to avoid noise
          },
          logLearningTarget: (msg: string, ...args: any[]) => {
            // Silent in SSR to avoid noise
          },
          getLogHistory: () => [],
          clearHistory: () => {},
          clearAllLogs: () => {},
          getAllErrorLogs: () => '',
        } as any;
        return loggerInstance;
      }

      // Use the imported LoggerService directly
      loggerInstance = LoggerService.getInstance();
    } catch (error) {
      // Client-side: create a minimal fallback logger
      loggerInstance = {
        info: (msg: string, ctx: string, file?: string, line?: string, meta?: any) => console.info(`[${ctx}] ${msg}`, meta || ''),
        warn: (msg: string, ctx: string, file?: string, line?: string, meta?: any) => console.warn(`[${ctx}] ${msg}`, meta || ''),
        error: (msg: string, ctx: string, file?: string, line?: string, meta?: any) => console.error(`[${ctx}] ${msg}`, meta || ''),
        debug: (msg: string, ctx: string, file?: string, line?: string, meta?: any) => console.debug(`[${ctx}] ${msg}`, meta || ''),
        logLearningTarget: (msg: string, ...args: any[]) => console.info(`[LEARNING] ${msg}`, ...args),
        getLogHistory: () => [],
        clearHistory: () => {},
        clearAllLogs: () => {},
        getAllErrorLogs: () => '',
        setConfig: () => {},
        getConfig: () => ({})
      } as any;
    }
  }
  return loggerInstance;
}

/**
 * FlowTracker instance alır, yoksa oluşturur
 * @returns FlowTrackerService instance or null in SSR
 */
export function getFlowTracker(): FlowTrackerService | null {
  if (!flowTrackerInstance) {
    try {
      flowTrackerInstance = FlowTrackerService.getInstance();
    } catch (error) {
      // If FlowTrackerService is not available (SSR case), create a mock instance
      if (typeof window === 'undefined') {
        // Server-side: create a minimal mock flow tracker
        flowTrackerInstance = {
          trackStep: () => {},
          trackTiming: () => {},
          trackComponent: () => {},
          trackStateChange: () => {},
          trackApiCall: () => {},
          trackUserInteraction: () => {},
          startSequence: () => '',
          endSequence: () => undefined,
          markStart: () => {},
          markEnd: () => {},
          configure: () => {},
          getSteps: () => [],
          getSequences: () => [],
          clearHistory: () => {},
          getAllFlowLogs: () => '',
          clearAllLogs: () => {}
        } as any;
      } else {
        console.error('[FlowTracker] FlowTracker initialization failed:', error);
        // Create a minimal client-side fallback
        flowTrackerInstance = {
          trackStep: (category: any, message: string, context: string) => 
            console.log(`[FLOW] [${category}] [${context}] ${message}`),
          trackTiming: () => {},
          trackComponent: () => {},
          trackStateChange: () => {},
          trackApiCall: () => {},
          trackUserInteraction: () => {},
          startSequence: () => '',
          endSequence: () => undefined,
          markStart: () => {},
          markEnd: () => {},
          configure: () => {},
          getSteps: () => [],
          getSequences: () => [],
          clearHistory: () => {},
          getAllFlowLogs: () => '',
          clearAllLogs: () => {}
        } as any;
      }
    }
  }
  return flowTrackerInstance;
}

/**
 * Global hata yakalama kurulumu
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') {
    return; // SSR'da çalışmaz
  }
  
  console.info('[ErrorHandler] Global hata yakalama aktif.');
}

/**
 * Yeni bir akış başlatır
 * @param category Akış kategorisi
 * @param name Akış adı
 * @returns FlowTracker instance
 */
export function startFlow(category: FlowCategory, name: string): any {
  if (flowTrackerInstance) {
    const flowId = flowTrackerInstance.startSequence(name);
    return { id: flowId, category, name };
  } else {
    const flowId = `flow_dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.warn(`[FlowTracker Utils] FlowTrackerService başlatılmamış. Akış başlatılıyor: ${name} (dummy ID: ${flowId})`);
    return { id: flowId, category, name };
  }
}
