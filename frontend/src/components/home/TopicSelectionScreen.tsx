"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useTheme } from "../../context/ThemeProvider";
import {
  FiCheck,
  FiLoader,
  FiInfo,
  FiBook,
  FiAlertTriangle,
  FiPlus,
  FiTarget,
  FiZap,
  FiAward,
} from "react-icons/fi";
import { LearningTargetStatusLiteral } from "@/types/learningTarget.type";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

// TopicData arayüzünü de import et
import type { DetectedSubTopic as TopicData } from "@/types/learningTarget.type";

interface StatusStyle {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon: React.ElementType;
}

export const getStatusStyle = (
  status: LearningTargetStatusLiteral | undefined,
): StatusStyle => {
  switch (status) {
    case "pending":
      return {
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
        label: "Yeni",
        icon: FiBook,
      };
    case "medium":
      return {
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        borderColor: "border-yellow-200 dark:border-yellow-700",
        label: "Devam Ediyor",
        icon: FiLoader,
      };
    case "failed":
      return {
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        borderColor: "border-red-200 dark:border-red-700",
        label: "Gözden Geçirilmeli",
        icon: FiAlertTriangle,
      };
    case "mastered":
      return {
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        borderColor: "border-green-200 dark:border-green-700",
        label: "Tamamlandı",
        icon: FiCheck,
      };
    default:
      return {
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
        label: "Bilinmiyor",
        icon: FiInfo,
      };
  }
};

interface CourseData {
  id: string;
  name: string;
}

interface TopicSelectionScreenProps {
  detectedTopics: TopicData[];
  existingTopics?: TopicData[];
  availableCourses?: CourseData[];
  selectedCourseId?: string;
  quizType: "quick" | "personalized";
  personalizedQuizType?:
    | "weakTopicFocused"
    | "learningObjectiveFocused"
    | "newTopicFocused"
    | "comprehensive";
  isLoading?: boolean;
  error?: string;
  onTopicsSelected: (selectedTopicIds: string[], courseId: string) => void;
  onCourseChange?: (courseId: string) => void;
  onCancel?: () => void;
  initialSelectedTopicIds?: string[];
  onTopicSelectionChange: (selectedTopicIds: string[]) => void;
  onInitialLoad: boolean;
  setOnInitialLoad: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TopicSelectionScreen({
  detectedTopics = [],
  existingTopics = [],
  availableCourses = [],
  selectedCourseId,
  quizType,
  personalizedQuizType = "comprehensive",
  isLoading = false,
  error,
  onTopicsSelected,
  onCourseChange,
  onCancel,
  initialSelectedTopicIds,
  onTopicSelectionChange = () => {},
  onInitialLoad = true,
  setOnInitialLoad = () => {},
}: TopicSelectionScreenProps) {
  const [filteredTopics, setFilteredTopics] = useState<TopicData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [currentCourseId, setCurrentCourseId] = useState(
    selectedCourseId || "",
  );
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(
    initialSelectedTopicIds || [],
  );

  const handleTopicSelectionChange = useCallback(
    (ids: string[]) => {
      setSelectedTopicIds(ids);
      onTopicSelectionChange(ids);
    },
    [onTopicSelectionChange],
  );

  const handleTopicSelectionChangeRef = useRef(handleTopicSelectionChange);
  useEffect(() => {
    handleTopicSelectionChangeRef.current = handleTopicSelectionChange;
  }, [handleTopicSelectionChange]);

  useEffect(() => {
    if (isLoading) return;

    const existingTopicIds = new Set(existingTopics.map((t) => t.id));
    let baseTopicsRaw: TopicData[] = [];

    if (quizType === "quick") {
      baseTopicsRaw = [...detectedTopics];
    } else if (personalizedQuizType === "newTopicFocused") {
      baseTopicsRaw = [...detectedTopics];
    } else if (personalizedQuizType === "learningObjectiveFocused") {
      const uniqueDetected = detectedTopics.filter(
        (t) => !existingTopicIds.has(t.id),
      );
      baseTopicsRaw = [...existingTopics, ...uniqueDetected];
    } else if (personalizedQuizType === "weakTopicFocused") {
      baseTopicsRaw = existingTopics.filter(
        (topic) => topic.status === "failed" || topic.status === "medium",
      );
    } else if (personalizedQuizType === "comprehensive") {
      const uniqueDetected = detectedTopics.filter(
        (t) => !existingTopicIds.has(t.id),
      );
      baseTopicsRaw = [...uniqueDetected, ...existingTopics];
    }

    let initialSelectionIds: string[] = [];
    if (onInitialLoad) {
      if (initialSelectedTopicIds && initialSelectedTopicIds.length > 0) {
        initialSelectionIds = initialSelectedTopicIds;
      } else {
        if (personalizedQuizType !== "weakTopicFocused") {
          initialSelectionIds = baseTopicsRaw.map((t) => t.id);
        } else {
          initialSelectionIds = [];
        }
      }
      setOnInitialLoad(false);
    } else {
      initialSelectionIds = baseTopicsRaw.map((t) => t.id);
    }

    const finalTopicsWithSelection = baseTopicsRaw.map((topic) => ({
      ...topic,
      isSelected: initialSelectionIds.includes(topic.id),
    }));

    setFilteredTopics(finalTopicsWithSelection);
    handleTopicSelectionChangeRef.current(initialSelectionIds);
  }, [
    detectedTopics,
    existingTopics,
    quizType,
    personalizedQuizType,
    isLoading,
    initialSelectedTopicIds,
    onInitialLoad,
    setOnInitialLoad,
  ]);

  const handleToggleAll = useCallback(
    (selectAll: boolean) => {
      const updatedTopics = filteredTopics.map((topic) => ({
        ...topic,
        isSelected: selectAll,
      }));
      setFilteredTopics(updatedTopics);
      const selectedIds = selectAll ? updatedTopics.map((t) => t.id) : [];
      handleTopicSelectionChangeRef.current(selectedIds);
    },
    [filteredTopics],
  );

  const handleTopicToggle = useCallback(
    (id: string) => {
      const updatedTopics = filteredTopics.map((topic) => {
        if (topic.id === id) {
          return { ...topic, isSelected: !topic.isSelected };
        }
        return topic;
      });
      setFilteredTopics(updatedTopics);
      const selectedIds = updatedTopics
        .filter((t) => t.isSelected)
        .map((t) => t.id);
      handleTopicSelectionChangeRef.current(selectedIds);
    },
    [filteredTopics],
  );

  const handleCourseChange = useCallback(
    (courseId: string) => {
      setCurrentCourseId(courseId);
      onCourseChange?.(courseId);
    },
    [onCourseChange],
  );

  const handleFilterChange = useCallback(
    (filter: "all" | "new" | "existing") => {
      setSelectedFilter(filter);
    },
    [],
  );

  const topicCounts = useMemo(
    () => ({
      all: filteredTopics.length,
      new: filteredTopics.filter((t) => t.isNew).length,
      existing: filteredTopics.filter((t) => !t.isNew).length,
      selected: filteredTopics.filter((t) => t.isSelected).length,
      weak: filteredTopics.filter((t) => t.status === "failed").length,
      medium: filteredTopics.filter((t) => t.status === "medium").length,
      good: filteredTopics.filter((t) => t.status === "mastered").length,
    }),
    [filteredTopics],
  );

  const displayTopics = useMemo(
    () =>
      selectedFilter === "all"
        ? filteredTopics
        : selectedFilter === "new"
          ? filteredTopics.filter((t) => t.isNew)
          : filteredTopics.filter((t) => !t.isNew),
    [filteredTopics, selectedFilter],
  );

  const groupedTopics = useMemo(() => {
    const groups: Record<string, TopicData[]> = {};
    displayTopics.forEach((topic) => {
      const parentTopic = topic.parentTopic || "Diğer Konular";
      if (!groups[parentTopic]) {
        groups[parentTopic] = [];
      }
      groups[parentTopic].push(topic);
    });
    return groups;
  }, [displayTopics]);

  const handleContinue = () => {
    if (!currentCourseId && quizType === "personalized") {
      alert("Lütfen bir ders seçin");
      return;
    }

    const topicsToSubmit = filteredTopics
      .filter((t) => t.isSelected)
      .map((t) => t.id);

    if (
      topicsToSubmit.length === 0 &&
      personalizedQuizType !== "weakTopicFocused"
    ) {
      alert("Lütfen en az bir konu seçin");
      return;
    }

    onTopicsSelected(
      topicsToSubmit,
      quizType === "quick" ? "" : currentCourseId,
    );
  };

  const getStatusInfo = useCallback(
    (status?: LearningTargetStatusLiteral | string) => {
      if (!status) {
        return {
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          borderColor: "border-blue-200 dark:border-blue-700",
          label: "Yeni",
          icon: FiPlus,
        };
      }
      const validStatusValues: LearningTargetStatusLiteral[] = [
        "pending",
        "medium",
        "failed",
        "mastered",
      ];
      const statusStr = typeof status === "string" ? status : String(status);
      const statusLiteral = validStatusValues.includes(
        statusStr as LearningTargetStatusLiteral,
      )
        ? (statusStr as LearningTargetStatusLiteral)
        : "pending";
      return getStatusStyle(statusLiteral);
    },
    [],
  );

  if (isLoading) {
    return (
      <div
        className={`relative py-12 flex flex-col items-center justify-center rounded-lg border transition-all duration-300 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
      >
        <div
          className={`w-16 h-16 rounded-lg flex items-center justify-center mb-6 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"}`}
        >
          <FiLoader className="w-8 h-8 animate-spin text-white" />
        </div>
        <h3
          className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}
        >
          Konular Hazırlanıyor
        </h3>
        <p
          className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
        >
          Yapay zeka konuları analiz ediyor...
        </p>
      </div>
    );
  }

  if (filteredTopics.length === 0) {
    return (
      <div
        className={`relative py-12 px-8 flex flex-col items-center justify-center rounded-lg border transition-all duration-300 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
      >
        <div className="flex flex-col items-center max-w-lg mx-auto">
          <div
            className={`w-16 h-16 rounded-lg flex items-center justify-center mb-6 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"}`}
          >
            <FiInfo className="w-8 h-8 text-white" />
          </div>

          <h3
            className={`text-xl font-bold mb-4 text-center ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}
          >
            {personalizedQuizType === "weakTopicFocused"
              ? "Henüz zayıf veya orta düzeyde konunuz bulunmuyor."
              : "Belgede konu tespit edilemedi"}
          </h3>

          <div
            className={`text-center mb-8 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
          >
            {personalizedQuizType === "weakTopicFocused" ? (
              <p className="leading-relaxed">
                Sınavları çözmeye devam ettikçe, performansınıza göre zayıf ve
                güçlü olduğunuz konuları belirlemeye başlayacağız.
              </p>
            ) : (
              <div>
                <p className="leading-relaxed mb-3">
                  AI tarafından yüklenen belgede öğrenilebilir konular tespit
                  edilemedi. Bu şu nedenlerden kaynaklanabilir:
                </p>
                <ul className="list-disc text-left space-y-1 ml-6">
                  <li>
                    Belge içeriği çok kısa veya yeterli kavramsal içerik
                    bulunmuyor olabilir
                  </li>
                  <li>
                    Belge formatı veya yapısı AI tarafından doğru analiz
                    edilememiş olabilir
                  </li>
                  <li>
                    Metin dili veya uzmanlık alanı AI tarafından işlenememiş
                    olabilir
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4 w-full">
            <div
              className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${isDarkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600" : "bg-white border-gray-200 hover:bg-gray-50"}`}
            >
              <h4
                className={`font-semibold mb-2 flex items-center ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
              >
                <FiPlus className="mr-2" />
                Manuel konu girişi yapın
              </h4>
              <p
                className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
              >
                Çalışmak istediğiniz konuları kendiniz ekleyerek devam
                edebilirsiniz.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/learning-goals/dashboard")}
              >
                <FiPlus className="mr-2" />
                Yeni Konu Ekle
              </Button>
            </div>

            <div
              className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${isDarkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600" : "bg-white border-gray-200 hover:bg-gray-50"}`}
            >
              <h4
                className={`font-semibold mb-2 flex items-center ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
              >
                <FiBook className="mr-2" />
                Farklı bir belge yükleyin
              </h4>
              <p
                className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
              >
                Daha fazla kavramsal içerik içeren bir ders materyali veya
                dokümandan tekrar yükleme yapabilirsiniz.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/")}
              >
                Belge Yükleme Ekranına Dön
              </Button>
            </div>

            <div
              className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${isDarkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600" : "bg-white border-gray-200 hover:bg-gray-50"}`}
            >
              <h4
                className={`font-semibold mb-2 flex items-center ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
              >
                <FiZap className="mr-2" />
                Farklı bir sınav türü seçin
              </h4>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
              >
                Kişiselleştirilmiş sınav yerine &quot;Hızlı Sınav&quot; seçeneğini veya
                mevcut konularınız varsa &quot;Zayıf Konular&quot; odaklı modu
                deneyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg shadow-md overflow-hidden border transition-all duration-300 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
    >
      {/* Simple blue accent line */}
      <div
        className={`absolute left-0 top-0 w-full h-1 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"}`}
      />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"}`}
            >
              <FiTarget className="w-5 h-5 text-white" />
            </div>
            <h2
              className={`text-2xl font-bold ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}
            >
              Konu Seçimi
            </h2>
          </div>
          <p
            className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
          >
            {quizType === "quick"
              ? "🎯 Yüklediğiniz belgedeki tespit edilen konular aşağıdadır. Sınava dahil etmek istediklerinizi seçin."
              : personalizedQuizType === "weakTopicFocused"
                ? "📈 Geliştirmeniz gereken alanları içeren özel bir sınav oluşturulacak."
                : personalizedQuizType === "learningObjectiveFocused"
                  ? "🎓 Öğrenme hedeflerinize göre özel bir sınav oluşturulacak."
                  : personalizedQuizType === "newTopicFocused"
                    ? "🆕 Henüz çalışmadığınız yeni konulara odaklanan bir sınav oluşturulacak."
                    : "🔍 Çalışma durumunuza uygun kapsamlı bir sınav oluşturulacak."}
          </p>
        </div>

        {/* Course Selection */}
        {availableCourses && availableCourses.length > 0 && (
          <div className="mb-6">
            <label
              className={`block text-sm font-semibold mb-2 flex items-center ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center mr-2 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"}`}
              >
                <FiBook className="w-2.5 h-2.5 text-white" />
              </div>
              📚 Ders Seçimi
            </label>
            <select
              value={currentCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"}`}
            >
              <option
                value=""
                className={
                  isDarkMode
                    ? "bg-slate-800 text-slate-300"
                    : "bg-white text-gray-700"
                }
              >
                💫 Bir ders seçin
              </option>
              {availableCourses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                  className={
                    isDarkMode
                      ? "bg-slate-800 text-slate-100"
                      : "bg-white text-gray-900"
                  }
                >
                  📖 {course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center ${
                  selectedFilter === "all"
                    ? isDarkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDarkMode
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <FiTarget className="w-4 h-4 mr-2" />
                🎯 Tümü ({topicCounts.all})
              </button>

              {topicCounts.new > 0 && (
                <button
                  onClick={() => handleFilterChange("new")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center ${
                    selectedFilter === "new"
                      ? isDarkMode
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white"
                      : isDarkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <FiZap className="w-4 h-4 mr-2" />✨ Yeni ({topicCounts.new})
                </button>
              )}

              {topicCounts.existing > 0 && (
                <button
                  onClick={() => handleFilterChange("existing")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center ${
                    selectedFilter === "existing"
                      ? isDarkMode
                        ? "bg-purple-600 text-white"
                        : "bg-purple-500 text-white"
                      : isDarkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <FiBook className="w-4 h-4 mr-2" />
                  📚 Mevcut ({topicCounts.existing})
                </button>
              )}
            </div>

            {/* Select All Button */}
            <button
              onClick={() => handleToggleAll(true)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
            >
              <FiCheck className="w-4 h-4 mr-2" />⭐ Tümünü Seç
            </button>
          </div>

          {/* Selection Stats */}
          <div
            className={`mt-3 flex flex-wrap gap-4 text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
              <span className="font-medium">{topicCounts.selected} seçili</span>
            </div>
            {topicCounts.weak > 0 && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                <span>{topicCounts.weak} zayıf</span>
              </div>
            )}
            {topicCounts.medium > 0 && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-yellow-500"></div>
                <span>{topicCounts.medium} orta</span>
              </div>
            )}
            {topicCounts.good > 0 && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                <span>{topicCounts.good} iyi</span>
              </div>
            )}
          </div>
        </div>

        {/* Topics Section */}
        <div className="space-y-4 mb-6">
          {Object.entries(groupedTopics).map(([parentTopic, topics]) => (
            <div
              key={parentTopic}
              className={`rounded-lg p-4 border transition-all duration-300 ${isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"}`}
            >
              {/* Group Header */}
              <div
                className={`flex items-center justify-between mb-4 pb-3 border-b ${isDarkMode ? "border-slate-600" : "border-gray-200"}`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"}`}
                  >
                    <FiBook className="w-4 h-4 text-white" />
                  </div>
                  <h3
                    className={`text-lg font-bold ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}
                  >
                    📖 {parentTopic}
                  </h3>
                </div>
                <div
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${isDarkMode ? "bg-slate-600 text-slate-300" : "bg-white text-gray-700 border"}`}
                >
                  {topics.length} konu
                </div>
              </div>

              {/* Topics Grid */}
              <div className="space-y-2">
                {topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onToggle={handleTopicToggle}
                    statusInfo={getStatusInfo(
                      topic.status || (topic.isNew ? undefined : "pending"),
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Section */}
        <div
          className={`p-4 rounded-lg border ${isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
            >
              <div className="flex items-center mb-1">
                <FiCheck className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-semibold">
                  {topicCounts.selected} konu seçili
                </span>
              </div>
              <p className="text-xs">
                {personalizedQuizType !== "weakTopicFocused" &&
                topicCounts.selected === 0
                  ? "⚠️ Lütfen en az bir konu seçin"
                  : "✅ Seçiminizi tamamlayıp devam edebilirsiniz"}
              </p>
            </div>

            <Button
              onClick={handleContinue}
              disabled={
                personalizedQuizType !== "weakTopicFocused" &&
                topicCounts.selected === 0
              }
              className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                personalizedQuizType !== "weakTopicFocused" &&
                topicCounts.selected === 0
                  ? isDarkMode
                    ? "bg-slate-600 text-slate-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isDarkMode
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <FiAward className="w-4 h-4 mr-2" />
              🚀 Sınava Devam Et
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TopicCardProps {
  topic: TopicData & { isSelected?: boolean };
  onToggle: (id: string) => void;
  statusInfo: StatusStyle;
}

function TopicCard({ topic, onToggle, statusInfo }: TopicCardProps) {
  const { isDarkMode } = useTheme();

  const displayTopicName = () => {
    let name = "";
    if (typeof topic.subTopicName === "string") {
      name = topic.subTopicName;
      if (
        name.startsWith("```") ||
        name.startsWith('"```') ||
        name.includes("subTopicName") ||
        name.includes("normalizedSubTopicName")
      ) {
        name = "Konu " + topic.id.substring(0, 8);
      }
    } else if (topic.name) {
      name = topic.name;
    } else {
      name = "Konu " + topic.id.substring(0, 8);
    }
    name = name.replace(/^\W+/, "").replace(/\s+/g, " ").trim();
    if (!name || name.length < 3) {
      return "Konu " + topic.id.substring(0, 8);
    }
    return name;
  };

  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 border ${
        topic.isSelected
          ? isDarkMode
            ? "bg-blue-600/20 border-blue-500/50"
            : "bg-blue-50 border-blue-200"
          : isDarkMode
            ? "bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50"
            : "bg-white border-gray-200 hover:bg-gray-50"
      }`}
      onClick={() => onToggle(topic.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onToggle(topic.id);
      }}
    >
      <div className="flex items-center justify-between p-3">
        {/* Left section with checkbox and content */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all duration-200 ${
              topic.isSelected
                ? "bg-blue-500 border-blue-500 text-white"
                : isDarkMode
                  ? "border-slate-500 hover:border-slate-400"
                  : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {topic.isSelected && <FiCheck className="w-3 h-3" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-sm leading-relaxed transition-colors duration-200 ${
                topic.isSelected
                  ? isDarkMode
                    ? "text-blue-300"
                    : "text-blue-700"
                  : isDarkMode
                    ? "text-slate-200"
                    : "text-gray-800"
              }`}
            >
              🎯 {displayTopicName()}
            </h3>
            {topic.parentTopic && (
              <p
                className={`text-xs mt-1 transition-colors duration-200 ${
                  topic.isSelected
                    ? isDarkMode
                      ? "text-blue-400"
                      : "text-blue-600"
                    : isDarkMode
                      ? "text-slate-400"
                      : "text-gray-500"
                }`}
              >
                📚 {topic.parentTopic}
              </p>
            )}
          </div>
        </div>

        {/* Right section with status and badges */}
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {/* Status Badge */}
          <div
            className={`flex items-center px-2 py-1 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap border ${
              topic.isSelected
                ? isDarkMode
                  ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                  : "bg-blue-100 text-blue-700 border-blue-200"
                : `${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`
            }`}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </div>

          {/* New Badge */}
          {topic.isNew && (
            <div
              className={`text-xs rounded-lg px-2 py-1 font-semibold whitespace-nowrap border transition-all duration-200 ${
                topic.isSelected
                  ? isDarkMode
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
              }`}
            >
              ✨ Yeni
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
