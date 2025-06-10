"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

// TopicData arayüzünü de import et
import type { DetectedSubTopic as TopicData } from "@/types/learningTarget.type";

interface StatusStyle {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon: React.ElementType;
}

export const getStatusStyle = (status: LearningTargetStatusLiteral | undefined): StatusStyle => {
  switch (status) {
    case "pending":
      return {
        color: "text-tertiary",
        bgColor: "bg-secondary",
        borderColor: "border-primary",
        label: "Yeni",
        icon: FiBook,
      };
    case "medium":
      return {
        color: "text-state-info",
        bgColor: "bg-state-info-bg",
        borderColor: "border-state-info-border",
        label: "Devam Ediyor",
        icon: FiLoader,
      };
    case "failed":
      return {
        color: "text-state-warning",
        bgColor: "bg-state-warning-bg",
        borderColor: "border-state-warning-border",
        label: "Gözden Geçirilmeli",
        icon: FiAlertTriangle,
      };
    case "mastered":
      return {
        color: "text-state-success",
        bgColor: "bg-state-success-bg",
        borderColor: "border-state-success-border",
        label: "Tamamlandı",
        icon: FiCheck,
      };
    default:
      return {
        color: "text-tertiary",
        bgColor: "bg-secondary",
        borderColor: "border-primary",
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
  existingTopics?: TopicData[]; // Mevcut/kayıtlı konular
  availableCourses?: CourseData[]; // Mevcut kurslar
  selectedCourseId?: string; // Seçili kurs ID
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
  error, // error prop'u şu an kullanılmıyor, ancak gelecekte kullanılabilir.
  onTopicsSelected,
  onCourseChange,
  onCancel, // onCancel prop'u şu an kullanılmıyor.
  initialSelectedTopicIds,
  onTopicSelectionChange = () => {},
  onInitialLoad = true,
  setOnInitialLoad = () => {},
}: TopicSelectionScreenProps) {
  const [filteredTopics, setFilteredTopics] = useState<TopicData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [currentCourseId, setCurrentCourseId] = useState(selectedCourseId || "");

  // --- YENİ: Seçili topic id'lerini local state'te de tutalım ---
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialSelectedTopicIds || []);

  // --- YENİ: Seçim değişimini hem localde hem parent'ta güncelle ---
  const handleTopicSelectionChange = useCallback((ids: string[]) => {
    setSelectedTopicIds(ids);
    onTopicSelectionChange(ids);
  }, [onTopicSelectionChange]);

  // Ref to store the latest callback to avoid dependency cycle
  const handleTopicSelectionChangeRef = useRef(handleTopicSelectionChange);
  useEffect(() => {
    handleTopicSelectionChangeRef.current = handleTopicSelectionChange;
  }, [handleTopicSelectionChange]);

  // --- YENİ: İlk yüklemede ve detectedTopics değiştiğinde seçimleri güncelle ---
  useEffect(() => {
    if (isLoading) return;

    const existingTopicIds = new Set(existingTopics.map((t) => t.id));
    let baseTopicsRaw: TopicData[] = [];

    if (quizType === "quick") {
      baseTopicsRaw = [...detectedTopics];
    } else if (personalizedQuizType === "newTopicFocused") {
      baseTopicsRaw = [...detectedTopics];
    } else if (personalizedQuizType === "learningObjectiveFocused") {
      const uniqueDetected = detectedTopics.filter((t) => !existingTopicIds.has(t.id));
      baseTopicsRaw = [...existingTopics, ...uniqueDetected];
    } else if (personalizedQuizType === "weakTopicFocused") {
      baseTopicsRaw = existingTopics.filter(
        (topic) => topic.status === "failed" || topic.status === "medium",
      );
    } else if (personalizedQuizType === "comprehensive") {
      const uniqueDetected = detectedTopics.filter((t) => !existingTopicIds.has(t.id));
      baseTopicsRaw = [...uniqueDetected, ...existingTopics];
    }

    // --- YENİ: Seçili id'leri belirle ---
    let initialSelectionIds: string[] = [];
    if (onInitialLoad) {
      if (initialSelectedTopicIds && initialSelectedTopicIds.length > 0) {
        initialSelectionIds = initialSelectedTopicIds;
      } else {
        if (personalizedQuizType !== 'weakTopicFocused') {
          initialSelectionIds = baseTopicsRaw.map(t => t.id);
        } else {
          initialSelectionIds = [];
        }
      }
      setOnInitialLoad(false);
    } else {
      // Burada selectedTopicIds kullanmayarak circular dependency'yi kırıyoruz
      initialSelectionIds = baseTopicsRaw.map(t => t.id);
    }

    // --- YENİ: filteredTopics'i oluştur ve seçimleri uygula ---
    const finalTopicsWithSelection = baseTopicsRaw.map(topic => ({
      ...topic,
      isSelected: initialSelectionIds.includes(topic.id),
    }));
    
    setFilteredTopics(finalTopicsWithSelection);
    
    // --- YENİ: Seçim değişimini parent'a bildir ---
    // Circular dependency'yi önlemek için ref kullanıyoruz
    handleTopicSelectionChangeRef.current(initialSelectionIds);
  }, [detectedTopics, existingTopics, quizType, personalizedQuizType, isLoading, initialSelectedTopicIds, onInitialLoad, setOnInitialLoad]);

  // --- YENİ: Seçimi güncelleyen fonksiyonlar ---
  const handleToggleAll = useCallback((selectAll: boolean) => {
    const updatedTopics = filteredTopics.map(topic => ({
      ...topic,
      isSelected: selectAll
    }));
    setFilteredTopics(updatedTopics);
    const selectedIds = selectAll ? updatedTopics.map(t => t.id) : [];
    handleTopicSelectionChangeRef.current(selectedIds);
  }, [filteredTopics]);

  const handleTopicToggle = useCallback((id: string) => {
    const updatedTopics = filteredTopics.map(topic => {
      if (topic.id === id) {
        return { ...topic, isSelected: !topic.isSelected };
      }
      return topic;
    });
    setFilteredTopics(updatedTopics);
    const selectedIds = updatedTopics.filter(t => t.isSelected).map(t => t.id);
    handleTopicSelectionChangeRef.current(selectedIds);
  }, [filteredTopics]);

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
      new: filteredTopics.filter((t) => t.isNew).length, // isNew property TopicData'da olmalı
      existing: filteredTopics.filter((t) => !t.isNew).length, // isNew property TopicData'da olmalı
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
          ? filteredTopics.filter((t) => t.isNew) // isNew property TopicData'da olmalı
          : filteredTopics.filter((t) => !t.isNew), // isNew property TopicData'da olmalı
    [filteredTopics, selectedFilter],
  );

  const groupedTopics = useMemo(() => {
    const groups: Record<string, TopicData[]> = {};
    displayTopics.forEach((topic) => {
      const parentTopic = topic.parentTopic || 'Diğer Konular';
      if (!groups[parentTopic]) {
        groups[parentTopic] = [];
      }
      groups[parentTopic].push(topic);
    });
    return groups;
  }, [displayTopics]);

  const handleContinue = () => {
    if (!currentCourseId && quizType === 'personalized') {
      alert("Lütfen bir ders seçin");
      return;
    }

    const topicsToSubmit = filteredTopics
      .filter((t) => t.isSelected)
      .map((t) => t.id);

    if (topicsToSubmit.length === 0 && personalizedQuizType !== 'weakTopicFocused') {
      alert("Lütfen en az bir konu seçin");
      return;
    }
    
    onTopicsSelected(topicsToSubmit, quizType === 'quick' ? "" : currentCourseId);
  };

  const getStatusInfo = useCallback((status?: LearningTargetStatusLiteral | string) => {
    if (!status) {
      return {
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        borderColor: "border-indigo-200 dark:border-indigo-700",
        label: "Yeni", // Varsayılan olarak 'Yeni' etiketi, eğer konu durumu yoksa
        icon: FiPlus,
      };
    }
    const validStatusValues: LearningTargetStatusLiteral[] = ["pending", "medium", "failed", "mastered"];
    const statusStr = typeof status === 'string' ? status : String(status);
    const statusLiteral = validStatusValues.includes(statusStr as LearningTargetStatusLiteral) 
      ? statusStr as LearningTargetStatusLiteral 
      : "pending"; // Bilinmeyen bir durum gelirse 'pending' varsay
    return getStatusStyle(statusLiteral);
  }, []);

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative py-12 flex flex-col items-center justify-center rounded-3xl backdrop-blur-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/60 border-slate-700/30 shadow-2xl shadow-slate-950/40' : 'bg-white/80 border-gray-200/40 shadow-2xl shadow-gray-900/10'}`}
      >
        {/* Background effects */}
        <div className={`absolute inset-0 opacity-30 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10' : 'bg-gradient-to-br from-blue-300/10 via-purple-300/5 to-indigo-300/10'}`} />
        
        {/* Gradient accent */}
        <motion.div 
          className={`absolute left-0 top-0 w-full h-2 bg-gradient-to-r ${isDarkMode ? 'from-blue-500 via-indigo-500 to-purple-500' : 'from-blue-400 via-indigo-400 to-purple-400'} opacity-90`}
          animate={{
            background: [
              'linear-gradient(90deg, rgb(59,130,246) 0%, rgb(99,102,241) 50%, rgb(168,85,247) 100%)',
              'linear-gradient(90deg, rgb(168,85,247) 0%, rgb(59,130,246) 50%, rgb(99,102,241) 100%)',
              'linear-gradient(90deg, rgb(99,102,241) 0%, rgb(168,85,247) 50%, rgb(59,130,246) 100%)',
              'linear-gradient(90deg, rgb(59,130,246) 0%, rgb(99,102,241) 50%, rgb(168,85,247) 100%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm ${isDarkMode ? 'bg-gradient-to-br from-blue-600/60 to-indigo-600/70 border border-blue-500/30' : 'bg-gradient-to-br from-blue-100/90 to-indigo-100/90 border border-blue-200/50'}`}
          >
            <FiLoader className={`w-8 h-8 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
          </motion.div>
          <motion.h3 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}
          >
            Konular Hazırlanıyor
          </motion.h3>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
          >
            Yapay zeka konuları analiz ediyor...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (filteredTopics.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative py-12 px-8 flex flex-col items-center justify-center rounded-3xl backdrop-blur-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/60 border-slate-700/30 shadow-2xl shadow-slate-950/40' : 'bg-white/80 border-gray-200/40 shadow-2xl shadow-gray-900/10'}`}
      >
        {/* Background effects */}
        <div className={`absolute inset-0 opacity-30 ${isDarkMode ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10' : 'bg-gradient-to-br from-amber-300/10 via-orange-300/5 to-red-300/10'}`} />
        
        {/* Gradient accent */}
        <div className={`absolute left-0 top-0 w-full h-2 bg-gradient-to-r ${isDarkMode ? 'from-amber-500 via-orange-500 to-red-500' : 'from-amber-400 via-orange-400 to-red-400'} opacity-90`} />

        <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm ${isDarkMode ? 'bg-gradient-to-br from-amber-600/60 to-orange-600/70 border border-amber-500/30' : 'bg-gradient-to-br from-amber-100/90 to-orange-100/90 border border-amber-200/50'}`}
          >
            <FiInfo className={`w-8 h-8 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} />
          </motion.div>
          
          <motion.h3 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}
          >
            {personalizedQuizType === "weakTopicFocused"
              ? "Henüz zayıf veya orta düzeyde konunuz bulunmuyor."
              : "Belgede konu tespit edilemedi"}
          </motion.h3>
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`text-center mb-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
          >
            {personalizedQuizType === "weakTopicFocused" ? (
              <p className="leading-relaxed">
                Sınavları çözmeye devam ettikçe, performansınıza göre zayıf ve güçlü olduğunuz konuları belirlemeye başlayacağız.
              </p>
            ) : (
              <div>
                <p className="leading-relaxed mb-3">
                  AI tarafından yüklenen belgede öğrenilebilir konular tespit edilemedi. Bu şu nedenlerden kaynaklanabilir:
                </p>
                <ul className="list-disc text-left space-y-1 ml-6">
                  <li>Belge içeriği çok kısa veya yeterli kavramsal içerik bulunmuyor olabilir</li>
                  <li>Belge formatı veya yapısı AI tarafından doğru analiz edilememiş olabilir</li>
                  <li>Metin dili veya uzmanlık alanı AI tarafından işlenememiş olabilir</li>
                </ul>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4 w-full"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-slate-700/40 border-slate-600/40 hover:bg-slate-700/60' : 'bg-white/60 border-gray-200/60 hover:bg-white/80'}`}
            >
              <h4 className={`font-semibold mb-2 flex items-center ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                <FiPlus className="mr-2" />
                Manuel konu girişi yapın
              </h4>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Çalışmak istediğiniz konuları kendiniz ekleyerek devam edebilirsiniz.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push('/learning-goals/dashboard')}
              >
                <FiPlus className="mr-2" />
                Yeni Konu Ekle
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-slate-700/40 border-slate-600/40 hover:bg-slate-700/60' : 'bg-white/60 border-gray-200/60 hover:bg-white/80'}`}
            >
              <h4 className={`font-semibold mb-2 flex items-center ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                <FiBook className="mr-2" />
                Farklı bir belge yükleyin
              </h4>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Daha fazla kavramsal içerik içeren bir ders materyali veya dokümandan tekrar yükleme yapabilirsiniz.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Belge Yükleme Ekranına Dön
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-slate-700/40 border-slate-600/40 hover:bg-slate-700/60' : 'bg-white/60 border-gray-200/60 hover:bg-white/80'}`}
            >
              <h4 className={`font-semibold mb-2 flex items-center ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                <FiZap className="mr-2" />
                Farklı bir sınav türü seçin
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Kişiselleştirilmiş sınav yerine "Hızlı Sınav" seçeneğini veya mevcut konularınız varsa "Zayıf Konular" odaklı modu deneyebilirsiniz.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border ${isDarkMode ? 'bg-slate-800/60 border-slate-700/30 shadow-slate-950/40' : 'bg-white/80 border-gray-200/40 shadow-gray-900/10'}`}
    >
      {/* Background effects */}
      <div className={`absolute inset-0 opacity-30 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10' : 'bg-gradient-to-br from-blue-300/10 via-purple-300/5 to-indigo-300/10'}`} />
      
      {/* Enhanced gradient accent */}
      <motion.div 
        className={`absolute left-0 top-0 w-full h-2 bg-gradient-to-r ${isDarkMode ? 'from-sky-600 via-cyan-600 to-teal-600' : 'from-sky-500 via-cyan-500 to-teal-500'} opacity-90`}
        animate={{
          background: [
            'linear-gradient(90deg, rgb(14,165,233) 0%, rgb(6,182,212) 50%, rgb(20,184,166) 100%)',
            'linear-gradient(90deg, rgb(20,184,166) 0%, rgb(14,165,233) 50%, rgb(6,182,212) 100%)',
            'linear-gradient(90deg, rgb(6,182,212) 0%, rgb(20,184,166) 50%, rgb(14,165,233) 100%)',
            'linear-gradient(90deg, rgb(14,165,233) 0%, rgb(6,182,212) 50%, rgb(20,184,166) 100%)'
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 p-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-lg backdrop-blur-sm ${isDarkMode ? 'bg-gradient-to-br from-sky-600/60 to-cyan-600/70 border border-sky-500/30' : 'bg-gradient-to-br from-sky-100/90 to-cyan-100/90 border border-sky-200/50'}`}
            >
              <FiTarget className={`w-7 h-7 ${isDarkMode ? 'text-sky-300' : 'text-sky-600'}`} />
            </motion.div>
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>
              <span className={`bg-gradient-to-r ${isDarkMode ? 'from-sky-300 to-cyan-300' : 'from-sky-600 to-cyan-600'} bg-clip-text text-transparent`}>
                Konu Seçimi
              </span>
            </h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
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
          </motion.p>
        </motion.div>

        {/* Enhanced Course Selection */}
        {availableCourses && availableCourses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <label className={`block text-sm font-semibold mb-3 flex items-center ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={`w-5 h-5 rounded-lg flex items-center justify-center mr-2 ${isDarkMode ? 'bg-gradient-to-br from-emerald-500/60 to-teal-500/70' : 'bg-gradient-to-br from-emerald-400/80 to-teal-400/80'}`}
              >
                <FiBook className={`w-3 h-3 ${isDarkMode ? 'text-emerald-200' : 'text-white'}`} />
              </motion.div>
              📚 Ders Seçimi
            </label>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <select
                value={currentCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 backdrop-blur-xl focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg hover:shadow-xl cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-600/50 focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400 hover:bg-slate-700/80' : 'bg-white/90 border-gray-200/60 focus:ring-sky-400 focus:border-sky-400 text-gray-900 placeholder-gray-500 hover:bg-white/95'}`}
              >
                <option value="" className={isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-700'}>
                  💫 Bir ders seçin
                </option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id} className={isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-gray-900'}>
                    📖 {course.name}
                  </option>
                ))}
              </select>
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange("all")}
                className={`px-5 py-2.5 text-sm font-medium rounded-2xl transition-all duration-300 backdrop-blur-md border shadow-lg hover:shadow-xl flex items-center ${
                  selectedFilter === "all"
                    ? (isDarkMode ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white border-sky-500/30 shadow-sky-500/30' : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-sky-400/40 shadow-sky-400/30')
                    : (isDarkMode ? 'bg-slate-700/60 text-slate-300 border-slate-600/40 hover:bg-slate-600/70' : 'bg-white/70 text-gray-700 border-gray-200/60 hover:bg-white/90')
                }`}
              >
                <FiTarget className="w-4 h-4 mr-2" />
                🎯 Tümü ({topicCounts.all})
              </motion.button>
              
              {topicCounts.new > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange("new")}
                  className={`px-5 py-2.5 text-sm font-medium rounded-2xl transition-all duration-300 backdrop-blur-md border shadow-lg hover:shadow-xl flex items-center ${
                    selectedFilter === "new"
                      ? (isDarkMode ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/30 shadow-emerald-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/40 shadow-emerald-400/30')
                      : (isDarkMode ? 'bg-slate-700/60 text-slate-300 border-slate-600/40 hover:bg-slate-600/70' : 'bg-white/70 text-gray-700 border-gray-200/60 hover:bg-white/90')
                  }`}
                >
                  <FiZap className="w-4 h-4 mr-2" />
                  ✨ Yeni ({topicCounts.new})
                </motion.button>
              )}
              
              {topicCounts.existing > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange("existing")}
                  className={`px-5 py-2.5 text-sm font-medium rounded-2xl transition-all duration-300 backdrop-blur-md border shadow-lg hover:shadow-xl flex items-center ${
                    selectedFilter === "existing"
                      ? (isDarkMode ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500/30 shadow-violet-500/30' : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-violet-400/40 shadow-violet-400/30')
                      : (isDarkMode ? 'bg-slate-700/60 text-slate-300 border-slate-600/40 hover:bg-slate-600/70' : 'bg-white/70 text-gray-700 border-gray-200/60 hover:bg-white/90')
                  }`}
                >
                  <FiBook className="w-4 h-4 mr-2" />
                  📚 Mevcut ({topicCounts.existing})
                </motion.button>
              )}
            </div>
            
            {/* Select All Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleAll(true)}
              className={`px-6 py-2.5 text-sm font-semibold rounded-2xl transition-all duration-300 backdrop-blur-md border shadow-lg hover:shadow-xl flex items-center ${isDarkMode ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white border-rose-500/30 shadow-rose-500/30' : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-rose-400/40 shadow-rose-400/30'}`}
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <FiCheck className="w-4 h-4 mr-2" />
              </motion.div>
              ⭐ Tümünü Seç
            </motion.button>
          </div>
          
          {/* Selection Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`mt-4 flex flex-wrap gap-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isDarkMode ? 'bg-green-500' : 'bg-green-400'}`}></div>
              <span className="font-medium">{topicCounts.selected} seçili</span>
            </div>
            {topicCounts.weak > 0 && (
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isDarkMode ? 'bg-red-500' : 'bg-red-400'}`}></div>
                <span>{topicCounts.weak} zayıf</span>
              </div>
            )}
            {topicCounts.medium > 0 && (
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400'}`}></div>
                <span>{topicCounts.medium} orta</span>
              </div>
            )}
            {topicCounts.good > 0 && (
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
                <span>{topicCounts.good} iyi</span>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Enhanced Topics Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-6 mb-8"
        >
          <AnimatePresence mode="wait">
            {Object.entries(groupedTopics).map(([parentTopic, topics], groupIndex) => (
              <motion.div 
                key={parentTopic}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: groupIndex * 0.1, duration: 0.5 }}
                className={`relative rounded-3xl p-6 transition-all duration-500 ease-out backdrop-blur-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/60 border-slate-700/40 shadow-xl shadow-slate-950/30 hover:shadow-slate-900/40' : 'bg-white/80 border-gray-200/60 shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20'}`}
              >
                {/* Background gradient effect */}
                <div className={`absolute inset-0 opacity-20 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10' : 'bg-gradient-to-br from-cyan-300/10 via-blue-300/5 to-indigo-300/10'}`} />
                
                {/* Animated accent border */}
                <motion.div 
                  className={`absolute left-0 top-0 w-full h-1 bg-gradient-to-r ${isDarkMode ? 'from-cyan-500 via-blue-500 to-indigo-500' : 'from-cyan-400 via-blue-400 to-indigo-400'} opacity-80`}
                  animate={{
                    background: [
                      'linear-gradient(90deg, rgb(6,182,212) 0%, rgb(59,130,246) 50%, rgb(99,102,241) 100%)',
                      'linear-gradient(90deg, rgb(99,102,241) 0%, rgb(6,182,212) 50%, rgb(59,130,246) 100%)',
                      'linear-gradient(90deg, rgb(59,130,246) 0%, rgb(99,102,241) 50%, rgb(6,182,212) 100%)',
                      'linear-gradient(90deg, rgb(6,182,212) 0%, rgb(59,130,246) 50%, rgb(99,102,241) 100%)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative z-10">
                  {/* Enhanced Group Header */}
                  <motion.div 
                    className={`flex items-center justify-between mb-5 pb-4 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/70'}`}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-4 shadow-lg backdrop-blur-sm ${isDarkMode ? 'bg-gradient-to-br from-cyan-600/60 to-blue-600/70 border border-cyan-500/30' : 'bg-gradient-to-br from-cyan-100/90 to-blue-100/90 border border-cyan-200/50'}`}
                      >
                        <FiBook className={`w-5 h-5 ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'}`} />
                      </motion.div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>
                        <span className={`bg-gradient-to-r ${isDarkMode ? 'from-cyan-300 to-blue-300' : 'from-cyan-600 to-blue-600'} bg-clip-text text-transparent`}>
                          📖 {parentTopic}
                        </span>
                      </h3>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-md border ${isDarkMode ? 'bg-slate-700/60 text-slate-300 border-slate-600/40' : 'bg-white/70 text-gray-700 border-gray-200/60'}`}
                    >
                      {topics.length} konu
                    </motion.div>
                  </motion.div>
                  
                  {/* Enhanced Topics Grid */}
                  <div className="grid gap-3">
                    <AnimatePresence>
                      {topics.map((topic, index) => (
                        <motion.div
                          key={`${topic.id}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                        >
                          <TopicCard
                            topic={topic}
                            onToggle={handleTopicToggle}
                            statusInfo={getStatusInfo(topic.status || (topic.isNew ? undefined : "pending"))}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Continue Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className={`sticky bottom-0 p-6 rounded-2xl backdrop-blur-xl border shadow-2xl ${isDarkMode ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-gray-200/60'}`}
        >
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              <div className="flex items-center mb-1">
                <FiCheck className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-semibold">{topicCounts.selected} konu seçili</span>
              </div>
              <p className="text-xs">
                {personalizedQuizType !== 'weakTopicFocused' && topicCounts.selected === 0 
                  ? "⚠️ Lütfen en az bir konu seçin" 
                  : "✅ Seçiminizi tamamlayıp devam edebilirsiniz"}
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleContinue}
                disabled={personalizedQuizType !== 'weakTopicFocused' && topicCounts.selected === 0}
                className={`px-8 py-3 text-base font-semibold rounded-2xl shadow-lg transition-all duration-300 ${
                  personalizedQuizType !== 'weakTopicFocused' && topicCounts.selected === 0
                    ? (isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                    : (isDarkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/30' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-indigo-400/30')
                }`}
              >
                <FiAward className="w-5 h-5 mr-2" />
                🚀 Sınava Devam Et
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface TopicCardProps {
  topic: TopicData & { isSelected?: boolean }; // isSelected TopicData'da olabilir veya olmayabilir.
  onToggle: (id: string) => void;
  statusInfo: StatusStyle;
}

function TopicCard({ topic, onToggle, statusInfo }: TopicCardProps) {
  const { isDarkMode } = useTheme();
  
  const displayTopicName = () => {
    let name = '';
    if (typeof topic.subTopicName === 'string') {
      name = topic.subTopicName;
      if (name.startsWith('```') || name.startsWith('"```') || name.includes('subTopicName') || name.includes('normalizedSubTopicName')) {
        name = 'Konu ' + topic.id.substring(0, 8);
      }
    }
    else if (topic.name) {
      name = topic.name;
    }
    else {
      name = 'Konu ' + topic.id.substring(0, 8);
    }
    name = name.replace(/^\W+/, '').replace(/\s+/g, ' ').trim();
    if (!name || name.length < 3) {
      return 'Konu ' + topic.id.substring(0, 8);
    }
    return name;
  };

  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border shadow-lg hover:shadow-xl ${
        topic.isSelected
          ? `bg-gradient-to-r ${isDarkMode ? 'from-emerald-600/80 to-cyan-600/80 border-emerald-500/40 shadow-emerald-500/30' : 'from-emerald-500/90 to-cyan-500/90 border-emerald-400/50 shadow-emerald-400/40'}`
          : `${isDarkMode ? 'bg-slate-700/60 border-slate-600/40 hover:bg-slate-600/70 shadow-slate-950/20' : 'bg-white/80 border-gray-200/50 hover:bg-white/95 shadow-gray-300/30'}`
      }`}
      onClick={() => onToggle(topic.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onToggle(topic.id);
      }}
    >
      {/* Animated background effect for selected state */}
      <AnimatePresence>
        {topic.isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center justify-between p-4">
        {/* Left section with checkbox and content */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Enhanced Checkbox */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`relative rounded-xl min-w-6 w-6 h-6 flex items-center justify-center transition-all duration-300 border-2 shadow-sm ${
              topic.isSelected
                ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white border-emerald-400 shadow-emerald-500/30'
                : (isDarkMode ? 'bg-slate-600/60 border-slate-500/60 hover:border-slate-400' : 'bg-white/90 border-gray-300/70 hover:border-gray-400')
            }`}
          >
            <AnimatePresence>
              {topic.isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <FiCheck className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.h3 
              className={`font-semibold text-sm leading-relaxed transition-colors duration-200 ${
                topic.isSelected 
                  ? (isDarkMode ? 'text-white' : 'text-white') 
                  : (isDarkMode ? 'text-slate-200' : 'text-gray-800')
              }`}
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              🎯 {displayTopicName()}
            </motion.h3>
            {topic.parentTopic && (
              <motion.p 
                className={`text-xs mt-1 transition-colors duration-200 ${
                  topic.isSelected 
                    ? (isDarkMode ? 'text-white/80' : 'text-white/90') 
                    : (isDarkMode ? 'text-slate-400' : 'text-gray-500')
                }`}
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
              >
                📚 {topic.parentTopic}
              </motion.p>
            )}
          </div>
        </div>

        {/* Right section with status and badges */}
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {/* Enhanced Status Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 whitespace-nowrap backdrop-blur-sm border shadow-sm ${
              topic.isSelected
                ? (isDarkMode ? 'bg-white/20 text-white border-white/30 shadow-white/10' : 'bg-white/30 text-white border-white/40 shadow-white/20')
                : `${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor} shadow-gray-200/20`
            }`}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="mr-1.5"
            >
              <StatusIcon className="w-3 h-3" />
            </motion.div>
            {statusInfo.label}
          </motion.div>
          
          {/* Enhanced New Badge */}
          <AnimatePresence>
            {topic.isNew && (
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, x: 20 }}
                whileHover={{ scale: 1.1, y: -1 }}
                className={`text-xs rounded-xl px-2.5 py-1 font-semibold whitespace-nowrap backdrop-blur-sm border shadow-sm transition-all duration-200 ${
                  topic.isSelected
                    ? (isDarkMode ? 'bg-yellow-400/20 text-yellow-200 border-yellow-300/30' : 'bg-yellow-300/30 text-yellow-100 border-yellow-200/40')
                    : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200/60 shadow-amber-200/30'
                }`}
              >
                ✨ Yeni
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(45deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))' 
            : 'linear-gradient(45deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05))'
        }}
      />
    </motion.div>
  );
}