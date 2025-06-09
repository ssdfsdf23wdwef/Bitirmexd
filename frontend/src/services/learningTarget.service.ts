import apiService from "./api.service";
import { 
  LearningTarget, 
  TopicDetectionResult, 
  LearningTargetStatusLiteral,
  ProposedTopic
} from "@/types/learningTarget.type";
import { DetectNewTopicsResponse } from "@/types/learning-target.types";
import { getLogger, getFlowTracker, trackFlow, mapToTrackerCategory } from "@/lib/logger.utils";
import { LogClass, LogMethod } from "@/decorators/log-method.decorator";
import { FlowCategory } from "@/constants/logging.constants";
import authService from './auth.service';
// Logger ve flowTracker nesnelerini lazy-load et (SSR safe)
let logger: any = null;
let flowTracker: any = null;

function getLoggerInstance() {
  if (!logger) {
    logger = getLogger();
  }
  return logger;
}

function getFlowTrackerInstance() {
  if (!flowTracker) {
    flowTracker = getFlowTracker();
  }
  return flowTracker;
}

/**
 * Öğrenme hedefleri servis sınıfı
 * API ile etkileşimleri yönetir
 */
@LogClass('LearningTargetService')
class LearningTargetService {
  // Bir dersin tüm öğrenme hedeflerini getir
  @LogMethod('LearningTargetService', FlowCategory.API)
  async getLearningTargetsByCourse(courseId: string): Promise<LearningTarget[]> {
    getFlowTrackerInstance().markStart(`getLearningTargets_${courseId}`);
    
    try {
      trackFlow(
        `Fetching learning targets by course ID: ${courseId}`,
        "LearningTargetService.getLearningTargetsByCourse",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/by-course/${courseId}`,
        'GET',
        'LearningTargetService.getLearningTargetsByCourse',
        { courseId }
      );
      
      const targets = await apiService.get<LearningTarget[]>(
        `/learning-targets/by-course/${courseId}`,
      );
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd(`getLearningTargets_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Öğrenme hedefleri getirildi: Kurs=${courseId}, Hedef sayısı=${targets.length}`,
        'debug',
        'LearningTargetService.getLearningTargetsByCourse',
        { count: targets.length, courseId, duration }
      );
      
      return targets;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd(`getLearningTargets_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      trackFlow(
        `Error fetching learning targets for course ${courseId}: ${(error as Error).message}`,
        "LearningTargetService.getLearningTargetsByCourse",
        FlowCategory.API,
        { courseId, error }
      );
      throw error;
    }
  }

  // Bir kurs için öğrenme hedeflerini getirir (eski topicService.getLearningTargets için uyumluluk)
  @LogMethod('LearningTargetService', FlowCategory.API)
  async getLearningTargets(courseId: string): Promise<LearningTarget[]> {
    getFlowTrackerInstance().markStart(`getLearningTargetsCompat_${courseId}`);
    
    try {
      getFlowTrackerInstance().trackStep(
        mapToTrackerCategory(FlowCategory.API), 
        'Uyumluluk metoduyla öğrenme hedefleri getiriliyor', 
        'LearningTargetService.getLearningTargets',
        { courseId }
      );
      
      getLoggerInstance().logLearningTarget(
        `Eski API uyumluluğu için getLearningTargets çağrılıyor: ${courseId}`,
        'debug',
        'LearningTargetService.getLearningTargets',
        { courseId }
      );
      
      const targets = await this.getLearningTargetsByCourse(courseId);
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd(`getLearningTargetsCompat_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Uyumluluk metodu başarılı: Kurs=${courseId}, Hedef sayısı=${targets.length}`,
        'debug',
        'LearningTargetService.getLearningTargets',
        { count: targets.length, courseId, duration }
      );
      
      return targets;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd(`getLearningTargetsCompat_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Öğrenme hedefleri yüklenirken hata oluştu: ${courseId}`,
        'error',
        'LearningTargetService.getLearningTargets',
        { courseId, error }
      );
      throw error;
    }
  }

  // Belirli bir öğrenme hedefini getir
  @LogMethod('LearningTargetService', FlowCategory.API)
  async getLearningTargetById(id: string): Promise<LearningTarget> {
    getFlowTrackerInstance().markStart(`getLearningTarget_${id}`);
    
    try {
      trackFlow(
        `Fetching learning target by ID: ${id}`,
        "LearningTargetService.getLearningTargetById",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/${id}`,
        'GET',
        'LearningTargetService.getLearningTargetById',
        { id }
      );
      
      const target = await apiService.get<LearningTarget>(`/learning-targets/${id}`);
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd(`getLearningTarget_${id}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Öğrenme hedefi getirildi: ID=${id}`,
        'LearningTargetService.getLearningTargetById',
        __filename,
        115,
        { 
          id, 
          topic: target.subTopicName,
          status: target.status,
          duration 
        }
      );
      
      return target;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd(`getLearningTarget_${id}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      trackFlow(
        `Error fetching learning target ${id}: ${(error as Error).message}`,
        "LearningTargetService.getLearningTargetById",
        FlowCategory.API,
        { id, error }
      );
      throw error;
    }
  }

  // Belirli bir dersteki öğrenme hedeflerini durum (status) bazında getir
  @LogMethod('LearningTargetService', FlowCategory.API)
  async getLearningTargetsByStatus(
    courseId: string,
  ): Promise<Record<string, LearningTarget[]>> {
    getFlowTrackerInstance().markStart(`getLearningTargetsByStatus_${courseId}`);
    
    try {
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/by-status/${courseId}`,
        'GET',
        'LearningTargetService.getLearningTargetsByStatus',
        { courseId }
      );
      
      const targetsByStatus = await apiService.get<Record<string, LearningTarget[]>>(
        `/learning-targets/by-status/${courseId}`,
      );
      
      // Hedef sayılarını hesapla
      const counts: Record<string, number> = {};
      Object.keys(targetsByStatus).forEach(status => {
        counts[status] = targetsByStatus[status].length;
      });
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd(`getLearningTargetsByStatus_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Durum bazlı öğrenme hedefleri getirildi: Kurs=${courseId}`,
        'LearningTargetService.getLearningTargetsByStatus',
        __filename,
        166,
        { 
          courseId, 
          statusCounts: counts,
          totalCount: Object.values(counts).reduce((a, b) => a + b, 0),
          duration 
        }
      );
      
      return targetsByStatus;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd(`getLearningTargetsByStatus_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Durum bazlı öğrenme hedefleri yüklenirken hata oluştu: ${courseId}`,
        'LearningTargetService.getLearningTargetsByStatus',
        __filename,
        182,
        { courseId, error }
      );
      throw error;
    }
  }

  // Doküman metninden konu tespiti yap
  @LogMethod('LearningTargetService', FlowCategory.API)
  async detectTopics(
    documentText: string,
    existingTopics: string[] = [],
  ): Promise<TopicDetectionResult> {
    await authService.getAuthToken();
    getFlowTrackerInstance().markStart('detectTopics');
    
    try {
      getFlowTrackerInstance().trackApiCall(
        "/learning-targets/detect-topics",
        'POST',
        'LearningTargetService.detectTopics'
      );
      
      getLoggerInstance().logLearningTarget(
        `Konu tespiti yapılıyor: ${documentText.length} karakter metin, ${existingTopics.length} mevcut konu`,
        'LearningTargetService.detectTopics',
        __filename,
        205,
        { 
          textLength: documentText.length,
          existingTopicsCount: existingTopics.length,
          existingTopics
        }
      );
      
      const result = await apiService.post<TopicDetectionResult>(
        "/learning-targets/detect-topics",
        {
          documentText,
          existingTopics,
        },
      );
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd('detectTopics', mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Konu tespiti tamamlandı: ${result.topics.length} konu tespit edildi`,
        'LearningTargetService.detectTopics',
        __filename,
        225,
        { 
          detectedTopics: result.topics,
          duration 
        }
      );
      
      return result;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd('detectTopics', mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        'Konu tespiti yapılırken hata oluştu',
        'LearningTargetService.detectTopics',
        __filename,
        239,
        { 
          textLength: documentText.length,
          existingTopicsCount: existingTopics.length,
          error 
        }
      );
      throw error;
    }
  }

  // Çoklu öğrenme hedefi oluştur
  @LogMethod('LearningTargetService', FlowCategory.API)
  async createBatchLearningTargets(
    courseId: string,
    topics: Array<{
      subTopicName: string;
      normalizedSubTopicName?: string;
    }>,
  ): Promise<LearningTarget[]> {
    getFlowTrackerInstance().markStart(`createBatchTargets_${courseId}`);
    
    try {
      getFlowTrackerInstance().trackApiCall(
        "/learning-targets/batch",
        'POST',
        'LearningTargetService.createBatchLearningTargets',
        { courseId, targetCount: topics.length }
      );
      
      getLoggerInstance().logLearningTarget(
        `Toplu öğrenme hedefi oluşturuluyor: Kurs=${courseId}, Hedef sayısı=${topics.length}`,
        'LearningTargetService.createBatchLearningTargets',
        __filename,
        267,
        { 
          courseId, 
          count: topics.length,
          topics: topics.map(t => t.subTopicName)
        }
      );
      
      const createdTargets = await apiService.post<LearningTarget[]>("/learning-targets/batch", {
        courseId,
        topics,
      });
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd(`createBatchTargets_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Toplu öğrenme hedefi oluşturuldu: Kurs=${courseId}, Hedef sayısı=${createdTargets.length}`,
        'LearningTargetService.createBatchLearningTargets',
        __filename,
        284,
        { 
          courseId, 
          count: createdTargets.length,
          duration 
        }
      );
      
      return createdTargets;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd(`createBatchTargets_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Toplu öğrenme hedefi oluşturulurken hata oluştu: ${courseId}`,
        'LearningTargetService.createBatchLearningTargets',
        __filename,
        299,
         {
          courseId,
          targetCount: topics.length,
          error
        }
      );
      throw error;
    }
  }

  // Çoklu öğrenme hedefi durumlarını güncelle
  @LogMethod('LearningTargetService', FlowCategory.API)
  async updateMultipleStatuses(
    targetUpdates: Array<{
      id: string;
      status: string;
      lastAttemptScorePercent: number;
    }>,
  ): Promise<LearningTarget[]> {
    getFlowTrackerInstance().markStart('updateMultipleStatuses');
    
    try {
      getFlowTrackerInstance().trackApiCall(
        "/learning-targets/update-multiple-statuses",
        'PUT',
        'LearningTargetService.updateMultipleStatuses',
        { updateCount: targetUpdates.length }
      );
      
      getLoggerInstance().logLearningTarget(
        `Çoklu hedef durumu güncelleniyor: ${targetUpdates.length} hedef`,
        'LearningTargetService.updateMultipleStatuses',
        __filename,
        329,
        { 
          updateCount: targetUpdates.length,
          targetIds: targetUpdates.map(t => t.id)
        }
      );
      
      const updatedTargets = await apiService.put<LearningTarget[]>(
        "/learning-targets/update-multiple-statuses",
        {
          targetUpdates,
        },
      );
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd('updateMultipleStatuses', mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Çoklu hedef durumu güncellendi: ${updatedTargets.length} hedef`,
        'LearningTargetService.updateMultipleStatuses',
        __filename,
        347,
        {
          count: updatedTargets.length,
          duration,
          courseId: ""
        }
      );
      
      return updatedTargets;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd('updateMultipleStatuses', mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        'Çoklu hedef durumu güncellenirken hata oluştu',
        'LearningTargetService.updateMultipleStatuses',
        __filename,
        361,
        { 
          targetCount: targetUpdates.length,
          error 
        }
      );
      throw error;
    }
  }

  // Tek bir öğrenme hedefini güncelle
  @LogMethod('LearningTargetService', FlowCategory.API)
  async updateLearningTarget(
    id: string,
    data: Partial<LearningTarget>,
  ): Promise<LearningTarget> {
    getFlowTrackerInstance().markStart(`updateTarget_${id}`);
    
    try {
      trackFlow(
        `Updating learning target ${id}: ${JSON.stringify(data)}`,
        "LearningTargetService.updateLearningTarget",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/${id}`,
        'PUT',
        'LearningTargetService.updateLearningTarget',
        { id, fields: Object.keys(data).length }
      );
      
      getLoggerInstance().logLearningTarget(
        `Öğrenme hedefi güncelleniyor: ID=${id}`,
        'LearningTargetService.updateLearningTarget',
        __filename,
        387,
        { 
          id, 
          updatedFields: Object.keys(data)
        }
      );
      
      const updatedTarget = await apiService.put<LearningTarget>(`/learning-targets/${id}`, data);
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd(`updateTarget_${id}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Öğrenme hedefi güncellendi: ID=${id}`,
        'LearningTargetService.updateLearningTarget',
        __filename,
        401,
        { 
          id,
          topic: updatedTarget.subTopicName,
          status: updatedTarget.status,
          duration 
        }
      );
      
      return updatedTarget;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd(`updateTarget_${id}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      trackFlow(
        `Error updating learning target ${id}: ${(error as Error).message}`,
        "LearningTargetService.updateLearningTarget",
        FlowCategory.API,
        { id, error }
      );
      throw error;
    }
  }

  // Tek bir öğrenme hedefini sil
  @LogMethod('LearningTargetService', FlowCategory.API)
  async deleteLearningTarget(id: string): Promise<{ id: string }> {
    getFlowTrackerInstance().markStart(`deleteTarget_${id}`);
    
    try {
      trackFlow(
        `Deleting learning target ${id}`,
        "LearningTargetService.deleteLearningTarget",
        FlowCategory.API
      );
      
      getLoggerInstance().logLearningTarget(
        `Öğrenme hedefi siliniyor: ID=${id}`,
        'LearningTargetService.deleteLearningTarget',
        __filename,
        438,
        { id }
      );
      
      const result = await apiService.delete<{ id: string }>(`/learning-targets/${id}`);
      
      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd(`deleteTarget_${id}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Öğrenme hedefi silindi: ID=${id}`,
        'LearningTargetService.deleteLearningTarget',
        __filename,
        450,
        { id, duration }
      );
      
      return result;
    } catch (error) {
      // Hata durumu
      getFlowTrackerInstance().markEnd(`deleteTarget_${id}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      trackFlow(
        `Error deleting learning target ${id}: ${(error as Error).message}`,
        "LearningTargetService.deleteLearningTarget",
        FlowCategory.API,
        { id, error }
      );
      throw error;
    }
  }

  // ----- topicService'den taşınan fonksiyonlar -----

  /**
   * Öğrenme hedefi bilgileri ve istatistikleri hesaplar
   * @param {LearningTarget[]} targets - Öğrenme hedefleri
   * @returns {Object} Hesaplanan istatistikler
   */
  calculateTargetStats(
    targets: LearningTarget[],
  ): {
    statuses: Record<LearningTargetStatusLiteral, number>;
    statusPercentages: Record<LearningTargetStatusLiteral, number>;
    completionRate: number;
    totalTargets: number;
    uncompletedCount: number;
  } {
    getFlowTrackerInstance().markStart('calculateTargetStats');
    
    getLoggerInstance().logLearningTarget(
      `Hedef istatistikleri hesaplanıyor: ${targets.length} hedef`,
      'LearningTargetService.calculateTargetStats',
      __filename,
      487,
      { count: targets.length }
    );
    
    const totalTargets = targets.length;

    // Durum sayıları
    const statuses: Record<LearningTargetStatusLiteral, number> = {
      pending: 0,
      failed: 0,
      medium: 0,
      mastered: 0,
    };

    // Her hedefin durumunu say
    targets.forEach((target) => {
      statuses[target.status]++;
    });

    // Durum yüzdeleri
    const statusPercentages: Record<LearningTargetStatusLiteral, number> = {
      pending: 0,
      failed: 0,
      medium: 0,
      mastered: 0,
    };

    // Yüzdeleri hesapla
    if (totalTargets > 0) {
      Object.keys(statuses).forEach((status) => {
        statusPercentages[status as LearningTargetStatusLiteral] =
          (statuses[status as LearningTargetStatusLiteral] / totalTargets) * 100;
      });
    }

    // Tamamlanma oranı (mastered + medium hedeflerin yüzdesi)
    const completedCount = statuses.mastered + statuses.medium;
    const completionRate =
      totalTargets > 0 ? (completedCount / totalTargets) * 100 : 0;

    // Tamamlanmamış hedef sayısı (pending + failed)
    const uncompletedCount = statuses.pending + statuses.failed;
    
    const result = {
      statuses,
      statusPercentages,
      completionRate,
      totalTargets,
      uncompletedCount,
    };

    // Başarılı sonuç
    const duration = getFlowTrackerInstance().markEnd('calculateTargetStats', mapToTrackerCategory(FlowCategory.Business), 'LearningTargetService', new Error('API Call End'));
    getLoggerInstance().logLearningTarget(
      `Hedef istatistikleri hesaplandı: Toplam=${totalTargets}, Tamamlanma=%${Math.round(completionRate)}`,
      'LearningTargetService.calculateTargetStats',
      __filename,
      536,
      { 
        result,
        duration 
      }
    );
    
    return result;
  }

  /**
   * Durum açıklamasını kişiselleştirir
   * @param {LearningTargetStatusLiteral} status - Öğrenme hedefi durumu
   * @param {number} scorePercent - Opsiyonel skor yüzdesi
   * @returns {string} Kişiselleştirilmiş açıklama
   */
  getPersonalizedStatusDescription(
    status: LearningTargetStatusLiteral,
    scorePercent?: number,
  ): string {
    getFlowTrackerInstance().trackStep(
      mapToTrackerCategory(FlowCategory.Business), 
      'Durum açıklaması üretiliyor', 
      'LearningTargetService.getPersonalizedStatusDescription',
      { status, scorePercent }
    );
    
    const personalizedDescriptions = {
      pending:
        "Henüz bu konuyu hiç çalışmadınız. Sınav çözerek bilgi seviyenizi ölçebilirsiniz.",
      failed: scorePercent
        ? `Son sınavınızda %${Math.round(scorePercent)} başarı gösterdiniz. Bu konu üzerinde daha fazla çalışmanız gerekiyor.`
        : "Bu konuda zorlanıyorsunuz. Daha fazla çalışmaya ihtiyacınız var.",
      medium: scorePercent
        ? `Son sınavınızda %${Math.round(scorePercent)} başarı gösterdiniz. İyi gidiyorsunuz, ancak gelişime açık alanlarınız var.`
        : "Bu konuda temel bilginiz var, ancak daha fazla pratik yapmanız önerilir.",
      mastered: scorePercent
        ? `Son sınavınızda %${Math.round(scorePercent)} başarı gösterdiniz. Harika gidiyorsunuz!`
        : "Bu konuda başarılısınız. Düzenli tekrar ile bilginizi koruyabilirsiniz.",
    };

    getLoggerInstance().logLearningTarget(
      `Durum açıklaması üretildi: ${status}`,
      'LearningTargetService.getPersonalizedStatusDescription',
      __filename,
      580,
      { 
        status, 
        scorePercent,
        description: personalizedDescriptions[status]
      }
    );

    return personalizedDescriptions[status];
  }

  /**
   * Öğrenme önerilerini oluşturur
   * @param {LearningTarget[]} targets - Öğrenme hedefleri
   * @returns {Array} Öğrenme önerileri
   */
  generateLearningRecommendations(
    targets: LearningTarget[],
  ): Array<{
    id: string;
    targetId: string;
    topicName: string;
    status: LearningTargetStatusLiteral;
    priority: "low" | "medium" | "high";
    recommendationType: "review" | "practice" | "learn";
    description: string;
  }> {
    getFlowTrackerInstance().markStart('generateRecommendations');
    
    getLoggerInstance().logLearningTarget(
      `Öğrenme önerileri oluşturuluyor: ${targets.length} hedef`,
      'LearningTargetService.generateLearningRecommendations',
      __filename,
      607,
      { count: targets.length }
    );
    
    const recommendations: Array<{
      id: string;
      targetId: string;
      topicName: string;
      status: LearningTargetStatusLiteral;
      priority: "low" | "medium" | "high";
      recommendationType: "review" | "practice" | "learn";
      description: string;
    }> = [];

    // Öncelik sıralaması: failed, medium, pending (sırayla)
    const failedTargets = targets.filter((t) => t.status === "failed");
    const mediumTargets = targets.filter((t) => t.status === "medium");
    const pendingTargets = targets.filter((t) => t.status === "pending");
    
    getLoggerInstance().logLearningTarget(
      'Hedef durumlarına göre gruplandırma yapıldı',
      'LearningTargetService.generateLearningRecommendations',
      __filename,
      627,
      { 
        failedCount: failedTargets.length,
        mediumCount: mediumTargets.length,
        pendingCount: pendingTargets.length
      }
    );

    // En fazla 2 adet başarısız hedef için öneri ekle
    failedTargets.slice(0, 2).forEach((target) => {
      recommendations.push({
        id: `rec_failed_${target.id}`,
        targetId: target.id,
        topicName: target.subTopicName,
        status: target.status,
        priority: "high",
        recommendationType: "practice",
        description: `${target.subTopicName} konusunda zorlanıyorsunuz. Daha fazla pratik yapmanız önerilir.`,
      });
    });

    // En fazla 2 adet orta hedef için öneri ekle
    mediumTargets.slice(0, 2).forEach((target) => {
      recommendations.push({
        id: `rec_medium_${target.id}`,
        targetId: target.id,
        topicName: target.subTopicName,
        status: target.status,
        priority: "medium",
        recommendationType: "review",
        description: `${target.subTopicName} konusunda iyisiniz, ancak daha da geliştirebilirsiniz.`,
      });
    });

    // En fazla 1 adet bekleyen hedef için öneri ekle
    pendingTargets.slice(0, 1).forEach((target) => {
      recommendations.push({
        id: `rec_pending_${target.id}`,
        targetId: target.id,
        topicName: target.subTopicName,
        status: target.status,
        priority: "low",
        recommendationType: "learn",
        description: `${target.subTopicName} konusunu henüz öğrenmeye başlamadınız.`,
      });
    });
    
    // Başarılı sonuç
    const duration = getFlowTrackerInstance().markEnd('generateRecommendations', mapToTrackerCategory(FlowCategory.Business), 'LearningTargetService', new Error('API Call End'));
    getLoggerInstance().logLearningTarget(
      `Öğrenme önerileri oluşturuldu: ${recommendations.length} öneri`,
      'LearningTargetService.generateLearningRecommendations',
      __filename,
      674,
      { 
        recommendationCount: recommendations.length,
        priorityDistribution: {
          high: recommendations.filter(r => r.priority === 'high').length,
          medium: recommendations.filter(r => r.priority === 'medium').length,
          low: recommendations.filter(r => r.priority === 'low').length
        },
        duration 
      }
    );

    return recommendations;
  }

  // Yeni konuları tespit et
  @LogMethod('LearningTargetService', FlowCategory.API)
  async detectNewTopics(
    courseId: string, 
    lessonContext: string, 
    existingTopicNames: string[]
  ): Promise<ProposedTopic[]> {
    console.group('🔍 [LearningTargetService] detectNewTopics - BAŞLADI');
    console.log('📋 Parametreler:', {
      courseId,
      lessonContextLength: lessonContext.length,
      lessonContextPreview: lessonContext.substring(0, 200) + '...',
      existingTopicNamesCount: existingTopicNames.length,
      existingTopicNames: existingTopicNames.slice(0, 5),
      timestamp: new Date().toISOString()
    });

    getFlowTrackerInstance().markStart(`detectNewTopics_${courseId}`);
    
    try {
      console.log('📊 Flow tracking başlatılıyor...');
      trackFlow(
        `Detecting new topics for course ${courseId} with ${existingTopicNames.length} existing topics`,
        "LearningTargetService.detectNewTopics",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/${courseId}/detect-new-topics`,
        'POST',
        'LearningTargetService.detectNewTopics',
        { courseId, contextLength: lessonContext.length, existingTopicsCount: existingTopicNames.length }
      );
      
      console.log('📝 Logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Yeni konu tespiti başlatılıyor: Kurs=${courseId}, Metin uzunluğu=${lessonContext.length}, Mevcut konu sayısı=${existingTopicNames.length}`,
        'LearningTargetService.detectNewTopics',
        __filename,
        785,
        { 
          courseId, 
          contextLength: lessonContext.length,
          existingTopicsCount: existingTopicNames.length,
          existingTopics: existingTopicNames.slice(0, 5) // İlk 5 konu için loglama
        }
      );
      
      console.log('🌐 API çağrısı yapılıyor...', {
        endpoint: `/learning-targets/${courseId}/detect-new-topics`,
        method: 'POST',
        requestBody: {
          lessonContext: lessonContext.substring(0, 100) + '...',
          existingTopicNamesCount: existingTopicNames.length
        }
      });

      const startTime = performance.now();
      const response = await apiService.post<DetectNewTopicsResponse>(
        `/learning-targets/${courseId}/detect-new-topics`,
        {
          lessonContext,
          existingTopicNames
        }
      );
      const endTime = performance.now();
      const apiDuration = endTime - startTime;

      // Extract the proposed topics from the standardized response
      const proposedTopics = response.data.proposedTopics;

      console.log('✅ API başarılı! Sonuçlar:', {
        success: response.success,
        message: response.message,
        proposedTopicsCount: proposedTopics.length,
        proposedTopics: proposedTopics.slice(0, 5), // Show first 5 with details
        apiDuration: `${apiDuration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Başarılı sonuç
      console.log('📊 Flow tracking sonlandırılıyor...');
      const duration = getFlowTrackerInstance().markEnd(`detectNewTopics_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      
      console.log('📝 Başarı logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Yeni konu tespiti tamamlandı: Kurs=${courseId}, Tespit edilen yeni konu sayısı=${proposedTopics.length}`,
        'LearningTargetService.detectNewTopics',
        __filename,
        810,
        { 
          courseId, 
          newTopicsCount: proposedTopics.length,
          newTopics: proposedTopics.map(t => t.name).slice(0, 10), // İlk 10 yeni konu için loglama
          duration 
        }
      );
      
      console.log('🎉 detectNewTopics BAŞARIYLA TAMAMLANDI');
      console.groupEnd();
      return proposedTopics;

    } catch (error) {
      console.error('❌ API HATASI:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : 'Stack yok',
        courseId,
        lessonContextLength: lessonContext.length,
        existingTopicNamesCount: existingTopicNames.length,
        timestamp: new Date().toISOString()
      });

      // Hata durumu
      getFlowTrackerInstance().markEnd(`detectNewTopics_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Yeni konu tespiti sırasında hata oluştu: ${courseId}`,
        'LearningTargetService.detectNewTopics',
        __filename,
        825,
        { courseId, contextLength: lessonContext.length, existingTopicsCount: existingTopicNames.length, error }
      );

      console.error('💥 detectNewTopics HATA İLE SONLANDI');
      console.groupEnd();
      throw error;
    }
  }

  // Yeni konuları onayla ve kaydet
  @LogMethod('LearningTargetService', FlowCategory.API)
  async confirmNewTopics(courseId: string, selectedTopics: ProposedTopic[]): Promise<LearningTarget[]> {
    console.group('✅ [LearningTargetService] confirmNewTopics - BAŞLADI');
    console.log('📋 Parametreler:', {
      courseId,
      selectedTopicsCount: selectedTopics.length,
      selectedTopics: selectedTopics,
      timestamp: new Date().toISOString()
    });

    getFlowTrackerInstance().markStart(`confirmNewTopics_${courseId}`);
    
    try {
      console.log('📊 Flow tracking başlatılıyor...');
      trackFlow(
        `Confirming ${selectedTopics.length} new topics for course ${courseId}`,
        "LearningTargetService.confirmNewTopics",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/confirm-new`,
        'POST',
        'LearningTargetService.confirmNewTopics',
        { courseId, topicsCount: selectedTopics.length }
      );
      
      console.log('📝 Logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Yeni konular onaylanıyor: Kurs=${courseId}, Onaylanacak konu sayısı=${selectedTopics.length}`,
        'LearningTargetService.confirmNewTopics',
        __filename,
        850,
        { 
          courseId, 
          topicsCount: selectedTopics.length,
          topicNames: selectedTopics.map(t => t.name).slice(0, 10) // İlk 10 konu adı için loglama
        }
      );
      
      console.log('🌐 API çağrısı yapılıyor...', {
        endpoint: `/learning-targets/confirm-new`,
        method: 'POST',
        requestBody: {
          courseId,
          selectedTopics: selectedTopics.map(topic => ({
            tempId: topic.tempId,
            name: topic.name
          }))
        }
      });

      const startTime = performance.now();
      const confirmedTargets = await apiService.post<LearningTarget[]>(
        `/learning-targets/confirm-new`,
        {
          courseId,
          selectedTopics: selectedTopics.map(topic => ({
            tempId: topic.tempId,
            name: topic.name
          }))
        }
      );
      const endTime = performance.now();
      const apiDuration = endTime - startTime;

      console.log('✅ API başarılı! Sonuçlar:', {
        confirmedTargetsCount: confirmedTargets.length,
        confirmedTargets: confirmedTargets.map(t => ({ 
          id: t.id, 
          name: t.subTopicName, 
          status: t.status 
        })),
        apiDuration: `${apiDuration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Başarılı sonuç
      console.log('📊 Flow tracking sonlandırılıyor...');
      const duration = getFlowTrackerInstance().markEnd(`confirmNewTopics_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      
      console.log('📝 Başarı logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Yeni konular başarıyla onaylandı ve kaydedildi: Kurs=${courseId}, Oluşturulan hedef sayısı=${confirmedTargets.length}`,
        'LearningTargetService.confirmNewTopics',
        __filename,
        875,
        { 
          courseId, 
          confirmedTargetsCount: confirmedTargets.length,
          targetIds: confirmedTargets.map(t => t.id).slice(0, 10), // İlk 10 hedef ID'si için loglama
          duration 
        }
      );
      
      console.log('🎉 confirmNewTopics BAŞARIYLA TAMAMLANDI');
      console.groupEnd();
      return confirmedTargets;

    } catch (error) {
      console.error('❌ ONAYLAMA HATASI:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : 'Stack yok',
        courseId,
        selectedTopicsCount: selectedTopics.length,
        selectedTopics,
        timestamp: new Date().toISOString()
      });

      // Hata durumu
      getFlowTrackerInstance().markEnd(`confirmNewTopics_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Yeni konuları onaylama ve kaydetme sırasında hata oluştu: ${courseId}`,
        'LearningTargetService.confirmNewTopics',
        __filename,
        890,
        { courseId, topicsCount: selectedTopics.length, topicNames: selectedTopics.map(t => t.name), error }
      );

      console.error('💥 confirmNewTopics HATA İLE SONLANDI');
      console.groupEnd();
      throw error;
    }
  }

  // Batch update öğrenme hedefleri
  @LogMethod('LearningTargetService', FlowCategory.API)
  async updateLearningTargetsBatch(
    temporaryTargets: Array<{
      topic: string;
      subTopic: string;
      status: 'PENDING' | 'FAILED' | 'MEDIUM' | 'MASTERED';
      score: number;
    }>
  ): Promise<{ success: boolean; updatedCount: number }> {
    console.group('🔄 [LearningTargetService] updateLearningTargetsBatch - BAŞLADI');
    console.log('📋 Parametreler:', {
      targetCount: temporaryTargets.length,
      targetsPreview: temporaryTargets.slice(0, 3),
      statusDistribution: temporaryTargets.reduce((acc, target) => {
        acc[target.status] = (acc[target.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      scoreRange: {
        min: Math.min(...temporaryTargets.map(t => t.score)),
        max: Math.max(...temporaryTargets.map(t => t.score)),
        avg: temporaryTargets.reduce((sum, t) => sum + t.score, 0) / temporaryTargets.length
      },
      timestamp: new Date().toISOString()
    });

    getFlowTrackerInstance().markStart('updateLearningTargetsBatch');
    
    try {
      console.log('📊 Flow tracking başlatılıyor...');
      trackFlow(
        `Batch updating learning targets: ${temporaryTargets.length} targets`,
        "LearningTargetService.updateLearningTargetsBatch",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/batch-update`,
        'PATCH',
        'LearningTargetService.updateLearningTargetsBatch',
        { targetCount: temporaryTargets.length }
      );
      
      console.log('📝 Logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Batch öğrenme hedefi güncellemesi başlatılıyor: ${temporaryTargets.length} hedef`,
        'LearningTargetService.updateLearningTargetsBatch',
        __filename,
        925,
        { 
          count: temporaryTargets.length,
          targets: temporaryTargets.map(t => ({ 
            topic: t.topic, 
            subTopic: t.subTopic, 
            status: t.status.toLowerCase(), 
            score: t.score 
          }))
        }
      );
      
      console.log('🌐 API çağrısı yapılıyor...', {
        endpoint: `/learning-targets/batch-update`,
        method: 'PATCH',
        requestBody: {
          targetsCount: temporaryTargets.length,
          sampleTargets: temporaryTargets.slice(0, 2),
          allStatuses: [...new Set(temporaryTargets.map(t => t.status))]
        }
      });

      // API çağrısı yap
      const startTime = performance.now();
      const result = await apiService.put<{ success: boolean; updatedCount: number }>(
        `/learning-targets/batch-update`, 
        { targets: temporaryTargets }
      );
      const endTime = performance.now();
      const apiDuration = endTime - startTime;

      console.log('✅ API başarılı! Sonuçlar:', {
        success: result.success,
        updatedCount: result.updatedCount,
        requestedCount: temporaryTargets.length,
        successRate: `${((result.updatedCount / temporaryTargets.length) * 100).toFixed(1)}%`,
        apiDuration: `${apiDuration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Başarılı sonuç
      console.log('📊 Flow tracking sonlandırılıyor...');
      const duration = getFlowTrackerInstance().markEnd('updateLearningTargetsBatch', mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      
      console.log('📝 Başarı logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Batch güncelleme tamamlandı: ${result.updatedCount}/${temporaryTargets.length} hedef güncellendi`,
        'LearningTargetService.updateLearningTargetsBatch',
        __filename,
        945,
        { 
          requestedCount: temporaryTargets.length,
          updatedCount: result.updatedCount,
          success: result.success,
          duration 
        }
      );
      
      console.log('🎉 updateLearningTargetsBatch BAŞARIYLA TAMAMLANDI');
      console.groupEnd();
      return result;
    } catch (error) {
      console.error('❌ API HATASI:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : 'Stack yok',
        targetCount: temporaryTargets.length,
        targetsPreview: temporaryTargets.slice(0, 2),
        timestamp: new Date().toISOString()
      });

      // Hata durumu
      getFlowTrackerInstance().markEnd('updateLearningTargetsBatch', mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      trackFlow(
        `Error in batch updating learning targets: ${(error as Error).message}`,
        "LearningTargetService.updateLearningTargetsBatch",
        FlowCategory.API,
        { error, targetCount: temporaryTargets.length }
      );
      
      getLoggerInstance().logLearningTarget(
        `Batch öğrenme hedefi güncellemesinde hata oluştu: ${temporaryTargets.length} hedef`,
        'LearningTargetService.updateLearningTargetsBatch',
        __filename,
        960,
        { count: temporaryTargets.length, error }
      );

      console.error('💥 updateLearningTargetsBatch HATA İLE SONLANDI');
      console.groupEnd();
      throw error;
    }
  }

  // Batch update öğrenme hedefleri - Yeni API endpoint için
  @LogMethod('LearningTargetService', FlowCategory.API)
  async batchUpdateTargets(targets: Array<{
    subTopicName: string;
    status: 'pending' | 'failed' | 'medium' | 'mastered';
    lastScore?: number;
  }>): Promise<{ success: boolean; processedCount: number }> {
    console.group('🔄 [LearningTargetService] batchUpdateTargets - BAŞLADI');
    console.log('📋 Parametreler:', {
      targetCount: targets.length,
      targetsPreview: targets.slice(0, 3),
      statusDistribution: targets.reduce((acc, target) => {
        acc[target.status] = (acc[target.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    });

    getFlowTrackerInstance().markStart('batchUpdateTargets');
    
    try {
      console.log('📊 Flow tracking başlatılıyor...');
      trackFlow(
        `Batch updating learning targets: ${targets.length} targets`,
        "LearningTargetService.batchUpdateTargets",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/batch-update`,
        'POST',
        'LearningTargetService.batchUpdateTargets',
        { targetCount: targets.length }
      );
      
      console.log('📝 Logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Batch öğrenme hedefi güncellemesi başlatılıyor: ${targets.length} hedef`,
        'LearningTargetService.batchUpdateTargets',
        __filename,
        1185,
        { 
          count: targets.length,
          targets: targets.map(t => ({ 
            subTopicName: t.subTopicName, 
            status: t.status.toLowerCase(), 
            lastScore: t.lastScore 
          }))
        }
      );

      console.log('🌐 API çağrısı yapılıyor...', {
        endpoint: `/learning-targets/batch-update`,
        method: 'POST',
        requestBody: {
          targetsCount: targets.length,
          sampleTargets: targets.slice(0, 2),
          allStatuses: [...new Set(targets.map(t => t.status))]
        }
      });

      // API çağrısı yap
      const startTime = performance.now();
      const result = await apiService.post<{ success: boolean; processedCount: number }>(
        `/learning-targets/batch-update`, 
        { targets: targets }
      );
      const endTime = performance.now();
      const apiDuration = endTime - startTime;

      console.log('✅ API başarılı! Sonuçlar:', {
        success: result.success,
        processedCount: result.processedCount,
        requestedCount: targets.length,
        apiDuration: `${apiDuration.toFixed(2)}ms`
      });

      // Başarılı sonuç
      const duration = getFlowTrackerInstance().markEnd('batchUpdateTargets', mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      
      console.log('📝 Başarı logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Batch güncelleme tamamlandı: ${result.processedCount}/${targets.length} hedef güncellendi`,
        'LearningTargetService.batchUpdateTargets',
        __filename,
        1225,
        { 
          requestedCount: targets.length,
          processedCount: result.processedCount,
          success: result.success,
          duration 
        }
      );

      console.log('🎉 batchUpdateTargets BAŞARIYLA TAMAMLANDI');
      console.groupEnd();
      return result;
    } catch (error) {
      console.error('❌ API HATASI:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : 'Stack yok',
        targetCount: targets.length,
        targetsPreview: targets.slice(0, 2),
        timestamp: new Date().toISOString()
      });

      // Hata durumu
      getFlowTrackerInstance().markEnd('batchUpdateTargets', mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      trackFlow(
        `Error in batch updating learning targets: ${(error as Error).message}`,
        "LearningTargetService.batchUpdateTargets",
        FlowCategory.API,
      );
      
      getLoggerInstance().logLearningTarget(
        `Batch öğrenme hedefi güncellemesinde hata oluştu: ${targets.length} hedef`,
        'LearningTargetService.batchUpdateTargets',
        __filename,
        1255,
        { count: targets.length, error }
      );

      console.error('💥 batchUpdateTargets HATA İLE SONLANDI');
      console.groupEnd();
      throw error;
    }
  }

  // Yeni konu önerilerini AI'dan al
  @LogMethod('LearningTargetService', FlowCategory.API)
  async proposeNewTopics(dto: {
    courseId?: string;
    contextText?: string;
    existingTopicTexts: string[];
  }): Promise<{ proposedTopics: { tempId: string; name: string; relevance?: string; details?: string }[] }> {
    console.group('🤖 [LearningTargetService] proposeNewTopics - BAŞLADI');
    console.log('📋 Parametreler:', {
      courseId: dto.courseId,
      contextTextLength: dto.contextText?.length || 0,
      contextTextPreview: dto.contextText?.substring(0, 200) + '...',
      existingTopicTextsCount: dto.existingTopicTexts.length,
      existingTopicTexts: dto.existingTopicTexts.slice(0, 5),
      timestamp: new Date().toISOString()
    });

    getFlowTrackerInstance().markStart(`proposeNewTopics_${dto.courseId || 'no-course'}`);
    
    try {
      console.log('📊 Flow tracking başlatılıyor...');
      trackFlow(
        `Proposing new topics for course ${dto.courseId || 'no course'} with ${dto.existingTopicTexts.length} existing topics`,
        "LearningTargetService.proposeNewTopics",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/propose-new`,
        'POST',
        'LearningTargetService.proposeNewTopics',
        { courseId: dto.courseId, contextLength: dto.contextText?.length || 0, existingTopicsCount: dto.existingTopicTexts.length }
      );
      
      console.log('📝 Logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Yeni konu önerileri tespiti başlatılıyor: Kurs=${dto.courseId || 'no-course'}, Metin uzunluğu=${dto.contextText?.length || 0}, Mevcut konu sayısı=${dto.existingTopicTexts.length}`,
        'LearningTargetService.proposeNewTopics',
        __filename,
        915,
        { 
          courseId: dto.courseId, 
          contextLength: dto.contextText?.length || 0,
          existingTopicsCount: dto.existingTopicTexts.length,
          existingTopics: dto.existingTopicTexts.slice(0, 5)
        }
      );
      
      console.log('🌐 API çağrısı yapılıyor...', {
        endpoint: `/learning-targets/propose-new`,
        method: 'POST',
        requestBody: {
          contextText: dto.contextText?.substring(0, 100) + '...',
          existingTopicTextsCount: dto.existingTopicTexts.length
        }
      });

      const startTime = performance.now();
      const response = await apiService.post<DetectNewTopicsResponse>(
        `/learning-targets/propose-new`,
        {
          courseId: dto.courseId,
          contextText: dto.contextText,
          existingTopicTexts: dto.existingTopicTexts
        }
      );
      const endTime = performance.now();
      const apiDuration = endTime - startTime;

      console.log('✅ API başarılı! Sonuçlar:', {
        success: response.success,
        message: response.message,
        proposedTopicsCount: response.data.proposedTopics.length,
        proposedTopics: response.data.proposedTopics.slice(0, 5), // Show first 5 with details
        apiDuration: `${apiDuration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Başarılı sonuç
      console.log('📊 Flow tracking sonlandırılıyor...');
      const duration = getFlowTrackerInstance().markEnd(`proposeNewTopics_${dto.courseId || 'no-course'}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      
      console.log('📝 Başarı logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `Yeni konu önerileri tespiti tamamlandı: Kurs=${dto.courseId || 'no-course'}, Tespit edilen önerilen konu sayısı=${response.data.proposedTopics.length}`,
        'LearningTargetService.proposeNewTopics',
        __filename,
        970,
        { 
          courseId: dto.courseId, 
          proposedTopicsCount: response.data.proposedTopics.length,
          proposedTopics: response.data.proposedTopics.slice(0, 10),
          duration 
        }
      );
      
      console.log('🎉 proposeNewTopics BAŞARIYLA TAMAMLANDI');
      console.groupEnd();
      return response.data;

    } catch (error) {
      console.error('❌ API HATASI:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : 'Stack yok',
        courseId: dto.courseId,
        contextTextLength: dto.contextText?.length || 0,
        existingTopicTextsCount: dto.existingTopicTexts.length,
        timestamp: new Date().toISOString()
      });

      // Hata durumu
      getFlowTrackerInstance().markEnd(`proposeNewTopics_${dto.courseId || 'no-course'}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `Yeni konu önerileri tespiti sırasında hata oluştu: ${dto.courseId || 'no-course'}`,
        'LearningTargetService.proposeNewTopics',
        __filename,
        995,
        { courseId: dto.courseId, contextLength: dto.contextText?.length || 0, existingTopicsCount: dto.existingTopicTexts.length, error }
      );

      console.error('💥 proposeNewTopics HATA İLE SONLANDI');
      console.groupEnd();
      throw error;
    }
  }

  // AI önerilerini onaylayıp öğrenme hedefleri olarak kaydet
  @LogMethod('LearningTargetService', FlowCategory.API)
  async confirmProposedTopics(courseId: string, selectedTopics: { tempId: string; name: string; relevance?: string; details?: string }[]): Promise<LearningTarget[]> {
    console.group('✅ [LearningTargetService] confirmProposedTopics - BAŞLADI');
    console.log('📋 Parametreler:', {
      courseId,
      selectedTopicsCount: selectedTopics.length,
      selectedTopics: selectedTopics.map(t => ({ tempId: t.tempId, name: t.name })),
      timestamp: new Date().toISOString()
    });

    getFlowTrackerInstance().markStart(`confirmProposedTopics_${courseId}`);
    
    try {
      console.log('📊 Flow tracking başlatılıyor...');
      trackFlow(
        `Confirming ${selectedTopics.length} proposed topics for course ${courseId}`,
        "LearningTargetService.confirmProposedTopics",
        FlowCategory.API
      );
      
      getFlowTrackerInstance().trackApiCall(
        `/learning-targets/${courseId}/confirm-new`,
        'POST',
        'LearningTargetService.confirmProposedTopics',
        { courseId, selectedTopicsCount: selectedTopics.length }
      );
      
      console.log('📝 Logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `AI önerilen konular onaylanıp kaydediliyor: Kurs=${courseId}, Onaylanacak konu sayısı=${selectedTopics.length}`,
        'LearningTargetService.confirmProposedTopics',
        __filename,
        1090,
        { 
          courseId, 
          selectedTopicsCount: selectedTopics.length,
          topics: selectedTopics.map(t => t.name).slice(0, 10)
        }
      );
      
      console.log('🌐 API çağrısı yapılıyor...', {
        endpoint: `/learning-targets/confirm-ne`,
        method: 'POST',
        requestBody: {
          selectedTopicsCount: selectedTopics.length
        }
      });

      const startTime = performance.now();
      const response = await apiService.post<LearningTarget[]>(
        `/learning-targets/confirm-new`,
        {
          courseId,
          selectedTopics
        }
      );
      const endTime = performance.now();
      const apiDuration = endTime - startTime;

      console.log('✅ API başarılı! Sonuçlar:', {
        createdTargetsCount: response.length,
        createdTargets: response.slice(0, 5), // Show first 5
        apiDuration: `${apiDuration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Başarılı sonuç
      console.log('📊 Flow tracking sonlandırılıyor...');
      const duration = getFlowTrackerInstance().markEnd(`confirmProposedTopics_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      
      console.log('📝 Başarı logger mesajı kaydediliyor...');
      getLoggerInstance().logLearningTarget(
        `AI önerilen konular başarıyla kaydedildi: Kurs=${courseId}, Oluşturulan hedef sayısı=${response.length}`,
        'LearningTargetService.confirmProposedTopics',
        __filename,
        1130,
        { 
          courseId, 
          createdCount: response.length,
          duration 
        }
      );
      
      console.log('🎉 confirmProposedTopics BAŞARIYLA TAMAMLANDI');
      console.groupEnd();
      return response;

    } catch (error) {
      console.error('❌ API HATASI:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : 'Stack yok',
        courseId,
        selectedTopicsCount: selectedTopics.length,
        timestamp: new Date().toISOString()
      });

      // Hata durumu
      getFlowTrackerInstance().markEnd(`confirmProposedTopics_${courseId}`, mapToTrackerCategory(FlowCategory.API), 'LearningTargetService', new Error('API Call End'));
      getLoggerInstance().logLearningTarget(
        `AI önerilen konuları onaylama sırasında hata oluştu: ${courseId}`,
        'LearningTargetService.confirmProposedTopics',
        __filename,
        1155,
        { courseId, selectedTopicsCount: selectedTopics.length, error }
      );

      console.error('💥 confirmProposedTopics HATA İLE SONLANDI');
      console.groupEnd();
      throw error;
    }
  }
}

// Singleton instance oluştur ve export et
const learningTargetService = new LearningTargetService();
export default learningTargetService;
