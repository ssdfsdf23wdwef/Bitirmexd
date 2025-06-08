import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getFlowTracker } from "../lib/logger.utils";

interface QuizUIState {
  selectedQuizId: string | null;
  setSelectedQuiz: (id: string | null) => void;
  resetStore: () => void;
}

const flowTracker = getFlowTracker();

export const useQuizStore = create<QuizUIState>()(
  immer((set, get) => ({
    selectedQuizId: null,

    setSelectedQuiz: (id: string | null) => {
      // Takip – kimden kime geçtik?
      flowTracker.trackStateChange(
        "selectedQuizId",
        "QuizStore",
        get().selectedQuizId,
        id
      );

      // Immer sayesinde doğrudan mutasyon
      set((state) => {
        state.selectedQuizId = id;
      });
    },

    resetStore: () => {
      set((state) => {
        state.selectedQuizId = null;
      });
    },
  }))
);

// Seçili quiz’i kolayca çekmek için yardımcı kanca
export const useSelectedQuiz = (quizzes: { id: string }[]) => {
  const selectedQuizId = useQuizStore((s) => s.selectedQuizId);
  return selectedQuizId
    ? quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null
    : null;
};
