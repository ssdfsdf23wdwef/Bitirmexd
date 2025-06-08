"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BarChart3, CheckCircle, XCircle, Percent, ListChecks, HelpCircle } from 'lucide-react';

// Projenizdeki Question ve Quiz tiplerine benzer basit tipler
interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string; // veya number (indeks) olabilir, mock data için string tutalım
  subTopic: string;
  userAnswer?: string; // Kullanıcının cevabı
  isCorrect?: boolean; // Kullanıcının cevabı doğru mu?
}

interface QuizResult {
  quizTitle: string;
  questions: Question[];
  overallScore: number; // Yüzde olarak
  subTopicStats: Array<{ subTopic: string; score: number; totalQuestions: number; correctQuestions: number }>;
}

// Mock Sınav Verileri ve Kullanıcı Cevapları
const MOCK_QUIZ_ID = "mock-sinav-123";

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    questionText: "React'te state yönetimi için kullanılan popüler kütüphane hangisidir?",
    options: ["Vuex", "Redux", "NgRx", "MobX"],
    correctAnswer: "Redux",
    subTopic: "React State Yönetimi",
  },
  {
    id: "q2",
    questionText: "Bir JavaScript fonksiyonunun 'this' değerini sabitlemek için hangi yöntem kullanılır?",
    options: [".bind()", ".apply()", ".call()", "Hepsi"],
    correctAnswer: "Hepsi",
    subTopic: "JavaScript Temelleri",
  },
  {
    id: "q3",
    questionText: "CSS'te 'flexbox' ne için kullanılır?",
    options: [
      "Animasyonlar oluşturmak için",
      "Sayfa düzenlerini esnek bir şekilde oluşturmak için",
      "Veritabanı sorguları için",
      "API istekleri göndermek için",
    ],
    correctAnswer: "Sayfa düzenlerini esnek bir şekilde oluşturmak için",
    subTopic: "CSS Flexbox",
  },
  {
    id: "q4",
    questionText: "Next.js'te dinamik route'lar nasıl oluşturulur?",
    options: [
      "Klasör adını [parametre] şeklinde kullanarak",
      "next.config.js dosyasında tanımlayarak",
      "Sadece query parametreleri ile",
      "Route.dynamic() fonksiyonu ile",
    ],
    correctAnswer: "Klasör adını [parametre] şeklinde kullanarak",
    subTopic: "Next.js Yönlendirme",
  },
  {
    id: "q5",
    questionText: "TypeScript'te 'interface' ne işe yarar?",
    options: [
      "Bir sınıfın örneğini oluşturur",
      "Kod bloklarını tanımlar",
      "Bir nesnenin şeklini (yapısını) tanımlar",
      "Asenkron işlemleri yönetir",
    ],
    correctAnswer: "Bir nesnenin şeklini (yapısını) tanımlar",
    subTopic: "TypeScript Temelleri",
  },
  {
    id: "q6",
    questionText: "React'te bir bileşenin yeniden render edilmesini tetikleyen nedir?",
    options: [
      "Sadece props değiştiğinde",
      "Sadece state değiştiğinde",
      "Props veya state değiştiğinde",
      "Hiçbiri",
    ],
    correctAnswer: "Props veya state değiştiğinde",
    subTopic: "React State Yönetimi",
  },
];

// Mock Kullanıcı Cevapları (soru ID'sine göre)
const MOCK_USER_ANSWERS: Record<string, string> = {
  q1: "Redux", // Doğru
  q2: ".bind()", // Yanlış
  q3: "Sayfa düzenlerini esnek bir şekilde oluşturmak için", // Doğru
  q4: "next.config.js dosyasında tanımlayarak", // Yanlış
  q5: "Bir nesnenin şeklini (yapısını) tanımlar", // Doğru
  q6: "Props veya state değiştiğinde", // Doğru
};

const calculateResults = (questions: Question[], userAnswers: Record<string, string>): QuizResult => {
  let correctCount = 0;
  const processedQuestions: Question[] = questions.map(q => {
    const userAnswer = userAnswers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) {
      correctCount++;
    }
    return { ...q, userAnswer, isCorrect };
  });

  const overallScore = (correctCount / questions.length) * 100;

  const subTopicStatsMap: Map<string, { correct: number; total: number }> = new Map();
  processedQuestions.forEach(q => {
    const stat = subTopicStatsMap.get(q.subTopic) || { correct: 0, total: 0 };
    stat.total++;
    if (q.isCorrect) {
      stat.correct++;
    }
    subTopicStatsMap.set(q.subTopic, stat);
  });

  const subTopicStats = Array.from(subTopicStatsMap.entries()).map(([subTopic, data]) => ({
    subTopic,
    score: (data.correct / data.total) * 100,
    totalQuestions: data.total,
    correctQuestions: data.correct,
  }));

  return {
    quizTitle: "Örnek Sınav Sonuçları",
    questions: processedQuestions,
    overallScore,
    subTopicStats,
  };
};

export default function ExamResultsPage() {
  const params = useParams();
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  // const quizId = params.id as string; // Gerçek senaryoda bu ID kullanılacak

  useEffect(() => {
    // Simulating data fetching or processing
    // Gerçek senaryoda, quizId kullanılarak localStorage'dan veya API'den sınav sonuçları alınır.
    // Şimdilik mock verileri doğrudan işliyoruz.
    console.log("Sınav Sonuç Sayfası Yüklendi. Sınav ID (mock):", MOCK_QUIZ_ID);
    const results = calculateResults(MOCK_QUESTIONS, MOCK_USER_ANSWERS);
    setQuizResult(results);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Sonuçlar yükleniyor...</p>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500">Sınav sonuçları bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-800 dark:to-sky-900 p-4 sm:p-6 md:p-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-sky-600 dark:text-sky-400 mb-2">{quizResult.quizTitle}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Sınav performansınızın detaylı analizi.</p>
        </header>

        {/* 1. Sınavın Genel Sonuçları */}
        <section className="mb-10 p-6 bg-sky-50 dark:bg-sky-900/50 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-sky-700 dark:text-sky-300 mb-4 flex items-center">
            <BarChart3 className="mr-3 h-7 w-7" /> Genel Başarı
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <p className="text-4xl font-bold text-green-500 dark:text-green-400">{quizResult.overallScore.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Genel Puan</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <p className="text-4xl font-bold text-blue-500 dark:text-blue-400">
                {quizResult.questions.filter(q => q.isCorrect).length} / {quizResult.questions.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Doğru / Toplam Soru</p>
            </div>
          </div>
        </section>

        {/* 2. Alt Konular Bazında İstatistikler */}
        <section className="mb-10 p-6 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300 mb-6 flex items-center">
            <ListChecks className="mr-3 h-7 w-7" /> Alt Konu Başarıları
          </h2>
          {quizResult.subTopicStats.length > 0 ? (
            <ul className="space-y-4">
              {quizResult.subTopicStats.map((stat, index) => (
                <li key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{stat.subTopic}</h3>
                    <span className={`text-xl font-bold ${stat.score >= 70 ? 'text-green-500' : stat.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {stat.score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-1">
                    <div
                      className={`h-2.5 rounded-full ${stat.score >= 70 ? 'bg-green-500' : stat.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${stat.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {stat.correctQuestions} / {stat.totalQuestions} doğru
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 italic">Alt konu istatistiği bulunmamaktadır.</p>
          )}
        </section>

        {/* 3. Her Soru Sonucu */}
        <section className="p-6 bg-teal-50 dark:bg-teal-900/50 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-teal-700 dark:text-teal-300 mb-6 flex items-center">
            <HelpCircle className="mr-3 h-7 w-7" /> Soru Detayları
          </h2>
          <ul className="space-y-6">
            {quizResult.questions.map((q, index) => (
              <li key={q.id} className="p-5 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 ${q.isCorrect ? 'border-green-500' : 'border-red-500'}">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Soru {index + 1}: {q.questionText}
                  </h3>
                  {q.isCorrect ? (
                    <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0 ml-4" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500 flex-shrink-0 ml-4" />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Alt Konu: {q.subTopic}</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Seçenekler:</strong></p>
                  <ul className="list-disc list-inside pl-4">
                    {q.options.map((option, i) => (
                      <li key={i} className={`${option === q.correctAnswer ? 'text-green-600 dark:text-green-400 font-semibold' : ''} ${option === q.userAnswer && option !== q.correctAnswer ? 'text-red-600 dark:text-red-400 line-through' : ''}`}>
                        {option}
                        {option === q.correctAnswer && <span className="ml-2 text-xs">(Doğru Cevap)</span>}
                        {option === q.userAnswer && option !== q.correctAnswer && <span className="ml-2 text-xs">(Sizin Cevabınız)</span>}
                        {option === q.userAnswer && option === q.correctAnswer && <span className="ml-2 text-xs">(Sizin Cevabınız - Doğru)</span>}
                      </li>
                    ))}
                  </ul>
                  {!q.isCorrect && (
                     <p className="mt-2"><strong>Doğru Cevap:</strong> <span className="text-green-600 dark:text-green-400 font-semibold">{q.correctAnswer}</span></p>
                  )}
                  {q.userAnswer && (
                    <p className="mt-1">
                      <strong>Sizin Cevabınız:</strong> 
                      <span className={q.isCorrect ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                        {' '}{q.userAnswer}
                      </span>
                    </p>
                  )}
                  {!q.userAnswer && (
                     <p className="mt-1 text-yellow-600 dark:text-yellow-400">Bu soru cevaplanmamış.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sınavınızı tamamladığınız için teşekkür ederiz.
          </p>
          {/* İsteğe bağlı olarak ana sayfaya veya sınav listesine dönüş linki eklenebilir */}
          {/* <Link href="/exams" className="text-sky-600 hover:underline">Diğer Sınavlara Göz At</Link> */}
        </footer>
      </div>
    </div>
  );
}
