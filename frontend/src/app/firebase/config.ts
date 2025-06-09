// Bitirme_Kopya/frontend/src/app/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { 
  getAuth, Auth, connectAuthEmulator, 
  browserLocalPersistence,
  initializeAuth,
  inMemoryPersistence,
  indexedDBLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";

import LoggerService from "@/services/logger.service"; // Changed from { LoggerService }
import { trackFlow } from "@/lib/logger.utils";
import { FlowCategory } from "@/constants/logging.constants";

// Firebase config logging - use LoggerService
const getLoggerInstance = () => {
  try {
    return LoggerService.getInstance();
  } catch (error) {
    // Fallback to console if logger service is not available
    return null;
  }
};

const logFirebaseInfo = (message: string, context: string = 'FirebaseConfig', metadata?: any) => {
  const logger = getLoggerInstance();
  if (logger) {
    logger.info(message, context, undefined, undefined, metadata);
  } else {
    console.log(`[INFO] [${context}] ${message}`, metadata || '');
  }
};

const logFirebaseWarn = (message: string, context: string = 'FirebaseConfig', metadata?: any) => {
  const logger = getLoggerInstance();
  if (logger) {
    logger.warn(message, context, undefined, undefined, metadata);
  } else {
    console.warn(`[WARN] [${context}] ${message}`, metadata || '');
  }
};

const logFirebaseError = (message: string, context: string = 'FirebaseConfig', metadata?: any) => {
  const logger = getLoggerInstance();
  if (logger) {
    logger.error(message, context, undefined, undefined, metadata);
  } else {
    console.error(`[ERROR] [${context}] ${message}`, metadata || '');
  }
};

const trackFirebaseFlow = (message: string, context: string = 'FirebaseConfig') => {
  const logger = getLoggerInstance();
  if (logger) {
    logger.info(`[FLOW] ${message}`, context);
  } else {
    console.log(`[FLOW] [${context}] ${message}`);
  }
};

// Firebase yapılandırma nesnesini çevresel değişkenlerden al
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Firebase yapılandırma tipi
type FirebaseConfigType = typeof firebaseConfig;

// Geliştirme için yedek Firebase yapılandırması
const FALLBACK_CONFIG: FirebaseConfigType = {
  apiKey: "AIzaSyC_3HCvaCSsLDvO0IJNmjXNvtNffalUl8Y",
  authDomain: "my-app-71530.firebaseapp.com",
  projectId: "my-app-71530",
  storageBucket: "my-app-71530.appspot.com",
  messagingSenderId: "29159149861",
  appId: "1:29159149861:web:5ca6583d1f45efcb6e0acc",
  measurementId: "G-CZNHMSMK8P",
  databaseURL: "https://my-app-71530-default-rtdb.firebaseio.com",
};

// Firebase yapılandırmasının geçerliliğini kontrol et
const validateFirebaseConfig = (): FirebaseConfigType => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'] as (keyof FirebaseConfigType)[];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  const validatedConfig = { ...firebaseConfig };
  
  if (missingFields.length > 0) {
    getLoggerInstance()?.warn(
      `Firebase yapılandırmasında eksik alanlar: ${missingFields.join(', ')}`,
      'FirebaseConfig',
      'firebase/config.ts',
      "34"
    );
    
    // Geliştirme ortamında eksik alanlar için yedek değerler kullan
    if (process.env.NODE_ENV === 'development') {
      // Eksik alanları doldur
      missingFields.forEach(field => {
        validatedConfig[field] = FALLBACK_CONFIG[field];
      });
      
      getLoggerInstance()?.info(
        'Eksik Firebase alanları geliştirme değerleriyle dolduruldu',
        'FirebaseConfig',
        'firebase/config.ts',
        "116"
      );
    } else {
      // Üretim ortamında eksik alanlar için uyarı logla
      getLoggerInstance()?.error(
        `Üretim ortamında eksik Firebase yapılandırma alanları: ${missingFields.join(', ')}`,
        'FirebaseConfig',
        'firebase/config.ts',
        "125"
      );
    }
  }
  
  // apiKey bir kez daha kontrol et - en kritik alan
  if (!validatedConfig.apiKey) {
    getLoggerInstance()?.error(
      'Firebase API Key tanımlanmamış! Firebase işlevselliği çalışmayabilir.',
      'FirebaseConfig',
      'firebase/config.ts',
      "140"
    );
    
    // Geliştirme ortamında yedek API key kullan
    if (process.env.NODE_ENV === 'development') {
      validatedConfig.apiKey = FALLBACK_CONFIG.apiKey;
    }
  }
  
  return validatedConfig;
};

// Firebase servislerini başlat
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  trackFlow('Firebase başlatılıyor', 'FirebaseConfig', FlowCategory.Custom);
  
  // Firebase yapılandırmasını doğrula
  const validatedConfig = validateFirebaseConfig();
  
  // Uygulama başlatılmadan önce kontrol edelim
  if (!getApps().length) {
    try {
      app = initializeApp(validatedConfig);
      getLoggerInstance()?.info(
        'Firebase başarıyla başlatıldı',
        'FirebaseConfig',
        'firebase/config.ts',
        "167"
      );
      trackFlow('Firebase başarıyla başlatıldı', 'FirebaseConfig', FlowCategory.Custom);
    } catch (initError) {
      getLoggerInstance()?.error(
        `Firebase başlatılamadı: ${initError instanceof Error ? initError.message : 'Bilinmeyen hata'}`,
        'FirebaseConfig',
        'firebase/config.ts',
        "173",
        { error: initError }
      );
      
      // Minimum yapılandırmayla tekrar dene
      app = initializeApp({
        apiKey: validatedConfig.apiKey || FALLBACK_CONFIG.apiKey,
        authDomain: validatedConfig.authDomain || FALLBACK_CONFIG.authDomain,
        projectId: validatedConfig.projectId || FALLBACK_CONFIG.projectId,
      });
      getLoggerInstance()?.warn(
        'Firebase minimum yapılandırma ile başlatıldı',
        'FirebaseConfig',
        'firebase/config.ts',
        "186"
      );
    }
  } else {
    app = getApps()[0];
    getLoggerInstance()?.info(
      'Mevcut Firebase uygulaması kullanılıyor',
      'FirebaseConfig',
      'firebase/config.ts',
      "198"
    );
  }
  
  // Firestore ve Storage başlat
  try {
    db = getFirestore(app);
    storage = getStorage(app);
    getLoggerInstance()?.info(
      'Firestore ve Storage başarıyla başlatıldı',
      'FirebaseConfig',
      'firebase/config.ts',
      "208"
    );
  } catch (dbError) {
    getLoggerInstance()?.error(
      'Firebase servislerini başlatma hatası',
      'FirebaseConfig',
      'firebase/config.ts',
      "218",
      { error: dbError }
    );
    // Minimum yeniden başlatma girişimi
    db = getFirestore(app);
    storage = getStorage(app);
  }
  
  // Auth servisi oluştur - tarayıcı ve sunucu taraflı çalışma için uyumlu
  if (typeof window !== 'undefined') {
    // İstemci tarafı - daha güçlü kalıcılık stratejisi kullan
    try {
      auth = initializeAuth(app, {
        persistence: [
          indexedDBLocalPersistence, // Öncelikle indexedDB kullan
          browserLocalPersistence,   // Fallback olarak localStorage
          browserSessionPersistence  // Son çare olarak sessionStorage
        ]
      });
      
      getLoggerInstance()?.info(
        'Firebase Auth tarayıcı tarafında başlatıldı',
        'FirebaseConfig',
        'firebase/config.ts',
        "242"
      );
    } catch (authInitError) {
      getLoggerInstance()?.error(
        'Firebase Auth özel başlatma hatası, standart yönteme dönülüyor',
        'FirebaseConfig',
        'firebase/config.ts',
        "249",
        { error: authInitError }
      );
      
      // Hata durumunda getAuth kullanarak düz bir başlatma yap
      auth = getAuth(app);
    }
  } else {
    // Sunucu taraflı rendering için - hafıza içi kalıcılık kullan
    try {
      auth = initializeAuth(app, { persistence: inMemoryPersistence });
      getLoggerInstance()?.info(
        'Firebase Auth sunucu tarafında başlatıldı',
        'FirebaseConfig',
        'firebase/config.ts',
        "264"
      );
    } catch (serverAuthError) {
      getLoggerInstance()?.error(
        'Firebase Auth sunucu taraflı başlatma hatası',
        'FirebaseConfig',
        'firebase/config.ts',
        "272",
        { error: serverAuthError }
      );
      // Geri dönüş - getAuth kullan
      auth = getAuth(app);
    }
  }
  
  // Geliştirme ortamında emülatör kullanımını ayarla
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
      getLoggerInstance()?.info(
        'Firebase emülatörleri yapılandırılıyor',
        'FirebaseConfig',
        'firebase/config.ts',
        "286"
      );
      
      // Auth, Firestore ve Storage servislerinin varlığını kontrol et
      if (auth) connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      if (db) connectFirestoreEmulator(db, 'localhost', 8080);
      if (storage) connectStorageEmulator(storage, 'localhost', 9199);
      
      getLoggerInstance()?.info(
        'Firebase emülatörleri başarıyla yapılandırıldı',
        'FirebaseConfig',
        'firebase/config.ts',
        "299"
      );
      
     
    } catch (emulatorError) {
      getLoggerInstance()?.error(
        'Firebase emülatörleri yapılandırılamadı',
        'FirebaseConfig',
        'firebase/config.ts',
        "307",
        { error: emulatorError instanceof Error ? emulatorError.message : 'Bilinmeyen hata' }
      );
    }
  }
  
  // Auth durum değişikliklerini dinle ve hataları yakala
  if (typeof window !== 'undefined' && auth) { // Sadece tarayıcı ortamında ve auth tanımlı ise
    auth.onAuthStateChanged(
      (user) => {
        if (user) {
          getLoggerInstance()?.info(
            'Firebase Auth: Kullanıcı oturum açtı',
            'FirebaseConfig',
            'firebase/config.ts',
            "322",
            { uid: user.uid }
          );
          
          trackFlow('Kullanıcı oturum açtı', 'FirebaseConfig', FlowCategory.Auth, { uid: user.uid });
        } else {
          getLoggerInstance()?.info(
            'Firebase Auth: Kullanıcı oturumu kapalı',
            'FirebaseConfig',
            'firebase/config.ts',
            "332"
          );
          
          trackFlow('Kullanıcı oturumu kapalı', 'FirebaseConfig', FlowCategory.Auth);
        }
      },
      (error) => {
        getLoggerInstance()?.error(
          'Firebase Auth hata',
          'FirebaseConfig',
          'firebase/config.ts',
          "343",
          { error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
        );
        
        trackFlow('Oturum izleme hatası', 'FirebaseConfig', FlowCategory.Auth);
      },
    );
  }
} catch (error) {
  getLoggerInstance()?.error(
    'Firebase başlatma hatası',
    'FirebaseConfig',
    'firebase/config.ts',
    "357",
    { error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
  );
  
  trackFlow('Firebase başlatma hatası', 'FirebaseConfig', FlowCategory.Custom);
  
  // Uygulamanın çökmemesi için varsayılan nesneler oluştur
  if (!getApps().length) {
    try {
      // Minimum yapılandırma ile yeniden deneme
      app = initializeApp({
        apiKey: FALLBACK_CONFIG.apiKey,
        authDomain: FALLBACK_CONFIG.authDomain,
        projectId: FALLBACK_CONFIG.projectId,
      });
      
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
      
      getLoggerInstance()?.warn(
        'Firebase minimum yapılandırma ile başlatıldı',
        'FirebaseConfig',
        'firebase/config.ts',
        "381"
      );
    } catch (fallbackError) {
      getLoggerInstance()?.error(
        'Firebase minimum yapılandırma ile bile başlatılamadı',
        'FirebaseConfig',
        'firebase/config.ts',
        "388",
        { error: fallbackError instanceof Error ? fallbackError.message : 'Bilinmeyen hata' }
      );
      
      // Tarayıcı ortamında kullanıcıya uyarı göster
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          console.error('Firebase başlatılamadı! Uygulama düzgün çalışmayabilir.');
          // alert('Firebase bağlantısı kurulamadı. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.');
        }, 1000);
      }
      
      // Değişkenlerin tanımlı olmasını sağla
      app = initializeApp({
        apiKey: FALLBACK_CONFIG.apiKey,
        authDomain: FALLBACK_CONFIG.authDomain,
        projectId: FALLBACK_CONFIG.projectId,
      });
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
    }
  } else if (getApps().length > 0) {
    // Firebase app zaten var, ancak diğer servisler başlatılmamış olabilir
    app = getApps()[0];
    
    // Değişkenlerin kesinlikle tanımlı olmasını sağla
    db = getFirestore(app);
    auth = getAuth(app);  
    storage = getStorage(app);
  }
}

// Firebase servislerini dışa aktar
export { app, db, auth, storage };
