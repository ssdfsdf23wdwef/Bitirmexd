import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/services/api.service";
import {
  LearningTarget,
  TopicDetectionRequest,
  BatchCreateLearningTargetsRequest,
  LearningTargetStatusLiteral,
} from "@/types/learningTarget.type";

// Api endpoint'leri
const API_ENDPOINTS = {
  BASE: "/learning-targets",
  BATCH: "/learning-targets/batch",
  BY_COURSE: (courseId: string) => `/learning-targets?courseId=${courseId}`,
  DETECT_TOPICS: "/learning-targets/detect-topics",
  UPDATE_STATUSES: "/learning-targets/update-statuses",
  BY_ID: (id: string) => `/learning-targets/${id}`,
};

// Learning target servis fonksiyonları
const learningTargetService = {
  /**
   * Dersin öğrenme hedeflerini getirir
   */
  getLearningTargets: async (courseId?: string): Promise<LearningTarget[]> => {
    if (!courseId) {
      return apiService.get<LearningTarget[]>(API_ENDPOINTS.BASE);
    }
    return apiService.get<LearningTarget[]>(API_ENDPOINTS.BY_COURSE(courseId));
  },

  /**
   * Belgedeki konuları tespit eder
   */
  detectTopics: async (request: TopicDetectionRequest) => {
    return apiService.post<unknown>(API_ENDPOINTS.DETECT_TOPICS, {
      ...request,
    });
  },

  /**
   * Bir ders için toplu öğrenme hedefleri oluşturur
   * Backend'in beklediği format: { courseId, topics }
   */
  createBatchLearningTargets: async (
    request: BatchCreateLearningTargetsRequest,
  ) => {
    return apiService.post<LearningTarget[]>(API_ENDPOINTS.BATCH, {
      ...request,
    });
  },

  /**
   * Bir öğrenme hedefini günceller
   */
  updateLearningTarget: async (
    id: string,
    data: Partial<LearningTarget>,
  ): Promise<LearningTarget> => {
    return apiService.put<LearningTarget>(API_ENDPOINTS.BY_ID(id), data);
  },

  /**
   * Birden fazla öğrenme hedefinin durumunu günceller
   */
  updateStatuses: async (
    targetUpdates: Array<{
      id: string;
      status: LearningTargetStatusLiteral;
      lastAttemptScorePercent: number;
    }>,
  ): Promise<LearningTarget[]> => {
    return apiService.put<LearningTarget[]>(API_ENDPOINTS.UPDATE_STATUSES, {
      targetUpdates,
    });
  },

  /**
   * Bir öğrenme hedefini siler
   */
  deleteLearningTarget: async (
    id: string,
  ): Promise<{ id: string; success: boolean }> => {
    return apiService.delete<{ id: string; success: boolean }>(
      API_ENDPOINTS.BY_ID(id),
    );
  },
};

// Query hook'ları
export const useLearningTargets = (courseId?: string) => {
  return useQuery({
    queryKey: courseId
      ? ["learningTargets", "course", courseId]
      : ["learningTargets"],
    queryFn: () => learningTargetService.getLearningTargets(courseId),
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};







// eslint-disable-next-line import/no-anonymous-default-export
