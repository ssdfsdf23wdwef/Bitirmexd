"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiBarChart2, FiPieChart } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import LearningStatusBadge from "@/components/ui/LearningStatusBadge";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import PageTransition from "@/components/transitions/PageTransition";
import { useTheme } from "@/context/ThemeProvider";
import type { LearningTarget, LearningTargetStatus } from "@/types/learningTarget.type";
import quizService from "@/services/quiz.service";
import type { Quiz } from "@/types/quiz.type";
import courseService from "@/services/course.service";
import learningTargetService from "@/services/learningTarget.service";

interface Course {
  id: string;
  name: string;
  title?: string;
}

// Chart.js bileşenlerini kaydet
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

export default function LearningGoalsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { isDarkMode } = useTheme();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningTargets, setLearningTargets] = useState<LearningTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PRD'ye uygun İngilizce durum isimleri
  const statusLabels: Record<string, string> = {
    mastered: "Başarılı",
    medium: "Orta",
    failed: "Başarısız",
    pending: "Beklemede",
  };

  // Kurs değiştiğinde yeni kurs ID'si ile yönlendir
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourseId = e.target.value;
    router.push(`/learning-goals/dashboard?courseId=${newCourseId}`);
  };

  useEffect(() => {
    setLoading(true);

    // Tüm kursları yükle
    courseService
      .getCourses()
      .then((coursesData: Course[]) => {
        setCourses(coursesData);

        // Aktif kurs veya ilk kurs
        const activeCourse = courseId
          ? coursesData.find((c: Course) => c.id === courseId)
          : coursesData[0];

        if (activeCourse) {
          setSelectedCourse(activeCourse);

          // Seçili kursa ait öğrenme hedeflerini yükle
          return learningTargetService.getLearningTargetsByCourse(activeCourse.id);
        } else {
          throw new Error("Kurs bulunamadı");
        }
      })
      .then((targets: LearningTarget[]) => {
        setLearningTargets(targets);
      })
      .catch((err: unknown) => {
        console.error("Veri yüklenirken hata:", err);
        setError("Öğrenme hedefleri yüklenirken bir sorun oluştu.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  // Durum dağılımı (İngilizce anahtarlar)
  const initialStatusDistribution: Record<LearningTargetStatus, number> = {
    mastered: 0,
    medium: 0,
    failed: 0,
    pending: 0,
  };
  const statusDistribution = learningTargets.reduce(
    (acc, target) => {
      acc[target.status as LearningTargetStatus] =
        (acc[target.status as LearningTargetStatus] || 0) + 1;
      return acc;
    },
    { ...initialStatusDistribution },
  );

  // Tema uyumlu renkler
  const chartColors = {
    mastered: isDarkMode ? "rgba(34,197,94,0.8)" : "rgba(34,197,94,0.7)",
    medium: isDarkMode ? "rgba(234,179,8,0.8)" : "rgba(234,179,8,0.7)",
    failed: isDarkMode ? "rgba(239,68,68,0.8)" : "rgba(239,68,68,0.7)",
    pending: isDarkMode ? "rgba(148,163,184,0.8)" : "rgba(148,163,184,0.7)",
  };

  // Pasta grafik verileri (PRD'ye uygun)
  const pieChartData = {
    labels: Object.values(statusLabels),
    datasets: [
      {
        data: [
          statusDistribution.mastered || 0,
          statusDistribution.medium || 0,
          statusDistribution.failed || 0,
          statusDistribution.pending || 0,
        ],
        backgroundColor: [
          chartColors.mastered,
          chartColors.medium,
          chartColors.failed,
          chartColors.pending,
        ],
        borderColor: [
          chartColors.mastered,
          chartColors.medium,
          chartColors.failed,
          chartColors.pending,
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart verisini mock servis ile dinamik getir (örnek)
  interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }

  interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
  }

  const [barChartData, setBarChartData] = useState<ChartData | null>(null);
  useEffect(() => {
    getQuizScores(selectedCourse?.id).then(
      (scores: { date: string; score: number }[]) => {
        setBarChartData({
          labels: scores.map((s: { date: string }) => s.date),
          datasets: [
            {
              label: "Ortalama Sınav Skoru",
              data: scores.map((s: { score: number }) => s.score),
              backgroundColor: isDarkMode
                ? "rgba(99,102,241,0.8)"
                : "rgba(99,102,241,0.7)",
              borderColor: isDarkMode ? "rgba(99,102,241,1)" : "rgba(99,102,241,1)",
              borderWidth: 1,
            },
          ],
        });
      },
    );
  }, [selectedCourse, isDarkMode]);

  // Yükleme ve hata durumları
  if (loading) {
    return (
      <>
        <PageTransition>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="mb-4">
                <span className={`inline-block w-6 h-6 border-2 rounded-full animate-spin ${
                  isDarkMode 
                    ? 'border-t-blue-400 border-r-blue-400 border-b-transparent border-l-transparent' 
                    : 'border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent'
                }`}></span>
              </div>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Öğrenme hedefleri yükleniyor...</p>
            </div>
          </div>
        </PageTransition>
      </>
    );
  }

  if (error || !selectedCourse) {
    return (
      <>
        <div className={`border rounded-lg p-4 ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-700 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p>{error || "Kurs bulunamadı"}</p>
        </div>
      </>
    );
  }

  return (
    <MainLayout>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Öğrenme Takip Paneli
            </h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Hedeflerinizi ve ilerlemenizi görüntüleyin.
            </p>
          </div>

          {/* Kurs Seçimi */}
          <div className="mb-8">
            <label
              htmlFor="course-select"
              className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              Ders Seçin
            </label>
            <select
              id="course-select"
              value={selectedCourse.id}
              onChange={handleCourseChange}
              className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 p-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
              }`}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          className={`rounded-lg shadow-md p-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          aria-label="Öğrenme hedeflerinin durum dağılımı grafiği"
          role="region"
        >
          <h2 className={`text-lg font-medium mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <FiPieChart className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-indigo-600'}`} aria-hidden="true" />
            Hedef Durumu Dağılımı
          </h2>
          <div className="h-64" aria-label="Hedef durumlarının pasta grafiği">
            <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </motion.div>

        <motion.div
          className={`rounded-lg shadow-md p-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          aria-label="Zaman içindeki sınav skorları grafiği"
          role="region"
        >
          <h2 className={`text-lg font-medium mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <FiBarChart2 className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-indigo-600'}`} aria-hidden="true" />
            Zaman İçindeki İlerleme
          </h2>
          <div className="h-64" aria-label="Sınav skorlarının çubuk grafiği">
            {barChartData && (
              <Bar
                data={barChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Hedef Listesi */}
      <motion.div
        className={`rounded-lg shadow-md p-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white"}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        aria-label="Öğrenme hedefleri tablosu"
        role="region"
      >
        <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Öğrenme Hedefleri</h2>

        {learningTargets.length === 0 ? (
          <div className="text-center py-6">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Bu ders için henüz hedef bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}
              aria-label="Öğrenme hedefleri tablosu"
            >
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    Alt Konu
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    Durum
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    Son Başarı %
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    İlk Karşılaşma
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {learningTargets.map((target) => (
                  <tr key={target.id} className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {target.subTopicName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LearningStatusBadge status={target.status as LearningTargetStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {target.lastAttemptScorePercent !== null &&
                        target.lastAttemptScorePercent !== undefined
                          ? `${target.lastAttemptScorePercent}%`
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {target.firstEncountered
                          ? new Date(
                              target.firstEncountered,
                            ).toLocaleDateString("tr-TR")
                          : "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}

async function getQuizScores(
  courseId: string | undefined,
): Promise<{ date: string; score: number }[]> {
  if (!courseId) return [];
  try {
    const quizzes = (await quizService.getQuizzes(courseId)) as Quiz[];
    return quizzes.map((quiz) => ({
      date: quiz.timestamp ? new Date(quiz.timestamp).toLocaleDateString() : "",
      score: quiz.score || 0,
    }));
  } catch {
    return [];
  }
}
