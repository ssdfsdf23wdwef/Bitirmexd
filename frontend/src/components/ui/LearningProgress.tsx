import React, { useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { FiTarget, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { useTheme } from "@/context/ThemeProvider";
import type { WeakTopic } from "@/types/learningTarget.type";

interface LearningProgressProps {
  weakTopics: Record<string, WeakTopic>;
  strongTopics: string[];
}

const LearningProgress: React.FC<LearningProgressProps> = memo(
  ({ weakTopics, strongTopics }) => {
    const { isDarkMode } = useTheme();

    // Toplam başarı oranı hesaplama - Memoized
    const masteryPercentage = useMemo((): number => {
      if (!weakTopics || !strongTopics) return 0;

      const totalTopics = Object.keys(weakTopics).length + strongTopics.length;
      const masteredTopics =
        strongTopics.length +
        Object.values(weakTopics).filter((topic) => topic.status === "mastered")
          .length;

      return totalTopics > 0
        ? Math.round((masteredTopics / totalTopics) * 100)
        : 0;
    }, [weakTopics, strongTopics]);

    // Başarı oranı hesaplama fonksiyonu - Memoized
    const calculateSuccessRate = useCallback((data?: WeakTopic): number => {
      if (!data) return 100;

      const totalAttempts = data.failCount + (data.successCount || 0);
      return totalAttempts > 0
        ? Math.round(((data.successCount || 0) / totalAttempts) * 100)
        : 0;
    }, []);

    // Konu kartı - Memoized component
    const TopicCard = memo(
      ({
        topic,
        status,
        data,
      }: {
        topic: string;
        status: "active" | "mastered";
        data?: WeakTopic;
      }) => {
        const successRate = calculateSuccessRate(data);

        // Memoized style calculations
        const cardStyles = useMemo(() => {
          const baseStyles =
            "p-6 border rounded-2xl shadow-lg backdrop-blur-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1";
          const statusStyles =
            status === "mastered"
              ? isDarkMode
                ? "border-emerald-400/40 bg-slate-800/80 hover:bg-slate-700/90 shadow-emerald-500/10"
                : "border-green-200 bg-green-50/70 hover:bg-green-50/90"
              : isDarkMode
                ? "border-amber-400/40 bg-slate-800/80 hover:bg-slate-700/90 shadow-amber-500/10"
                : "border-yellow-200 bg-yellow-50/70 hover:bg-yellow-50/90";
          return `${baseStyles} ${statusStyles}`;
        }, [status, isDarkMode]);

        const iconContainerStyles = useMemo(() => {
          const baseStyles = "p-3 rounded-xl";
          const statusStyles =
            status === "mastered"
              ? isDarkMode
                ? "bg-emerald-500/20 border border-emerald-400/30"
                : "bg-green-100"
              : isDarkMode
                ? "bg-amber-500/20 border border-amber-400/30"
                : "bg-yellow-100";
          return `${baseStyles} ${statusStyles}`;
        }, [status, isDarkMode]);

        const progressBadgeStyles = useMemo(() => {
          const baseStyles = "px-3 py-1 rounded-lg text-xs font-semibold";
          if (successRate >= 80) {
            return `${baseStyles} ${isDarkMode ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/30" : "bg-green-100 text-green-700"}`;
          } else if (successRate >= 60) {
            return `${baseStyles} ${isDarkMode ? "bg-amber-500/25 text-amber-300 border border-amber-400/30" : "bg-yellow-100 text-yellow-700"}`;
          } else {
            return `${baseStyles} ${isDarkMode ? "bg-red-500/25 text-red-300 border border-red-400/30" : "bg-red-100 text-red-700"}`;
          }
        }, [successRate, isDarkMode]);

        return (
          <div className={cardStyles}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`font-semibold text-lg ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                >
                  {topic}
                </h3>
                <p
                  className={`text-sm mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  {status === "mastered"
                    ? "🎉 Başarıyla tamamlandı"
                    : `📈 Aktif gelişim (${successRate}% başarı)`}
                </p>
              </div>
              <div className={iconContainerStyles}>
                {status === "mastered" ? (
                  <FiCheckCircle
                    className={`text-2xl ${isDarkMode ? "text-emerald-400" : "text-green-600"}`}
                  />
                ) : (
                  <FiTarget
                    className={`text-2xl ${isDarkMode ? "text-amber-400" : "text-yellow-600"}`}
                  />
                )}
              </div>
            </div>

            {data && (
              <div className="mt-6">
                <div
                  className={`flex justify-between text-sm mb-3 font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  <span>İlerleme Durumu</span>
                  <span className={progressBadgeStyles}>{successRate}%</span>
                </div>
                <div
                  className={`w-full rounded-full h-3 ${isDarkMode ? "bg-slate-700" : "bg-gray-200"} overflow-hidden`}
                >
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
                      successRate >= 80
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : successRate >= 60
                          ? "bg-gradient-to-r from-amber-400 to-amber-500"
                          : "bg-gradient-to-r from-red-400 to-red-500"
                    }`}
                    style={{ width: `${successRate}%` }}
                  ></div>
                </div>
                <div
                  className={`flex justify-between mt-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    <span>Başarılı: {data.successCount || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span>Başarısız: {data.failCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      },
    );

    TopicCard.displayName = "TopicCard";

    // Filtered data - Memoized
    const activeWeakTopics = useMemo(
      () =>
        Object.entries(weakTopics).filter(
          ([, data]) => data.status === "active",
        ),
      [weakTopics],
    );

    const masteredWeakTopics = useMemo(
      () =>
        Object.entries(weakTopics).filter(
          ([, data]) => data.status === "mastered",
        ),
      [weakTopics],
    );

    return (
      <div
        className={`space-y-8 transition-all duration-500 ${isDarkMode ? "bg-slate-900" : "bg-gray-50"}`}
      >
        {/* Genel İlerleme */}
        <div
          className={`rounded-2xl shadow-xl backdrop-blur-lg p-8 transition-all duration-500 hover:shadow-2xl ${
            isDarkMode
              ? "bg-slate-800/70 border border-slate-700/50"
              : "bg-white/70 border border-gray-200/50"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
          >
            <div
              className={`p-2 rounded-lg mr-3 ${isDarkMode ? "bg-blue-500/20 text-blue-400 border border-blue-400/30" : "bg-indigo-100 text-indigo-600"}`}
            >
              <FiTrendingUp className="w-6 h-6" />
            </div>
            Genel İlerleme Durumu
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              <div className="relative w-40 h-40">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    strokeWidth="2"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeDasharray={`${masteryPercentage}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          masteryPercentage >= 80
                            ? "#10b981"
                            : masteryPercentage >= 60
                              ? "#f59e0b"
                              : "#ef4444"
                        }
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          masteryPercentage >= 80
                            ? "#059669"
                            : masteryPercentage >= 60
                              ? "#d97706"
                              : "#dc2626"
                        }
                      />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${
                        masteryPercentage >= 80
                          ? isDarkMode
                            ? "text-emerald-400"
                            : "text-green-600"
                          : masteryPercentage >= 60
                            ? isDarkMode
                              ? "text-amber-400"
                              : "text-yellow-600"
                            : isDarkMode
                              ? "text-red-400"
                              : "text-red-600"
                      }`}
                    >
                      {masteryPercentage}%
                    </div>
                    <div
                      className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Tamamlandı
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
                <div
                  className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    isDarkMode
                      ? "bg-slate-700/50 border-slate-600/50"
                      : "bg-gray-50/70 border-gray-200"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${isDarkMode ? "text-emerald-400" : "text-green-600"}`}
                  >
                    {strongTopics?.length || 0}
                  </div>
                  <div
                    className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Uzmanlaşılan Konular
                  </div>
                </div>
                <div
                  className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    isDarkMode
                      ? "bg-slate-700/50 border-slate-600/50"
                      : "bg-gray-50/70 border-gray-200"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${isDarkMode ? "text-amber-400" : "text-yellow-600"}`}
                  >
                    {Object.keys(weakTopics || {}).length}
                  </div>
                  <div
                    className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Gelişim Aşamasında
                  </div>
                </div>
                <div
                  className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    isDarkMode
                      ? "bg-slate-700/50 border-slate-600/50"
                      : "bg-gray-50/70 border-gray-200"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                  >
                    {(strongTopics?.length || 0) +
                      Object.keys(weakTopics || {}).length}
                  </div>
                  <div
                    className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Toplam Konu
                  </div>
                </div>
              </div>

              <div
                className={`p-5 rounded-xl border ${
                  masteryPercentage >= 80
                    ? isDarkMode
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-green-50 border-green-200"
                    : masteryPercentage >= 60
                      ? isDarkMode
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-yellow-50 border-yellow-200"
                      : isDarkMode
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-red-50 border-red-200"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    masteryPercentage >= 80
                      ? isDarkMode
                        ? "text-emerald-300"
                        : "text-green-700"
                      : masteryPercentage >= 60
                        ? isDarkMode
                          ? "text-amber-300"
                          : "text-yellow-700"
                        : isDarkMode
                          ? "text-red-300"
                          : "text-red-700"
                  }`}
                >
                  {masteryPercentage >= 80
                    ? "🎉 Harika! Çoğu konuda uzmanlaştınız."
                    : masteryPercentage >= 60
                      ? "📈 İyi ilerleme gösteriyorsunuz. Devam edin!"
                      : "💪 Başlangıç aşamasındasınız. Pratik yaparak gelişebilirsiniz."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Uzmanlaşılan Konular */}
        {strongTopics.length > 0 && (
          <motion.div
            className={`rounded-2xl shadow-xl backdrop-blur-lg p-6 transition-all duration-500 hover:shadow-2xl ${
              isDarkMode
                ? "bg-gray-800/60 border border-gray-700/50"
                : "bg-white/70 border border-gray-200/50"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2
              className={`text-xl font-semibold mb-6 flex items-center ${isDarkMode ? "text-green-400" : "text-green-600"}`}
            >
              <div
                className={`p-2 rounded-lg mr-3 ${isDarkMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"}`}
              >
                <FiCheckCircle className="w-5 h-5" />
              </div>
              Uzmanlaşılan Konular
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? "bg-green-500/20 text-green-400"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {strongTopics.length + masteredWeakTopics.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {strongTopics.map((topic, index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <TopicCard topic={topic} status="mastered" />
                </motion.div>
              ))}

              {/* Zayıf konulardan uzmanlaşılanları da ekle */}
              {masteredWeakTopics.map(([topic, data], index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1 * (strongTopics.length + index),
                  }}
                >
                  <TopicCard topic={topic} status="mastered" data={data} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gelişim Aşamasındaki Konular */}
        {activeWeakTopics.length > 0 && (
          <motion.div
            className={`rounded-2xl shadow-xl backdrop-blur-lg p-6 transition-all duration-500 hover:shadow-2xl ${
              isDarkMode
                ? "bg-gray-800/60 border border-gray-700/50"
                : "bg-white/70 border border-gray-200/50"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2
              className={`text-xl font-semibold mb-6 flex items-center ${isDarkMode ? "text-yellow-400" : "text-amber-600"}`}
            >
              <div
                className={`p-2 rounded-lg mr-3 ${isDarkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-amber-600"}`}
              >
                <FiTarget className="w-5 h-5" />
              </div>
              Gelişim Aşamasındaki Konular
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-yellow-100 text-amber-600"
                }`}
              >
                {activeWeakTopics.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeWeakTopics.map(([topic, data], index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <TopicCard topic={topic} status="active" data={data} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  },
);

LearningProgress.displayName = "LearningProgress";

export default LearningProgress;
