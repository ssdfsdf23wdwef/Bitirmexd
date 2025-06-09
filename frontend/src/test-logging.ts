/**
 * @file test-logging.ts
 * @description Test dosyası - localStorage tabanlı logging sistemini test eder
 */

import LoggerService from './services/logger.service';
import { FlowTrackerService, FlowCategory } from './services/flow-tracker.service';
import { configureLogging } from './lib/setup-logging';

/**
 * Logging sistemini test eder
 */
export function testLocalStorageLogging() {
  console.log('🧪 LocalStorage tabanlı logging sistemi test ediliyor...');
  
  // Global logging sistemi başlat
  configureLogging();
  
  // Logger servisini al
  const logger = LoggerService.getInstance();
  
  // Flow tracker servisini al
  const flowTracker = FlowTrackerService.getInstance({
    enabled: true,
    writeToLocalFile: true,
    consoleOutput: false
  });
  
  console.log('✅ Servisler başlatıldı');
  
  // Test logları oluştur
  console.log('📝 Test logları oluşturuluyor...');
  
  // Öğrenme hedefleri kategori testi
  logger.info('Öğrenme hedefi oluşturuldu', 'LEARNING_TARGET');
  logger.debug('Hedef detayları kontrol ediliyor', 'LEARNING_TARGET');
  
  // Sınav oluşturma kategori testi
  logger.info('Yeni sınav oluşturuldu', 'EXAM_CREATION');
  logger.warn('Sınav soruları eksik', 'EXAM_CREATION');
  
  // Auth kategori testi
  logger.info('Kullanıcı giriş yaptı', 'AUTH');
  logger.error('Login başarısız', 'AUTH');
  
  // Data transfer kategori testi
  logger.info('Dosya yükleme başlatıldı', 'DATA_TRANSFER');
  logger.debug('API çağrısı gönderildi', 'API');
  
  // Navigation kategori testi
  logger.info('Sayfa geçişi yapıldı', 'NAVIGATION');
  
  // Genel kategori testi
  logger.info('Genel sistem mesajı', 'GENERAL');
  logger.error('Beklenmeyen hata oluştu');
  
  // Flow tracker testleri
  flowTracker.trackStep(FlowCategory.Navigation, 'Ana sayfa yüklendi', 'HomePage');
  flowTracker.trackStep(FlowCategory.User, 'Butona tıklandı', 'LoginButton');
  flowTracker.trackStep(FlowCategory.API, 'Login API çağrısı', 'AuthService');
  flowTracker.trackStep(FlowCategory.Auth, 'Kimlik doğrulama başarılı', 'AuthService');
  
  // Durum değişikliği testi
  flowTracker.trackStateChange('userStatus', 'AuthStore', 'anonymous', 'authenticated');
  
  // API çağrısı testi
  flowTracker.trackApiCall('/api/user/profile', 'GET', 'ProfileService');
  
  console.log('✅ Test logları oluşturuldu');
  
  // LocalStorage'daki logları kontrol et
  setTimeout(() => {
    console.log('📊 LocalStorage logları kontrol ediliyor...');
    
    const categories = ['learning-targets', 'exam-creation', 'auth', 'data-transfer', 'navigation', 'general'];
    
    categories.forEach(category => {
      const storageKey = `frontend-logs-${category}`;
      const logs = localStorage.getItem(storageKey);
      
      if (logs) {
        console.log(`📁 ${category} kategorisi: ${logs.split('\n').filter(line => line.trim()).length} log satırı`);
        console.log(`   Son log: ${logs.split('\n').filter(line => line.trim()).pop()?.substring(0, 100)}...`);
      } else {
        console.log(`📁 ${category} kategorisi: log bulunamadı`);
      }
    });
    
    // Flow tracker logları
    const flowLogs = flowTracker.getAllFlowLogs();
    if (flowLogs) {
      console.log(`🔄 Flow tracker: ${flowLogs.split('\n').filter(line => line.trim()).length} log satırı`);
      console.log(`   Son flow log: ${flowLogs.split('\n').filter(line => line.trim()).pop()?.substring(0, 100)}...`);
    } else {
      console.log('🔄 Flow tracker: log bulunamadı');
    }
    
    console.log('🎉 Test tamamlandı! LocalStorage tabanlı logging sistemi çalışıyor.');
    
    // İndirme testleri
    console.log('💾 Log indirme testi başlatılıyor...');
    
    // Kategoriye göre log indirme
    logger.downloadLogFile('auth');
    
    // Tüm logları indirme
    setTimeout(() => {
      logger.downloadLogFile();
      console.log('✅ Log indirme testleri tamamlandı');
    }, 1000);
    
  }, 2000); // Flow tracker'ın debounce süresi için bekleme
}

/**
 * Logları temizle
 */
export function clearAllTestLogs() {
  console.log('🧹 Tüm test logları temizleniyor...');
  
  const logger = LoggerService.getInstance();
  const flowTracker = FlowTrackerService.getInstance();
  
  // Logger servis loglarını temizle
  logger.clearAllLogs();
  
  // Flow tracker loglarını temizle
  flowTracker.clearAllLogs();
  
  console.log('✅ Tüm loglar temizlendi');
}

// Tarayıcı ortamında global olarak erişilebilir hale getir
if (typeof window !== 'undefined') {
  (window as any).testLocalStorageLogging = testLocalStorageLogging;
  (window as any).clearAllTestLogs = clearAllTestLogs;
  
  console.log('🚀 Test fonksiyonları hazır:');
  console.log('   - testLocalStorageLogging() : Logging sistemini test et');
  console.log('   - clearAllTestLogs() : Tüm logları temizle');
}
