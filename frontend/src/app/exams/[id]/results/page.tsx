"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart3, CheckCircle, XCircle, ListChecks, HelpCircle, ArrowLeft, Trophy, Target, TrendingUp, Home, FileText } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Projenizdeki Question ve Quiz tiplerine benzer basit tipler
interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subTopic: string;
  userAnswer?: string;
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
    <div className={`min-h-screen p-4 sm:p-6 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-200' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800'
    }`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header with Navigation */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link 
              href="/exams" 
              className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 group ${
                isDarkMode 
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 text-gray-300 border border-slate-700/50' 
                  : 'bg-white/80 hover:bg-gray-50/80 text-gray-700 border border-gray-200/50'
              } backdrop-blur-sm shadow-lg`}
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Sınavlara Dön
            </Link>
          </div>
        </div>

        {/* Main Content Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`shadow-2xl rounded-2xl p-6 sm:p-8 transition-all duration-300 backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-slate-800/90 border-slate-700/50' 
              : 'bg-white/90 border-gray-200/50'
          }`}
        >
          {/* Title Section */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              } shadow-lg`}>
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold mb-2 bg-gradient-to-r ${
              isDarkMode 
                ? 'from-blue-400 to-purple-400' 
                : 'from-blue-600 to-purple-600'
            } bg-clip-text text-transparent`}>
              {quizResult.quizTitle}
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Sınav performansınızın detaylı analizi
            </p>
          </motion.header>

          {/* Overall Performance Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`mb-8 p-6 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-sm border ${
              isDarkMode 
                ? 'bg-slate-700/80 border-slate-600/50' 
                : 'bg-blue-50/80 border-blue-200/50'
            }`}
          >
            <h2 className={`text-2xl font-semibold mb-6 flex items-center ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <BarChart3 className="mr-3 h-7 w-7" /> 
              Genel Başarı
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl shadow-md transition-all duration-300 backdrop-blur-sm border text-center ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700/50' 
                    : 'bg-white/80 border-gray-200/50'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  calculatedOverallScore >= 70 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : calculatedOverallScore >= 40 
                    ? 'bg-yellow-100 dark:bg-yellow-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  <Target className={`w-8 h-8 ${getScoreColor(calculatedOverallScore)}`} />
                </div>
                <p className={`text-4xl font-bold mb-2 ${getScoreColor(calculatedOverallScore)}`}>
                  {calculatedOverallScore.toFixed(1)}%
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Genel Başarı Oranı
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl shadow-md transition-all duration-300 backdrop-blur-sm border text-center ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700/50' 
                    : 'bg-white/80 border-gray-200/50'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'
                }`}>
                  <CheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <p className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {(quizResult.questions?.filter(q => q.isCorrect).length ?? 0)}
                  <span className="text-2xl text-gray-400 mx-1">/</span>
                  {(quizResult.questions?.length ?? 0)}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Doğru Cevap Sayısı
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl shadow-md transition-all duration-300 backdrop-blur-sm border text-center ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700/50' 
                    : 'bg-white/80 border-gray-200/50'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-900/20' : 'bg-purple-100'
                }`}>
                  <TrendingUp className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <p className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {calculatedSubTopicStats.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Değerlendirilen Konu
                </p>
              </motion.div>
            </div>
          </motion.section>

        {/* 2. Alt Konular Bazında İstatistikler */}
        <section className={`mb-10 p-6 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-slate-700/80 border-slate-600/50' 
            : 'bg-indigo-50/80 border-indigo-200/50'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
          }`}>
            <ListChecks className="mr-2 h-5 w-5" /> Alt Konu Başarıları
          </h2>
          {(calculatedSubTopicStats.length > 0) ? (
            <ul className="space-y-2">
              {calculatedSubTopicStats.map((stat: {subTopic: string; score: number; totalQuestions: number; correctQuestions: number}, index: number) => (
                <li key={index} className={`p-2.5 rounded-md shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm border ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700/50' 
                    : 'bg-white/80 border-gray-200/50'
                }`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                      {stat.subTopic}
                    </h3>
                    <span className={`text-base font-bold ${getScoreColor(stat.score)}`}>
                      {stat.score.toFixed(1)}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 mb-1 transition-all duration-300 ${
                    isDarkMode ? 'bg-slate-600' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressBarBgColor(stat.score)}`}
                      style={{ width: `${stat.score}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.correctQuestions} / {stat.totalQuestions} doğru
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
              Alt konu istatistiği bulunmamaktadır.
            </p>
          )}
        </section>

        {/* 3. Her Soru Sonucu */}
        <section className={`p-6 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-slate-700/80 border-slate-600/50' 
            : 'bg-teal-50/80 border-teal-200/50'
        }`}>
          <h2 className={`text-2xl font-semibold mb-6 flex items-center ${
            isDarkMode ? 'text-teal-300' : 'text-teal-700'
          }`}>
            <HelpCircle className="mr-3 h-7 w-7" /> Soru Detayları
          </h2>
          <ul className="space-y-6">
            {quizResult.questions.map((q, index) => (
              <li key={q.id} 
                  className={`p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-l-4 backdrop-blur-sm border ${
                    isDarkMode 
                      ? 'bg-slate-800/80 border-slate-700/50' 
                      : 'bg-white/80 border-gray-200/50'
                  } ${q.isCorrect 
                    ? (isDarkMode ? 'border-l-green-500' : 'border-l-green-600') 
                    : (isDarkMode ? 'border-l-red-500' : 'border-l-red-600')}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Soru {index + 1}: {q.questionText}
                  </h3>
                  {q.isCorrect ? (
                    <CheckCircle className={`h-8 w-8 flex-shrink-0 ml-4 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                  ) : (
                    <XCircle className={`h-8 w-8 flex-shrink-0 ml-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                  )}
                </div>
                {/* Kullanıcı cevabı gösterimi */}
                <div className={`mb-2 text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'} font-semibold`}>Senin cevabın: {q.userAnswer ? (typeof q.userAnswer === 'object' && 'text' in q.userAnswer ? q.userAnswer.text : q.userAnswer) : <span className="italic text-gray-400">Cevap verilmedi</span>}</div>
                <div className="space-y-2 text-sm">
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Seçenekler:</p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    {q.options.map((option, i) => {
                      const isUserAnswer = normalize(option) === normalize(q.userAnswer);
                      const isCorrectAnswer = normalize(option) === normalize(q.correctAnswer);
                      return (
                        <li
                          key={i}
                          className={`
                            flex items-center gap-2
                            ${isCorrectAnswer ? (isDarkMode ? 'text-green-400 font-bold' : 'text-green-600 font-bold') : ''}
                            ${isUserAnswer && !isCorrectAnswer ? (isDarkMode ? 'text-red-400 line-through' : 'text-red-500 line-through') : ''}
                            ${isUserAnswer ? 'bg-yellow-100 dark:bg-yellow-900 rounded px-2 py-1' : ''}
                            ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                          `}
                        >
                          {isUserAnswer && (
                            <span title="Sizin Cevabınız" className="inline-block">
                              <svg width="16" height="16" fill="orange" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>
                            </span>
                          )}
                          {typeof option === 'object' && option !== null && 'text' in option ? option.text : option}
                          {isCorrectAnswer && isUserAnswer && (
                            <span className="ml-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">Sizin Cevabınız - Doğru</span>
                          )}
                          {isCorrectAnswer && !isUserAnswer && (
                            <span className="ml-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">Doğru Cevap</span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="ml-2 text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">Sizin Cevabınız</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {!q.isCorrect && q.userAnswer && (
                  <p className="mt-3"><strong>Doğru Cevap:</strong> <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>
                    {typeof q.correctAnswer === 'object' && q.correctAnswer !== null && 'text' in q.correctAnswer ? q.correctAnswer.text : q.correctAnswer}
                  </span></p>
                )}
                {q.userAnswer && (
                  <p className="mt-2">
                    <strong>Sizin Cevabınız:</strong>
                    <span className={`${q.isCorrect ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-500')} font-semibold`}>
                      {' '}{typeof q.userAnswer === 'object' && q.userAnswer !== null && 'text' in q.userAnswer ? q.userAnswer.text : q.userAnswer}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

      
      </div>
    </div>
  );
}
