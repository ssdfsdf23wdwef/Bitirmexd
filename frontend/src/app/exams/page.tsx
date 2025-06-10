"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiFileText,
  FiCalendar,
  FiClock,
  FiFilter,
  FiDownload,
  FiEye,
} from "react-icons/fi";
import { useTheme } from "@/context/ThemeProvider";
import { useQuizzes } from "@/hooks/api/useQuizzes";
import type { Quiz } from "../../types/quiz.type";
import { Spinner } from "@nextui-org/react";

// Sınav türü için tema uyumlu etiketler
const getQuizTypeInfo = (isDarkMode: boolean) => ({
  quick: {
    label: "Hızlı Sınav",
    bgColor: isDarkMode ? "bg-blue-500/20" : "bg-blue-50",
    textColor: isDarkMode ? "text-blue-300" : "text-blue-700",
    borderColor: isDarkMode ? "border-blue-400/30" : "border-blue-200",
  },
  personalized: {
    label: "Kişiselleştirilmiş Sınav",
    bgColor: isDarkMode ? "bg-purple-500/20" : "bg-purple-50",
    textColor: isDarkMode ? "text-purple-300" : "text-purple-700",
    borderColor: isDarkMode ? "border-purple-400/30" : "border-purple-200",
  },
});

// Yardımcı fonksiyonlar
// quiz.timestamp'in 'any' olabileceğini varsayarak daha genel bir tip kullanalım.
const formatDate = (dateValue: any): string => {
  if (dateValue === null || typeof dateValue === 'undefined') {
    return "Tarih Yok (null/undefined)";
  }

  let potentialDate: Date | undefined;

  // 1. If it's an object with a toDate method (like Firebase Timestamp)
  if (typeof dateValue === 'object' && dateValue !== null && typeof dateValue.toDate === 'function') {
    try {
      potentialDate = dateValue.toDate();
    } catch (e) {
      return "Hata: toDate() çağrılamadı";
    }
  }
  // 2. If it's already a Date object
  else if (dateValue instanceof Date) {
    potentialDate = dateValue;
  }
  // 3. If it's a string or a number (potential timestamp or date string)
  else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    // Ensure not an empty string before passing to new Date()
    if (dateValue === '') {
      return "Tarih Yok (boş string)";
    }
    potentialDate = new Date(dateValue);
  }
  // 4. If none of the above, it's an unsupported type for direct conversion
  else {
    return `Desteklenmeyen Veri Tipi: ${typeof dateValue}`;
  }

  // 5. Validate the potentialDate
  if (!(potentialDate instanceof Date)) {
    // This means conversion failed or toDate() didn't return a Date
    return "Hata: Geçerli Date nesnesine dönüştürülemedi";
  }

  // 6. Check if getTime method exists and is a function
  if (typeof potentialDate.getTime !== 'function') {
    return "Hata: Date nesnesinde getTime metodu yok/fonksiyon değil";
  }

  // 7. Check if the date is valid (getTime() should return a number)
  let timeValue;
  try {
    timeValue = potentialDate.getTime();
  } catch (e) {
    return "Hata: getTime() çağrılırken hata oluştu";
  }

  if (isNaN(timeValue)) {
    return "Geçersiz Tarih Değeri (NaN)";
  }


  try {
    return potentialDate.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    // console.error("Error in toLocaleDateString: ", e, potentialDate);
    return "Hata: toLocaleDateString çağrılırken hata oluştu";
  }
};

// Sınav başlığı üretici yardımcı fonksiyon
function getQuizTitle(quiz: Quiz, isDarkMode: boolean) {
  const typeInfo = getQuizTypeInfo(isDarkMode);
  return quiz.sourceDocument?.fileName ||
    `${typeInfo[quiz.quizType]?.label || "Sınav"} - ${formatDate(quiz.timestamp)}`;
}

// Sınav kartı bileşeni
const ExamItem = ({ quiz, index, isDarkMode }: { quiz: Quiz; index: number; isDarkMode: boolean }) => {
  const quizType =
    quiz.quizType === "quick" || quiz.quizType === "personalized"
      ? quiz.quizType
      : "quick";
  const typeInfo = getQuizTypeInfo(isDarkMode)[quizType];
  // Başlık: sourceDocument varsa dosya adı, yoksa quizType ve tarih
  const title = getQuizTitle(quiz, isDarkMode);
  // Soru sayısı: totalQuestions
  const questionsCount = quiz.totalQuestions;
  // Oluşturulma tarihi: timestamp
  const createdAt = quiz.timestamp;
  // Süre: elapsedTime (varsa), yoksa "-"
  const duration = quiz.elapsedTime ? Math.round(quiz.elapsedTime / 60) : "-";
  
  return (
    <motion.tr
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.02, 
        transition: { duration: 0.2 } 
      }}
      className={`group transition-all duration-300 ${
        isDarkMode 
          ? 'hover:bg-slate-700/40 border-b border-slate-700/50' 
          : 'hover:bg-gray-50/70 border-b border-gray-200/50'
      }`}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30' 
              : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
          }`}>
            <FiFileText className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-sm font-semibold truncate max-w-xs ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {title}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {questionsCount} Soru
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border transition-all duration-300 hover:scale-105 ${typeInfo.bgColor} ${typeInfo.textColor} ${typeInfo.borderColor}`}
        >
          {typeInfo.label}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <FiCalendar className={`w-3 h-3 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatDate(createdAt)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <FiClock className={`w-3 h-3 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {duration} dk
          </span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-end space-x-2">
          <Link
            href={`/exams/${quiz.id}/results`}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 hover:scale-110 ${
              isDarkMode 
                ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30' 
                : 'text-blue-600 bg-blue-100 hover:bg-blue-200 border border-blue-200'
            }`}
          >
            <FiEye className="w-3 h-3" />
          </Link>
          <button className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? 'text-gray-400 bg-slate-700/60 hover:bg-slate-600/80 border border-slate-600/50' 
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200'
          }`}>
            <FiDownload className="w-3 h-3" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default function ExamsPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: quizzes, isLoading, error, isError } = useQuizzes();

  useEffect(() => {
    if (!quizzes) {
      setFilteredQuizzes([]);
      return;
    }

    // Array.from kullanarak array olduğundan emin oluyoruz
    let result = Array.isArray(quizzes) ? quizzes : [];

    // Arama filtresi
    if (searchTerm) {
      result = result.filter((quiz: Quiz) =>
        getQuizTitle(quiz, isDarkMode).toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Tür filtresi
    if (selectedType !== "all") {
      result = result.filter((quiz: Quiz) => quiz.quizType === selectedType);
    }

    setFilteredQuizzes(result);
  }, [searchTerm, selectedType, quizzes]);

  const handleCreateNewExam = () => {
    router.push("/exams/create");
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <div className="text-center">
          <Spinner 
            size="lg" 
            color={isDarkMode ? "secondary" : "primary"} 
            classNames={{
              circle1: isDarkMode ? "border-blue-400" : "border-blue-600",
              circle2: isDarkMode ? "border-purple-400" : "border-purple-600",
            }}
          />
          <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Sınavlar yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !quizzes) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <div className={`p-8 rounded-2xl border backdrop-blur-sm text-center max-w-md ${
          isDarkMode 
            ? 'bg-red-500/10 border-red-400/30 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
          }`}>
            <FiFileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sınavlar Yüklenemedi</h3>
          <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-600'}`}>
            {error instanceof Error
              ? error.message
              : "Sınavlar yüklenirken bir hata oluştu."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="container mx-auto max-w-7xl h-full">
        {/* Header */}
        <div className="mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
              isDarkMode 
                ? 'from-blue-400 to-purple-400' 
                : 'from-blue-600 to-purple-600'
            } bg-clip-text text-transparent`}
          >
            Sınavlarım
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Geçmiş sınavlarınızı görüntüleyin ve yeni sınavlar oluşturun.
          </motion.p>
        </div>
       
        </div>

        {/* Filtreler ve arama */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Sınav ara..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700/50 text-gray-100 placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20'
                } backdrop-blur-sm`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>

            <div className="relative">
              <select
                className={`appearance-none pl-12 pr-12 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700/50 text-gray-100 focus:border-blue-400/50 focus:ring-blue-400/20'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500/50 focus:ring-blue-500/20'
                } backdrop-blur-sm`}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Tüm Sınavlar</option>
                <option value="quick">Hızlı Sınav</option>
                <option value="personalized">Kişiselleştirilmiş Sınav</option>
              </select>
              <FiFilter className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNewExam}
            className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
            }`}
          >
            <FiPlus className="mr-2 w-5 h-5" />
            Yeni Sınav
          </motion.button>
        </motion.div>

        {/* Sonuçları göster: Yükleniyor, hata veya veri tablosu */}
        {filteredQuizzes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl shadow-xl backdrop-blur-sm border ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700/50' 
                : 'bg-white/80 border-gray-200/50'
            }`}
          >
            {/* Desktop tablo görünümü */}
            <div className="hidden lg:block">
              <div className={`overflow-y-auto max-h-[calc(100vh-200px)] ${
                isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'
              }`}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: isDarkMode ? '#475569 #1e293b' : '#cbd5e1 #f1f5f9'
                }}
              >
                <table className="w-full">
                  <thead className={`sticky top-0 z-10 ${
                    isDarkMode ? 'bg-slate-900/90 backdrop-blur-sm' : 'bg-gray-50/90 backdrop-blur-sm'
                  }`}>
                    <tr>
                      <th
                        scope="col"
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Sınav
                      </th>
                      <th
                        scope="col"
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Tür
                      </th>
                      <th
                        scope="col"
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Tarih
                      </th>
                      <th
                        scope="col"
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Süre
                      </th>
                      <th
                        scope="col"
                        className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-slate-700/50' : 'divide-gray-200/50'
                  }`}>
                    {filteredQuizzes.map((quiz, idx) => (
                      <ExamItem key={quiz.id} quiz={quiz} index={idx} isDarkMode={isDarkMode} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobil kart görünümü */}
            <div className={`lg:hidden max-h-[calc(100vh-200px)] overflow-y-auto p-3 space-y-3 ${
              isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'
            }`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: isDarkMode ? '#475569 #1e293b' : '#cbd5e1 #f1f5f9'
              }}
            >
              {filteredQuizzes.map((quiz, idx) => {
                const quizType = quiz.quizType === "quick" || quiz.quizType === "personalized" ? quiz.quizType : "quick";
                const typeInfo = getQuizTypeInfo(isDarkMode)[quizType];
                const title = getQuizTitle(quiz, isDarkMode);
                const questionsCount = quiz.totalQuestions;
                const createdAt = quiz.timestamp;
                const duration = quiz.elapsedTime ? Math.round(quiz.elapsedTime / 60) : "-";

                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`p-3 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-slate-700/40 border-slate-600/50 hover:bg-slate-700/60' 
                        : 'bg-white/70 border-gray-200/50 hover:bg-white/90'
                    } backdrop-blur-sm`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDarkMode 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <FiFileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-semibold truncate ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {title}
                          </h3>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {questionsCount} Soru
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${typeInfo.bgColor} ${typeInfo.textColor} ${typeInfo.borderColor}`}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs space-x-4 mb-2">
                      <div className="flex items-center">
                        <FiCalendar className={`w-3 h-3 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {formatDate(createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className={`w-3 h-3 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {duration} dk
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/exams/${quiz.id}/results`}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 hover:scale-110 ${
                          isDarkMode 
                            ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30' 
                            : 'text-blue-600 bg-blue-100 hover:bg-blue-200 border border-blue-200'
                        }`}
                      >
                        <FiEye className="w-3 h-3" />
                      </Link>
                      <button className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 hover:scale-110 ${
                        isDarkMode
                          ? 'text-gray-400 bg-slate-700/60 hover:bg-slate-600/80 border border-slate-600/50' 
                          : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200'
                      }`}>
                        <FiDownload className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-20 flex flex-col items-center justify-center text-center"
          >
            <div className="w-32 h-32 relative mb-8">
              <div className={`absolute inset-0 opacity-20 rounded-3xl rotate-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-br from-blue-600 to-purple-600'
              }`}></div>
              <div className={`absolute inset-0 rounded-3xl flex items-center justify-center border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}>
                <FiFileText className={`text-6xl bg-gradient-to-br ${
                  isDarkMode 
                    ? 'from-blue-400 to-purple-400' 
                    : 'from-blue-600 to-purple-600'
                } bg-clip-text text-transparent`} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Henüz hiç sınav bulunamadı
            </h3>
            <p className={`mb-8 max-w-md ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {searchTerm || selectedType !== "all"
                ? "Filtrelerinize uygun sınav bulunamadı. Lütfen arama kriterlerinizi değiştirin."
                : "Kişiselleştirilmiş sınavlar oluşturmak için yeni sınav ekleyin."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNewExam}
              className={`inline-flex items-center px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
              }`}
            >
              <FiPlus className="mr-2 w-5 h-5" />
              İlk Sınavı Oluştur
            </motion.button>
          </motion.div>
        )}
      </div>
    
  );
}
