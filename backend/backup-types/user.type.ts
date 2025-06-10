
export interface User {
  id: string;
  uid: string;
  firebaseUid: string; // Firebase kullanıcı ID'si (auth.service.ts için gerekli)
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  role?: 'USER' | 'ADMIN';
  onboarded?: boolean;
  createdAt: Date;
  updatedAt: Date; // Güncellenme tarihi
  lastLogin: Date;
  settings?: Record<string, any>;
}


export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  onboarded?: boolean;
}


type UserTheme = 'light' | 'dark' | 'system';





/**
 * Konu bazlı kullanıcı ilerleme durumu
 */
interface TopicProgress {
  subTopic: string;
  normalizedSubTopic: string;
  status: 'weak' | 'medium' | 'strong';
  scorePercent: number;
  questionCount: number;
  lastAttempt: string;
}

/**
 * Zorluk seviyesi bazlı kullanıcı ilerleme durumu
 */
interface DifficultyProgress {
  difficulty: 'easy' | 'medium' | 'hard';
  scorePercent: number;
  questionCount: number;
  correctCount: number;
}

/**
 * Kullanıcı sınav ilerleme
 */
interface UserQuizProgress {
  totalQuizzes: number;
  averageScore: number;
  quizzesLast30Days: number;
  scorePercentLast30Days: number;
  quizzesByType: Record<string, number>;
  recentQuizzes: Array<{
    id: string;
    date: string;
    score: number;
    quizType: string;
  }>;
}
