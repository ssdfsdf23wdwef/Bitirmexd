/**
 * Birleşik Type Tanımları
 * Backend'deki tüm type'lar bu dosyada toplandı
 * @description Tüm modelleri, DTO'ları ve interface'leri içeren merkezi type dosyası
 */

// ==================== TEMA TYPES ====================

export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

// ==================== KULLANICI TYPES ====================

/**
 * Kullanıcı (User) modelini temsil eden interface
 * @see PRD 7.1
 */
export interface User {
  id: string;
  uid: string;
  firebaseUid: string; // Firebase kullanıcı ID'si
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  role?: 'USER' | 'ADMIN';
  onboarded?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  settings?: Record<string, any>;
}

/**
 * Kullanıcı güncelleme DTO
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  onboarded?: boolean;
}

/**
 * Kullanıcı istatistikleri
 */
export interface UserStats {
  completedQuizzes: number;
  averageScore: number;
  totalCourses: number;
  lastActive?: string; // ISO date string
}

/**
 * Kullanıcı tercihleri
 */
export interface UserPreferences {
  theme?: ThemeType;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  language?: string;
}

/**
 * Kullanıcı refresh token
 */
export interface UserRefreshToken {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== KURS TYPES ====================

/**
 * Ders (Course) modelini temsil eden interface
 * @see PRD 7.2
 */
export interface Course {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Kurs oluşturma DTO
 */
export interface CreateCourseDto {
  name: string;
  description?: string;
}

/**
 * Kurs güncelleme DTO
 */
export interface UpdateCourseDto {
  name?: string;
  description?: string;
}

/**
 * Kurs istatistikleri
 */
export interface CourseStats {
  courseId: string;
  totalDocuments: number;
  totalQuizzes: number;
  totalLearningTargets: number;
  learningTargetStatusCounts: {
    pending: number;
    failed: number;
    medium: number;
    mastered: number;
  };
  lastQuiz?: {
    id: string;
    timestamp: string;
    score: number;
  };
  averageScore: number;
}

/**
 * Kurs hedef istatistikleri
 */
export interface CourseTargetStats {
  courseId: string;
  targetStats: {
    pending: number;
    failed: number;
    medium: number;
    mastered: number;
    total: number;
  };
  quizHistory: Array<{
    id: string;
    date: string;
    score: number;
    quizType: string;
  }>;
  overallStats: {
    totalQuizzes: number;
    averageScore: number;
    masteryPercentage: number;
  };
}

/**
 * Kurs Dashboard Veri Yapısı
 */
export interface CourseDashboardData {
  course: Course;
  stats: CourseStats;
  recentQuizzes: Array<{
    id: string;
    quizType: string;
    timestamp: string;
    score: number;
    totalQuestions: number;
  }>;
  learningTargetTrends: Array<{
    date: string;
    pending: number;
    failed: number;
    medium: number;
    mastered: number;
  }>;
  scoreHistory: Array<{
    date: string;
    score: number;
  }>;
}

// ==================== BELGE TYPES ====================

/**
 * Belge (Document) modelini temsil eden interface
 * @see PRD 7.8
 */
export interface Document {
  id: string;
  userId: string;
  courseId?: string | null;
  fileName: string;
  storagePath: string;
  storageUrl: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Belge listeleme için minimal alanlar
 */
export interface DocumentListItem {
  id: string;
  fileName: string;
  storagePath: string;
  storageUrl: string;
  fileType: string;
  fileSize: number;
  courseId?: string | null;
  createdAt: string;
}

/**
 * Belge yükleme DTO
 */
export interface UploadDocumentDto {
  fileName: string;
  fileType: string;
  fileSize: number;
  courseId?: string | null;
}

/**
 * Belge güncelleme DTO
 */
export interface UpdateDocumentDto {
  fileName?: string;
  courseId?: string | null;
}

/**
 * Belge kaynak bilgisi
 */
export interface DocumentSource {
  documentId?: string;
  fileName: string;
  fileType?: string;
  storagePath: string;
}

// ==================== ÖĞRENME HEDEFİ TYPES ====================

/**
 * Öğrenme hedefi durumu
 */
export type LearningTargetStatus = 'pending' | 'failed' | 'medium' | 'mastered';

/**
 * Öğrenme hedefi kaynağı
 */
export type LearningTargetSource = 
  | 'user_created' 
  | 'document_extracted' 
  | 'ai_generated_new' 
  | 'legacy'
  | 'manual';

/**
 * Öğrenme Hedefi (LearningTarget) modelini temsil eden interface
 * @see PRD 7.3
 */
export interface LearningTarget {
  id: string;
  courseId: string;
  userId: string;
  subTopicName: string;
  normalizedSubTopicName: string;
  mainTopic?: string;
  status: LearningTargetStatus;
  failCount: number;
  mediumCount: number;
  successCount: number;
  lastAttemptScorePercent: number | null;
  lastAttempt: string | null;
  firstEncountered: string;
  source?: LearningTargetSource;
  notes?: string;
  createdAt?: any; // FirebaseFirestore.Timestamp
  updatedAt?: any; // FirebaseFirestore.Timestamp
}

/**
 * Öğrenme hedefi oluşturma DTO
 */
export interface CreateLearningTargetDto {
  courseId: string;
  subTopicName: string;
  normalizedSubTopicName?: string;
  status?: LearningTargetStatus;
  source?: LearningTargetSource;
}

/**
 * Öğrenme hedefi güncelleme DTO
 */
export interface UpdateLearningTargetDto {
  status?: LearningTargetStatus;
  failCount?: number;
  mediumCount?: number;
  successCount?: number;
  lastAttemptScorePercent?: number | null;
  lastAttempt?: string | null;
}

/**
 * Quiz verilerine sahip öğrenme hedefi
 */
export interface LearningTargetWithQuizzes extends LearningTarget {
  quizzes?: Array<{
    id: string;
    type: string;
    completedAt: Date;
    questions: Array<{
      subTopicName: string;
      scorePercent: number;
    }>;
  }>;
  lastPersonalizedQuizId?: string | null;
}

/**
 * Öğrenme hedefi durumu güncellemesi
 */
export interface LearningTargetStatusUpdate {
  id: string;
  status: LearningTargetStatus;
  scorePercent: number;
  quizId?: string;
}

// ==================== SORU TYPES ====================

/**
 * Soru seçeneği
 */
export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

/**
 * Soru (Question) modelini temsil eden interface
 * @see PRD 7.5
 */
export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subTopicName?: string;
  normalizedSubTopicName?: string;
  subTopic?: string;
  normalizedSubTopic?: string;
  difficulty: string;
  questionType?: string;
  cognitiveDomain?: string;
}

/**
 * Başarısız Soru modelini temsil eden interface
 * @see PRD 7.7
 */
export interface FailedQuestion {
  id: string;
  userId: string;
  quizId: string;
  questionId: string;
  courseId?: string | null;
  questionText: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  subTopicName: string;
  normalizedSubTopicName: string;
  difficulty: string;
  failedTimestamp: string;
}

/**
 * Soru oluşturma DTO
 */
export interface CreateQuestionDto {
  text: string;
  description?: string | null;
  type: 'multiple_choice' | 'single_choice' | 'true_false' | 'coding' | 'open_ended';
  format?: 'text' | 'code' | 'image' | 'mixed';
  mainTopic: string;
  subTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  codeContent?: string | null;
  language?: string | null;
  estimatedTime?: number;
}

/**
 * Soru güncelleme DTO
 */
export interface UpdateQuestionDto {
  text?: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: string;
}

// ==================== SINAV TYPES ====================

/**
 * Quiz tercihleri
 */
export interface QuizPreferences {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timeLimit?: number | null;
  prioritizeWeakAndMediumTopics?: boolean | null;
}

/**
 * Konu seçimi
 */
export interface TopicSelection {
  subTopic: string;
  normalizedSubTopic: string;
  count?: number;
}

/**
 * Sınav (Quiz) modelini temsil eden interface
 * @see PRD 7.4
 */
export interface Quiz {
  id: string;
  userId: string;
  courseId?: string | null;
  quizType: string;
  personalizedQuizType: string | null;
  sourceDocument?: DocumentSource | null;
  selectedSubTopics?: TopicSelection[] | null;
  preferences: QuizPreferences;
  questions: Question[];
  userAnswers: Record<string, string>;
  score: number;
  correctCount: number;
  totalQuestions: number;
  elapsedTime?: number | null;
  analysisResult?: AnalysisResult | null;
  timestamp: Date | string;
}

/**
 * Sınav Analiz Sonucu
 * @see PRD 7.6
 */
export interface AnalysisResult {
  overallScore: number;
  performanceBySubTopic: Record<string, {
    scorePercent: number;
    status: LearningTargetStatus;
    questionCount: number;
    correctCount: number;
  }>;
  performanceCategorization: {
    failed: string[];
    medium: string[];
    mastered: string[];
  };
  performanceByDifficulty: Record<string, {
    count: number;
    correct: number;
    score: number;
  }>;
  recommendations?: string[] | null;
}

/**
 * Quiz özet bilgisi
 */
export interface QuizSummary {
  id: string;
  quizType: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  courseId?: string | null;
}

/**
 * Konu performansı
 */
export interface TopicPerformance {
  subTopicName: string;
  normalizedSubTopicName: string;
  status: LearningTargetStatus;
  scorePercent: number;
  questionCount: number;
  correctCount: number;
}

/**
 * Quiz sonuç özeti
 */
export interface QuizResultSummary {
  overallScore: number;
  totalQuestions: number;
  correctCount: number;
  performanceBySubTopic: TopicPerformance[];
  recommendations: string[];
}

/**
 * Sınav oluşturma DTO
 */
export interface GenerateQuizDto {
  subTopics?: string[] | TopicSelection[];
  questionCount?: number;
  difficulty?: string;
  prioritizeWeakAndMediumTopics?: boolean;
  documentId?: string;
  courseId?: string;
  quizType?: string;
  personalizedQuizType?: string;
}

/**
 * Sınav gönderme DTO
 */
export interface SubmitQuizDto {
  quizId: string;
  answers: Record<string, string>;
  elapsedTime?: number;
  courseId?: string | null;
  quizType: string;
  personalizedQuizType?: string | null;
  sourceDocument?: DocumentSource | null;
  selectedSubTopics?: TopicSelection[] | null;
  preferences: QuizPreferences;
  questions: QuestionDto[];
}

/**
 * Soru DTO (submit için)
 */
export interface QuestionDto {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subTopicName: string;
  normalizedSubTopicName: string;
  difficulty: string;
}

// ==================== AI INTERFACE TYPES ====================

/**
 * Sınav sorusu arayüzü (AI için)
 */
export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subTopicName: string;
  normalizedSubTopicName: string;
  difficulty: string;
  questionType: string;
  cognitiveDomain: string;
}

/**
 * Alt konu tipi
 */
export type SubTopicType =
  | string[]
  | { subTopicName: string; count: number; status?: string }[];

/**
 * Sınav oluşturma seçenekleri (AI için)
 */
export interface QuizGenerationOptions {
  subTopics: SubTopicType;
  questionCount: number;
  difficulty?: string;
  prioritizeWeakAndMediumTopics?: boolean;
  documentText?: string;
  personalizationContext?: string;
  quizType?: 'quick' | 'personalized';
  courseId?: string | null;
  personalizedQuizType?: string | null;
  userId?: string;
  documentId?: string;
  traceId?: string;
}

/**
 * Quiz metadata
 */
export interface QuizMetadata {
  traceId: string;
  subTopicsCount?: number;
  difficulty?: string;
  questionCount?: number;
  userId?: string;
  documentId?: string;
  keywords?: string;
  specialTopic?: string;
  subTopics?: SubTopicType;
  documentText?: string;
  personalizationContext?: string;
  courseId?: string | null;
  personalizedQuizType?: string | null;
}

// ==================== REQUEST TYPES ====================

/**
 * Request with User interface
 */
export interface RequestWithUser {
  user: {
    id: string;
    uid: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string | null;
    role?: string;
    createdAt?: string | Date;
    lastLogin?: string | Date;
    firebaseUser?: any;
  };
}

// ==================== SERVICE-SPECIFIC TYPES ====================

/**
 * Dashboard Quiz tipi (Courses Service için)
 */
export interface DashboardQuiz {
  id: string;
  date: Date;
  score: number;
  quizType: string | null;
}

/**
 * Öğrenme hedefi analizi tipi (Courses Service için)
 */
export interface LearningTargetAnalysis {
  id: string;
  subTopicName: string;
  status: string;
  failCount: number;
  mediumCount: number;
  successCount: number;
  lastAttempt: Date | null;
  lastAttemptScorePercent: number | null;
  firstEncountered: Date;
}

/**
 * Durum dağılımı tipi (Courses Service için)
 */
export interface StatusDistribution {
  pending: number;
  failed: number;
  medium: number;
  mastered: number;
  total: number;
}

/**
 * Hedef ilerleme tipi (Courses Service için)
 */
export interface TargetProgress {
  targetId: string;
  subTopicName: string;
  currentStatus: string;
  progressData: Array<{
    date: Date;
    score: number;
    status: string;
  }>;
}

/**
 * Panel veri tipi (Courses Service için)
 */
export interface DashboardData {
  courseId: string;
  overallProgress: StatusDistribution;
  recentQuizzes: Array<{
    id: string;
    timestamp: string;
    score: number;
    totalQuestions: number;
  }>;
  progressByTopic: Array<{
    subTopic: string;
    status: string;
    scorePercent: number;
  }>;
}

/**
 * İlişkili öğe sayıları tipi (Courses Service için)
 */
export interface RelatedItemsCount {
  courseId: string;
  learningTargets: number;
  quizzes: number;
  failedQuestions: number;
  documents: number;
  total: number;
}

/**
 * Quiz oluşturma parametreleri (Quizzes Service için)
 */
export interface CreateQuizParams {
  userId: string;
  courseId?: string | null;
  documentId?: string;
  subTopics?: string[] | TopicSelection[];
  questionCount?: number;
  difficulty?: string;
  prioritizeWeakAndMediumTopics?: boolean;
  quizType?: string;
  personalizedQuizType?: string | null;
  traceId?: string;
}

/**
 * Alt konu güncelleme tipi (Quizzes Service için)
 */
export interface SubtopicUpdate {
  subTopicName: string;
  normalizedSubTopicName: string;
  status: LearningTargetStatus;
  scorePercent: number;
  quizId: string;
}

// ==================== UTILITY TYPES ====================

/**
 * Hata ile metadata
 */
export interface ErrorWithMetadata extends Error {
  metadata?: Record<string, any>;
}

/**
 * API Response formatı
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
