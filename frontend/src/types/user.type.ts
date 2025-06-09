/**
 * @file user.ts
 * @description Kullanıcı ile ilgili tip tanımları
 */

/**
 * Kullanıcı rolü tanımları
 */
type UserRole = 'user' | 'admin' | 'teacher' | 'student';

/**
 * Temel kullanıcı tipi 
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: UserRole;
  onboarded?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Diğer kullanıcı bilgileri
}

/**
 * Genişletilmiş kullanıcı tipi (profil bilgileri dahil)
 */
interface UserProfile extends User {
  phoneNumber?: string;
  bio?: string;
  preferences?: UserPreferences;
  stats?: UserStats;
  // Diğer profil bilgileri
}

/**
 * Kullanıcı tercihleri
 */
interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  language?: string;
}

/**
 * Kullanıcı istatistikleri
 */
interface UserStats {
  quizzesTaken?: number;
  quizzesPassed?: number;
  averageScore?: number;
  lastActivity?: string | Date;
}

/**
 * Kullanıcı (User) modelini temsil eden interface
 * @see PRD 7.1
 */
interface UserDTO {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: "USER" | "ADMIN";
  onboarded: boolean;
}

/**
 * Kullanıcı profil güncelleme modeli
 */
interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  onboarded?: boolean;
}

// Firebase Auth User tipini import et
import { User as FirebaseUser } from "firebase/auth";

/**
 * Kimlik doğrulama durumu
 */
interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null; // Firebase User type
  idToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

// Tema tipi - backend'den UserTheme ile uyumlu
type UserTheme = "light" | "dark" | "system";

/**
 * Konu bazlı kullanıcı ilerleme durumu
 */
interface TopicProgress {
  subTopic: string;
  normalizedSubTopic: string;
  status: "weak" | "medium" | "strong";
  scorePercent: number;
  questionCount: number;
  lastAttempt: string;
}

/**
 * Zorluk seviyesi bazlı kullanıcı ilerleme durumu
 */
interface DifficultyProgress {
  difficulty: "easy" | "medium" | "hard";
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

/**
 * Kullanıcı ilerleme durumu
 */
interface UserProgress {
  userId: string;
  totalStudyTime: number;
  studyTimeLast30Days: number;
  totalQuestionsAnswered: number;
  overallCorrectRate: number;
  topicProgress: TopicProgress[];
  difficultyProgress: DifficultyProgress[];
  strongestTopics: TopicProgress[];
  weakestTopics: TopicProgress[];
  quizProgress: UserQuizProgress;
  recommendations: string[];
}
