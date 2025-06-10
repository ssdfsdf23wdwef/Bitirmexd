"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  BarChart3, CheckCircle, XCircle, ListChecks, HelpCircle, ArrowLeft, 
  Trophy, Target, TrendingUp, Home, FileText, Star, Award, 
  BookOpen, Brain, Clock, Zap, CircleCheck, AlertCircle 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Shimmer animation styles
const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Projenizdeki Question ve Quiz tiplerine benzer basit tipler
interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subTopic: string;
  userAnswer?: string | null;
  isCorrect?: boolean;
}

interface QuizResult {
  quizTitle: string;
  questions: Question[];
  overallScore: number;
  subTopicStats: Array<{ subTopic: string; score: number; totalQuestions: number; correctQuestions: number }>;
}

const calculateResults = (questions: Question[], userAnswers: Record<string, string>, quizTitle: string): QuizResult => {
  console.log('[RESULTS_PAGE_TRACE] calculateResults() ÇAĞRILDI. Parametreler:', {questions, userAnswers, quizTitle});
  let correctCount = 0;
  const processedQuestions: Question[] = questions.map(q => {
    const userAnswer = userAnswers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    console.log(`[RESULTS_PAGE_TRACE] Soru: ${q.id} | Kullanıcı Cevabı: ${userAnswer} | Doğru Cevap: ${q.correctAnswer} | isCorrect: ${isCorrect}`);
    if (isCorrect) correctCount++;
    return { ...q, userAnswer, isCorrect };
  });
  const overallScore = (correctCount / questions.length) * 100;
  console.log(`[RESULTS_PAGE_TRACE] Toplam Doğru: ${correctCount} / ${questions.length} | Skor: ${overallScore}`);
  const subTopicStatsMap: Map<string, { correct: number; total: number }> = new Map();
  processedQuestions.forEach(q => {
    const stat = subTopicStatsMap.get(q.subTopic) || { correct: 0, total: 0 };
    stat.total++;
    if (q.isCorrect) stat.correct++;
    subTopicStatsMap.set(q.subTopic, stat);
    console.log(`[RESULTS_PAGE_TRACE] Alt Konu: ${q.subTopic} | Doğru: ${stat.correct} | Toplam: ${stat.total}`);
  });
  const subTopicStats = Array.from(subTopicStatsMap.entries()).map(([subTopic, data]) => ({
    subTopic,
    score: (data.correct / data.total) * 100,
    totalQuestions: data.total,
    correctQuestions: data.correct,
  }));
  console.log('[RESULTS_PAGE_TRACE] subTopicStats:', subTopicStats);
  const result = { quizTitle, questions: processedQuestions, overallScore, subTopicStats };
  console.log('[RESULTS_PAGE_TRACE] calculateResults() DÖNDÜRÜLEN SONUÇ:', result);
  return result;
};

import { fetchExamResultFromBackend } from '@/services/quiz.service';

export default function ExamResultsPage() {
  // Add shimmer styles to document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = shimmerStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  function normalize(val: any) {
    if (val == null) return '';
    if (typeof val === 'object' && 'text' in val) return String(val.text).trim().toLocaleLowerCase('tr');
    return String(val).trim().toLocaleLowerCase('tr');
  }
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme, isDarkMode } = useTheme();
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  // ... diğer state ve ref'ler

  const calculatedSubTopicStats: Array<{subTopic: string; score: number; totalQuestions: number; correctQuestions: number}> = React.useMemo(() => {
    if (!quizResult || !Array.isArray(quizResult.questions)) return [];
    const statsMap: Record<string, { total: number; correct: number }> = {};
    quizResult.questions.forEach((q) => {
      if (!q.subTopic) return;
      if (!statsMap[q.subTopic]) statsMap[q.subTopic] = { total: 0, correct: 0 };
      statsMap[q.subTopic].total += 1;
      if (q.isCorrect) statsMap[q.subTopic].correct += 1;
    });
    return Object.entries(statsMap).map(([subTopic, data]) => ({
      subTopic,
      score: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      totalQuestions: data.total,
      correctQuestions: data.correct,
    }));
  }, [quizResult]);

  // Genel puan (doğru/total * 100)
  const calculatedOverallScore: number = React.useMemo(() => {
    if (!quizResult || !Array.isArray(quizResult.questions) || quizResult.questions.length === 0) return 0;
    const correctCount = quizResult.questions.filter(q => q.isCorrect).length;
    return (correctCount / quizResult.questions.length) * 100;
  }, [quizResult]);

  // Backend'den çekilen veri için loading ve error state
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Backend'den sınav sonucu çekme fonksiyonu
  const fetchBackendExamResult = async (quizId: string) => {
    setBackendLoading(true);
    setBackendError(null);
    try {
      const backendResult = await fetchExamResultFromBackend(quizId);
      if (!backendResult) throw new Error("Sonuç bulunamadı");
      // questions dizisine userAnswer ve isCorrect ekle
      const processedQuestions = backendResult.questions.map((q: any) => ({
        ...q,
        userAnswer: backendResult.userAnswers?.[q.id] ?? null,
        isCorrect: backendResult.userAnswers?.[q.id] === q.correctAnswer,
      }));
      setQuizResult({
        ...backendResult,
        questions: processedQuestions,
      });
      dataLoadedRef.current = true;
      setLoading(false);
    } catch (err: any) {
      setBackendError("Sonuçlar backend'den alınamadı: " + (err?.message || "Bilinmeyen hata"));
      setLoading(false);
      dataLoadedRef.current = true;
    } finally {
      setBackendLoading(false);
    }
  };


  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const dataLoadedRef = React.useRef(false); // Bir defalık veri yükleme koruması

  useEffect(() => {
  let isMounted = true;
  (async () => {
    console.log(`[RESULTS_PAGE_TRACE] useEffect BAŞLADI. params.id=`, params.id, '| quizResult exists:', !!quizResult, '| dataLoadedRef.current:', dataLoadedRef.current);
    if (dataLoadedRef.current) {
      console.log('[RESULTS_PAGE_TRACE] dataLoadedRef.current=true olduğu için veri tekrar yüklenmeyecek. useEffect çıkıyor.');
      return;
    }
    if (quizResult) {
      dataLoadedRef.current = true;
      console.log('[RESULTS_PAGE_TRACE] quizResult yüklendi, dataLoadedRef.current=true olarak ayarlandı. useEffect çıkıyor.');
      return;
    }
    console.log("[RESULTS_PAGE_TRACE] Sonuçlar henüz yüklenmemiş, yükleme işlemi başlatılıyor. State'ler:", { loading, dataError, quizResult });
    setLoading(true);
    setDataError(null);
    let storedDataString: string | null = null;
    let storageKeyUsed: string = '';
    try {
      const currentQuizId = Array.isArray(params.id) ? params.id[0] : params.id as string;
      console.log(`[RESULTS_PAGE_TRACE] useEffect: quizId oluşturuldu: ${currentQuizId}`);
      if (!currentQuizId) {
        console.error("[RESULTS_PAGE_ERROR] Sınav ID bulunamadı. params:", params);
        setDataError("Sınav ID bulunamadı.");
        dataLoadedRef.current = true;
        console.log('[RESULTS_PAGE_STATE] Hata durumunda dataLoadedRef.current=true olarak ayarlandı.');
        setLoading(false);
        return;
      }
      storageKeyUsed = `examCompletionData_${currentQuizId}`;
      console.log(`[RESULTS_PAGE_TRACE] 🔑 localStorage'dan okunacak anahtar: ${storageKeyUsed}`);
      console.log(`[RESULTS_PAGE_TRACE] localStorage.getItem(${storageKeyUsed}) ÇAĞRILIYOR.`);
      storedDataString = localStorage.getItem(storageKeyUsed);
      console.log(`[RESULTS_PAGE_TRACE] 📄 localStorage'dan okunan veri (string):`, storedDataString);
      if (!storedDataString) {
        // Local'de veri yoksa backend'den çekmeye çalış
        console.log(`[RESULTS_PAGE_DEBUG] LocalStorage'da veri yok, backend'den sonuç çekilecek: ${storageKeyUsed}`);
        setLoading(true);
        console.log(`[RESULTS_PAGE_TRACE] setLoading(true) çağrıldı (backend fetch öncesi). Şu anki state:`, { loading, dataError, quizResult });
        try {
          console.log(`[RESULTS_PAGE_TRACE] fetchExamResultFromBackend(${currentQuizId}) çağrılıyor...`);
          const backendResult = await fetchExamResultFromBackend(currentQuizId);
          console.log(`[RESULTS_PAGE_TRACE] fetchExamResultFromBackend dönüşü:`, backendResult);
          if (backendResult === undefined) {
            console.warn('[RESULTS_PAGE_WARN] Backend sonuç: undefined');
          } else if (backendResult === null) {
            console.warn('[RESULTS_PAGE_WARN] Backend sonuç: null');
          } else if (typeof backendResult !== 'object') {
            console.warn('[RESULTS_PAGE_WARN] Backend sonuç tip hatası:', typeof backendResult);
          } else {
            console.log('[RESULTS_PAGE_TRACE] Backend sonuç tip kontrolü geçti:', backendResult);
            if (backendResult.id) console.log('[RESULTS_PAGE_TRACE] Backend veri id:', backendResult.id);
            if (backendResult.title) console.log('[RESULTS_PAGE_TRACE] Backend veri title:', backendResult.title);
            if (backendResult.quizTitle) console.log('[RESULTS_PAGE_TRACE] Backend veri quizTitle:', backendResult.quizTitle);
            if (Array.isArray(backendResult.questions)) console.log('[RESULTS_PAGE_TRACE] Backend veri questions uzunluğu:', backendResult.questions.length);
          }
          if (isMounted && backendResult) {
            console.log('[RESULTS_PAGE_TRACE] setQuizResult() çağrılacak. Önceki quizResult:', quizResult);
            setQuizResult((prev) => {
              console.log('[RESULTS_PAGE_TRACE] setQuizResult callback, önceki:', prev, 'yeni:', backendResult);
              return backendResult as QuizResult;
            });
            setTimeout(() => {
              console.log('[RESULTS_PAGE_TRACE] setQuizResult sonrası quizResult:', quizResult);
            }, 100);
            dataLoadedRef.current = true;
            console.log(`[RESULTS_PAGE_TRACE] dataLoadedRef.current=true olarak ayarlandı (backend success).`);
          } else if (isMounted) {
            setDataError('Sonuçlar backend\'den alınamadı.');
            console.log(`[RESULTS_PAGE_ERROR] Backend'den sonuç alınamadı veya veri yok. State güncellendi.`);
            setTimeout(() => {
              console.log('[RESULTS_PAGE_TRACE] setDataError sonrası dataError:', dataError);
            }, 100);
            dataLoadedRef.current = true;
            console.log(`[RESULTS_PAGE_TRACE] dataLoadedRef.current=true olarak ayarlandı (backend error).`);
          }
        } catch (err) {
          if (isMounted) {
            setDataError('Sonuçlar backend\'den alınamadı.');
            console.error(`[RESULTS_PAGE_ERROR] Backend fetch sırasında hata oluştu:`, err);
            if (err instanceof Error) {
              console.error('[RESULTS_PAGE_ERROR] Backend fetch hata stack:', err.stack);
            }
            setTimeout(() => {
              console.log('[RESULTS_PAGE_TRACE] setDataError sonrası dataError:', dataError);
            }, 100);
            dataLoadedRef.current = true;
            console.log(`[RESULTS_PAGE_TRACE] dataLoadedRef.current=true olarak ayarlandı (backend catch bloğu).`);
          }
        }
        if (isMounted) {
          setLoading(false);
          console.log(`[RESULTS_PAGE_TRACE] setLoading(false) çağrıldı (backend fetch sonrası). Şu anki state:`, { loading, dataError, quizResult });
        }
        return;
      }

      console.log("[RESULTS_PAGE_DEBUG] JSON.parse ÇAĞRILIYOR.");
      let parsedData = null;
      try {
        parsedData = JSON.parse(storedDataString); 

        console.log("[RESULTS_PAGE_TRACE] 📦 localStorage'dan parse edilen veri:", parsedData);
      } catch(parseErr) {
        console.error('[RESULTS_PAGE_ERROR] JSON.parse HATASI:', parseErr, '| Okunan veri:', storedDataString);
        setDataError('Sınav sonuç verisi okunurken parse hatası oluştu.');
        localStorage.removeItem(storageKeyUsed);
        dataLoadedRef.current = true;
        return;
      }

      const { quizData: parsedQuizData, userAnswersData: parsedUserAnswersData } = parsedData;

      if (!parsedQuizData || !parsedQuizData.questions || !parsedUserAnswersData) {
        console.error("[RESULTS_PAGE_ERROR] Alınan sınav verileri eksik veya bozuk. Veri:", parsedData);
        setDataError("Alınan sınav verileri eksik veya bozuk.");
        localStorage.removeItem(storageKeyUsed);
        console.log(`[RESULTS_PAGE_TRACE] localStorage.removeItem(${storageKeyUsed}) ÇAĞRILDI (bozuk veri).`);
        dataLoadedRef.current = true;
        console.log('[RESULTS_PAGE_STATE] Hata durumunda dataLoadedRef.current=true olarak ayarlandı.');
        return;
      }

      console.log("[RESULTS_PAGE_DEBUG] calculateResults ÇAĞRILIYOR.");
      const results = calculateResults(parsedQuizData.questions, parsedUserAnswersData, parsedQuizData.title || "Sınav Sonuçları");
      console.log('[RESULTS_PAGE_STATE] setQuizResult() ÇAĞRILIYOR. Sonuçlar:', results);
      setQuizResult(results);
      console.log('[RESULTS_PAGE_STATE] quizResult state güncellendi:', results);
      console.log("[RESULTS_PAGE_TRACE] Veri başarıyla işlendi.");
    } catch (error) {
      console.error("[RESULTS_PAGE_ERROR] Sınav sonuçları yüklenirken hata oluştu:", error, '| storageKeyUsed:', storageKeyUsed, '| storedDataString:', storedDataString);
      if (error instanceof Error) {
        console.error('[RESULTS_PAGE_ERROR] Stack Trace:', error.stack);
      }
      setDataError(`Sınav sonuçları yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
      if (storageKeyUsed && storedDataString) {
        localStorage.removeItem(storageKeyUsed);
        console.log(`[RESULTS_PAGE_TRACE] localStorage.removeItem(${storageKeyUsed}) ÇAĞRILDI (hata sonrası temizlik).`);
      }
    } finally {
      console.log(`[RESULTS_PAGE_TRACE] FINALLY BLOĞU: loading state (önceki) =`, loading);
      setLoading(false);
      console.log("[RESULTS_PAGE_TRACE] setLoading(false) çağrıldı (finally bloğu).");
      console.log("[RESULTS_PAGE_TRACE] useEffect BİTTİ (finally bloğu sonrası). Son State'ler:", { loading, dataError, quizResult });
    }
    })();
  return () => { isMounted = false; };
}, [params.id, calculateResults]); // Bağımlılıklar sadeleştirildi

  // localStorage'dan veriyi silmek için ayrı bir effect
  useEffect(() => {
    if (!quizResult) return;
    // quizResult yüklendiyse, ilgili anahtarı sil
    const currentQuizId = Array.isArray(params.id) ? params.id[0] : params.id as string;
    if (!currentQuizId) return;
    const storageKeyUsed = `examCompletionData_${currentQuizId}`;
    localStorage.removeItem(storageKeyUsed);
    console.log(`[RESULTS_PAGE_TRACE] [CLEANUP_EFFECT] localStorage.removeItem(${storageKeyUsed}) ÇAĞRILDI (quizResult yüklendiği için).`);
  }, [quizResult, params.id]); // Bağımlılıklar sadeleştirildi

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  if (dataError) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-4 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`max-w-md mx-auto text-center p-8 rounded-2xl shadow-2xl backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-slate-800/90 border-slate-700/50' 
              : 'bg-white/90 border-gray-200/50'
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Sonuçlar Yüklenemedi
          </h2>
          <p className={`text-red-500 dark:text-red-400 mb-6`}>{dataError}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/exams" 
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Sınavlar
            </Link>
            <button
              onClick={() => window.location.reload()}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 border ${
                isDarkMode 
                  ? 'border-slate-600 hover:bg-slate-700 text-gray-300' 
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              Yeniden Dene
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className={`w-8 h-8 border-2 border-transparent rounded-full ${
                isDarkMode 
                  ? 'border-t-blue-400 border-r-purple-400' 
                  : 'border-t-blue-500 border-r-purple-500'
              }`}
            />
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Sonuçlar yükleniyor...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className={`min-h-screen flex justify-center items-center transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center p-8 rounded-2xl shadow-2xl backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-slate-800/90 border-slate-700/50' 
              : 'bg-white/90 border-gray-200/50'
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-xl text-red-500 dark:text-red-400 mb-4">Sınav sonuçları bulunamadı.</p>
          <Link href="/exams" 
            className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sınavlara Dön
          </Link>
        </motion.div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (score >= 40) return isDarkMode ? 'text-yellow-400' : 'text-yellow-500';
    return isDarkMode ? 'text-red-400' : 'text-red-500';
  };

  const getProgressBarBgColor = (score: number) => {
    if (score >= 70) return isDarkMode ? 'bg-green-500' : 'bg-green-600';
    if (score >= 40) return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500';
        return isDarkMode ? 'bg-red-500' : 'bg-red-600';
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl ${
          isDarkMode ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl ${
          isDarkMode ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
      </div>
      
      <div className="relative z-10 p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto"
        >
          {/* Enhanced Header with Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link 
                href="/exams" 
                className={`inline-flex items-center px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 group relative overflow-hidden ${
                  isDarkMode 
                    ? 'bg-slate-800/70 hover:bg-slate-700/70 text-gray-300 border border-slate-700/50' 
                    : 'bg-white/70 hover:bg-gray-50/70 text-gray-700 border border-gray-200/50'
                } backdrop-blur-xl shadow-xl hover:shadow-2xl`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  isDarkMode 
                    ? 'from-blue-600/20 to-purple-600/20' 
                    : 'from-blue-500/10 to-purple-500/10'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <ArrowLeft className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1 relative z-10" />
                <span className="relative z-10">Sınavlara Dön</span>
              </Link>
              
              {/* Performance Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`px-4 py-2 rounded-xl backdrop-blur-xl border ${
                  calculatedOverallScore >= 80 
                    ? (isDarkMode ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-green-100/80 border-green-300/50 text-green-700')
                    : calculatedOverallScore >= 60 
                    ? (isDarkMode ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 'bg-yellow-100/80 border-yellow-300/50 text-yellow-700')
                    : (isDarkMode ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-100/80 border-red-300/50 text-red-700')
                }`}
              >
                <div className="flex items-center gap-2">
                  {calculatedOverallScore >= 80 ? <Star className="w-4 h-4" /> : 
                   calculatedOverallScore >= 60 ? <Target className="w-4 h-4" /> : 
                   <AlertCircle className="w-4 h-4" />}
                  <span className="font-semibold text-sm">
                    {calculatedOverallScore >= 80 ? 'Mükemmel' : 
                     calculatedOverallScore >= 60 ? 'İyi' : 'Geliştirilmeli'}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Main Content Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-500 backdrop-blur-xl border ${
              isDarkMode 
                ? 'bg-slate-800/40 border-slate-700/50' 
                : 'bg-white/60 border-gray-200/50'
            } relative overflow-hidden`}
          >
            {/* Decorative Elements */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl ${
              isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
            }`}></div>
            <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 blur-2xl ${
              isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
            }`}></div>

            {/* Enhanced Title Section */}
            <motion.header 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12 text-center relative z-10"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, duration: 0.8, type: "spring", stiffness: 150 }}
                className="flex items-center justify-center mb-6"
              >
                <div className={`p-4 rounded-full shadow-2xl ${
                  calculatedOverallScore >= 80 
                    ? (isDarkMode ? 'bg-gradient-to-br from-green-500 to-emerald-400' : 'bg-gradient-to-br from-green-500 to-emerald-400')
                    : calculatedOverallScore >= 60 
                    ? (isDarkMode ? 'bg-gradient-to-br from-yellow-500 to-amber-400' : 'bg-gradient-to-br from-yellow-500 to-amber-400')
                    : (isDarkMode ? 'bg-gradient-to-br from-red-500 to-pink-400' : 'bg-gradient-to-br from-red-500 to-pink-400')
                } animate-pulse`}>
                  <Trophy className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r ${
                  isDarkMode 
                    ? 'from-blue-400 via-purple-400 to-pink-400' 
                    : 'from-blue-600 via-purple-600 to-pink-600'
                } bg-clip-text text-transparent drop-shadow-lg`}
              >
                {quizResult.quizTitle}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto leading-relaxed`}
              >
                🎯 Sınav performansınızın detaylı analizi ve gelişim önerileri
              </motion.p>
            </motion.header>

            {/* Enhanced Overall Performance Section */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={`mb-12 p-8 rounded-2xl shadow-2xl transition-all duration-500 backdrop-blur-xl border relative overflow-hidden ${
                isDarkMode 
                  ? 'bg-slate-700/60 border-slate-600/50' 
                  : 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-blue-200/50'
              }`}
            >
              {/* Section Decorations */}
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 blur-xl ${
                isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
              }`}></div>
              
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className={`text-3xl font-bold mb-8 flex items-center ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}
              >
                <div className={`p-2 rounded-xl mr-4 ${
                  isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <BarChart3 className="h-8 w-8" />
                </div>
                Genel Başarı Analizi
              </motion.h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Score Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.8, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`lg:col-span-1 p-8 rounded-2xl shadow-xl transition-all duration-500 backdrop-blur-xl border text-center relative overflow-hidden group ${
                    isDarkMode 
                      ? 'bg-slate-800/60 border-slate-700/50' 
                      : 'bg-white/80 border-gray-200/50'
                  }`}
                >
                  {/* Card Glow Effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    calculatedOverallScore >= 70 
                      ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10' 
                      : calculatedOverallScore >= 40 
                      ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10'
                      : 'bg-gradient-to-br from-red-500/10 to-pink-500/10'
                  } rounded-2xl`}></div>
                  
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.6, type: "spring", stiffness: 150 }}
                    className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl relative z-10 ${
                      calculatedOverallScore >= 70 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-400' 
                        : calculatedOverallScore >= 40 
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-400'
                        : 'bg-gradient-to-br from-red-500 to-pink-400'
                    }`}
                  >
                    <Target className="w-12 h-12 text-white drop-shadow-lg" />
                  </motion.div>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    className={`text-6xl font-black mb-3 relative z-10 ${getScoreColor(calculatedOverallScore)} drop-shadow-lg`}
                  >
                    {calculatedOverallScore.toFixed(1)}%
                  </motion.p>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                    className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} relative z-10`}
                  >
                    Genel Başarı Oranı
                  </motion.p>
                  
                  {/* Performance Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    className={`mt-4 px-4 py-2 rounded-xl text-sm font-medium relative z-10 ${
                      calculatedOverallScore >= 80 
                        ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                        : calculatedOverallScore >= 60 
                        ? (isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700')
                        : (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                    }`}
                  >
                    {calculatedOverallScore >= 80 ? '🎉 Harika bir performans!' : 
                     calculatedOverallScore >= 60 ? '👍 İyi bir sonuç!' : 
                     '💪 Daha fazla çalışma gerekli!'}
                  </motion.div>
                </motion.div>

                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Correct Answers Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className={`p-6 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-xl border text-center group ${
                      isDarkMode 
                        ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60' 
                        : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                    }`}>
                      <CheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <p className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {(quizResult.questions?.filter(q => q.isCorrect).length ?? 0)}
                      <span className={`text-2xl mx-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>/</span>
                      {(quizResult.questions?.length ?? 0)}
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Doğru Cevap Sayısı
                    </p>
                  </motion.div>

                  {/* Topics Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className={`p-6 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-xl border text-center group ${
                      isDarkMode 
                        ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60' 
                        : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                    }`}>
                      <BookOpen className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <p className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {calculatedSubTopicStats.length}
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Değerlendirilen Konu
                    </p>
                  </motion.div>

                  {/* Performance Trend Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className={`p-6 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-xl border text-center group ${
                      isDarkMode 
                        ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60' 
                        : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <TrendingUp className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <p className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {calculatedSubTopicStats.filter(stat => stat.score >= 70).length}
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Başarılı Konu Sayısı
                    </p>
                  </motion.div>

                  {/* Study Recommendation Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className={`p-6 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-xl border text-center group ${
                      isDarkMode 
                        ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60' 
                        : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                    }`}>
                      <Brain className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <p className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                      {calculatedSubTopicStats.filter(stat => stat.score < 50).length}
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Geliştirilmesi Gereken
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          </motion.div>

        {/* Enhanced Topic Performance Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className={`mb-12 p-8 rounded-2xl shadow-2xl transition-all duration-500 backdrop-blur-xl border relative overflow-hidden ${
            isDarkMode 
              ? 'bg-slate-700/60 border-slate-600/50' 
              : 'bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border-indigo-200/50'
          }`}
        >
          {/* Section Decorations */}
          <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 blur-2xl ${
            isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
          }`}></div>
          
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className={`text-3xl font-bold mb-8 flex items-center ${
              isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
            }`}
          >
            <div className={`p-2 rounded-xl mr-4 ${
              isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'
            }`}>
              <ListChecks className="h-8 w-8" />
            </div>
            Konu Bazlı Performans Analizi
          </motion.h2>
          
          {(calculatedSubTopicStats.length > 0) ? (
            <div className="space-y-6">
              {calculatedSubTopicStats.map((stat: {subTopic: string; score: number; totalQuestions: number; correctQuestions: number}, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`p-6 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-xl border group relative overflow-hidden ${
                    isDarkMode 
                      ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60' 
                      : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
                  }`}
                >
                  {/* Performance indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl transition-all duration-500 ${
                    stat.score >= 80 ? 'bg-gradient-to-b from-green-500 to-emerald-400' :
                    stat.score >= 60 ? 'bg-gradient-to-b from-yellow-500 to-amber-400' :
                    stat.score >= 40 ? 'bg-gradient-to-b from-orange-500 to-red-400' :
                    'bg-gradient-to-b from-red-500 to-pink-400'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 group-hover:scale-110 ${
                        stat.score >= 70 
                          ? (isDarkMode ? 'bg-green-500/20' : 'bg-green-100')
                          : stat.score >= 40 
                          ? (isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100')
                          : (isDarkMode ? 'bg-red-500/20' : 'bg-red-100')
                      }`}>
                        {stat.score >= 70 ? 
                          <CircleCheck className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} /> :
                          stat.score >= 40 ?
                          <Clock className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} /> :
                          <AlertCircle className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                        }
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {stat.subTopic}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stat.correctQuestions} / {stat.totalQuestions} doğru cevap
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-3xl font-black ${getScoreColor(stat.score)}`}>
                        {stat.score.toFixed(1)}%
                      </span>
                      <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                        stat.score >= 80 ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700') :
                        stat.score >= 60 ? (isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700') :
                        (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                      }`}>
                        {stat.score >= 80 ? 'Mükemmel' : stat.score >= 60 ? 'İyi' : 'Geliştirilmeli'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Progress Bar */}
                  <div className="relative">
                    <div className={`w-full rounded-full h-3 transition-all duration-300 ${
                      isDarkMode ? 'bg-slate-600/50' : 'bg-gray-200/70'
                    } overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.score}%` }}
                        transition={{ delay: 1.4 + index * 0.1, duration: 1, ease: "easeOut" }}
                        className={`h-3 rounded-full transition-all duration-500 relative overflow-hidden ${getProgressBarBgColor(stat.score)}`}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
                      </motion.div>
                    </div>
                    
                    {/* Progress percentage indicator */}
                    <div className={`absolute top-0 transition-all duration-1000 ease-out h-3 flex items-center`}
                         style={{ left: `${Math.min(stat.score, 95)}%` }}>
                      <div className={`w-2 h-2 rounded-full shadow-lg ${getProgressBarBgColor(stat.score)} -mt-0.5`}></div>
                    </div>
                  </div>
                  
                  {/* Performance insights */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                    className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      {stat.score >= 80 ? (
                        <>
                          <Zap className="w-3 h-3 mr-1 text-green-500" />
                          Bu konuda çok başarılısınız! Bilginizi pekiştirin.
                        </>
                      ) : stat.score >= 60 ? (
                        <>
                          <Target className="w-3 h-3 mr-1 text-yellow-500" />
                          İyi seviyedesiniz. Biraz daha çalışarak mükemmelleştirebilirsiniz.
                        </>
                      ) : (
                        <>
                          <Brain className="w-3 h-3 mr-1 text-red-500" />
                          Bu konuya daha fazla zaman ayırmanız önerilir.
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className={`text-center py-12 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg italic">
                Alt konu istatistiği bulunmamaktadır.
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Enhanced Question Details Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className={`p-8 rounded-2xl shadow-2xl transition-all duration-500 backdrop-blur-xl border relative overflow-hidden ${
            isDarkMode 
              ? 'bg-slate-700/60 border-slate-600/50' 
              : 'bg-gradient-to-br from-teal-50/80 to-cyan-50/80 border-teal-200/50'
          }`}
        >
          {/* Section Decorations */}
          <div className={`absolute top-0 left-0 w-24 h-24 rounded-full opacity-10 blur-xl ${
            isDarkMode ? 'bg-teal-400' : 'bg-teal-500'
          }`}></div>
          
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className={`text-3xl font-bold mb-8 flex items-center ${
              isDarkMode ? 'text-teal-300' : 'text-teal-700'
            }`}
          >
            <div className={`p-2 rounded-xl mr-4 ${
              isDarkMode ? 'bg-teal-500/20' : 'bg-teal-100'
            }`}>
              <HelpCircle className="h-8 w-8" />
            </div>
            Soru Bazlı Detaylı Analiz
          </motion.h2>
          
          <div className="space-y-8">
            {quizResult.questions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 border-l-4 backdrop-blur-xl border relative overflow-hidden group ${
                  isDarkMode 
                    ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60' 
                    : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
                } ${q.isCorrect 
                  ? (isDarkMode ? 'border-l-green-500' : 'border-l-green-600') 
                  : (isDarkMode ? 'border-l-red-500' : 'border-l-red-600')}`}
              >
                {/* Question Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 text-white font-bold text-lg shadow-lg ${
                      q.isCorrect 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-400' 
                        : 'bg-gradient-to-br from-red-500 to-pink-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {q.questionText}
                      </h3>
                      {q.subTopic && (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          isDarkMode 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          📚 {q.subTopic}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6 + index * 0.1, duration: 0.4, type: "spring", stiffness: 150 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      q.isCorrect 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-400' 
                        : 'bg-gradient-to-br from-red-500 to-pink-400'
                    }`}
                  >
                    {q.isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <XCircle className="h-6 w-6 text-white" />
                    )}
                  </motion.div>
                </div>

                {/* User Answer Display */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8 + index * 0.1, duration: 0.5 }}
                  className={`mb-6 p-4 rounded-xl border-l-4 ${
                    q.isCorrect 
                      ? (isDarkMode ? 'bg-green-500/10 border-l-green-400 border border-green-500/20' : 'bg-green-50 border-l-green-500 border border-green-200')
                      : (isDarkMode ? 'bg-red-500/10 border-l-red-400 border border-red-500/20' : 'bg-red-50 border-l-red-500 border border-red-200')
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      q.isCorrect 
                        ? (isDarkMode ? 'bg-green-400' : 'bg-green-500')
                        : (isDarkMode ? 'bg-red-400' : 'bg-red-500')
                    }`}>
                      {q.isCorrect ? '✓' : '✗'}
                    </div>
                    <span className={`font-semibold ${
                      q.isCorrect 
                        ? (isDarkMode ? 'text-green-300' : 'text-green-700')
                        : (isDarkMode ? 'text-red-300' : 'text-red-700')
                    }`}>
                      Sizin Cevabınız:
                    </span>
                  </div>
                  <p className={`ml-9 font-medium ${
                    q.isCorrect 
                      ? (isDarkMode ? 'text-green-200' : 'text-green-800')
                      : (isDarkMode ? 'text-red-200' : 'text-red-800')
                  }`}>
                    {q.userAnswer ? String(q.userAnswer) : 
                    <span className="italic opacity-75">Cevap verilmedi</span>}
                  </p>
                </motion.div>

                {/* Options List */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 + index * 0.1, duration: 0.5 }}
                  className="space-y-3"
                >
                  <h4 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    📝 Seçenekler:
                  </h4>
                  <div className="grid gap-3">
                    {q.options.map((option, i) => {
                      const isUserAnswer = normalize(option) === normalize(q.userAnswer);
                      const isCorrectAnswer = normalize(option || '') === normalize(q.correctAnswer || '');
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2.2 + index * 0.1 + i * 0.05, duration: 0.4 }}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border-2 ${
                            isCorrectAnswer 
                              ? (isDarkMode ? 'bg-green-500/20 border-green-500/40 shadow-green-500/20 shadow-lg' : 'bg-green-100 border-green-300 shadow-green-200/50 shadow-lg')
                              : isUserAnswer && !isCorrectAnswer 
                              ? (isDarkMode ? 'bg-red-500/20 border-red-500/40 shadow-red-500/20 shadow-lg' : 'bg-red-100 border-red-300 shadow-red-200/50 shadow-lg')
                              : (isDarkMode ? 'bg-slate-700/50 border-slate-600/30' : 'bg-gray-50 border-gray-200')
                          }`}
                        >
                          {/* Option Indicator */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCorrectAnswer 
                              ? 'bg-green-500 text-white shadow-lg' 
                              : isUserAnswer && !isCorrectAnswer 
                              ? 'bg-red-500 text-white shadow-lg'
                              : (isDarkMode ? 'bg-slate-600 text-gray-300' : 'bg-gray-300 text-gray-600')
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          
                          {/* Option Text */}
                          <span className={`flex-1 font-medium ${
                            isCorrectAnswer 
                              ? (isDarkMode ? 'text-green-300 font-bold' : 'text-green-700 font-bold')
                              : isUserAnswer && !isCorrectAnswer 
                              ? (isDarkMode ? 'text-red-300 line-through' : 'text-red-600 line-through')
                              : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                          }`}>
                            {String(option || '')}
                          </span>
                          
                          {/* Status Badges */}
                          <div className="flex gap-2">
                            {isUserAnswer && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isCorrectAnswer 
                                  ? (isDarkMode ? 'bg-green-500/30 text-green-300' : 'bg-green-200 text-green-800')
                                  : (isDarkMode ? 'bg-yellow-500/30 text-yellow-300' : 'bg-yellow-200 text-yellow-800')
                              }`}>
                                👆 Seçiminiz
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isDarkMode ? 'bg-green-500/30 text-green-300' : 'bg-green-200 text-green-800'
                              }`}>
                                ✅ Doğru Cevap
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Additional Information */}
                {!q.isCorrect && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.4 + index * 0.1, duration: 0.5 }}
                    className={`mt-6 p-4 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-blue-500/10 border-blue-500/30' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                      }`}>
                        💡
                      </div>
                      <span className={`font-semibold ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        Doğru Cevap:
                      </span>
                    </div>
                    <p className={`ml-9 font-medium ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-800'
                    }`}>
                      {String(q.correctAnswer || '')}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mt-12"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/exams"
              className={`inline-flex items-center px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
              } group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Home className="w-6 h-6 mr-3 relative z-10" />
              <span className="relative z-10">Sınavlara Dön</span>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={() => window.print()}
              className={`inline-flex items-center px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl border-2 ${
                isDarkMode 
                  ? 'border-slate-600 hover:bg-slate-700/70 text-gray-300 hover:text-white' 
                  : 'border-gray-300 hover:bg-gray-50/70 text-gray-700 hover:text-gray-900'
              } group relative overflow-hidden backdrop-blur-xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FileText className="w-6 h-6 mr-3 relative z-10" />
              <span className="relative z-10">Sonuçları Yazdır</span>
            </button>
          </motion.div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
