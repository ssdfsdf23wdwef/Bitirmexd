import { create } from 'zustand';
import { LearningTarget, LearningTargetStatus } from '../types/learning-target.types';
import { ProposedTopic } from "@/types/learning-target.types";
// Temporary learning target type for quiz processing
export interface TemporaryLearningTarget {
  topic: string;
  subTopic: string;
  status: 'PENDING' | 'FAILED' | 'MEDIUM' | 'MASTERED';
  score: number;
}

export interface PendingTopic {
  name: string;
  status: 'pending';
}

// Mock data for learning targets
const mockLearningTargets: LearningTarget[] = [
  {
    id: '1',
    userId: 'current-user',
    courseId: 'course-1',
    topicName: 'JavaScript Promises',
    status: LearningTargetStatus.NOT_STARTED,
    isNewTopic: true,
    source: 'ai_proposal',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'current-user',
    courseId: 'course-1',
    topicName: 'React Hooks',
    status: LearningTargetStatus.IN_PROGRESS,
    isNewTopic: false,
    source: 'manual',
    notes: 'Focus on useEffect and useMemo',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'current-user',
    courseId: 'course-1',
    topicName: 'TypeScript Generics',
    status: LearningTargetStatus.COMPLETED,
    isNewTopic: false,
    source: 'manual',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    userId: 'current-user',
    courseId: 'course-2',
    topicName: 'CSS Grid Layout',
    status: LearningTargetStatus.NOT_STARTED,
    isNewTopic: false,
    source: 'manual',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface LearningTargetsState {
  targets: LearningTarget[];
  isLoading: boolean;
  error: string | null;
  selectedCourseId: string | null;
  temporaryTargets: TemporaryLearningTarget[];
  pendingTopics: PendingTopic[]; // Yeni state
  
  // Actions
  fetchTargets: (userId: string, courseId?: string) => Promise<void>;
  createTarget: (target: Omit<LearningTarget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTarget: (id: string, updates: Partial<LearningTarget>) => Promise<void>;
  deleteTarget: (id: string) => Promise<void>;
  setSelectedCourseId: (courseId: string | null) => void;
  getTargetsByCourseId: (courseId: string) => LearningTarget[];
  getTargetsByStatus: (status: LearningTargetStatus) => LearningTarget[];
  
  // Temporary targets actions for quiz processing
  setTemporaryTargetsFromQuiz: (questions: any[]) => void;
  updateTemporaryTargetScores: (quizResults: any) => TemporaryLearningTarget[];
  clearTemporaryTargets: () => void;
  setPendingTopics: (topics: string[]) => void; // Yeni action
  clearPendingTopics: () => void; // Yeni action
}

export const useLearningTargetsStore = create<LearningTargetsState>((set, get) => ({
  targets: [],
  isLoading: false,
  error: null,
  selectedCourseId: null,
  temporaryTargets: [],
  pendingTopics: [], // State'i başlat

  fetchTargets: async (userId: string, courseId?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock data based on courseId if provided
      const filteredTargets = courseId 
        ? mockLearningTargets.filter(t => t.courseId === courseId)
        : mockLearningTargets;
      
      set({ targets: filteredTargets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch learning targets', isLoading: false });
      console.error('Error fetching learning targets:', error);
    }
  },

  createTarget: async (target) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTarget: LearningTarget = {
        ...target,
        id: Date.now().toString(), // Generate a temporary ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set(state => ({ 
        targets: [...state.targets, newTarget],
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to create learning target', isLoading: false });
      console.error('Error creating learning target:', error);
    }
  },

  updateTarget: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({ 
        targets: state.targets.map(target => 
          target.id === id ? { ...target, ...updates, updatedAt: new Date() } : target
        ),
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to update learning target', isLoading: false });
      console.error('Error updating learning target:', error);
    }
  },

  deleteTarget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({ 
        targets: state.targets.filter(target => target.id !== id),
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to delete learning target', isLoading: false });
      console.error('Error deleting learning target:', error);
    }
  },

  setSelectedCourseId: (courseId) => {
    set({ selectedCourseId: courseId });
  },

  getTargetsByCourseId: (courseId) => {
    return get().targets.filter(target => target.courseId === courseId);
  },

  getTargetsByStatus: (status) => {
    const { targets, selectedCourseId } = get();
    
    let filteredTargets = targets.filter(target => target.status === status);
    
    if (selectedCourseId) {
      filteredTargets = filteredTargets.filter(target => target.courseId === selectedCourseId);
    }
    
    return filteredTargets;
  },

  // Temporary targets actions for quiz processing
  setTemporaryTargetsFromQuiz: (questions) => {
    const uniqueSubTopics = new Set<string>();
    
    // Extract unique subTopics from questions - check both field naming conventions
    questions.forEach(question => {
      // Check for both subTopic (frontend interface) and subTopicName (backend API response) fields
      const subTopicValue = question.subTopic || (question as any).subTopicName;
      if (subTopicValue) {
        uniqueSubTopics.add(subTopicValue);
      }
    });

    // Create temporary targets for each unique subTopic
    const temporaryTargets: TemporaryLearningTarget[] = Array.from(uniqueSubTopics).map(subTopic => ({
      topic: questions.find(q => {
        const questionSubTopic = q.subTopic || (q as any).subTopicName;
        return questionSubTopic === subTopic;
      })?.topic || 'Unknown Topic',
      subTopic: subTopic,
      status: 'PENDING' as const,
      score: 0,
    }));
    
    set({ temporaryTargets });
  },

  updateTemporaryTargetScores: (quizResults) => {
    const { temporaryTargets } = get();
    
    // Calculate scores for each subTopic based on quiz results
    const updatedTargets = temporaryTargets.map(target => {
      // Find questions for this subTopic - check both field naming conventions
      const subTopicQuestions = quizResults.questions?.filter(
        (q: any) => {
          const questionSubTopic = q.subTopic || q.subTopicName;
          return questionSubTopic === target.subTopic;
        }
      ) || [];
      
      if (subTopicQuestions.length === 0) {
        return target; // No questions found, keep original
      }
      
      // Calculate correct answers for this subTopic
      const correctAnswers = subTopicQuestions.filter((q: any) => {
        const userAnswer = quizResults.userAnswers?.[q.id];
        return userAnswer === q.correctAnswer;
      }).length;
      
      const totalQuestions = subTopicQuestions.length;
      const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Determine status based on score
      let status: 'PENDING' | 'FAILED' | 'MEDIUM' | 'MASTERED';
      if (scorePercent >= 80) {
        status = 'MASTERED';
      } else if (scorePercent >= 60) {
        status = 'MEDIUM';
      } else {
        status = 'FAILED';
      }
      
      return {
        ...target,
        score: scorePercent,
        status,
      };
    });
    
    set({ temporaryTargets: updatedTargets });
    console.log('[Store] Temporary target scores updated:', updatedTargets);
    return updatedTargets;
  },

  clearTemporaryTargets: () => {
    set({ temporaryTargets: [] });
  },

  setPendingTopics: (topics: string[]) => {
    const pendingTopics: PendingTopic[] = topics.map(topicName => ({
      name: topicName,
      status: 'pending',
    }));
    set({ pendingTopics });
  },

  clearPendingTopics: () => {
    set({ pendingTopics: [] });
  },
}));
