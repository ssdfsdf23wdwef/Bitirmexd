import { FlowCategory } from '../services/flow-tracker.service';
import { LoggerService } from '../services/logger.service';
import { FlowTrackerService } from '../services/flow-tracker.service';
import { safeStringify } from '../utils/logger.utils';

// Logger ve Flow Tracker singleton instance'ları
const logger = LoggerService.getInstance();
const flowTracker = FlowTrackerService.getInstance();

/**
 * Metod çağrılarını otomatik olarak loglayan decorator
 * Bu decorator, bir metodun başlangıcını ve bitişini otomatik olarak izler.
 * Ayrıca hatalar oluştuğunda bunları otomatik olarak loglar.
 *
 * @param options Loglama seçenekleri
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @LogMethod()
 * async findAll(): Promise<User[]> {
 *   // ...
 * }
 *
 * @LogMethod({ trackParams: true, trackResult: true })
 * async findById(id: string): Promise<User> {
 *   // ...
 * }
 * ```
 */
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
                (arg.socket || arg.req || arg.headers)
              ) {
                params[`arg${index}`] = '[Circular Object]';
              } else {
                params[`arg${index}`] = arg;
              }
              return params;
            }, {});
          } catch (serializeError) {
            safeParams = { error: 'Serialization Error' };
            logger.warn(
              `Metot argümanları serileştirilemedi: ${serializeError.message}`,
              context,
              __filename,
              '63',
            );
          }
        }

        // Metot başlangıcını kaydet
        flowTracker.trackMethodStart(
          methodName,
          className,
          trackParams && safeParams
            ? safeStringify(safeParams, 500)
            : undefined,
        );

        // Metot çalıştırma
        logger.debug(`${methodName} çağrıldı`, context, __filename, '70');
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
                  logger.warn(
                    `Metot sonucu serileştirilemedi: ${error.message}`,
                    context,
                    __filename,
                    '85',
                  );
                }
              }

              // Metot bitişini kaydet
              flowTracker.trackMethodEnd(
                methodName,
                className,
                duration,
                trackReturn ? returnValue : undefined,
              );

              return resolvedResult;
            },
            (error) => {
              // Error case for async
              logger.logError(error, context, __filename, '100', {
                args:
                  trackParams && safeParams
                    ? safeStringify(safeParams, 200)
                    : 'Not tracked',
              });

              flowTracker.trackError(
                `${methodName} hatası: ${error.message}`,
                className,
              );
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
              logger.warn(
                `Metot sonucu serileştirilemedi: ${error.message}`,
                context,
                __filename,
                '85',
              );
            }
          }

          // Metot bitişini kaydet
          flowTracker.trackMethodEnd(
            methodName,
            className,
            duration,
            trackReturn ? returnValue : undefined,
          );

          return result;
        }
      } catch (error) {
        // Hata durumunda loglama
        logger.logError(error, context, __filename, '100', {
          args:
            trackParams && safeParams
              ? safeStringify(safeParams, 200)
              : 'Not tracked',
        });

        // Hata mesajını izle
        flowTracker.trackError(
          `${methodName} hatası: ${error.message}`,
          className,
        );
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
