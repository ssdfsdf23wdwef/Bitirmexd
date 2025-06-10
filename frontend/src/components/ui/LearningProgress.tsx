import React from "react";
import { FiTarget, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { useTheme } from "@/context/ThemeProvider";
import type { WeakTopic } from "@/types/learningTarget.type";

interface LearningProgressProps {
  weakTopics: Record<string, WeakTopic>;
  strongTopics: string[];
}

const LearningProgress: React.FC<LearningProgressProps> = ({
  weakTopics,
  strongTopics,
}) => {
  const { isDarkMode } = useTheme();
  // Toplam başarı oranı hesaplama
  const calculateMasteryPercentage = (): number => {
    if (!weakTopics || !strongTopics) return 0;

    const totalTopics = Object.keys(weakTopics).length + strongTopics.length;
    const masteredTopics =
      strongTopics.length +
      Object.values(weakTopics).filter((topic) => topic.status === "mastered")
        .length;

    return totalTopics > 0
      ? Math.round((masteredTopics / totalTopics) * 100)
      : 0;
  };

  const masteryPercentage = calculateMasteryPercentage();

  // Konu kartı
  const TopicCard = ({
    topic,
    status,
    data,
  }: {
    topic: string;
    status: "active" | "mastered";
    data?: WeakTopic;
  }) => {
    // Başarı oranı hesaplama
    const calculateSuccessRate = (data?: WeakTopic): number => {
      if (!data) return 100;

      const totalAttempts = data.failCount + (data.successCount || 0);
      return totalAttempts > 0
        ? Math.round(((data.successCount || 0) / totalAttempts) * 100)
        : 0;
    };

    const successRate = calculateSuccessRate(data);

    return (
      <div
        className={`p-4 border rounded-lg shadow-sm transition-colors duration-200 ${
          status === "mastered"
            ? isDarkMode 
              ? "border-green-600 bg-green-900/20" 
              : "border-green-200 bg-green-50"
            : isDarkMode 
              ? "border-yellow-600 bg-yellow-900/20" 
              : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{topic}</h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {status === "mastered"
                ? "Uzmanlaşıldı"
                : `Gelişim aşamasında (${successRate}%)`}
            </p>
          </div>
          <div>
            {status === "mastered" ? (
              <FiCheckCircle className={`text-xl ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            ) : (
              <FiTarget className={`text-xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            )}
          </div>
        </div>

        {data && (
          <div className="mt-3">
            <div className={`flex justify-between text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>İlerleme</span>
              <span>{successRate}%</span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-2 rounded-full ${
                  successRate >= 80
                    ? isDarkMode ? "bg-green-400" : "bg-green-500"
                    : successRate >= 60
                      ? isDarkMode ? "bg-yellow-400" : "bg-yellow-500"
                      : isDarkMode ? "bg-red-400" : "bg-red-500"
                }`}
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
            <div className={`flex justify-between mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Başarılı: {data.successCount || 0}</span>
              <span>Başarısız: {data.failCount}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Genel İlerleme */}
      <div className={`rounded-lg shadow p-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <FiTrendingUp className="mr-2" /> Genel İlerleme
        </h2>

        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  masteryPercentage >= 80
                    ? isDarkMode ? "#10b981" : "#059669"
                    : masteryPercentage >= 60
                      ? isDarkMode ? "#f59e0b" : "#d97706"
                      : isDarkMode ? "#ef4444" : "#dc2626"
                }
                strokeWidth="3"
                strokeDasharray={`${masteryPercentage}, 100`}
              />
              <text
                x="18"
                y="20.5"
                textAnchor="middle"
                fontSize="8"
                fill={isDarkMode ? "#ffffff" : "#111827"}
                fontWeight="bold"
              >
                %{masteryPercentage}
              </text>
            </svg>
          </div>

          <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Toplam {Object.keys(weakTopics).length + strongTopics.length}{" "}
            konudan{" "}
            {strongTopics.length +
              Object.values(weakTopics).filter(
                (topic) => topic.status === "mastered",
              ).length}{" "}
            tanesinde uzmanlaştınız.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className={`p-3 rounded-lg border transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-600' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center">
              <FiCheckCircle className={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Uzmanlaşılan Konular</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {strongTopics.length +
                Object.values(weakTopics).filter(
                  (topic) => topic.status === "mastered",
                ).length}
            </p>
          </div>

          <div className={`p-3 rounded-lg border transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-yellow-900/20 border-yellow-600' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center">
              <FiTarget className={`mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-amber-500'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gelişim Aşamasında</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {
                Object.values(weakTopics).filter(
                  (topic) => topic.status === "active",
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Uzmanlaşılan Konular */}
      {strongTopics.length > 0 && (
        <div className={`rounded-lg shadow p-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            <FiCheckCircle className="mr-2" /> Uzmanlaşılan Konular
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strongTopics.map((topic) => (
              <TopicCard key={topic} topic={topic} status="mastered" />
            ))}

            {/* Zayıf konulardan uzmanlaşılanları da ekle */}
            {Object.entries(weakTopics)
              .filter(([, data]) => data.status === "mastered")
              .map(([topic, data]) => (
                <TopicCard
                  key={topic}
                  topic={topic}
                  status="mastered"
                  data={data}
                />
              ))}
          </div>
        </div>
      )}

      {/* Gelişim Aşamasındaki Konular */}
      {Object.values(weakTopics).filter((topic) => topic.status === "active")
        .length > 0 && (
        <div className={`rounded-lg shadow p-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-yellow-400' : 'text-amber-600'}`}>
            <FiTarget className="mr-2" /> Gelişim Aşamasındaki Konular
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(weakTopics)
              .filter(([, data]) => data.status === "active")
              .map(([topic, data]) => (
                <TopicCard
                  key={topic}
                  topic={topic}
                  status="active"
                  data={data}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningProgress;
