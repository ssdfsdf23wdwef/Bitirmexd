// Frontend'den localStorage'a log yazmak için fonksiyon
function writeLogToLocalFile(logData: {
  level: string;
  message: string | object;
  context?: string;
  details?: any;
}) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Log kategorisini belirle
    const category = determineLogCategory(logData.context, logData.message);
    const storageKey = `frontend-logs-${category}`;
    
    const timestamp = new Date().toISOString();
    const messageString = typeof logData.message === 'object' 
      ? JSON.stringify(logData.message) 
      : logData.message;
    const detailsString = logData.details ? ` | Details: ${JSON.stringify(logData.details)}` : '';
    const contextString = logData.context ? ` [${logData.context}]` : '';
    
    const logLine = `[${timestamp}] [${logData.level.toUpperCase()}]${contextString}: ${messageString}${detailsString}\n`;

    // Mevcut logları al
    let existingLogs = '';
    try {
      existingLogs = localStorage.getItem(storageKey) || '';
    } catch (error) {
      console.warn('LocalStorage okuma hatası:', error);
      existingLogs = '';
    }

    // Yeni log satırını ekle
    const updatedLogs = existingLogs + logLine;

    // Boyut kontrolü (max 1MB per kategori)
    const MAX_SIZE = 1024 * 1024; // 1MB
    let finalLogs = updatedLogs;
    
    if (finalLogs.length > MAX_SIZE) {
      // Son 500KB'ı koru
      const PRESERVE_SIZE = 500 * 1024;
      finalLogs = finalLogs.substring(finalLogs.length - PRESERVE_SIZE);
      
      // İlk tam satırın başlangıcını bul
      const firstLineIndex = finalLogs.indexOf('\n') + 1;
      if (firstLineIndex > 0) {
        finalLogs = finalLogs.substring(firstLineIndex);
      }
      
      // Kesme bilgisini ekle
      finalLogs = `[${timestamp}] [SYSTEM] Log dosyası boyut sınırına ulaştı, eski loglar temizlendi.\n` + finalLogs;
    }

    // localStorage'a kaydet
    try {
      localStorage.setItem(storageKey, finalLogs);
    } catch (error) {
      console.warn('LocalStorage yazma hatası, eski loglar temizleniyor:', error);
      try {
        localStorage.removeItem(storageKey);
        localStorage.setItem(storageKey, `[${timestamp}] [SYSTEM] Log alanı temizlendi.\n${logLine}`);
      } catch (finalError) {
        console.error('LocalStorage yazma başarısız:', finalError);
      }
    }
  } catch (error) {
    console.error('Log yazma hatası:', error);
  }
}

// Log kategorisini belirleyen yardımcı fonksiyon
function determineLogCategory(context?: string, message?: string | object): string {
  const messageString = typeof message === 'object' ? JSON.stringify(message) : (message || '');
  
  if (!context && !messageString) return 'general';

  // Context bazlı kategori belirleme
  if (context) {
    const contextLower = context.toLowerCase();
    
    // Öğrenme hedefleri
    if (contextLower.includes('learning') || contextLower.includes('target') || contextLower.includes('hedef')) {
      return 'learning-targets';
    }
    
    // Sınav oluşturma
    if (contextLower.includes('exam') || contextLower.includes('quiz') || contextLower.includes('sinav')) {
      return 'exam-creation';
    }
    
    // Auth işlemleri
    if (contextLower.includes('auth') || contextLower.includes('login') || contextLower.includes('logout')) {
      return 'auth';
    }
    
    // API/Data transfer
    if (contextLower.includes('api') || contextLower.includes('data') || contextLower.includes('upload')) {
      return 'data-transfer';
    }
    
    // Navigation
    if (contextLower.includes('navigation') || contextLower.includes('router') || contextLower.includes('history')) {
      return 'navigation';
    }
  }

  // Mesaj bazlı kategori belirleme
  if (messageString) {
    const messageLower = messageString.toLowerCase();
    
    if (messageLower.includes('öğrenme') || messageLower.includes('hedef') || messageLower.includes('learning')) {
      return 'learning-targets';
    }
    if (messageLower.includes('sınav') || messageLower.includes('quiz') || messageLower.includes('exam')) {
      return 'exam-creation';
    }
    if (messageLower.includes('giriş') || messageLower.includes('login') || messageLower.includes('auth')) {
      return 'auth';
    }
    if (messageLower.includes('api') || messageLower.includes('upload') || messageLower.includes('data')) {
      return 'data-transfer';
    }
    if (messageLower.includes('navigation') || messageLower.includes('gezinti') || messageLower.includes('route')) {
      return 'navigation';
    }
  }

  return 'general';
}

// Log seviyesi tipleri
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Logger metotları için tip
interface LogFunction {
  (message: string | object, context?: string, details?: any): void;
}

// Daha güvenli bir şekilde konsol override
const safeConsoleOverride = () => {
  // Orijinal konsol metodları
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalDebug = console.debug;
  
  // Sadece desteklenen metodları override et
  console.error = function(...args: any[]) {
    originalError.apply(console, args);
    writeLogToLocalFile({
      level: 'error',
      message: args[0] || '',
      context: 'Console',
      details: args.length > 1 ? args.slice(1) : undefined
    });
  };
  
  console.warn = function(...args: any[]) {
    originalWarn.apply(console, args);
    writeLogToLocalFile({
      level: 'warn',
      message: args[0] || '',
      context: 'Console',
      details: args.length > 1 ? args.slice(1) : undefined
    });
  };
  
  console.info = function(...args: any[]) {
    originalInfo.apply(console, args);
    writeLogToLocalFile({
      level: 'info',
      message: args[0] || '',
      context: 'Console',
      details: args.length > 1 ? args.slice(1) : undefined
    });
  };
  
  console.debug = function(...args: any[]) {
    originalDebug.apply(console, args);
    writeLogToLocalFile({
      level: 'debug',
      message: args[0] || '',
      context: 'Console',
      details: args.length > 1 ? args.slice(1) : undefined
    });
  };
};

// Logging yapılandırmasını oluştur
export function configureLogging() {
  // Tarayıcı ortamında değilsek çık
  if (typeof window === 'undefined') {
    return;
  }
  
  // Global hata yakalayıcı ekle
  window.addEventListener('error', (event) => {
    writeLogToLocalFile({
      level: 'error',
      message: `Yakalanmamış hata: ${event.message}`,
      context: 'Window.onerror',
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error ? event.error.stack : null
      }
    });
  });
  
  // Promise rejection yakalayıcı
  window.addEventListener('unhandledrejection', (event) => {
    writeLogToLocalFile({
      level: 'error',
      message: 'Yakalanmamış Promise hatası',
      context: 'UnhandledPromiseRejection',
      details: {
        reason: event.reason ? (event.reason.stack || event.reason.toString()) : 'Bilinmeyen'
      }
    });
  });
  
  // Konsol metotlarını override et (istenirse)
  // Not: Bu kısım flood yapabilir, sadece geliştirme sırasında kullanılabilir
  // safeConsoleOverride();
  
  // Logger servisini global olarak ayarla
  window.appLogger = {
    error: (message: string | object, context?: string, details?: any) => {
      writeLogToLocalFile({ level: 'error', message, context, details });
    },
    warn: (message: string | object, context?: string, details?: any) => {
      writeLogToLocalFile({ level: 'warn', message, context, details });
    },
    info: (message: string | object, context?: string, details?: any) => {
      writeLogToLocalFile({ level: 'info', message, context, details });
    },
    debug: (message: string | object, context?: string, details?: any) => {
      writeLogToLocalFile({ level: 'debug', message, context, details });
    }
  };
  
  // Başlangıç logu
  writeLogToLocalFile({
    level: 'info',
    message: 'Frontend localStorage log sistemi başlatıldı',
    context: 'LogSetup'
  });
  
  return window.appLogger;
}

// TypeScript için global değişken tanımı
declare global {
  interface Window {
    appLogger: {
      error: LogFunction;
      warn: LogFunction;
      info: LogFunction;
      debug: LogFunction;
    };
  }
} 