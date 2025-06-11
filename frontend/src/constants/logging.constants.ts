// frontend/src/constants/logging.constants.ts

// Flow kategorileri enum'u
export enum FlowCategory {
  Navigation = "Navigation",
  Component = "Component",
  State = "State",
  API = "API",
  Auth = "Auth",
  Render = "Render",
  User = "User",
  Error = "Error",
  Business = "Business",
  Custom = "Custom",
}

// Log dosya kategorileri enum'u
export enum LogFileCategory {
  LEARNING_TARGETS = "learning-targets",
  EXAM_CREATION = "exam-creation",
  AUTH = "auth",
  DATA_TRANSFER = "data-transfer",
  NAVIGATION = "navigation",
  GENERAL = "general",
}

// Context'e göre dosya kategorisi belirleme mapping'i
const CONTEXT_TO_FILE_CATEGORY: Record<string, LogFileCategory> = {
  // Öğrenme hedefleri
  LearningTargets: LogFileCategory.LEARNING_TARGETS,
  LearningTargetService: LogFileCategory.LEARNING_TARGETS,
  LearningTargetContext: LogFileCategory.LEARNING_TARGETS,
  "learning-targets": LogFileCategory.LEARNING_TARGETS,
  hedefler: LogFileCategory.LEARNING_TARGETS,

  // Sınav oluşturma
  ExamCreation: LogFileCategory.EXAM_CREATION,
  ExamService: LogFileCategory.EXAM_CREATION,
  QuizGeneration: LogFileCategory.EXAM_CREATION,
  exam: LogFileCategory.EXAM_CREATION,
  quiz: LogFileCategory.EXAM_CREATION,
  sinav: LogFileCategory.EXAM_CREATION,

  // Auth işlemleri
  Auth: LogFileCategory.AUTH,
  AuthService: LogFileCategory.AUTH,
  Login: LogFileCategory.AUTH,
  Logout: LogFileCategory.AUTH,
  Register: LogFileCategory.AUTH,
  GoogleAuth: LogFileCategory.AUTH,
  auth: LogFileCategory.AUTH,

  // Veri transfer işlemleri
  API: LogFileCategory.DATA_TRANSFER,
  ApiService: LogFileCategory.DATA_TRANSFER,
  DataService: LogFileCategory.DATA_TRANSFER,
  FileUpload: LogFileCategory.DATA_TRANSFER,
  DocumentProcessing: LogFileCategory.DATA_TRANSFER,
  api: LogFileCategory.DATA_TRANSFER,

  // Navigasyon
  Navigation: LogFileCategory.NAVIGATION,
  Router: LogFileCategory.NAVIGATION,
  History: LogFileCategory.NAVIGATION,
  navigation: LogFileCategory.NAVIGATION,

  // Varsayılan - genel
  Frontend: LogFileCategory.GENERAL,
  Console: LogFileCategory.GENERAL,
  "Window.onerror": LogFileCategory.GENERAL,
  UnhandledPromiseRejection: LogFileCategory.GENERAL,
};

// Flow kategori ile dosya kategorisi mapping'i
const FLOW_TO_FILE_CATEGORY: Record<FlowCategory, LogFileCategory> = {
  [FlowCategory.Navigation]: LogFileCategory.NAVIGATION,
  [FlowCategory.Auth]: LogFileCategory.AUTH,
  [FlowCategory.API]: LogFileCategory.DATA_TRANSFER,
  [FlowCategory.Business]: LogFileCategory.LEARNING_TARGETS,
  [FlowCategory.Error]: LogFileCategory.GENERAL,
  [FlowCategory.Component]: LogFileCategory.GENERAL,
  [FlowCategory.State]: LogFileCategory.GENERAL,
  [FlowCategory.Render]: LogFileCategory.GENERAL,
  [FlowCategory.User]: LogFileCategory.GENERAL,
  [FlowCategory.Custom]: LogFileCategory.GENERAL,
};

/**
 * Context ve flow kategorisine göre hangi dosyaya yazılacağını belirler
 */
export function determineLogFileCategory(
  context?: string,
  flowCategory?: FlowCategory,
  message?: string,
): LogFileCategory {
  // Önce context'e bakılır
  if (context) {
    // Exact match
    if (CONTEXT_TO_FILE_CATEGORY[context]) {
      return CONTEXT_TO_FILE_CATEGORY[context];
    }

    // Partial match (context içinde anahtar kelime arama)
    const contextLower = context.toLowerCase();
    for (const [key, category] of Object.entries(CONTEXT_TO_FILE_CATEGORY)) {
      if (contextLower.includes(key.toLowerCase())) {
        return category;
      }
    }
  }

  // Sonra flow kategorisine bakılır
  if (flowCategory && FLOW_TO_FILE_CATEGORY[flowCategory]) {
    return FLOW_TO_FILE_CATEGORY[flowCategory];
  }

  // Son olarak mesaj içeriğine bakılır
  if (message) {
    const messageLower = message.toLowerCase();
    if (
      messageLower.includes("öğrenme") ||
      messageLower.includes("hedef") ||
      messageLower.includes("learning")
    ) {
      return LogFileCategory.LEARNING_TARGETS;
    }
    if (
      messageLower.includes("sınav") ||
      messageLower.includes("quiz") ||
      messageLower.includes("exam")
    ) {
      return LogFileCategory.EXAM_CREATION;
    }
    if (
      messageLower.includes("giriş") ||
      messageLower.includes("login") ||
      messageLower.includes("auth")
    ) {
      return LogFileCategory.AUTH;
    }
    if (
      messageLower.includes("api") ||
      messageLower.includes("upload") ||
      messageLower.includes("data")
    ) {
      return LogFileCategory.DATA_TRANSFER;
    }
    if (
      messageLower.includes("navigation") ||
      messageLower.includes("gezinti") ||
      messageLower.includes("route")
    ) {
      return LogFileCategory.NAVIGATION;
    }
  }

  // Varsayılan genel kategori
  return LogFileCategory.GENERAL;
}

/**
 * Dosya kategorisine göre dosya adını döndürür
 */
export function getLogFileName(category: LogFileCategory): string {
  return `frontend-${category}.log`;
}
