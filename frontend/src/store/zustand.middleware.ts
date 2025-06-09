
import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { getLogger, getFlowTracker } from '../lib/logger.utils';
import { FlowCategory } from '../services/flow-tracker.service';


export type Middleware<T> = (
  config: StateCreator<T, [], [], T>
) => StateCreator<T, [], [], T>;

/**
 * Immer destekli middleware tipi
 */
export type ImmerMiddleware<T> = (
  config: StateCreator<T, [], [["zustand/immer", never]], T>
) => StateCreator<T, [], [["zustand/immer", never]], T>;

/**
 * Generic middleware that works with any mutators
 */
export type GenericMiddleware<T, M extends [StoreMutatorIdentifier, unknown][] = []> = (
  config: StateCreator<T, [], M, T>
) => StateCreator<T, [], M, T>;


export const loggerMiddleware = <T extends object>(storeName: string): Middleware<T> => {
  return (config) => (
    set: Parameters<StateCreator<T, [], []>>[0],
    get: Parameters<StateCreator<T, [], []>>[1],
    api: Parameters<StateCreator<T, [], []>>[2]
  ) => {
    const logger = getLogger();
    const flowTracker = getFlowTracker();
     return config(
      (
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        replace?: boolean
      ) => {
        const previousState = get();
        
        // Handle the overloaded set function properly
        if (replace === true) {
          set(partial as T, replace);
        } else {
          set(partial, replace);
        }
        
        const nextState = get();
        
        // Değişimleri belirle
        const changes: Record<string, { from: unknown; to: unknown }> = {};
        const isPartialFunction = typeof partial === 'function';
        const updatedKeys: string[] = [];
        
        // Safely access object properties with proper typing
Object.keys(nextState as Record<string, unknown>).forEach((key) => {
          const prevState = previousState as Record<string, unknown>;
          const currentState = nextState as Record<string, unknown>;
          
          if (prevState[key] !== currentState[key]) {
            changes[key] = { from: prevState[key], to: currentState[key] };
            updatedKeys.push(key);
          }
        });
        
        // Akış izleme
        flowTracker.trackStateChange(
          storeName,
          'ZustandStore',
          previousState,
          nextState
        );
        
        // Loglama
        logger.debug(
          `Store degisimi: ${JSON.stringify(changes)}`,
          'ZustandStore',
          'zustand.middleware.ts',
        );
        
    
        
        return nextState;
      },
      get,
      api
    );
  };
};

/**
 * Performans izleme middleware
 * Store aksiyonlarının çalışma süresini ölçer
 * @param storeName Store adı
 * @returns Middleware
 */
export const performanceMiddleware = <T extends object>(storeName: string): Middleware<T> => {
 return (
    config: StateCreator<T, [], [], T>
  ) => (
    set: any,
    get: any,
    api: any
  ) => {
    const logger = getLogger();
    const flowTracker = getFlowTracker();
    
    // Store işlem sayacı
    let actionCounter = 0;
    
    // Yeni API - Aksiyonları izlemek için imzalanmış metodlar ekler
    const trackedApi = Object.assign({}, api, {
      // Track fonksiyonu ekle
       trackAction: <Args extends unknown[], Return>(
        actionName: string,
        fn: (...args: Args) => Return
      ): ((...args: Args) => Return) => {
        return ((...args: Args) => {
          actionCounter++;
          const actionId = `${storeName}:${actionName}:${actionCounter}`;
          
          // İşlem başlangıcını işaretle
          flowTracker.markStart(actionId);
          
          try {
            // İşlemi çalıştır
            const result = fn(...args);
            
            // Promise ise asenkron olarak ölç
            if (result instanceof Promise) {              return result.then(
                // Başarılı
                (value) => {
                  const duration = flowTracker.markEnd(actionId, FlowCategory.State, `${storeName}.${actionName}`);
                  
                  return value;
                },
                // Hata
                (error) => {
                  
                  throw error;
                }
              );
            }            
            // Senkron işlem
            
            return result;
          } catch (error) {
            // Hata durumunda
            
            throw error;
          }
            }) as (...args: Args) => Return;

      }
    });
    
    // Set, get ve izlenen api ile store'u oluştur
    // @ts-ignore - Düzeltilmiş API için tip uyarısını yoksay
    return config(set, get, trackedApi);
  };
};

/**
 * Durumu localStorage'a kaydetme middleware'i
 * Sayfalar arası durum aktarımı için
 * @param storeName Store adı
 * @param whitelist Kaydedilecek alan isimleri (opsiyonel)
 * @returns Middleware
 */
export const persistMiddleware = <T extends object>(
  storeName: string,
  whitelist?: (keyof T)[]
): Middleware<T> => {
  return (
    config: StateCreator<T, [], [], T>
  ) => (
    set: Parameters<StateCreator<T, [], []>>[0],
    get: Parameters<StateCreator<T, [], []>>[1],
    api: Parameters<StateCreator<T, [], []>>[2]
  ) => {
    // İlk yüklemede localStorage'dan verileri al
    const localStorageKey = `zustand_${storeName}`;
    const logger = getLogger();
    
    // Tarayıcı ortamı kontrolü
    const isBrowser = typeof window !== 'undefined';
    
    try {
      // Yalnızca tarayıcı ortamında localStorage'a erişim sağla
      if (isBrowser) {
        const persistedState = localStorage.getItem(localStorageKey);
        
        if (persistedState) {
          const parsed = JSON.parse(persistedState) as Partial<T>;
          
          // Başlangıç durumunu al
          const initialState = config(set, get, api) as T;
          
          // Sadece whitelist'te belirtilen alanları al
          const filteredState = whitelist 
            ? Object.fromEntries(
                Object.entries(parsed).filter(([key]) => 
                  whitelist.includes(key as keyof T)
                )
              ) 
            : parsed;
          
          // Birleştirilmiş durumu set et
          set({ ...initialState, ...filteredState });
        }
      }    } catch (error) {
      logger.error(
        `Durum geri yükleme hatası: ${storeName}`,
        'persistMiddleware',
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        { error }
      );
    }
      return config(
      (
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        replace?: boolean
      ) => {
        // Handle the overloaded set function properly 
        if (replace === true) {
          set(partial as T, replace);
        } else {
          set(partial, replace);
        }
        
        // Sonra güncel durumu localStorage'a kaydet (sadece tarayıcı ortamında)
        if (isBrowser) {
          try {
            const state = get();
            
            // Sadece whitelist'te belirtilen alanları kaydet
            const filteredState = whitelist
              ? Object.fromEntries(
                  Object.entries(state).filter(([key]) => 
                    whitelist.includes(key as keyof T)
                  )
                )
              : state;
            
            localStorage.setItem(localStorageKey, JSON.stringify(filteredState));
          } catch (error) {
            
          }
        }
      },
      get,
      api
    );
  };
};

/**
 * Çoklu middleware uygulama yardımcısı
 * @param middlewares Uygulanacak middleware'ler
 * @returns Tek birleştirilmiş middleware
 */
export const composeMiddlewares = <T extends object>(
  middlewares: Middleware<T>[]
): Middleware<T> => {
  return (config) => 
    middlewares.reduce(
      (acc, middleware) => middleware(acc), 
      config
    );
};

/**
 * Zustand store oluşturucu fabrika fonksiyonu
 * Standart middleware'leri otomatik olarak ekler
 * @param createStore Store oluşturucu fonksiyon
 * @param storeName Store adı
 * @param options Opsiyonlar
 * @returns Middleware'ler eklenmiş store oluşturucu
 */
export const createTrackedStore = <
  T extends object,
  M extends [StoreMutatorIdentifier, unknown][] = [],
  U extends (config: StateCreator<T, [], M, T>) => any = (config: StateCreator<T, [], M, T>) => any
>(
  createStore: U,
  storeName: string,
  options?: {
    enableLogging?: boolean;
    enablePersist?: boolean;
    persistWhitelist?: (keyof T)[];
    enablePerformance?: boolean;
    additionalMiddlewares?: GenericMiddleware<T, M>[];
  }
) => {
  const {
    enableLogging = process.env.NODE_ENV !== 'production',
    enablePersist = false,
    persistWhitelist,
    enablePerformance = process.env.NODE_ENV !== 'production',
    additionalMiddlewares = []
  } = options || {};
  
  // Uygulanacak middleware'leri topla
  const middlewares: GenericMiddleware<T, M>[] = [];
  
  if (enableLogging) {
    middlewares.push(loggerMiddleware(storeName) as GenericMiddleware<T, M>);
  }
  
  if (enablePerformance) {
    middlewares.push(performanceMiddleware(storeName) as GenericMiddleware<T, M>);
  }
  
  if (enablePersist) {
    middlewares.push(persistMiddleware(storeName, persistWhitelist) as GenericMiddleware<T, M>);
  }
  
  // Kullanıcının eklediği middleware'leri ekle
  middlewares.push(...additionalMiddlewares);
  
  // Tüm middleware'leri uygula
  const composeGenericMiddlewares = <T extends object, M extends [StoreMutatorIdentifier, unknown][] = []>(
    middlewares: GenericMiddleware<T, M>[]
  ): GenericMiddleware<T, M> => {
    return (config) => 
      middlewares.reduce(
        (acc, middleware) => middleware(acc), 
        config
      );
  };
  
  const composedMiddleware = composeGenericMiddlewares(middlewares);
  
  // Store oluşturucu fonksiyonunu döndür
  return (storeCreator: StateCreator<T, [], M, T>) => {
     return createStore(
      composedMiddleware(
        (
          set: any,
          get: any,
          api: any
        ) => {
      // Store initi izle
      const flowTracker = getFlowTracker();
      const logger = getLogger();
      
      logger.info(
        `${storeName} store başlatıldı`,
        'createTrackedStore',
        undefined,
        undefined,
        { storeName }
      );
      
     flowTracker?.trackStep(
        FlowCategory.State,
        `${storeName} store başlatıldı`,
        'ZustandStore'
      );
      
      // Store'un gerçek implementasyonunu çağır
      return {
        _storeName: storeName,
        ...storeCreator(set, get, api)
      };
    }));
  };
};