"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BarChart3, CheckCircle, XCircle, ListChecks, HelpCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider'; // Tema sağlayıcısını import et

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
  const params = useParams();
  const { theme, setTheme, isDarkMode } = useTheme(); // Temayı al
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
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
      setQuizResult(backendResult as QuizResult);
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
      <div className={`flex flex-col justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <p className={`text-xl text-red-500 dark:text-red-400 px-4 text-center`}>{dataError}</p>
        {/* İsteğe bağlı: Geri dön veya sınav listesine git butonu eklenebilir */}
        {/* Örnek: <Link href="/exams"><a className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Sınav Listesine Dön</a></Link> */}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sonuçlar yükleniyor...</p>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <p className="text-xl text-red-500 dark:text-red-400">Sınav sonuçları bulunamadı.</p>
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
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-gray-200' : 'bg-gradient-to-br from-slate-50 to-sky-100 text-gray-800'}`}>
      <div className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl rounded-xl p-6 sm:p-8 transition-colors duration-300`}>
        <header className="mb-10 relative">
          <div className="text-center">
            <h1 className={`text-4xl font-extrabold mb-2 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>{quizResult.quizTitle}</h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sınav performansınızın detaylı analizi.</p>
          </div>
          <button 
            onClick={toggleTheme}
            className={`absolute top-0 right-0 p-2 rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' : 'bg-sky-100 hover:bg-sky-200 text-sky-600'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        {/* 1. Sınavın Genel Sonuçları */}
        <section className={`mb-10 p-6 rounded-xl shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-sky-50'}`}>
          <h2 className={`text-2xl font-semibold mb-5 flex items-center ${isDarkMode ? 'text-sky-300' : 'text-sky-700'}`}>
            <BarChart3 className="mr-3 h-7 w-7" /> Genel Başarı
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
            <div className={`p-5 rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-5xl font-bold ${getScoreColor(Number(quizResult.overallScore) || 0)}`}>{Number(quizResult.overallScore).toFixed(1)}%</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Genel Puan</p>
            </div>
            <div className={`p-5 rounded-lg shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-5xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {(quizResult.questions?.filter(q => q.isCorrect).length ?? 0)} <span className="text-3xl">/</span> {(quizResult.questions?.length ?? 0)}
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Doğru / Toplam Soru</p>
            </div>
          </div>
        </section>

        {/* 2. Alt Konular Bazında İstatistikler */}
        <section className={`mb-10 p-6 rounded-xl shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-indigo-50'}`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
            <ListChecks className="mr-2 h-5 w-5" /> Alt Konu Başarıları
          </h2>
          {(quizResult.subTopicStats?.length ?? 0) > 0 ? (
            <ul className="space-y-2">
              {quizResult.subTopicStats.map((stat, index) => (
                <li key={index} className={`p-2.5 rounded-md shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{stat.subTopic}</h3>
                    <span className={`text-base font-bold ${getScoreColor(stat.score)}`}>
                      {stat.score.toFixed(1)}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 mb-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressBarBgColor(stat.score)}`}
                      style={{ width: `${stat.score}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    {stat.correctQuestions} / {stat.totalQuestions} doğru
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-300'} italic`}>Alt konu istatistiği bulunmamaktadır.</p>
          )}
        </section>

        {/* 3. Her Soru Sonucu */}
        <section className={`p-6 rounded-xl shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-teal-50'}`}>
          <h2 className={`text-2xl font-semibold mb-6 flex items-center ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
            <HelpCircle className="mr-3 h-7 w-7" /> Soru Detayları
          </h2>
          <ul className="space-y-6">
            {quizResult.questions.map((q, index) => (
              <li key={q.id} 
                  className={`p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-l-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${q.isCorrect ? (isDarkMode ? 'border-green-500' : 'border-green-600') : (isDarkMode ? 'border-red-500' : 'border-red-600')}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Soru {index + 1}: {q.questionText}</h3>
                  {q.isCorrect ? (
                    <CheckCircle className={`h-8 w-8 flex-shrink-0 ml-4 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                  ) : (
                    <XCircle className={`h-8 w-8 flex-shrink-0 ml-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                  )}
                </div>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Alt Konu: {q.subTopic}</p>
                <div className="space-y-2 text-sm">
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Seçenekler:</p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    {q.options.map((option, i) => {
                      const optionText = typeof option === 'object' && option !== null && 'text' in option ? option.text : option;
                      const correctAnswerText = typeof q.correctAnswer === 'object' && q.correctAnswer !== null && 'text' in q.correctAnswer ? q.correctAnswer.text : q.correctAnswer;
                      const userAnswerText = typeof q.userAnswer === 'object' && q.userAnswer !== null && 'text' in q.userAnswer ? q.userAnswer.text : q.userAnswer;
                      return (
                        <li key={i} className={`
                          ${optionText === correctAnswerText ? (isDarkMode ? 'text-green-400 font-bold' : 'text-green-600 font-bold') : ''}
                          ${optionText === userAnswerText && optionText !== correctAnswerText ? (isDarkMode ? 'text-red-400 line-through' : 'text-red-500 line-through') : ''}
                          ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                        `}>
                          {optionText}
                          {optionText === correctAnswerText && <span className="ml-2 text-xs">(Doğru Cevap)</span>}
                          {optionText === userAnswerText && optionText !== correctAnswerText && <span className="ml-2 text-xs">(Sizin Cevabınız)</span>}
                          {optionText === userAnswerText && optionText === correctAnswerText && <span className="ml-2 text-xs">(Sizin Cevabınız - Doğru)</span>}
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

        <footer className="mt-12 pt-8 border-t text-center ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}">
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Sınavınızı tamamladığınız için teşekkür ederiz.
          </p>
          {/* <Link href="/exams" className={`${isDarkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-700'} underline mt-2 inline-block`}>Diğer Sınavlara Göz At</Link> */}
        </footer>
      </div>
    </div>
  );
}
