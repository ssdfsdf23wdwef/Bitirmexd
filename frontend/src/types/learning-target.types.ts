/**
 * Learning target status enum
 */
export enum LearningTargetStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

/**
 * Learning target source type
 */
type LearningTargetSource = 'ai_proposal' | 'manual' | 'document_import';

/**
 * Learning target interface
 */
export interface LearningTarget {
  id: string;
  userId: string;
  courseId?: string;
  topicName: string;
  status: LearningTargetStatus;
  isNewTopic: boolean;
  source: LearningTargetSource;
  originalProposedId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Learning target with additional quiz data
 */
interface LearningTargetWithQuizzes extends LearningTarget {
  quizzes: string[]; // Quiz IDs
  lastAttempt: Date | null;
  lastAttemptScorePercent: number | null;
  failCount: number;
  mediumCount: number;
  successCount: number;
  attemptCount: number;
}

/**
 * Create learning target DTO
 */
interface CreateLearningTargetDto {
  courseId?: string;
  topicName: string;
  status?: LearningTargetStatus;
  notes?: string;
}

/**
 * Update learning target DTO
 */
interface UpdateLearningTargetDto {
  topicName?: string;
  status?: LearningTargetStatus;
  notes?: string;
}

/**
 * Detect new topics DTO
 */
interface DetectNewTopicsDto {
  courseId?: string;
  existingTopicTexts: string[];
  contextText?: string;
}

/**
 * Proposed topic from AI
 */
export interface ProposedTopic {
  tempId: string;
  name: string;
  relevance?: string;
  details?: string;
}

/**
 * Confirm new topics DTO
 */
interface ConfirmNewTopicsDto {
  courseId: string;
  selectedTopics: ProposedTopic[];
}

/**
 * Standardized API response format
 */
interface StandardizedApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Detect new topics API response data
 */
interface DetectNewTopicsResponseData {
  proposedTopics: ProposedTopic[];
}

/**
 * Complete detect new topics API response
 */
export interface DetectNewTopicsResponse extends StandardizedApiResponse<DetectNewTopicsResponseData> {
  data: DetectNewTopicsResponseData;
}
