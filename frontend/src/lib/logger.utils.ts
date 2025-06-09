/**
 * @file logger.utils.ts
 * @description Frontend loglama yardımcı fonksiyonları
 */

import { FlowTrackerService, FlowCategory as TrackerFlowCategory } from '../services/flow-tracker.service';
import LoggerService from '../services/logger.service';
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
function extractFileName(filePath: string): string {
  if (!filePath) return 'unknown';
  const parts = filePath.split(/[\/\\]/);
  return parts[parts.length - 1];
}

/**
 * Logger servisini kurar
 * @param options Logger servisi opsiyonları
 * @returns LoggerService instance
 */
function setupLogger(options?: any): any {
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
  }  try {
    // Try to get the LoggerService instance
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
function setupFlowTracker(options?: any): FlowTrackerService {
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
      }      // Try to use the LoggerService
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
 * Akış izleme fonksiyonu - FlowTracker servisini kullanarak akış adımlarını izler
 * @param message Akış mesajı
 * @param context Akış konteksti (dosya adı veya bileşen adı)
 * @param category Akış kategorisi
 * @param metadata Ek metadata
 */
export function trackFlow(
  message: string,
  context: string,
  category: FlowCategory,
  metadata?: any
): void {
  try {
    const flowTracker = getFlowTracker();
    if (flowTracker) {
      const trackerCategory = mapToTrackerCategory(category);
      flowTracker.trackStep(trackerCategory, message, context);
      
      // Logger'a da kaydet
      const logger = getLogger();
      if (logger) {
        logger.info(`[FLOW] ${message}`, context, undefined, undefined, metadata);
      }
    }
  } catch (error) {
    // Fallback to console logging if services are not available
    console.log(`[FLOW] [${category}] [${context}] ${message}`, metadata || '');
  }
}

/**
 * Yeni bir akış başlatır
 * @param category Akış kategorisi
 * @param name Akış adı
 * @returns FlowTracker instance
 */
export function startFlow(category: FlowCategory, name: string): any {
  const flowTracker = getFlowTracker();
  
  if (flowTracker) {
    const flowId = flowTracker.startSequence(name);
    return {
      id: flowId,
      category,
      name,
      trackStep: (message: string, metadata?: any) => {
        const trackerCategory = mapToTrackerCategory(category);
        flowTracker.trackStep(trackerCategory, message, `Flow:${name}`, {
          flowId,
          flowName: name,
          ...metadata
        });
      },
      end: (summary?: string) => {
        const trackerCategory = mapToTrackerCategory(category);
        flowTracker.trackStep(
          trackerCategory,
          summary || `Flow tamamlandı: ${name}`,
          `Flow:${name}`,
          {
            flowId,
            flowName: name,
            status: 'completed'
          }
        );
        flowTracker.endSequence(flowId);
      }
    };
  } else {
    const flowId = `flow_dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.warn(`[FlowTracker Utils] FlowTrackerService başlatılmamış. Akış başlatılıyor: ${name} (dummy ID: ${flowId})`);
    return {
      id: flowId,
      category,
      name,
      trackStep: (message: string, metadata?: any) => {
        console.log(`[FLOW] [${category}] [Flow:${name}] ${message}`, metadata || '');
      },
      end: (summary?: string) => {
        console.log(`[FLOW] [${category}] [Flow:${name}] ${summary || 'Flow tamamlandı'}`);
      }
    };
  }
}

// Add exports for logInfo, logDebug, and prettyLogError

/**
 * Bilgilendirme mesajı loglar
 * @param message Log mesajı
 * @param context Log konteksti (dosya adı veya bileşen adı)
 * @param file Dosya adı (otomatik olarak alınır)
 * @param line Satır numarası (otomatik olarak alınır)
 * @param metadata Ek metadata
 */
export function logInfo(
  message: string,
  context: string,
  file?: string,
  line?: string,
  metadata?: any
): void {
  try {
    const logger = getLogger();
    if (logger) {
      logger.info(message, context, file, line, metadata);
    }
  } catch (error) {
    // Fallback to console logging if logger is not available
    console.info(`[INFO] [${context}] ${message}`, metadata || '');
  }
}

/**
 * Hata ayıklama mesajı loglar
 * @param message Log mesajı
 * @param context Log konteksti (dosya adı veya bileşen adı)
 * @param file Dosya adı (otomatik olarak alınır)
 * @param line Satır numarası (otomatik olarak alınır)
 * @param metadata Ek metadata
 */
function logDebug(
  message: string,
  context: string,
  file?: string,
  line?: string,
  metadata?: any
): void {
  try {
    const logger = getLogger();
    if (logger) {
      logger.debug(message, context, file, line, metadata);
    }
  } catch (error) {
    // Fallback to console logging if logger is not available
    console.debug(`[DEBUG] [${context}] ${message}`, metadata || '');
  }
}

/**
 * Hata mesajını loglar ve opsiyonel olarak kullanıcıya gösterir
 * @param error Hata nesnesi
 * @param context Hata konteksti (dosya adı veya bileşen adı)
 * @param metadata Ek metadata
 * @param showErrorToast Kullanıcıya toast mesajı gösterilsin mi?
 */
export function prettyLogError(
  error: Error,
  context: string,
  metadata?: any,
  showErrorToast = false
): void {
  try {
    const logger = getLogger();
    if (logger) {
      logger.error(error.message, context, undefined, undefined, {
        stack: error.stack,
        ...metadata,
      });
    }

    if (showErrorToast) {
      // ErrorService.showToast(error.message, "error"); // ErrorService dependency removed to avoid circular deps
      console.error(`[Toast Error] ${error.message}`); // Fallback to console
    }
  } catch (loggingError) {
    // Fallback to console logging if logger is not available
    console.error(`[ERROR] [${context}] ${error.message}`, {
      stack: error.stack,
      ...metadata,
      loggingError,
    });
  }
}
