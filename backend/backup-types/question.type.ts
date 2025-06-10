
export interface Question {
  id: string;
  questionText: string;
  description?: string | null;
  type:
    | 'multiple_choice'
    | 'single_choice'
    | 'true_false'
    | 'coding'
    | 'open_ended';
  format: 'text' | 'code' | 'image' | 'mixed';
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
  mainTopic: string;
  subTopic: string;
  normalizedSubTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  codeContent?: string | null;
  language?: string | null;
}



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

