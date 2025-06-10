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
import type { Quiz } from "../../types/quiz.type";
import { Spinner } from "@nextui-org/react";

// Sınav türü için güzel etiketler
export const QUIZ_TYPE_INFO = {
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
export const formatDate = (dateValue: any): string => {
  if (dateValue === null || typeof dateValue === 'undefined') {
    return "Tarih Yok";
  }

  let potentialDate: Date | undefined;

  // Firebase Timestamp check
  if (typeof dateValue === 'object' && dateValue !== null && typeof dateValue.toDate === 'function') {
    try {
      potentialDate = dateValue.toDate();
    } catch (e) {
      console.warn('Error converting timestamp to date:', e);
      return "Geçersiz Tarih";
    }
  }
  // String check
  else if (typeof dateValue === 'string') {
    potentialDate = new Date(dateValue);
  }
  // Number check (milliseconds since epoch)
  else if (typeof dateValue === 'number') {
    potentialDate = new Date(dateValue);
  }
  // Already a Date object
  else if (dateValue instanceof Date) {
    potentialDate = dateValue;
  }

  if (!potentialDate || isNaN(potentialDate.getTime())) {
    return "Geçersiz Tarih";
  }

  return potentialDate.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
  });
};

export const getQuizTitle = (quiz: Quiz): string => {
  if (quiz.title) return quiz.title;
  if (quiz.courseName) return `${quiz.courseName} Sınavı`;
  if (quiz.topic) return `${quiz.topic} Konusu`;
  return "Başlıksız Sınav";
};

interface ExamRowProps {
  quiz: Quiz;
  index: number;
}

export const ExamRow: React.FC<ExamRowProps> = ({ quiz, index }) => {
  const quizTypeInfo = QUIZ_TYPE_INFO[quiz.quizType as keyof typeof QUIZ_TYPE_INFO] || QUIZ_TYPE_INFO.quick;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, delay: index * 0.02 }} // Faster animation
      className="group hover:bg-interactive-hover border-b border-primary last:border-b-0 fast-interactive"
    >
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-brand-primary bg-opacity-10">
            <FiFileText className="w-4 h-4 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-medium text-primary text-sm">{getQuizTitle(quiz)}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${quizTypeInfo.bgColor} ${quizTypeInfo.textColor} ${quizTypeInfo.borderColor}`}
              >
                {quizTypeInfo.label}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary">
        <div className="flex items-center space-x-1">
          <FiCalendar className="w-4 h-4" />
          <span>{formatDate(quiz.timestamp)}</span>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary">
        <div className="flex items-center space-x-1">
          <FiClock className="w-4 h-4" />
          <span>{quiz.totalQuestions || 0} Soru</span>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {quiz.score !== undefined ? (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              quiz.score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              quiz.score >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              %{Math.round(quiz.score)}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Henüz Tamamlanmadı
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end space-x-2 fast-transition">
          <Link
            href={`/exams/${quiz.id}/results`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-brand-primary bg-brand-primary bg-opacity-10 hover:bg-opacity-20 fast-interactive"
          >
            <FiEye className="w-4 h-4" />
          </Link>
          <button className="inline-flex items-center justify-center w-8 h-8 rounded-full text-tertiary bg-secondary hover:bg-interactive-hover fast-interactive">
            <FiDownload className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};
