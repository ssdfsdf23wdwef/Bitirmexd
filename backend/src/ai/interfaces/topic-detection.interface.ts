import { LoggerService } from '../../common/services/logger.service';

/**
 * Alt konu arayüzü
 */
export interface SubTopicItem {
  subTopicName: string;
  normalizedSubTopicName: string;
  difficulty: 'kolay' | 'orta' | 'zor';
  learningObjective: string;
  reference: string | null;
}

/**
 * Ana konu arayüzü
 */
export interface TopicResponse {
  mainTopic: string;
  subTopics: SubTopicItem[];
}

/**
 * Konu tespiti sonucu ana arayüzü
 */
export interface TopicsResponseData {
  topics: TopicResponse[];
}

/**
 * Yeni konu öğesi arayüzü
 */
export interface NewTopicItem {
  topicName: string;
}

/**
 * Yeni konular yanıt arayüzü
 */
export interface NewTopicsResponse {
  newly_identified_topics: NewTopicItem[];
}

/**
 * Konu tespiti seçenekleri
 */
export interface TopicDetectionOptions {
  maxTopics?: number;
  useCache?: boolean;
  cacheKey?: string;
  existingTopics?: string[];
}

/**
 * Legacy - geriye uyumluluk için
 * @deprecated TopicsResponseData kullanın
 */
export interface TopicDetectionResult {
  topics: Array<{
    subTopicName: string;
    normalizedSubTopicName: string;
    parentTopic?: string;
  }>;
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
