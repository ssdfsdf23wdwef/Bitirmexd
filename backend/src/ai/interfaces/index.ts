/**
 * AI Interfaces - now using unified types
 */
import { LoggerService } from '../../common/services/logger.service';

// Re-export from unified types
export * from './topic-detection.interface';
export * from './quiz-question.interface';

// Also export directly from unified types for convenience
export type {
  QuizQuestion,
  SubTopicType,
  QuizGenerationOptions,
  QuizMetadata,
  ErrorWithMetadata,
} from '../../common/types';

// Log kaydı
try {
  const logger = LoggerService.getInstance();
  logger.debug(
    'AI interfaces index yüklendi (unified types)',
    'ai.interfaces.index',
    __filename,
    9,
  );
} catch (error) {
  console.error('Interface index yüklenirken hata:', error);
}
