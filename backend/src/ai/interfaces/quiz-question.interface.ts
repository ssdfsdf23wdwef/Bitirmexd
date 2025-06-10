/**
 * AI Quiz interfaces - now using unified types
 * Bu dosya artık unified types'dan import eder
 */
import { LoggerService } from '../../common/services/logger.service';

// Unified types'dan import et
export type {
  QuizQuestion,
  SubTopicType,
  QuizGenerationOptions,
  QuizMetadata,
  ErrorWithMetadata,
} from '../../common/types/unified.types';

// Log kaydı
try {
  const logger = LoggerService.getInstance();
  logger.debug(
    'Quiz Question interfaces yüklendi (unified types)',
    'quiz-question.interface',
  );
} catch (error) {
  console.error('Interfaces yüklenirken hata:', error);
}
