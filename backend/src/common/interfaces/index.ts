/**
 * Common interfaces - now importing from unified types
 * Bu dosya artık sadece birleşik type'lardan re-export yapar
 */
import { LoggerService } from '../services/logger.service';

// Unified types'dan import et ve re-export yap
export * from '../types/unified.types';

// RequestWithUser interface'ini ayrı dosyadan import et
export * from './request-with-user.interface';

// Log kaydı
try {
  const logger = LoggerService.getInstance();
  logger.debug(
    'Interface indeksi yüklendi (unified types)',
    'interfaces.index',
    __filename,
    8,
  );
} catch (error) {
  console.error('Interface indeksi yüklenirken hata:', error);
}
