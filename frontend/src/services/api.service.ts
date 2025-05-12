import axios, { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";
import { auth } from "@/app/firebase/config";
import { ErrorService } from "./errorService";
import { LoggerService } from "./logger.service";
import { FlowTrackerService } from "./flow-tracker.service";
import { getLogger, getFlowTracker } from "../lib/logger.utils";
  
/**
 * API temel URL'si
 * 
 * Öncelik sırası:
 * 1. .env.local dosyasında tanımlanmış NEXT_PUBLIC_API_URL 
 * 2. localStorage'da kaydedilmiş API URL (kullanıcı tarafından değiştirilmiş)
 * 3. Varsayılan değer: http://localhost:3001/api
 */
let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Hata ayıklama için API URL logla
console.log("🔍 API URL:", API_URL);

// LocalStorage'da kayıtlı API URL kontrolü - sadece istemci tarafında çalışırken
if (typeof window !== "undefined") {
  const savedApiUrl = localStorage.getItem("api_base_url");
  if (savedApiUrl) {
    API_URL = savedApiUrl;
    console.log("🔄 LocalStorage'dan alınan API URL:", API_URL);
  }
}

// API istek konfigürasyonu
const DEFAULT_TIMEOUT = 15000; // 15 saniye
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000; // 1 saniye

/**
 * Axios instance oluşturma
 * Temel HTTP isteklerini yönetir
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // HttpOnly cookie kullanımı için CORS destekli istekler
  timeout: DEFAULT_TIMEOUT,
});

/**
 * Kullanılabilir API URL'ini kontrol eden fonksiyon
 * Mevcut API URL'ini kontrol eder, çalışmıyorsa alternatif portları dener
 * @param retryPorts Port taraması yapılıp yapılmayacağı
 * @returns Çalışan API URL'i
 */
export const checkApiAvailability = async (
  retryPorts = true,
): Promise<string> => {
  const logger = getLogger();
  const flowTracker = getFlowTracker();
  
  flowTracker.trackStep('API', 'API erişilebilirlik kontrolü başladı', 'checkApiAvailability');
  
  try {
    // Mevcut API_URL ile kontrol
    const startTime = performance.now();
    await axios.get(`${API_URL}/health`, { timeout: 3000 });
    const endTime = performance.now();
    
    logger.info(
      `API bağlantısı başarılı: ${API_URL}, ${Math.round(endTime - startTime)}ms`,
      'checkApiAvailability',
      __filename,
      44
    );
    
    flowTracker.trackStep('API', 'API erişilebilirlik kontrolü başarılı', 'checkApiAvailability');
    return API_URL; // Mevcut URL çalışıyor
  } catch (error) {
    logger.warn(
      `API bağlantı hatası: ${API_URL}, ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      'checkApiAvailability',
      __filename,
      54
    );
    
    flowTracker.trackStep('API', 'API erişilebilirlik kontrolü başarısız', 'checkApiAvailability', {
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
    
    if (!retryPorts) return API_URL; // Tekrar deneme kapalıysa mevcut URL'i döndür

    // Backend çalışıyor mu kontrol et - bunu sadece geliştirme ortamında yap
    if (process.env.NODE_ENV === "development") {
      // Port tarama - 3001, 3002, 3003, 3004, 3005 portlarını dene
      const baseUrl = API_URL.replace(/:\d+\/api$/, ""); // localhost kısmını al
      const portsToTry = [3001, 3002, 3003, 3004, 3005];

      logger.info(
        `Alternatif portlar deneniyor: ${portsToTry.join(', ')}`,
        'checkApiAvailability',
        __filename,
        72
      );

      for (const port of portsToTry) {
        const testUrl = `${baseUrl}:${port}/api`;
        try {
          flowTracker.trackStep('API', `Port ${port} deneniyor`, 'checkApiAvailability');
          await axios.get(`${testUrl}/health`, { timeout: 2000 });
          
          logger.info(
            `Çalışan API URL'i bulundu: ${testUrl}`,
            'checkApiAvailability',
            __filename,
            83
          );
          
          flowTracker.trackStep('API', `Port ${port} başarılı`, 'checkApiAvailability');

          // Çalışan URL'i güncelle ve kaydet
          API_URL = testUrl;
          if (typeof window !== "undefined") {
            localStorage.setItem("api_base_url", testUrl);
          }

          // apiClient'ın baseURL'ini güncelle
          axiosInstance.defaults.baseURL = testUrl;

          return testUrl;
        } catch (portError) {
          logger.debug(
            `Port ${port} erişilemez: ${portError instanceof Error ? portError.message : 'Bilinmeyen hata'}`,
            'checkApiAvailability',
            __filename,
            102
          );
          flowTracker.trackStep('API', `Port ${port} erişilemez`, 'checkApiAvailability');
        }
      }

      // Hiçbir port çalışmıyorsa kullanıcıya bildir
      const errorMsg = "API sunucusuna erişilemiyor. Lütfen backend servisinin çalıştığından emin olun.";
      logger.error(
        errorMsg,
        'checkApiAvailability',
        __filename,
        113
      );
      
      flowTracker.trackStep('API', 'Tüm portlar başarısız', 'checkApiAvailability');
      
      if (typeof window !== "undefined") {
        ErrorService.showToast(errorMsg, "error");
      }
    } else {
      // Production ortamında sadece log mesajı
      logger.warn(
        `API bağlantı hatası: ${API_URL}`,
        'checkApiAvailability',
        __filename,
        126
      );
    }
    
    return API_URL; // Varsayılan URL'i döndür
  }
};

// Retry mekanizması
const retryRequest = async <T>(
  fn: () => Promise<T>, 
  retries = MAX_RETRY_COUNT, 
  delay = RETRY_DELAY,
  retryCondition?: (error: unknown) => boolean
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    // Eğer retry yapma koşulu belirtilmişse ve koşul sağlanmıyorsa hata fırlat
    if (retryCondition && !retryCondition(error)) {
      throw error;
    }
    
    // Yeniden deneme hakkı kalmadıysa hata fırlat
    if (retries <= 0) {
      throw error;
    }
    
    // Belirli bir süre bekle
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Tekrar dene - her denemede hata kodu veya mesaj loglanabilir
    return retryRequest(fn, retries - 1, delay, retryCondition);
  }
};

// Uygulama yüklendiğinde API URL'ini kontrol et - sadece tarayıcı ortamında ve geliştirme modunda
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  checkApiAvailability().then((workingUrl) => {
    console.log(`🌐 Aktif API URL: ${workingUrl}`);
  });
}

/**
 * Token yönetimi için değişkenler
 */
const TOKEN_CACHE = {
  token: null as string | null,
  expiresAt: 0, // Token'ın geçerlilik süresi (milisaniye)
  isRefreshing: false, // Token yenileme işlemi devam ediyor mu?
  lastRefreshAttempt: 0, // Son yenileme denemesi zamanı
  waitingPromise: null as Promise<string | null> | null, // Devam eden token isteği
};

/**
 * Kimlik doğrulama token'ını alma fonksiyonu
 * Firebase kullanıcısından ID token alır veya önbellekten döndürür
 * @returns Firebase ID Token
 */
const getAuthToken = async (): Promise<string | null> => {
  const now = Date.now();

  // Eğer başka bir token yenileme işlemi devam ediyorsa, o işlemin tamamlanmasını bekle
  if (TOKEN_CACHE.isRefreshing && TOKEN_CACHE.waitingPromise) {
    try {
      return await TOKEN_CACHE.waitingPromise;
    } catch (error) {
      console.warn("Token yenileme işlemi başarısız:", error);
      // Hata durumunda yeni bir token isteği başlatmak için devam et
    }
  }

  // Önbellekteki token hala geçerliyse kullan
  if (TOKEN_CACHE.token && TOKEN_CACHE.expiresAt > now) {
    return TOKEN_CACHE.token;
  }

  // Rate limiting - son token isteğinden sonra en az 5 saniye bekle
  if (now - TOKEN_CACHE.lastRefreshAttempt < 5000) {
    console.log(
      "🚫 Token istekleri çok sık yapılıyor, önbellekteki token kullanılıyor",
    );
    // Önbellekteki token varsa kullan, yoksa localStorage'dan oku
    return TOKEN_CACHE.token || localStorage.getItem("auth_token");
  }

  // Token yenileme işlemi başlat
  TOKEN_CACHE.isRefreshing = true;
  TOKEN_CACHE.lastRefreshAttempt = now;

  // Yeni bir token isteği başlat ve önbelleğe kaydet
  TOKEN_CACHE.waitingPromise = (async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // Kullanıcı yoksa localStorage'dan token'ı dene
        TOKEN_CACHE.token = localStorage.getItem("auth_token");
        return TOKEN_CACHE.token;
      }

      // Firebase'den token al
      const token = await currentUser.getIdToken(true);

      // Token'ı önbelleğe kaydet
      TOKEN_CACHE.token = token;

      // Token süresini 50 dakika olarak ayarla (Firebase token'ları genelde 1 saat geçerli)
      TOKEN_CACHE.expiresAt = now + 50 * 60 * 1000;

      return token;
    } catch (error) {
      console.error("Token alma hatası:", error);

      // Hata durumunda localStorage'dan token'ı dene
      TOKEN_CACHE.token = localStorage.getItem("auth_token");
      return TOKEN_CACHE.token;
    } finally {
      // Token yenileme işlemini sonlandır
      TOKEN_CACHE.isRefreshing = false;
      TOKEN_CACHE.waitingPromise = null;
    }
  })();

  return TOKEN_CACHE.waitingPromise;
};

// API istekleri için bekleyen istekler kuyruğu
// Token yenileme sırasında gelen istekleri saklayıp, token yenilenince otomatik tekrar eder
let isRefreshingToken = false;
const pendingRequests: Array<{
  config: AxiosRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// İstek interceptor'ı - her istekte token ekler
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Firebase ID token'ını al
      const token = await getAuthToken();

      if (token) {
        // Firebase ID token'ını Authorization header'ına ekle
        // Not: Backend, hem bu header'ı hem de HttpOnly cookie'leri destekler
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Kimlik doğrulama hatası:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Backend API'sinden dönen hata yanıtları için tip tanımı
interface ApiErrorResponse {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

// Cevap interceptor'ı - hata yönetimi ve token yenileme
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Original request config
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // API bağlantı hatası kontrol (ECONNREFUSED veya TIMEOUT)
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNABORTED" ||
      error.message?.includes("timeout")
    ) {
      console.error("API bağlantı hatası:", error.message);

      // API URL'ini kontrol et ve alternatif portları dene
      await checkApiAvailability();

      // Orijinal hatayı döndür
      return Promise.reject(error);
    }

    // Kimlik doğrulama hataları (401) ve token yenileme
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as { _retry?: boolean })._retry
    ) {
      // İstek daha önce yeniden denenmediyse ve login sayfasında değilse
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        // Token yenileme işlemi başlatılmamışsa
        if (!isRefreshingToken) {
          isRefreshingToken = true;
          console.warn("🔄 Kimlik doğrulama hatası (401), token yenileniyor...");

          try {
            // authService üzerinden token yenileme
            const authService = (await import("./auth.service")).default;
            const response = await authService.refreshToken();

            // Yeni token'ı kullanarak bekleyen tüm istekleri tekrar dene
            if (response.token) {
              console.log("✅ Token yenilendi, bekleyen istekler tekrar deneniyor...");
              
              // Bekleyen tüm istekleri yeni token ile tekrar dene
              pendingRequests.forEach(({ config, resolve, reject }) => {
                if (config.headers) {
                  config.headers.Authorization = `Bearer ${response.token}`;
                }
                axiosInstance(config).then(resolve).catch(reject);
              });
              
              // Kuyruk temizle
              pendingRequests.length = 0;

              // Mevcut isteği yeni token ile tekrar dene
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.token}`;
              }
              (originalRequest as { _retry?: boolean })._retry = true;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error("❌ Token yenilemesi başarısız:", refreshError);
            
            // Bekleyen tüm istekleri reddet
            pendingRequests.forEach(({ reject }) => {
              reject(new Error("Oturum süresi doldu - yeniden giriş yapmanız gerekiyor"));
            });
            
            // Kuyruk temizle
            pendingRequests.length = 0;

            // Kullanıcıyı logout yap ve login sayfasına yönlendir
            try {
              const authService = (await import("./auth.service")).default;
              await authService.signOut();
              
              // Zustand store'dan kullanıcıyı çıkış yap
              const { useAuthStore } = await import("@/store/auth.store");
              useAuthStore.getState().logoutUser();
              
              // Login sayfasına yönlendir
              if (typeof window !== 'undefined') {
                window.location.href = "/auth/login";
              }
            } catch (logoutError) {
              console.error("❌ Çıkış işlemi başarısız:", logoutError);
            }
          } finally {
            isRefreshingToken = false;
          }
        } else {
          // Token yenileme işlemi devam ediyorsa, bu isteği beklet
          return new Promise((resolve, reject) => {
            pendingRequests.push({
              config: originalRequest,
              resolve,
              reject,
            });
          });
        }
      }
    }

    // Diğer hataları olduğu gibi döndür
    return Promise.reject(error);
  },
);

/**
 * API istekleri için servis sınıfı
 * Tüm backend API çağrılarını buradan yapılır
 */
class ApiService {
  /**
   * Axios istemcisi
   */
  private readonly client: AxiosInstance;
  private logger: LoggerService;
  private flowTracker: FlowTrackerService;

  constructor(client: AxiosInstance) {
    this.client = client;
    this.logger = getLogger();
    this.flowTracker = getFlowTracker();
    
    this.logger.info(
      'ApiService başlatıldı',
      'ApiService.constructor',
      __filename,
      359
    );
  }

  /**
   * GET isteği atar
   * @param endpoint API endpoint
   * @param params URL parametreleri
   * @returns API cevabı
   */
  async get<T>(
    endpoint: string,
    params: Record<string, unknown> = {},
  ): Promise<T> {
    try {
      // API isteği başlangıcını izle
      this.flowTracker.trackApiCall(endpoint, 'GET', 'ApiService.get', { params });
      this.flowTracker.markStart(`GET_${endpoint}`);
      
      this.logger.debug(
        `GET isteği başlatıldı: ${endpoint}`,
        'ApiService.get',
        __filename,
        372,
        { params }
      );
      
      // Yeniden deneme stratejisi ile isteği yap
      return await retryRequest<T>(
        () => this.client.get<T>(endpoint, { params }).then(response => response.data),
        MAX_RETRY_COUNT,
        RETRY_DELAY,
        (error) => {
          // Sadece bağlantı hataları için yeniden dene
          return axios.isAxiosError(error) && 
            (error.code === 'ECONNABORTED' || 
             error.code === 'ECONNREFUSED' || 
             error.code === 'ERR_NETWORK' ||
             (error.response?.status && error.response?.status >= 500));
        }
      );
    } catch (error) {
      this.handleError(error, `GET ${endpoint}`);
      throw error;
    }
  }

  /**
   * POST isteği atar
   * @param endpoint API endpoint
   * @param data Gönderilecek veri
   * @param config Axios konfigürasyonu
   * @returns API cevabı
   */
  async post<T>(
    endpoint: string,
    data: Record<string, unknown> | unknown[] = {},
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      // API isteği başlangıcını izle
      this.flowTracker.trackApiCall(endpoint, 'POST', 'ApiService.post', { dataSize: JSON.stringify(data).length });
      this.flowTracker.markStart(`POST_${endpoint}`);
      
      this.logger.debug(
        `POST isteği başlatıldı: ${endpoint}`,
        'ApiService.post',
        __filename,
        410,
        { dataKeys: typeof data === 'object' ? Object.keys(data) : 'array' }
      );
      
      const response = await this.client.post<T>(endpoint, data, config);
      
      // İstek tamamlandı ölçümü
      this.flowTracker.markEnd(`POST_${endpoint}`, 'API', 'ApiService.post');
      this.logger.debug(
        `POST isteği tamamlandı: ${endpoint}`,
        'ApiService.post',
        __filename,
        420,
        { status: response.status }
      );
      
      return response.data;
    } catch (error) {
      this.handleError(error, `POST ${endpoint}`);
      throw error;
    }
  }

  /**
   * PUT isteği atar
   * @param endpoint API endpoint
   * @param data Gönderilecek veri
   * @returns API cevabı
   */
  async put<T>(
    endpoint: string,
    data: Record<string, unknown> | unknown[] = {},
  ): Promise<T> {
    try {
      // API isteği başlangıcını izle
      this.flowTracker.trackApiCall(endpoint, 'PUT', 'ApiService.put', { dataSize: JSON.stringify(data).length });
      this.flowTracker.markStart(`PUT_${endpoint}`);
      
      this.logger.debug(
        `PUT isteği başlatıldı: ${endpoint}`,
        'ApiService.put',
        __filename,
        447,
        { dataKeys: typeof data === 'object' ? Object.keys(data) : 'array' }
      );
      
      const response = await this.client.put<T>(endpoint, data);
      
      // İstek tamamlandı ölçümü
      this.flowTracker.markEnd(`PUT_${endpoint}`, 'API', 'ApiService.put');
      this.logger.debug(
        `PUT isteği tamamlandı: ${endpoint}`,
        'ApiService.put',
        __filename,
        457,
        { status: response.status }
      );
      
      return response.data;
    } catch (error) {
      this.handleError(error, `PUT ${endpoint}`);
      throw error;
    }
  }

  /**
   * DELETE isteği atar
   * @param endpoint API endpoint
   * @returns API cevabı
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      // API isteği başlangıcını izle
      this.flowTracker.trackApiCall(endpoint, 'DELETE', 'ApiService.delete');
      this.flowTracker.markStart(`DELETE_${endpoint}`);
      
      this.logger.debug(
        `DELETE isteği başlatıldı: ${endpoint}`,
        'ApiService.delete',
        __filename,
        478
      );
      
      const response = await this.client.delete<T>(endpoint);
      
      // İstek tamamlandı ölçümü
      this.flowTracker.markEnd(`DELETE_${endpoint}`, 'API', 'ApiService.delete');
      this.logger.debug(
        `DELETE isteği tamamlandı: ${endpoint}`,
        'ApiService.delete',
        __filename,
        487,
        { status: response.status }
      );
      
      return response.data;
    } catch (error) {
      this.handleError(error, `DELETE ${endpoint}`);
      throw error;
    }
  }

  /**
   * API hatalarını işleyen fonksiyon
   * @param error Hata nesnesi
   * @param context Hata içeriği
   */
  private handleError(error: unknown, context: string): void {
    // API hatalarını logla
    this.logger.error(
      `API hatası: ${context}`,
      'ApiService.handleError',
      __filename,
      508,
      { error: this.formatError(error) }
    );
    
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const errorData = error.response?.data as ApiErrorResponse;
      const errorMessage = Array.isArray(errorData?.message)
        ? errorData?.message[0]
        : errorData?.message || error.message;

      if (status === 401 || status === 403) {
        // Yetki hatası, kullanıcı oturumunu kontrol et
        this.logger.warn(
          `Yetkilendirme hatası: ${status}`,
          'ApiService.handleError',
          __filename,
          521,
          { endpoint: error.config?.url }
        );
        
        // Kullanıcıya bildir
        ErrorService.showToast(
          "Yetki hatası: Lütfen tekrar giriş yapın",
          "error"
        );
      } else {
        // Kullanıcıya hata mesajı göster, hassas bilgileri filtrelenmiş haliyle
        ErrorService.showToast(errorMessage, "error");
      }
    } else {
      this.flowTracker.trackStep('API', 'Beklenmeyen API hatası', 'ApiService.handleError', {
        error: typeof error === 'object' ? (error as Error).message : String(error)
      });
      
      // Bilinmeyen hata durumu
      ErrorService.showToast(
        "İşlem sırasında beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        "error"
      );
    }
  }
  
  /**
   * Hata nesnesini formatlar
   * @param error Hata nesnesi
   * @returns Formatlı hata bilgisi
   */
  private formatError(error: unknown): Record<string, unknown> {
    if (error instanceof AxiosError) {
      return {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        errorData: error.response?.data,
      };
    }
    
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    return {
      error: String(error)
    };
  }
}

// -----------------
// EXPORTS
// -----------------

// Standart HTTP istemcisi (axios instance)
export const httpClient = axiosInstance;

// API Servisi - CRUD operasyonları için
const apiService = new ApiService(httpClient);
export default apiService;

// Not: apiClient kullanımı artık desteklenmiyor.
// @deprecated Kullanılmamalı - Bunun yerine httpClient kullanın.
