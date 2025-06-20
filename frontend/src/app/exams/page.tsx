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
import { useQuizzes } from "@/hooks/api/useQuizzes";
import type { Quiz } from "../../types/quiz.type";
import { Spinner } from "@nextui-org/react";

// Sınav türü için güzel etiketler
const QUIZ_TYPE_INFO = {
  quick: {
    label: "Hızlı Sınav",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  personalized: {
    label: "Kişiselleştirilmiş Sınav",
    bgColor: "bg-purple-50 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
};

// Yardımcı fonksiyonlar
// quiz.timestamp'in 'any' olabileceğini varsayarak daha genel bir tip kullanalım.
const formatDate = (dateValue: any): string => {
  console.log('Original dateValue:', dateValue); // Hata ayıklama için log
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

  // All checks passed, format the date
  console.log('Processing potentialDate:', potentialDate, 'typeof getTime:', typeof potentialDate?.getTime); // Hata ayıklama için log
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
function getQuizTitle(quiz: Quiz) {
  return quiz.sourceDocument?.fileName ||
    `${QUIZ_TYPE_INFO[quiz.quizType]?.label || "Sınav"} - ${formatDate(quiz.timestamp)}`;
}

// Sınav kartı bileşeni
const ExamItem = ({ quiz, index }: { quiz: Quiz; index: number }) => {
  const quizType =
    quiz.quizType === "quick" || quiz.quizType === "personalized"
      ? quiz.quizType
      : "quick";
  const typeInfo = QUIZ_TYPE_INFO[quizType];
  // Başlık: sourceDocument varsa dosya adı, yoksa quizType ve tarih
  const title = getQuizTitle(quiz);
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
      className="group transition-colors hover:bg-interactive-hover"
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-brand-primary bg-opacity-10 flex items-center justify-center text-brand-primary mr-3">
            <FiFileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-primary">
              {title}
            </div>
            <div className="text-sm text-tertiary">
              {questionsCount} Soru
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${typeInfo.bgColor} ${typeInfo.textColor} ${typeInfo.borderColor}`}
        >
          {typeInfo.label}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <FiCalendar className="w-4 h-4 mr-1.5 text-tertiary" />
          {formatDate(createdAt)}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <FiClock className="w-4 h-4 mr-1.5 text-tertiary" />
          {duration} dk
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end space-x-2">
          <Link
            href={`/exams/${quiz.id}/results`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-brand-primary bg-brand-primary bg-opacity-10 hover:bg-opacity-20 transition-colors"
          >
            <FiEye className="w-4 h-4" />
          </Link>
          <button className="inline-flex items-center justify-center w-8 h-8 rounded-full text-tertiary bg-secondary hover:bg-interactive-hover transition-colors">
            <FiDownload className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default function ExamsPage() {
  const router = useRouter();
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
        getQuizTitle(quiz).toLowerCase().includes(searchTerm.toLowerCase()),
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <Spinner label="Sınavlar yükleniyor..." color="primary" />
      </div>
    );
  }

  if (isError || !quizzes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="text-state-error font-semibold text-lg">
          {error instanceof Error
            ? error.message
            : "Sınavlar yüklenirken bir hata oluştu."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent mb-2"
          >
            Sınavlarım
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-secondary"
          >
            Geçmiş sınavlarınızı görüntüleyin ve yeni sınavlar oluşturun.
          </motion.p>
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary bg-elevated text-primary focus:outline-none focus:ring-2 focus:border-focus transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
            </div>

            <div className="relative">
              <select
                className="appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-primary bg-elevated text-primary focus:outline-none focus:ring-2 focus:border-focus transition-all duration-300"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Tüm Sınavlar</option>
                <option value="quick">Hızlı Sınav</option>
                <option value="personalized">Kişiselleştirilmiş Sınav</option>
              </select>
              <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-tertiary"
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

          <button
            onClick={handleCreateNewExam}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-inverse font-medium hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            <FiPlus className="mr-2" />
            Yeni Sınav
          </button>
        </motion.div>

        {/* Sonuçları göster: Yükleniyor, hata veya veri tablosu */}
        {filteredQuizzes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-elevated shadow-md rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-secondary">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Sınav
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Tür
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Tarih
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Süre
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-elevated divide-y border-primary">
                  {filteredQuizzes.map((quiz, idx) => (
                    <ExamItem key={quiz.id} quiz={quiz} index={idx} />
                  ))}
                </tbody>
              </table>
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
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-accent opacity-10 rounded-3xl rotate-6"></div>
              <div className="absolute inset-0 bg-elevated rounded-3xl flex items-center justify-center border border-primary">
                <FiFileText className="text-6xl text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-brand-accent" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-2">
              Henüz hiç sınav bulunamadı
            </h3>
            <p className="text-tertiary mb-8 max-w-md">
              {searchTerm || selectedType !== "all"
                ? "Filtrelerinize uygun sınav bulunamadı. Lütfen arama kriterlerinizi değiştirin."
                : "Kişiselleştirilmiş sınavlar oluşturmak için yeni sınav ekleyin."}
            </p>
            <button
              onClick={handleCreateNewExam}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-inverse text-lg font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FiPlus className="mr-2" />
              İlk Sınavı Oluştur
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
