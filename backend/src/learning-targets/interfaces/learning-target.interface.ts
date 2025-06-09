export type LearningTargetStatus = 'pending' | 'failed' | 'medium' | 'mastered';

export interface LearningTargetWithQuizzes {
  id: string;
  userId: string;
  status: LearningTargetStatus;
  lastAttempt?: Date;
  lastAttemptScorePercent?: number;
  failCount: number;
  mediumCount: number;
  successCount: number;
  lastPersonalizedQuizId?: string;
  source?: 'user_created' | 'document_extracted' | 'ai_generated_new' | 'legacy';
  type?: string; // Added type field
  quizzes: Array<{
    id: string;
    type: string;
    completedAt: Date;
    questions: Array<{
      subTopicName: string;
      scorePercent: number;
    }>;
  }>;
}

export interface LearningTarget {
  id: string;
  userId: string;
  courseId: string;
  subTopicName: string;
  normalizedSubTopicName: string;
  status: LearningTargetStatus;
  failCount: number;
  mediumCount: number;
  successCount: number;
  lastAttemptScorePercent: number | null;
  lastAttempt: Date | null;
  firstEncountered: string; // ISO Date string
  createdAt: admin.firestore.Timestamp | null; // Firestore Timestamp
  updatedAt: admin.firestore.Timestamp | null; // Firestore Timestamp
  source?: 'user_created' | 'document_extracted' | 'ai_generated_new' | 'legacy'; // Added source field
  type?: string; // Added type field
  // Optional fields for additional details
  notes?: string;
  // ... any other fields
}
