import { LoggerService } from '../../common/services/logger.service';

/**
 * Alt konu arayüzü
 */
interface SubTopic {
  subTopicName: string;
  normalizedSubTopicName: string;
  parentTopic?: string; // Ana konunun adı (eğer bir alt konu ise)
  isMainTopic?: boolean; // Ana konu mu alt konu mu
}

/**
 * Konu tespiti sonuç arayüzü
 */
export interface TopicDetectionResult {
  topics: Array<{
    subTopicName: string;
    normalizedSubTopicName: string;
    parentTopic?: string;
    isMainTopic?: boolean;
  }>;
}

interface TopicDetectionOptions {
  maxTopics?: number;
  useCache?: boolean;
  cacheKey?: string;
  existingTopics?: string[];
}

// Log kaydı
try {
  const logger = LoggerService.getInstance();
  logger.debug(
    'Topic Detection interface yüklendi',
    'topic-detection.interface',
    __filename,
    25,
  );
} catch (error) {
  console.error('Interface yüklenirken hata:', error);
}
