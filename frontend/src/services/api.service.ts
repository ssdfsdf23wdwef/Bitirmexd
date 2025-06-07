import axios, { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";
import { auth } from "@/app/firebase/config";
import { ErrorService } from "./error.service";
import { FlowCategory, FlowTrackerService } from "./flow-tracker.service"; 
import { getLogger, getFlowTracker } from "../lib/logger.utils";
import { LoggerService } from "./logger.service";

let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
// Hata ayıklama için API URL logla
console.log("🔍 API URL (başlangıç):", API_URL);

// LocalStorage'da kayıtlı API URL kontrolü - sadece istemci tarafında çalışırken
if (typeof window !== "undefined") {
  const savedApiUrl = localStorage.getItem("api_base_url");
  if (savedApiUrl) {
    API_URL = savedApiUrl;
    console.log("🔄 LocalStorage'dan alınan API URL:", API_URL);
  }
}

// API istek konfigürasyonu
const DEFAULT_TIMEOUT = 60000; // 30 saniye (daha uzun bir timeout)
const MAX_RETRY_COUNT = 5; // Daha fazla deneme
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
  withCredentials: true, // Cookie gönderimi için true yapın
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
  
  flowTracker.trackStep(FlowCategory.API, 'API erişilebilirlik kontrolü başladı', 'checkApiAvailability'); // Use FlowCategory
  
  const initialRetryDelay = 100; 
  const maxRetries = 8; 
  const backoffFactor = 1.2; 
  const maxDelay = 2000; 

  const portsToTry: { port: number; testUrl: string }[] = [
    { port: 3001, testUrl: 'http://localhost:3001/api' },
    { port: 3002, testUrl: 'http://localhost:3002/api' },
    { port: 8080, testUrl: 'http://localhost:8080/api' }, 
  ];

  const lastSuccessPort = localStorage.getItem('lastSuccessfulApiPort');
  const lastSuccessAPI = localStorage.getItem('lastSuccessfulApiUrl');

  if (lastSuccessPort && lastSuccessAPI && retryPorts) {
    try {
      const response = await axios.get(`${lastSuccessAPI}/health`, { timeout: 2000 });
      if (response.status >= 200 && response.status < 300) {
        logger.info(
          `Önceki başarılı API port\'u kullanıldı: ${lastSuccessPort}`,
          'checkApiAvailability',
  
        );
        API_URL = lastSuccessAPI;
        axiosInstance.defaults.baseURL = lastSuccessAPI;
        return lastSuccessAPI;
      }
    } catch (_error) {
    }
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const { port, testUrl } of portsToTry) {
      const currentAPI = testUrl;
      logger.info(
        `API deneniyor: ${currentAPI} (deneme ${attempt + 1}/${maxRetries})`,
        'checkApiAvailability',
      );
      try {
        const startTime = performance.now();
        const response = await axios.get(`${currentAPI}/health`, {
          timeout: attempt < 2 ? 1500 : 3000, 
        });
        const endTime = performance.now();

        if (response.status >= 200 && response.status < 300) {
          logger.info(
            `API bağlantısı başarılı: ${currentAPI}, ${Math.round(endTime - startTime)}ms`,
            'checkApiAvailability',
          );
          API_URL = currentAPI;
          axiosInstance.defaults.baseURL = currentAPI;
          localStorage.setItem('lastSuccessfulApiPort', port.toString());
          localStorage.setItem('lastSuccessfulApiUrl', currentAPI);
          return currentAPI;
        } else {
          logger.warn(
            `API yanıt verdi fakat durum kodu: ${response.status}`,
            'checkApiAvailability',
          );
        }
      } catch (error) {
        logger.warn(
          `Deneme ${attempt+1}/${maxRetries}: API bağlantı hatası: ${currentAPI}, ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
          'checkApiAvailability',
        );
      }
    }
    if (attempt < maxRetries - 1) {
      const delay = Math.min(initialRetryDelay * Math.pow(backoffFactor, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  if (retryPorts && portsToTry.length > 1) { 
    logger.info(
      `Alternatif portlar deneniyor: ${portsToTry.map(p => p.port).join(', ')}`,
      'checkApiAvailability',
    );
    for (const successfulPort of portsToTry) {
        if (successfulPort.testUrl === API_URL) continue; 
        try {
            const response = await axios.get(`${successfulPort.testUrl}/health`, { timeout: 2000 });
            if (response.status >= 200 && response.status < 300) {
                logger.info(
                    `Çalışan API URL\'i bulundu: ${successfulPort.testUrl}`,
                    'checkApiAvailability',
                );
                API_URL = successfulPort.testUrl;
                axiosInstance.defaults.baseURL = API_URL;
                localStorage.setItem('lastSuccessfulApiPort', successfulPort.port.toString());
                localStorage.setItem('lastSuccessfulApiUrl', API_URL);
                return API_URL;
            }
        } catch (error) {
          console.error('API kontrol hatası:', error);
        }
    }
  }

  const errorMsg = "API sunucusuna erişilemiyor. Lütfen backend servisinin çalıştığından emin olun.";
  ErrorService.showToast(errorMsg, "error");
  logger.error(errorMsg, 'checkApiAvailability', new Error(errorMsg)); // Pass an Error object
  flowTracker.trackStep(FlowCategory.API, 'Hiçbir API portu aktif değil!', 'checkApiAvailability'); // Use FlowCategory
  
  // This function must return a string as per its signature.
  // If no API is available after all checks, returning the initial/default API_URL 
  // or a specific error indicator URL might be appropriate.
  // For now, let's ensure it returns API_URL as it did before the error.
  return API_URL; 
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
    // Sadece önbellekteki Firebase ID token'ı kullan, localStorage session token'ı kullanma
    return TOKEN_CACHE.token;
  }

  // Token yenileme işlemi başlat
  TOKEN_CACHE.isRefreshing = true;
  TOKEN_CACHE.lastRefreshAttempt = now;

  // Yeni bir token isteği başlat ve önbelleğe kaydet
  TOKEN_CACHE.waitingPromise = (async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // Kullanıcı yoksa null döndür - localStorage session token'ı kullanma
        console.log("🚫 Firebase kullanıcısı bulunamadı, token alınamıyor");
        TOKEN_CACHE.token = null;
        return null;
      }

      // Firebase'den ID token al
      const token = await currentUser.getIdToken(true);

      // Token'ı önbelleğe kaydet
      TOKEN_CACHE.token = token;

      // Token süresini 50 dakika olarak ayarla (Firebase token'ları genelde 1 saat geçerli)
      TOKEN_CACHE.expiresAt = now + 50 * 60 * 1000;

      return token;
    } catch (error) {
      console.error("Firebase ID token alma hatası:", error);

      // Hata durumunda null döndür - localStorage session token'ı kullanma
      TOKEN_CACHE.token = null;
      return null;
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

      console.log(`🌐 API İsteği: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error("Kimlik doğrulama hatası:", error);
      return config;
    }
  },
  (error) => {
    console.error('❌ API istek hatası:', error.message);
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
  (response) => {
    console.log(`✅ API Yanıtı: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    if (error.message === 'Network Error') {
      console.error('🔄 Ağ hatası. Bağlantı tekrar deneniyor...');
      
      // API URL'ini kontrol et ve gerekirse güncelle
      try {
        const workingUrl = await checkApiAvailability();
        axiosInstance.defaults.baseURL = workingUrl;
        console.log(`🔄 API URL güncellendi: ${workingUrl}`);
      } catch (e) {
        console.error('❌ API URL güncellenemedi:', e);
      }
    }
    
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
            try {
              const response = await authService.refreshToken();

              // Yeni token'ı kullanarak bekleyen tüm istekleri tekrar dene
              if (response && response.token) {
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
              } else {
                throw new Error("Token yanıtında geçerli token bulunamadı");
              }
            } catch (refreshError) {
              console.error("❌ Token yenilemesi başarısız:", refreshError);
              
              // Bekleyen tüm istekleri reddet
              pendingRequests.forEach(({ reject }) => {
                reject(new Error("Oturum süresi doldu - yeniden giriş yapmanız gerekiyor"));
              });
              
              // Kuyruk temizle
              pendingRequests.length = 0;

              // Arka planda otomatik yeniden oturum açma mantığı
              try {
                console.log("🔄 Oturum yenileme işlemi başlatılıyor...");
                // Firebase/auth doğru şekilde import ediliyor
                const firebaseAuth = await import("firebase/auth");
                const { getAuth } = firebaseAuth;
                const auth = getAuth();

                // Mevcut Firebase kullanıcısını kontrol et
                const currentUser = auth.currentUser;
                if (currentUser) {
                  // Mevcut kullanıcıdan idToken alınmaya çalışılıyor
                  try {
                    // Mevcut ID token'ı al
                    const idToken = await currentUser.getIdToken(true);
                    console.log("✅ Firebase kimlik bilgileri ile otomatik giriş yapılıyor");
                    
                    // ID token ile oturum açma
                    await authService.loginWithIdToken(idToken);
                    console.log("✅ ID token ile oturum yenileme başarılı");
                    
                    // Mevcut isteği tekrar dene
                    if (originalRequest.headers) {
                      // Yeni token al
                      const token = await currentUser.getIdToken(true);
                      originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    (originalRequest as { _retry?: boolean })._retry = true;
                    return axiosInstance(originalRequest);
                  } catch (idTokenError) {
                    console.error("❌ ID token alınamadı:", idTokenError);
                  }
                }

              // Kullanıcıyı logout yap ve login sayfasına yönlendir
                await authService.signOut();
                
                // Zustand store'dan kullanıcıyı çıkış yap
                const { useAuthStore } = await import("@/store/auth.store");
                useAuthStore.getState().logoutUser();
                
                // Login sayfasına yönlendir
                if (typeof window !== 'undefined') {
                  console.log("🔐 Yeniden giriş sayfasına yönlendiriliyor");
                  
                  // Mevcut URL'i kaydet
                  const currentPath = window.location.pathname + window.location.search;
                  if (currentPath && !currentPath.includes('/auth/')) {
                    sessionStorage.setItem('redirectAfterLogin', currentPath);
                  }
                  
                  // Hızlı sınav URL'sindeyse sadece toast mesajı gösterelim, yönlendirme yapmayalım
                  if (currentPath.includes('/exams/quick') || 
                      (currentPath.includes('/exams/create') && currentPath.includes('type=quick'))) {
                    console.log("🔐 Hızlı sınav sayfasındayız, yönlendirme yapmadan uyarı göster");
                    const { toast } = await import("react-hot-toast");
                    toast.error("Oturum bilgileriniz güncellenemedi, ancak hızlı sınav için devam edebilirsiniz.");
                    
                    // Hatayı göster ama işlemi iptal etme, hızlı sınav için oturum gerektirmez
                    console.log("⚠️ Hızlı sınav için oturum hatası yok sayılıyor");
                    const quizError = new Error("Hızlı sınav için işleme devam ediliyor");
                    quizError.name = "QuickQuizSessionError";
                    
                    // Hızlı sınav için orijinal isteği token olmadan tekrar deneyelim
                    if (originalRequest.headers) {
                      delete originalRequest.headers.Authorization;
                    }
                    (originalRequest as { _retry?: boolean })._retry = true;
                    return axiosInstance(originalRequest);
                  } else {
                    // Normal durum - login sayfasına yönlendir
                    window.location.href = "/auth/login?session_expired=true";
                  }
                }
              } catch (logoutError) {
                console.error("❌ Çıkış işlemi başarısız:", logoutError);
              
              // Orijinal hatayı döndür
              return Promise.reject(error);
              }
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
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;

  constructor(client: AxiosInstance) {
    this.client = client;
    this.logger = getLogger();
    this.flowTracker = getFlowTracker();
    
    this.logger.info(
      'ApiService başlatıldı',
      'ApiService.constructor',
      0
    );
    
    this.flowTracker.trackStep(FlowCategory.API, 'ApiService başlatıldı', 'ApiService.constructor');
  }

  // Yardımcı metot: String mesajları Error nesnesine çevirir
  private createLogError(message: string): Error {
    return new Error(message);
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
    const startTime = performance.now();
    this.logger.debug(
      `GET ${endpoint} isteği başlatılıyor`,
      'ApiService.get',
    
    );
    
    this.flowTracker.trackStep(FlowCategory.API, `GET ${endpoint} isteği başlatılıyor`, 'ApiService.get');
    
    try {
      return await retryRequest<T>(
        async () => {
          const response = await this.client.get<T>(endpoint, { params });
          return response.data;
        },
        undefined,
        undefined,
        (error: unknown) => {
          // Sadece belirli hatalarda retry yapmak için koşul
          return this.shouldRetryRequest(error);
        }
      );
    } catch (error) {
      this.handleError(error, `GET ${endpoint}`);
      throw error;
    } finally {
      const endTime = performance.now();
      this.logger.debug(
        `GET ${endpoint} isteği tamamlandı (${Math.round(endTime - startTime)}ms)`,
        'ApiService.get',
        
      );
      
      this.flowTracker.trackStep(FlowCategory.API, `GET ${endpoint} isteği tamamlandı`, 'ApiService.get');
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
      
      // DETAYLI HATA AYIKLAMA: API isteği gönderiliyor bilgisi
      console.log(`[ApiService.post] İSTEK BAŞLATILDI: ${endpoint}`);
      console.log(`[ApiService.post] İSTEK METODU: POST`);
      console.log(`[ApiService.post] İSTEK URL: ${endpoint}`);
      console.log(`[ApiService.post] İSTEK VERİSİ:`, JSON.stringify(data, null, 2));
      
      if (config) {
        console.log(`[ApiService.post] ÖZEL KONFİGÜRASYON:`, config);
      }
      
      this.logger.debug(
        `POST isteği başlatıldı: ${endpoint}`,
        'ApiService.post',
        410,
        { dataKeys: typeof data === 'object' ? Object.keys(data) : 'array' }
      );
      
      // İstek zamanını ölç
      const startTime = Date.now();
      const response = await this.client.post<T>(endpoint, data, config);
      const requestDuration = Date.now() - startTime;
      
      // DETAYLI HATA AYIKLAMA: API yanıtı analizi
      console.log(`[ApiService.post] YANIT ALINDI: ${endpoint} (${requestDuration}ms)`);
      console.log(`[ApiService.post] DURUM KODU: ${response.status}`);
      console.log(`[ApiService.post] YANIT HEADERS:`, response.headers);
      
      // Yanıt verisi içeriğini analiz et
      console.log(`[ApiService.post] YANIT VERİSİ: `, response.data);
      
      if (typeof response.data === 'object' && response.data !== null) {
        console.log(`[ApiService.post] YANIT VERİSİ TİPİ: Nesne`);
        console.log(`[ApiService.post] YANIT VERİSİ ANAHTARLARI:`, Object.keys(response.data));
        
        // Önemli alanları kontrol et
        if ('id' in response.data) {
          console.log(`[ApiService.post] YANIT İÇERİĞİ - ID: ${(response.data as any).id}`);
        }
        
        if ('status' in response.data) {
          console.log(`[ApiService.post] YANIT İÇERİĞİ - STATUS: ${(response.data as any).status}`);
        }
        
        if ('data' in response.data) {
          console.log(`[ApiService.post] YANIT İÇERİĞİ - NESTED DATA:`, (response.data as any).data);
        }
      } else if (Array.isArray(response.data)) {
        console.log(`[ApiService.post] YANIT VERİSİ TİPİ: Dizi`);
        console.log(`[ApiService.post] YANIT VERİSİ UZUNLUĞU: ${response.data.length}`);
      } else {
        console.log(`[ApiService.post] YANIT VERİSİ TİPİ: ${typeof response.data}`);
      }
      
      // İstek tamamlandı ölçümü
      this.flowTracker.markEnd(`POST_${endpoint}`, FlowCategory.API, 'ApiService.post');
      this.logger.debug(
        `POST isteği tamamlandı: ${endpoint}`,
        'ApiService.post',
      
        420,
        { status: response.status }
      );
      
      return response.data;
    } catch (error) {
      // DETAYLI HATA AYIKLAMA: Hata detayları
      console.error(`[ApiService.post] HATA: ${endpoint}`);
      
      if (axios.isAxiosError(error)) {
        console.error(`[ApiService.post] AXIOS HATASI: ${error.message}`);
        console.error(`[ApiService.post] HATA KODU: ${error.code}`);
        console.error(`[ApiService.post] HATA DURUMU: ${error.response?.status}`);
        console.error(`[ApiService.post] HATA YANITI:`, error.response?.data);
        
        if (error.response?.data) {
          if (typeof error.response.data === 'object') {
            console.error(`[ApiService.post] HATA DETAYLARI:`, JSON.stringify(error.response.data, null, 2));
            
            // Backend hata mesajı
            if ('message' in error.response.data) {
              console.error(`[ApiService.post] BACKEND HATA MESAJI:`, (error.response.data as any).message);
            }
            
            // Hata kodu
            if ('statusCode' in error.response.data) {
              console.error(`[ApiService.post] BACKEND HATA KODU:`, (error.response.data as any).statusCode);
            }
          } else {
            console.error(`[ApiService.post] HATA YANITI (STRİNG):`, String(error.response.data));
          }
        }
      } else {
        console.error(`[ApiService.post] GENEL HATA:`, error);
      }
      
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
      
        447,
        { dataKeys: typeof data === 'object' ? Object.keys(data) : 'array' }
      );
      
      const response = await this.client.put<T>(endpoint, data);
      
      // İstek tamamlandı ölçümü
      this.flowTracker.markEnd(`PUT_${endpoint}`, FlowCategory.API, 'ApiService.put');
      this.logger.debug(
        `PUT isteği tamamlandı: ${endpoint}`,
        'ApiService.put',
     
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
   
        478
      );
      
      const response = await this.client.delete<T>(endpoint);
      
      // İstek tamamlandı ölçümü
      this.flowTracker.markEnd(`DELETE_${endpoint}`, FlowCategory.API, 'ApiService.delete');
      this.logger.debug(
        `DELETE isteği tamamlandı: ${endpoint}`,
        'ApiService.delete',
       
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
      this.flowTracker.trackStep(FlowCategory.API, 'Beklenmeyen API hatası', 'ApiService.handleError', {
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

  /**
   * Bir isteğin yeniden denenmesi gerekip gerekmediğini kontrol eder
   */
  private shouldRetryRequest(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      // Ağ hataları için yeniden dene
      if (!error.response) {
        return true; 
      }
      
      // 5xx sunucu hataları için yeniden dene
      if (error.response.status >= 500 && error.response.status < 600) {
        return true;
      }
      
      // Diğer HTTP hataları için yeniden deneme
      return false;
    }
    
    // Bilinmeyen hatalar için yeniden dene
    return true;
  }

  /**
   * Axios error handler
   * @param error Axios error
   * @returns Error response or rethrows
   */
  private handleAxiosError(error: any, endpointType?: 'quick_quiz' | 'general'): any {
    console.error('[ApiService.handleAxiosError] API işlemi sırasında hata:', error);

    // Axios hata yapısını kontrol et
    if (error.response) {
      // Sunucu cevabı varsa (4xx-5xx kodları)
      const { status, data } = error.response;
      console.error(`[ApiService.handleAxiosError] Status: ${status}, Data:`, data);

      // 401 Unauthorized durumu, token süresi dolmuş olabilir
      if (status === 401) {
        console.error("[ApiService.handleAxiosError] 401 Unauthorized hatası. Token geçersiz veya süresi dolmuş.");
        
        // Eğer bu bir hızlı sınav endpointi ise ve quick_quiz tipindeyse, sessiz davran ve işleme devam et
        if (endpointType === 'quick_quiz') {
          console.warn("[ApiService.handleAxiosError] Hızlı sınav için 401 hatası yok sayılıyor ve varsayılan cevap döndürülüyor");
          // Hızlı sınav API'si için temel bir yanıt sağlayın
          return {
            id: `mock_quiz_${Date.now()}`,
            questions: this.createMockQuestions(),
            timestamp: new Date().toISOString(),
            quizType: 'quick',
            status: 'Unauthorized but continuing',
          };
        }
        
        // Diğer API çağrıları için normal yönlendirme yap
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          // Client-side yönlendirme için toast ekle
          if (this.toast) {
            this.toast.error("Oturum süreniz dolmuş. Giriş sayfasına yönlendiriliyorsunuz.");
          }
          
          // Yönlendirmeyi zamanlı yap
          setTimeout(() => {
            console.log("[ApiService.handleAxiosError] Giriş sayfasına yönlendiriliyor");
            window.location.href = "/auth/login?session_expired=true";
          }, 1500);
        }
      }

      // Diğer hata detaylarını döndür
      return {
        status,
        data,
        message: data?.message || "API isteği başarısız oldu",
      };
    } else if (error.request) {
      // İstek yapıldı ama cevap alınamadı
      console.error("[ApiService.handleAxiosError] İstek gönderildi ama cevap alınamadı.");
      
      // Network hatası, ancak quick_quiz için hız devam et
      if (endpointType === 'quick_quiz') {
        console.warn("[ApiService.handleAxiosError] Hızlı sınav için network hatası yok sayılıyor");
        return {
          id: `offline_quiz_${Date.now()}`,
          questions: this.createMockQuestions(),
          timestamp: new Date().toISOString(),
          quizType: 'quick',
          status: 'Offline mode',
        };
      }
      
      return {
        status: 0,
        data: null,
        message: "Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.",
      };
    } else {
      // İstek oluşturulamadı, başka bir hata var
      console.error("[ApiService.handleAxiosError] İstek oluşturulurken hata:", error.message);
      return {
        status: 0,
        data: null,
        message: error.message || "Bilinmeyen bir hata oluştu.",
      };
    }
  }

  /**
   * Mock sınav soruları oluşturur (bağlantı hatalarında kullanılır)
   */
  private createMockQuestions() {
    return [
      {
        id: `mock_q1_${Date.now()}`,
        questionText: "Bu sorular, sunucu bağlantısı olmadığı için otomatik oluşturulmuştur. Aşağıdakilerden hangisi bir programlama dilidir?",
        options: [
          "A) HTML",
          "B) Python",
          "C) HTTP",
          "D) FTP"
        ],
        correctAnswer: "B) Python",
        explanation: "Python, genel amaçlı yüksek seviyeli bir programlama dilidir.",
        subTopicName: "Programlama Dilleri",
        normalizedSubTopicName: "programlama-dilleri",
        difficulty: "easy"
      },
      {
        id: `mock_q2_${Date.now()}`,
        questionText: "Hangisi bir veri yapısı değildir?",
        options: [
          "A) Dizi (Array)",
          "B) Yığın (Stack)",
          "C) Kuyruk (Queue)",
          "D) Komut (Command)"
        ],
        correctAnswer: "D) Komut (Command)",
        explanation: "Komut (Command) bir tasarım desenidir, veri yapısı değildir.",
        subTopicName: "Veri Yapıları",
        normalizedSubTopicName: "veri-yapilari",
        difficulty: "medium"
      },
      {
        id: `mock_q3_${Date.now()}`,
        questionText: "Web uygulamalarında HTTPS protokolünün kullanım amacı nedir?",
        options: [
          "A) Daha hızlı sayfa yükleme",
          "B) Güvenli veri iletimi",
          "C) Daha fazla bant genişliği",
          "D) Arama motoru optimizasyonu"
        ],
        correctAnswer: "B) Güvenli veri iletimi",
        explanation: "HTTPS, veri iletimini şifreleyerek güvenli hale getirir.",
        subTopicName: "Web Teknolojileri",
        normalizedSubTopicName: "web-teknolojileri",
        difficulty: "medium"
      }
    ];
  }

  // API bağlantı kontrolü ve otomatik geri dönüş mekanizması
  async isServerAvailable(): Promise<boolean> {
    try {
      await this.client.get('/health', { timeout: 2000 });
      return true;
    } catch (error) {
      console.warn('API sunucusuna bağlanılamadı, çevrimdışı moda geçiliyor');
      return false;
    }
  }

  // API isteği için sarmalayıcı - bağlantı hatalarını yönetir
  async safeRequest<T>(
    requestFn: () => Promise<T>,
    fallbackFn: () => T | Promise<T>,
    options: { skipAvailabilityCheck?: boolean } = {}
  ): Promise<T> {
    try {
      // Sunucu kontrolü yap (isteğe bağlı geçilebilir)
      if (!options.skipAvailabilityCheck) {
        const serverAvailable = await this.isServerAvailable();
        if (!serverAvailable) {
          console.warn('API sunucusu kullanılamıyor, alternatif veriler kullanılıyor');
          return await fallbackFn();
        }
      }
      
      return await requestFn();
    } catch (error) {
      console.warn('API isteği başarısız, alternatif veriler kullanılıyor', error);
      return await fallbackFn();
    }
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
