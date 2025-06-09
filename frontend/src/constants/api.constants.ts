// frontend/src/constants/api.constants.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  COURSES: '/courses',
  USERS: '/users',
  // İhtiyaç duydukça daha fazla endpoint ekleyin
};


const DEFAULT_TIMEOUT = 10000; // 10 saniye 
const API_ENDPOINTS = {
  QUIZZES: "/quizzes",
  FAILED_QUESTIONS: "/failed-questions",
  GENERATE_QUICK_QUIZ: "/quizzes/quick",
  GENERATE_PERSONALIZED_QUIZ: "/quizzes/personalized",
  SAVE_QUICK_QUIZ: "/quizzes/save-quick-quiz",
};

export default API_ENDPOINTS;
