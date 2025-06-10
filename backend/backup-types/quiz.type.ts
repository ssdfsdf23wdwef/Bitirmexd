import { Question } from './question.type';

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


interface QuizPreferences {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timeLimit?: number | null;
  prioritizeWeakAndMediumTopics?: boolean | null;
}


interface DocumentSource {
  documentId: string;
  fileName: string;
  fileType: string;
  storagePath: string;
}

/**
 * Konu seçimi
 */
interface TopicSelection {
  subTopic: string;
  normalizedSubTopic: string;
  count?: number;
}

interface AnalysisResult {
  overallScore: number;
  performanceBySubTopic: Record<
    string,
    {
      scorePercent: number;
      status: 'pending' | 'failed' | 'medium' | 'mastered';
      questionCount: number;
      correctCount: number;
    }
  >;
  performanceCategorization: {
    failed: string[];
    medium: string[];
    mastered: string[];
  };
  performanceByDifficulty: Record<
    string,
    {
      count: number;
      correct: number;
      score: number;
    }
  >;
  recommendations?: string[] | null;
}

/**
 * Quiz özet bilgisi
 */
export interface QuizSummary {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  questionCount: number;
  score?: number | null;
  completedAt?: string | null;
  timestamp: string;
}

