import React from "react";
import {
  FiBook,
  FiSettings,
  FiFileText,
  FiTarget,
  FiList,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { useTheme } from "@/context/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

interface ExamCreationProgressProps {
  currentStep: number;
  totalSteps: number;
  quizType?: "quick" | "personalized";
  onStepClick?: (step: number) => void;
  children?: React.ReactNode;
}

const ExamCreationProgress: React.FC<ExamCreationProgressProps> = ({
  currentStep,
  totalSteps,
  quizType = "quick",
  onStepClick,
  children,
}) => {
  const stepTitles = {
    personalized: [
      "Ders Seçimi",
      "Sınav Türü",
      "Dosya Yükleme",
      "Alt Konular",
      "Tercihler",
    ],
    quick: ["Dosya Yükleme", "Alt Konular", "Tercihler"],
  };

  const stepIcons = {
    personalized: [
      <FiBook key="book" className="w-5 h-5" />,
      <FiTarget key="target" className="w-5 h-5" />,
      <FiFileText key="file" className="w-5 h-5" />,
      <FiList key="list" className="w-5 h-5" />,
      <FiSettings key="settings" className="w-5 h-5" />,
    ],
    quick: [
      <FiFileText key="file" className="w-5 h-5" />,
      <FiList key="list" className="w-5 h-5" />,
      <FiSettings key="settings" className="w-5 h-5" />,
    ],
  };

  const currentStepTitle =
    quizType === "personalized"
      ? stepTitles.personalized[currentStep - 1]
      : stepTitles.quick[currentStep - 1];

  const handleStepClick = (step: number) => {
    if (step < currentStep && onStepClick) {
      onStepClick(step);
    }
  };

  const { isDarkMode } = useTheme();

  return (
    <div
      className={`flex w-full h-full min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Sidebar */}
      <div
        className={`w-80 flex flex-col border-r ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <div className="p-8 h-full flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"}`}
            >
              <FiTarget className="w-6 h-6 text-white" />
            </div>
            <h2
              className={`text-xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
            >
              Sınav Oluşturma
            </h2>
            <p
              className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {quizType === "personalized" ? "Kişiselleştirilmiş" : "Hızlı"}{" "}
              sınav oluşturma süreci
            </p>
          </div>

          {/* Step List */}
          <div className="flex flex-col space-y-3 flex-grow">
            {(quizType === "personalized"
              ? stepTitles.personalized
              : stepTitles.quick
            ).map((title, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isActive = stepNumber === currentStep;

              return (
                <div
                  key={`step-${stepNumber}`}
                  onClick={() => handleStepClick(stepNumber)}
                  className={`flex items-center p-4 rounded-lg transition-colors cursor-pointer ${
                    isCompleted
                      ? `${isDarkMode ? "bg-green-900/30 hover:bg-green-900/40" : "bg-green-50 hover:bg-green-100"}`
                      : isActive
                        ? `${isDarkMode ? "bg-blue-900/30" : "bg-blue-50"}`
                        : `${isDarkMode ? "bg-gray-700/30 hover:bg-gray-700/50" : "bg-gray-100 hover:bg-gray-200"} opacity-60 hover:opacity-80`
                  }`}
                >
                  {/* Step Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? `${isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"}`
                          : `${isDarkMode ? "bg-gray-600 text-gray-400" : "bg-gray-200 text-gray-500"}`
                    }`}
                  >
                    {isCompleted ? (
                      <FiCheckCircle className="w-5 h-5" />
                    ) : (
                      <>
                        {quizType === "personalized"
                          ? stepIcons.personalized[index]
                          : stepIcons.quick[index]}
                      </>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex flex-col flex-1">
                    <span
                      className={`font-medium text-sm ${
                        isActive
                          ? isDarkMode
                            ? "text-blue-300"
                            : "text-blue-600"
                          : isCompleted
                            ? isDarkMode
                              ? "text-green-300"
                              : "text-green-600"
                            : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                      }`}
                    >
                      {title}
                    </span>
                    <span
                      className={`text-xs mt-1 ${
                        isCompleted
                          ? isDarkMode
                            ? "text-green-400/80"
                            : "text-green-600/80"
                          : isActive
                            ? isDarkMode
                              ? "text-blue-400/80"
                              : "text-blue-600/80"
                            : isDarkMode
                              ? "text-gray-500"
                              : "text-gray-400"
                      }`}
                    >
                      {isCompleted
                        ? "✓ Tamamlandı"
                        : isActive
                          ? "● Devam Ediyor"
                          : "○ Bekliyor"}
                    </span>
                  </div>

                  {/* Arrow indicator for active step */}
                  {isActive && (
                    <FiArrowRight
                      className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                İlerleme
              </span>
              <span
                className={`text-sm font-semibold ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
              >
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div
              className={`w-full h-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${isDarkMode ? "bg-blue-500" : "bg-blue-500"}`}
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <div className="h-full p-8 flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div
                className={`w-1 h-8 rounded-full mr-4 ${isDarkMode ? "bg-blue-500" : "bg-blue-500"}`}
              />
              <h1
                className={`text-2xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
              >
                {currentStepTitle}
              </h1>
            </div>
            <p
              className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {currentStep === 1 &&
                quizType === "quick" &&
                "Sınav oluşturmak için bir dosya yükleyin."}
              {currentStep === 1 &&
                quizType === "personalized" &&
                "Sınav oluşturmak için bir ders seçin."}
              {currentStep === 2 &&
                quizType === "personalized" &&
                "Oluşturmak istediğiniz sınav türünü seçin."}
              {currentStep === 2 &&
                quizType === "quick" &&
                "Sınavda yer alacak alt konuları seçin."}
              {currentStep === (quizType === "personalized" ? 3 : 1) &&
                "Konuları tespit etmek için bir dosya yükleyin."}
              {currentStep === (quizType === "personalized" ? 4 : 2) &&
                "Sınavda yer alacak alt konuları seçin."}
              {currentStep === (quizType === "personalized" ? 5 : 3) &&
                "Sınav tercihlerinizi belirleyin."}
            </p>
          </div>

          {/* Content Container */}
          <div className="flex-1 relative">
            <div
              className={`h-full rounded-lg p-6 border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreationProgress;
