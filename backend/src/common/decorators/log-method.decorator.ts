import { FlowCategory } from '../services/flow-tracker.service';
import { LoggerService } from '../services/logger.service';
import { FlowTrackerService } from '../services/flow-tracker.service';
import { safeStringify } from '../utils/logger.utils';

// Güvenli logger getter - null check ile
function getLogger() {
  try {
    return LoggerService.getInstance();
  } catch (error) {
    console.warn('[LogMethod] Logger alınamadı:', error);
    return null;
  }
}

// Güvenli flow tracker getter - null check ile  
function getFlowTracker() {
  try {
    return FlowTrackerService.getInstance();
  } catch (error) {
    console.warn('[LogMethod] FlowTracker alınamadı:', error);
    return null;
  }
}

export function LogMethod(
  options: {
    trackParams?: boolean;
    trackReturn?: boolean;
    trackPerformance?: boolean;
    trackResult?: boolean;
  } = {},
) {
  const {
    trackParams = true,
    trackReturn = false,
    trackPerformance = true,
    trackResult = false,
  } = options;

  return function (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const className = target.constructor.name;
      const context = `${className}.${methodName}`;
      const startTime = trackPerformance ? Date.now() : 0;
      
      // Logger ve FlowTracker'ı güvenli şekilde al
      const logger = getLogger();
      const flowTracker = getFlowTracker();
      
      let safeParams: Record<string, any> | undefined;

      try {
        // Safeleştirilmiş argümanlar
        if (trackParams) {
          try {
            // Serileştirilebilir objeleri güvenli şekilde dönüştür
            safeParams = args.reduce((params, arg, index) => {
              // HTTP request/response gibi döngüsel yapıları içeren objeleri atla
              if (
                arg &&
                typeof arg === 'object' &&
                (arg.socket || arg.req || arg.headers || arg.response || arg.request)
              ) {
                params[`arg${index}`] = '[HTTP Object]';
              } else if (arg && typeof arg === 'object') {
                // Diğer objeler için güvenli serialization
                try {
                  JSON.stringify(arg);
                  params[`arg${index}`] = arg;
                } catch {
                  params[`arg${index}`] = '[Complex Object]';
                }
              } else {
                params[`arg${index}`] = arg;
              }
              return params;
            }, {});
          } catch (serializeError) {
            safeParams = { error: 'Serialization Error' };
          }
        }

        // Metot başlangıcını logla (sadece logger varsa)
        if (logger) {
          try {
            logger.debug(
              `Metot başlangıcı: ${context}`,
              'LogMethod',
              __filename,
              76,
              safeParams ? { paramCount: Object.keys(safeParams).length } : undefined
            );
          } catch (logError) {
            // Log hatası durumunda sadece basit mesaj
            logger.debug(
              `Metot başlangıcı: ${context}`,
              'LogMethod',
              __filename,
              76
            );
          }
        }

        // Flow tracking başlat (sadece flowTracker varsa)
        if (flowTracker) {
          flowTracker.trackCategory(FlowCategory.Custom, `${context} başladı`, 'LogMethod');
        }

        const result = originalMethod.apply(this, args);

        // Check if result is a Promise
        if (result instanceof Promise) {
          return result.then(
            (resolvedResult) => {
              // Success case for async
              const duration = trackPerformance ? Date.now() - startTime : 0;
              let returnValue;

              if (trackReturn) {
                try {
                  returnValue = safeStringify(resolvedResult, 500);
                } catch (error) {
                  returnValue = 'Serialization Error';
                }
              }

              // Başarılı tamamlanmayı logla (sadece logger varsa)
              if (logger) {
                logger.debug(
                  `Metot tamamlandı (async): ${context}`,
                  'LogMethod',
                  __filename,
                  100,
                  { duration, returnValue }
                );
              }

              // Flow tracking tamamla (sadece flowTracker varsa)
              if (flowTracker) {
                flowTracker.trackCategory(FlowCategory.Custom, `${context} tamamlandı (${duration}ms)`, 'LogMethod');
              }

              return resolvedResult;
            },
            (error) => {
              // Error case for async
              const duration = trackPerformance ? Date.now() - startTime : 0;
              
              // Hatayı logla (sadece logger varsa)
              if (logger) {
                logger.error(
                  `Metot hatası (async): ${context}`,
                  'LogMethod',
                  __filename,
                  118,
                  error,
                  { duration }
                );
              }

              // Flow tracking hatayı kaydet (sadece flowTracker varsa)
              if (flowTracker) {
                flowTracker.trackCategory(FlowCategory.Error, `${context} hatası: ${error.message}`, 'LogMethod');
              }

              throw error;
            },
          );
        } else {
          // Synchronous method handling
          const duration = trackPerformance ? Date.now() - startTime : 0;
          let returnValue;

          if (trackReturn) {
            try {
              returnValue = safeStringify(result, 500);
            } catch (error) {
              returnValue = 'Serialization Error';
            }
          }

          // Başarılı tamamlanmayı logla (sadece logger varsa)
          if (logger) {
            logger.debug(
              `Metot tamamlandı (sync): ${context}`,
              'LogMethod',
              __filename,
              147,
              { duration, returnValue }
            );
          }

          // Flow tracking tamamla (sadece flowTracker varsa)
          if (flowTracker) {
            flowTracker.trackCategory(FlowCategory.Custom, `${context} tamamlandı (${duration}ms)`, 'LogMethod');
          }

          return result;
        }
      } catch (error) {
        const duration = trackPerformance ? Date.now() - startTime : 0;
        
        // Hatayı logla (sadece logger varsa)
        if (logger) {
          logger.error(
            `Metot hatası (sync): ${context}`,
            'LogMethod',
            __filename,
            166,
            error,
            { duration }
          );
        }

        // Flow tracking hatayı kaydet (sadece flowTracker varsa)
        if (flowTracker) {
          flowTracker.trackCategory(FlowCategory.Error, `${context} hatası: ${error.message}`, 'LogMethod');
        }

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Bir fonksiyonun parametre isimlerini çıkarır
 * @param func Fonksiyon
 * @returns Parametre isimleri dizisi
 */
function getParamNames(func: Function): string[] {
  const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
  const ARGUMENT_NAMES = /([^\s,]+)/g;

  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  const result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .match(ARGUMENT_NAMES);

  return result || [];
}
