/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeProvider";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  Flag,
  CheckCircle,
  XCircle,
  Info,
  ChevronLeft,
  Award,
  ListChecks,
  BarChart3,
} from "lucide-react";
import {
  Quiz,
  Question,
  QuizType,
  QuizSubmissionPayload,
  DifficultyLevel,
} from "@/types/quiz.type";
import quizService from "@/services/quiz.service";
import { ErrorService } from "@/services/error.service";
import { Tooltip, Button } from "@nextui-org/react"; // Added Button
import learningTargetService from "@/services/learningTarget.service";
import { useQueryClient } from "@tanstack/react-query"; // Added useQueryClient
import { useLearningTargetsStore } from "@/store/useLearningTargetsStore";
// import { useQuizStore } from "@/store/useQuizStore"; // Removed: not needed since answers are in local state

// Sonuçları localStorage'a kaydetmek için fonksiyon
const storeQuizResultsInStorage = (quizId: string, resultsToStore: Quiz) => {
  if (typeof window !== "undefined") {
    // Quiz arayüzüne uymayan alanları çıkararak sadece Quiz tipinde olanları sakla
    const {
      userAnswers,
      correctCount,
      totalQuestions,
      score,
      elapsedTime,
      timestamp,
      analysisResult,
      ...quizDataToStore
    } = resultsToStore;
    localStorage.setItem(
      `quizResult_${quizId}`,
      JSON.stringify(quizDataToStore),
    );
    // Analiz sonuçlarını ayrı bir anahtarda sakla
    if (analysisResult) {
      localStorage.setItem(
        `quizAnalysis_${quizId}`,
        JSON.stringify({
          userAnswers,
          correctCount,
          totalQuestions,
          score,
          elapsedTime,
          timestamp,
          analysisResult,
        }),
      );
    }
  }
};

// Quiz nesnesini localStorage'a kaydetmek için fonksiyon
const storeQuizInStorage = (quizId: string, quizData: Quiz) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`quiz_${quizId}`, JSON.stringify(quizData));
      console.log(`[DEBUG] ✅ Sınav localStorage'a kaydedildi: ID=${quizId}`);
    } catch (error) {
      console.error(`[DEBUG] Sınav localStorage'a kaydedilemedi:`, error);
    }
  }
};

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  // Ensure examId is correctly extracted and is a string
  const examId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);
  const queryClient = useQueryClient(); // As per prompt: get answers from useQuizStore.
  // If 'answers' is not in your store, this will cause an error.
  // const { answers } = useQuizStore(); // Removed: answers are stored in local userAnswers state
  const {
    setTemporaryTargetsFromQuiz,
    updateTemporaryTargetScores,
    clearTemporaryTargets,
  } = useLearningTargetsStore();
  const [quiz, setQuiz] = useState<Quiz>();
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // This is for the existing handleSubmit
  const [isLoadingFinishExam, setIsLoadingFinishExam] = useState(false); // New state for handleFinishExam
  const [showResults, setShowResults] = useState(false);
  const { isDarkMode, theme } = useTheme();
  const [startTime, setStartTime] = useState<number>(Date.now()); // Add startTime state

  useEffect(() => {
    setStartTime(Date.now()); // Set startTime when component mounts or examId changes
  }, [examId]);

  const handleFinishExam = async () => {
    if (!examId) {
      console.error("Error finishing exam: examId is undefined.");
      ErrorService.showToast(
        "Sınav kimliği bulunamadı. Lütfen tekrar deneyin.",
        "error",
        "Sınav Hatası",
      );
      setIsLoadingFinishExam(false);
      return;
    }
    setIsLoadingFinishExam(true);
    try {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calculate elapsed time in seconds
      const submissionPayload: QuizSubmissionPayload = {
        quizId: examId,
        userAnswers: userAnswers, // Use local userAnswers state instead of answers from store
        elapsedTime: elapsedTime,
      };
      const result = await quizService.submitQuiz(submissionPayload); // Save result to localStorage for results page
      if (result && typeof window !== "undefined") {
        const examCompletionKey = `examCompletionData_${examId}`;

        // Transform data to the format expected by results page
        const transformedData = {
          quizData: result.quiz,
          userAnswersData: result.quiz?.userAnswers || {},
        };

        localStorage.setItem(
          examCompletionKey,
          JSON.stringify(transformedData),
        );
        console.log(
          `[DEBUG] ✅ Sınav sonuçları localStorage'a kaydedildi: ${examCompletionKey}`,
        );
        console.log(`[DEBUG] 📄 Kaydedilen veri:`, transformedData);
      }

      // Öğrenme hedeflerini temizle
      clearTemporaryTargets();
      await queryClient.invalidateQueries({ queryKey: ["learningTargets"] });
      router.push(`/exams/${examId}/results`);
    } catch (error) {
      console.error("Error finishing exam:", error);
      ErrorService.showToast(
        "Sınav bitirilirken bir hata oluştu.",
        "error",
        "Sınav Hatası",
      );
    } finally {
      setIsLoadingFinishExam(false);
    }
  };

  // Sınav verilerini yükle
  useEffect(() => {
    async function loadQuiz() {
      if (!params.id) return;

      try {
        setLoading(true);
        const quizId = Array.isArray(params.id) ? params.id[0] : params.id;
        console.log(`[DEBUG] 🔄 Sınav verileri yükleniyor: ID=${quizId}`);

        // Hata ile çakışma ihtimali olan ID kontrolü
        if (
          quizId.startsWith("error_fallback") ||
          quizId.startsWith("fallback") ||
          quizId.startsWith("parsed_fallback")
        ) {
          console.error(`[DEBUG] ❌ Geçersiz sınav ID formatı: ${quizId}`);
          ErrorService.showToast(
            "Geçersiz sınav formatı. Ana sayfaya yönlendiriliyorsunuz.",
            "error",
            "Sınav Hatası",
          );
          setTimeout(() => {
            router.push("/");
          }, 2000);
          return;
        }

        // Önce local storage'da sınavı ara (yeni değişiklikte sınavlar veritabanına kaydedilmeden önce local'de tutulabilir)
        let quizData = null;
        if (typeof window !== "undefined") {
          const localQuizData = localStorage.getItem(`quiz_${quizId}`);
          if (localQuizData) {
            try {
              quizData = JSON.parse(localQuizData);
              console.log(
                `[DEBUG] ✅ Sınav localStorage'dan yüklendi: ${quizId}`,
              );
            } catch (parseError) {
              console.error(`[DEBUG] localStorage parse hatası:`, parseError);
            }
          }
        }

        // Local'de yoksa API'den getir
        if (!quizData) {
          quizData = await quizService.getQuizById(quizId);
          console.log(
            "[DEBUG] quizService.getQuizById'den gelen quizData:",
            JSON.stringify(quizData, null, 2),
          );
        }

        if (!quizData || !quizData.id) {
          throw new Error("Sınav verileri eksik veya boş");
        }

        console.log(
          "[DEBUG] ✅ Sınav verileri yüklendi (işlenmeden önce):",
          JSON.stringify(quizData, null, 2),
        );
        // Her bir soruyu ensureQuestionSubTopics ile işle
        if (quizData.questions && Array.isArray(quizData.questions)) {
          quizData.questions = quizData.questions.map((q: Question) => {
            const processedQ = ensureQuestionSubTopics(q);
            return processedQ;
          });
          console.log(
            `[DEBUG] ✅ Soru alt konu bilgileri kontrol edildi ve tamamlandı. İşlenmiş sorular:`,
            JSON.stringify(quizData.questions, null, 2),
          );
        } else {
          console.warn(
            "[DEBUG] quizData.questions bulunamadı veya dizi değil:",
            quizData.questions,
          );
        }

        setQuiz({
          ...quizData,
          quizType: quizData.quizType as QuizType,
        } as Quiz);

        // Zamanlayıcıyı ayarla
        if (quizData.preferences?.timeLimit) {
          setRemainingTime(quizData.preferences.timeLimit * 60); // Dakika -> Saniye
        }
      } catch (error) {
        console.error(`[DEBUG] ❌ Sınav verileri yüklenemedi:`, error);
        ErrorService.showToast(
          "Sınav bulunamadı veya erişim hatası oluştu.",
          "error",
          "Sınav Yükleme",
        );
        // Kullanıcıyı ana sayfaya veya sınav listesine yönlendir
        setTimeout(() => {
          router.push("/exams");
        }, 3000);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [params.id]); // ensureQuestionSubTopics bağımlılıklardan çıkarıldı, çünkü sayfa içinde tanımlı ve değişmiyor.

  // Learning targets integration - Set temporary targets from quiz questions
  useEffect(() => {
    if (quiz?.questions) {
      console.log(
        "[Learning Targets] Setting temporary targets from quiz questions",
      );
      setTemporaryTargetsFromQuiz(quiz.questions);
    }

    // Cleanup function to clear temporary targets when component unmounts
    return () => {
      console.log("[Learning Targets] Clearing temporary targets on unmount");
      clearTemporaryTargets();
    };
  }, [quiz?.questions, setTemporaryTargetsFromQuiz, clearTemporaryTargets]);

  // Timer
  useEffect(() => {
    if (!quiz || isCompleted || showResults || !remainingTime) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          // handleSubmit yerine doğrudan submit için state değerleri güncelleyelim
          setIsCompleted(true);
          setIsSubmitting(true);
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, isCompleted, showResults, remainingTime]);

  // Zamanlayıcı sıfırlandığında submit işlemini gerçekleştir
  useEffect(() => {
    // Sadece zamanlayıcı tamamlandığında ve isCompleted true olduğunda
    if (remainingTime === 0 && isCompleted && isSubmitting) {
      handleSubmit();
    }
  }, [remainingTime, isCompleted, isSubmitting]);

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Sorunun alt konu bilgilerini kontrol eder ve eksikse tamamlar
   * Bu fonksiyon, backend'den gelen eksik verileri tamamlar ve null/undefined durumlarını güvenli şekilde ele alır
   */
  const ensureQuestionSubTopics = (question: Question): Question => {
    if (!question) {
      console.error(
        `[DEBUG] ensureQuestionSubTopics - Geçersiz soru (null/undefined)`,
      );
      // Geçersiz soru durumunda minimum geçerli bir soru nesnesi döndür
      return {
        id: `fallback_${Date.now()}`,
        questionText: "Geçersiz soru",
        options: [],
        correctAnswer: "",
        subTopic: "Genel Konu",
        normalizedSubTopic: "genel-konu",
        difficulty: "medium" as DifficultyLevel,
        questionType: "multiple_choice",
        status: "active",
        explanation: "",
      };
    }

    // Backend'den gelen subTopicName/normalizedSubTopicName alanlarını subTopic/normalizedSubTopic olarak eşle
    const updatedQuestion = JSON.parse(JSON.stringify(question)) as Question;
    if (updatedQuestion.subTopicName && !updatedQuestion.subTopic) {
      updatedQuestion.subTopic = updatedQuestion.subTopicName;
    }
    if (
      updatedQuestion.normalizedSubTopicName &&
      !updatedQuestion.normalizedSubTopic
    ) {
      updatedQuestion.normalizedSubTopic =
        updatedQuestion.normalizedSubTopicName;
    }

    // ID kontrolü - ID yoksa oluştur
    if (!updatedQuestion.id) {
      updatedQuestion.id = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.warn(
        `[DEBUG] ensureQuestionSubTopics - Soru ID'si eksik, otomatik ID oluşturuldu: ${updatedQuestion.id}`,
      );
    }

    // Alt konu bilgilerinin tam kontrolü
    // Her türlü durum için kontrol yapıyor (null, undefined, boş string)
    const hasValidSubTopic =
      !!updatedQuestion.subTopic &&
      typeof updatedQuestion.subTopic === "string" &&
      updatedQuestion.subTopic.trim() !== "";
    const hasValidNormalizedSubTopic =
      !!updatedQuestion.normalizedSubTopic &&
      typeof updatedQuestion.normalizedSubTopic === "string" &&
      updatedQuestion.normalizedSubTopic.trim() !== "";

    console.log(
      `[DEBUG] ensureQuestionSubTopics - ID: ${updatedQuestion.id} - Gelen: subTopic='${question.subTopic}', normSubTopic='${question.normalizedSubTopic}' -> hasValidSubTopic: ${hasValidSubTopic}, hasValidNormalizedSubTopic: ${hasValidNormalizedSubTopic}`,
    );

    // Alt konu kontrolü ve düzeltme
    if (!hasValidSubTopic && !hasValidNormalizedSubTopic) {
      // Her ikisi de geçersizse, varsayılan değerleri ata
      console.log(
        `[DEBUG] ensureQuestionSubTopics - ID: ${updatedQuestion.id} - Her iki alan da eksik veya boş, varsayılan değer atanıyor`,
      );
      updatedQuestion.subTopic = "Genel Konu";
      updatedQuestion.normalizedSubTopic = "genel-konu";
    } else if (hasValidSubTopic && !hasValidNormalizedSubTopic) {
      // subTopic var ama normalizedSubTopic yoksa, normalizedSubTopic oluştur
      console.log(
        `[DEBUG] ensureQuestionSubTopics - ID: ${updatedQuestion.id} - normalizedSubTopic eksik, subTopic'ten oluşturuluyor: "${updatedQuestion.subTopic}"`,
      );
      try {
        updatedQuestion.normalizedSubTopic = updatedQuestion.subTopic
          .toLowerCase()
          .trim() // Ensure trimming before normalization
          .replace(/\s+/g, "-") // Düzeltildi: \s+ yerine \s+
          .replace(/[^a-z0-9-]/g, ""); // Düzeltildi: \- yerine -
      } catch (error) {
        console.error(`[DEBUG] normalizedSubTopic oluşturulurken hata:`, error);
        updatedQuestion.normalizedSubTopic = "genel-konu";
      }
    } else if (!hasValidSubTopic && hasValidNormalizedSubTopic) {
      // normalizedSubTopic var ama subTopic yoksa, subTopic oluştur
      console.log(
        `[DEBUG] ensureQuestionSubTopics - ID: ${updatedQuestion.id} - subTopic eksik, normalizedSubTopic'ten oluşturuluyor: "${updatedQuestion.normalizedSubTopic}"`,
      );
      try {
        updatedQuestion.subTopic = updatedQuestion.normalizedSubTopic
          .split("-")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      } catch (error) {
        console.error(`[DEBUG] subTopic oluşturulurken hata:`, error);
        updatedQuestion.subTopic = "Genel Konu";
      }
    } else {
      // Her ikisi de var, normalizedSubTopic'in doğru format olduğundan emin ol
      console.log(
        `[DEBUG] ensureQuestionSubTopics - ID: ${updatedQuestion.id} - Her iki alan da var, format kontrolü yapılıyor`,
      );
      let expectedNormalizedSubTopic = "genel-konu";
      try {
        expectedNormalizedSubTopic = updatedQuestion.subTopic
          .toLowerCase()
          .trim() // Ensure trimming before normalization
          .replace(/\s+/g, "-") // Düzeltildi: \s+ yerine \s+
          .replace(/[^a-z0-9-]/g, ""); // Düzeltildi: \- yerine -
      } catch (error) {
        console.error(
          `[DEBUG] expectedNormalizedSubTopic oluşturulurken hata:`,
          error,
        );
        expectedNormalizedSubTopic = "genel-konu";
      }

      // Eğer normalizedSubTopic beklenen formatla uyuşmuyorsa veya boşsa düzelt
      if (
        updatedQuestion.normalizedSubTopic !== expectedNormalizedSubTopic ||
        !updatedQuestion.normalizedSubTopic.trim()
      ) {
        console.log(
          `[DEBUG] ensureQuestionSubTopics - ID: ${updatedQuestion.id} - normalizedSubTopic yeniden formatlanıyor veya boş olduğu için düzeltiliyor`,
        );
        console.log(
          `[DEBUG] Mevcut: "${updatedQuestion.normalizedSubTopic}", Beklenen: "${expectedNormalizedSubTopic}"`,
        );
        updatedQuestion.normalizedSubTopic =
          expectedNormalizedSubTopic || "genel-konu"; // Fallback if expected is empty
      }
    }

    // Zorluk seviyesi kontrolü - varsayılan olarak 'medium' kullan
    if (
      !updatedQuestion.difficulty ||
      typeof updatedQuestion.difficulty !== "string"
    ) {
      updatedQuestion.difficulty = "medium" as DifficultyLevel;
    }

    // Question type kontrolü
    if (
      !updatedQuestion.questionType ||
      typeof updatedQuestion.questionType !== "string"
    ) {
      updatedQuestion.questionType = "multiple_choice";
    }

    // Status kontrolü
    if (!updatedQuestion.status || typeof updatedQuestion.status !== "string") {
      updatedQuestion.status = "active";
    }

    // CorrectAnswer kontrolü
    if (
      !updatedQuestion.correctAnswer ||
      typeof updatedQuestion.correctAnswer !== "string"
    ) {
      console.warn(
        `[DEBUG] ensureQuestionSubTopics - ID: ${updatedQuestion.id} - doğru cevap eksik veya geçersiz`,
      );
      // Options varsa ilk seçeneği doğru cevap olarak ata, yoksa boş string kullan
      updatedQuestion.correctAnswer =
        updatedQuestion.options && updatedQuestion.options.length > 0
          ? updatedQuestion.options[0]
          : "";
    }

    // Options kontrolü
    if (!updatedQuestion.options || !Array.isArray(updatedQuestion.options)) {
      console.warn(
        `[DEBUG] ensureQuestionSubTopics - ID: ${updatedQuestion.id} - seçenekler eksik veya geçersiz`,
      );
      updatedQuestion.options = [
        "A) Seçenek eksik",
        "B) Seçenek eksik",
        "C) Seçenek eksik",
        "D) Seçenek eksik",
      ];
    }

    console.log(
      `[DEBUG] ensureQuestionSubTopics - Sonuç - ID: ${updatedQuestion.id}, subTopic: "${updatedQuestion.subTopic}", normalizedSubTopic: "${updatedQuestion.normalizedSubTopic}"`,
    );
    return updatedQuestion;
  };

  /**
   * Seçenek karşılaştırmak için yardımcı fonksiyon
   * String veya { id, text } formatındaki seçeneklerin eşitliğini kontrol eder
   */
  const optionsEqual = (option1: any, option2: any): boolean => {
    if (option1 === option2) return true;

    if (
      typeof option1 === "object" &&
      typeof option2 === "object" &&
      option1 !== null &&
      option2 !== null &&
      "id" in option1 &&
      "id" in option2
    ) {
      return option1.id === option2.id;
    }

    if (
      typeof option1 === "object" &&
      option1 !== null &&
      "text" in option1 &&
      option2 === option1.text
    ) {
      return true;
    }

    if (
      typeof option2 === "object" &&
      option2 !== null &&
      "text" in option2 &&
      option1 === option2.text
    ) {
      return true;
    }

    return false;
  };

  /**
   * Sınav gönderme işlemini gerçekleştirir
   * Veri doğrulama ve hata yakalama mekanizmaları güçlendirilmiştir
   */
  const handleSubmit = async () => {
    if (!quiz || isSubmitting) {
      console.warn(
        "[handleSubmit] Quiz veya isSubmitting durumu engeli, işlem iptal ediliyor",
      );
      return;
    }

    try {
      console.log("🕔 Sınav gönderme işlemi başlatılıyor - Quiz ID:", quiz.id);

      // İşlem durum bilgisini güncelle
      setIsSubmitting(true);
      setIsCompleted(true);

      // Quiz ID kontrol et
      if (!quiz.id || typeof quiz.id === "undefined") {
        console.error("❌ Quiz ID tanımsız! Submitting işlemi yapılamıyor.");
        ErrorService.showToast(
          "Sınav kimliği bulunamadı. Lütfen ana sayfaya dönün.",
          "error",
          "Sınav Hatası",
        );
        setIsSubmitting(false);
      }

      // Soruların varlığını kontrol et
      if (
        !quiz.questions ||
        !Array.isArray(quiz.questions) ||
        quiz.questions.length === 0
      ) {
        console.error("❌ Sınav soruları bulunamadı!");
        ErrorService.showToast(
          "Sınav soruları bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.",
          "error",
          "Sınav Hatası",
        );
        setIsSubmitting(false);
        setIsCompleted(false);
        return;
      }

      console.log(
        `📌 Quiz ${quiz.questions.length} soru içeriyor, alt konu bilgileri kontrol ediliyor...`,
      );

      // Soruların alt konu bilgilerini kontrol et ve eksikse doldur
      const preparedQuestions = quiz.questions.map((question) => {
        const processedQuestion = ensureQuestionSubTopics(question);
        // Ek kontroller burada yapılabilir
        return processedQuestion;
      });

      // Hazırlanan soruları doğrula
      if (preparedQuestions.length === 0) {
        console.error("❌ Sınav soruları işlenemedi veya geçersiz format!");
        ErrorService.showToast(
          "Sınav soruları işlenemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
          "error",
          "Sınav Hatası",
        );
        setIsSubmitting(false);
        setIsCompleted(false);
        return;
      }

      // Sorular düzeltilmiş olarak quizi güncelle
      const preparedQuiz: Quiz = {
        ...quiz,
        id: quiz.id, // ID'nin kesinlikle string olduğundan emin oluyoruz (lint hatasını çözmek için)
        questions: preparedQuestions,
      };

      // Kullanıcı cevaplarını kontrol et
      if (!userAnswers || typeof userAnswers !== "object") {
        console.error(
          "❌ Kullanıcı cevapları bulunamadı veya geçersiz format!",
        );
        ErrorService.showToast(
          "Cevaplarınız kaydedilemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
          "error",
          "Sınav Hatası",
        );
        setIsSubmitting(false);
        setIsCompleted(false);
        return;
      }

      // Cevapları doğrula ve eksik cevapları tespit et
      let allAnswersValid = true;
      const validatedUserAnswers = { ...userAnswers };
      const unansweredQuestions: string[] = [];

      preparedQuestions.forEach((question) => {
        if (!validatedUserAnswers[question.id]) {
          console.warn(
            `[DEBUG] Soru ${question.id} için cevap bulunamadı, varsayılan boş cevap atanıyor.`,
          );
          validatedUserAnswers[question.id] = ""; // Boş cevap atanabilir veya ilk seçenek varsayılan olarak seçilebilir
          allAnswersValid = false;
          unansweredQuestions.push(question.questionText);
        }
      });

      // Cevaplanmamış sorular varsa kullanıcıya bildir
      if (!allAnswersValid && unansweredQuestions.length > 0) {
        const unansweredCount = unansweredQuestions.length;
        const message =
          unansweredCount === 1
            ? "1 soru cevaplanmamış"
            : `${unansweredCount} soru cevaplanmamış`;

        console.warn(`⚠️ ${message}, ancak devam ediliyor.`);
        ErrorService.showToast(
          `${message}. Sınav tamamlanacak ancak bu sorular yanlış kabul edilecek.`,
          "warning",
          "Eksik Cevaplar",
        );
      }

      console.log(
        `📃 Toplam ${Object.keys(validatedUserAnswers).length} cevap işleniyor...`,
      );

      // Önce sonuçları lokal olarak hesapla ve sakla
      const quizResult = calculateAndStoreResults(preparedQuiz);
      console.log(
        `📊 Sınav sonuçları hesaplandı. Doğru: ${quizResult?.correctCount || 0}/${quizResult?.totalQuestions || 0}`,
      );

      try {
        // API'ye yanıtları gönder - Güçlendirilmiş veri yapısı ile
        const payload: QuizSubmissionPayload = {
          quizId: preparedQuiz.id,
          userAnswers: validatedUserAnswers,
          elapsedTime: preparedQuiz.preferences?.timeLimit
            ? preparedQuiz.preferences.timeLimit * 60 - (remainingTime || 0)
            : 0,
        };

        console.log(
          `🔄 Sınav yanıtları gönderiliyor: Quiz ID=${payload.quizId}, Cevap Sayısı=${Object.keys(payload.userAnswers).length}`,
        );

        // API bağlantı hatalarında bile ilerleyebilmek için try/catch içine alındı
        const result = await quizService.submitQuiz(payload);
        console.log(`✅ Sınav yanıtları başarıyla gönderildi`);

        // Eğer backend bir analiz sonucu döndürdüyse, localStorage'a kaydet
        if (result && result.analysisResult) {
          // Quiz nesnesinin tüm gerekli alanlarını ve tip uyumluluğunu sağlamak için
          // ID'nin kesinlikle string olduğundan emin olalım
          const quizId =
            typeof preparedQuiz.id === "string"
              ? preparedQuiz.id
              : String(preparedQuiz.id); // Quiz modeli için tüm gerekli alanları içeren tam bir nesne oluşturalım
          const updatedQuizResult: Quiz = {
            // quizResult'dan gelen temel alanlar
            ...quizResult,
            // String tipinde ID garantisi
            id: quizId,
            // Varsayılan değerler ve eksik alanlar
            title: quizResult?.title || "Sınav",
            questions: quizResult?.questions || [],
            userAnswers: quizResult?.userAnswers || {},
            quizType: quizResult?.quizType || "quick",
            // timestamp için string garantisi
            timestamp:
              typeof quizResult?.timestamp === "string"
                ? quizResult.timestamp
                : new Date().toISOString(),
            // courseId için null/undefined kontrolü
            courseId: quizResult?.courseId || null,
            score: quizResult?.score || 0,
            userId: quizResult?.userId || "anonim",
            correctCount: quizResult?.correctCount || 0,
            totalQuestions: quizResult?.totalQuestions || 0,
            elapsedTime: quizResult?.elapsedTime || 0,
            // preferences için doğru yapı garantisi
            preferences: {
              questionCount: quizResult?.preferences?.questionCount || 10,
              difficulty: quizResult?.preferences?.difficulty || "mixed",
              timeLimit: quizResult?.preferences?.timeLimit,
              prioritizeWeakAndMediumTopics:
                quizResult?.preferences?.prioritizeWeakAndMediumTopics,
            },
            analysisResult: quizResult?.analysisResult || null,
          }; // --- Öğrenme Hedefleri Güncellemesi ---
          try {
            console.log(
              "[Learning Targets] Starting learning targets update...",
            );

            // Update temporary target scores with quiz results
            const quizResultsForTargets = {
              questions: preparedQuiz.questions,
              userAnswers: validatedUserAnswers,
            };

            const updatedTargets = updateTemporaryTargetScores(
              quizResultsForTargets,
            );
            console.log(
              "[Learning Targets] Updated temporary targets:",
              updatedTargets,
            );
            // Send updated targets to backend
            if (updatedTargets.length > 0) {
              // Convert TemporaryLearningTarget format to new API format
              const convertedTargets = updatedTargets.map((target) => ({
                subTopicName: target.subTopic,
                status: target.status.toLowerCase() as
                  | "pending"
                  | "failed"
                  | "medium"
                  | "mastered",
                lastScore: target.score,
              }));

              console.log(
                "[Learning Targets] Converted targets for new API:",
                convertedTargets,
              );

              const batchResult =
                await learningTargetService.batchUpdateTargets(
                  convertedTargets,
                );
              console.log(
                "[Learning Targets] Batch update result:",
                batchResult,
              );

              if (batchResult.success) {
                // Clear temporary targets after successful update
                clearTemporaryTargets();
                console.log(
                  "[Learning Targets] Temporary targets cleared after successful update",
                );

                ErrorService.showToast(
                  `Öğrenme hedefleriniz başarıyla güncellendi! (${batchResult.processedCount} hedef)`,
                  "success",
                  "Öğrenme Hedefleri",
                );
              } else {
                console.warn("[Learning Targets] Batch update failed");
                ErrorService.showToast(
                  "Öğrenme hedefleri güncellenirken bir sorun oluştu.",
                  "warning",
                  "Öğrenme Hedefleri",
                );
              }
            } else {
              console.log("[Learning Targets] No targets to update");
            }
          } catch (ltError) {
            console.error(
              "[Learning Targets] Error updating learning targets:",
              ltError,
            );
            ErrorService.showToast(
              "Öğrenme hedefleri güncellenirken bir hata oluştu.",
              "error",
              "Öğrenme Hedefleri",
            );
          }
          // --- Öğrenme Hedefleri Güncellemesi Sonu ---

          // --- Legacy öğrenme hedefleri güncellemesi (eski kod) ---
          try {
            const performanceBySubTopic =
              result.analysisResult.performanceBySubTopic;
            if (performanceBySubTopic && quiz && quiz.courseId) {
              // Önce o kursa ait öğrenme hedeflerini al
              const learningTargets =
                await learningTargetService.getLearningTargets(quiz.courseId);

              // Güncellenecek hedefleri hazırla
              const updates = Object.entries(performanceBySubTopic)
                .map(([normalizedSubTopic, perf]: [string, any]) => {
                  // Normalized name ile hedefi bul
                  const target = learningTargets.find(
                    (lt) => lt.normalizedSubTopicName === normalizedSubTopic,
                  );

                  if (!target) {
                    console.warn(
                      `[handleSubmit] Öğrenme hedefi bulunamadı: ${normalizedSubTopic}`,
                    );
                    return null;
                  }

                  return {
                    id: target.id,
                    status: perf.status, // "mastered" | "medium" | "failed"
                    lastAttemptScorePercent: perf.scorePercent,
                  };
                })
                .filter(Boolean); // null olan değerleri filtrele
              if (updates.length > 0) {
                // Her hedefi tek tek güncelle (çünkü updateMultipleStatuses endpoint'i yok)
                const updatePromises = updates.map((update) => {
                  if (!update) return Promise.resolve();
                  return learningTargetService.updateLearningTarget(update.id, {
                    status: update.status,
                    lastAttemptScorePercent: update.lastAttemptScorePercent,
                  });
                });

                await Promise.all(updatePromises);
                console.log(
                  "[handleSubmit] Legacy öğrenme hedefleri güncellendi:",
                  updates,
                );
              } else {
                console.log(
                  "[handleSubmit] Legacy - Güncellenecek öğrenme hedefi yok.",
                );
              }
            } else {
              console.warn(
                "[handleSubmit] Legacy - Alt konu performansı ya da courseId bulunamadı, öğrenme hedefi güncellenmedi.",
              );
            }
          } catch (ltError) {
            console.error(
              "[handleSubmit] Legacy öğrenme hedefleri güncellenirken hata:",
              ltError,
            );
            // Not showing error toast for legacy update since new system is primary
          }
          // --- Legacy Öğrenme Hedefleri Güncellemesi Sonu ---
        } else {
          console.log(
            `ℹ️ Backend'den analiz sonucu alınamadı, sadece lokalde hesaplanan sonucu kullanıyoruz`,
          );
        }
      } catch (apiError) {
        console.error(
          "⚠️ API yanıt hatası (sonuçlar yine de gösterilecek):",
          apiError,
        );
        ErrorService.showToast(
          "Sınav sonuçları sunucuya kaydedilemedi, ancak sonuçlarınızı görebilirsiniz.",
          "warning",
          "Sunucu Hatası",
        );

        // Hata detaylarını konsola yaz
        if (apiError instanceof Error) {
          console.error("API Hata Detayı:", {
            message: apiError.message,
            stack: apiError.stack,
            name: apiError.name,
          });
        }

        // API hatası olsa da devam ediyoruz - lokalde hesaplanmış sonuçlarla
      }

      console.log(
        `[EXAM_PAGE_DEBUG] handleSubmit: localStorage'a YAZMA BAŞLIYOR. Quiz ID: ${preparedQuiz.id}`,
      );
      try {
        // validatedUserAnswers içindeki her cevabı sadece string olarak kaydet
        const userAnswersDataStringOnly = Object.fromEntries(
          Object.entries(validatedUserAnswers).map(([qid, answerObj]) => [
            qid,
            typeof answerObj === "object" &&
            answerObj !== null &&
            "text" in answerObj
              ? answerObj.text
              : answerObj,
          ]),
        );
        const dataForResultsPage = {
          quizData: preparedQuiz,
          userAnswersData: userAnswersDataStringOnly,
        };
        const storageKey = `examCompletionData_${preparedQuiz.id}`;
        const stringifiedData = JSON.stringify(dataForResultsPage);
        console.log(
          `[EXAM_PAGE_DEBUG] handleSubmit: localStorage'a YAZILACAK ANAHTAR: ${storageKey}`,
        );
        console.log(
          `[EXAM_PAGE_DEBUG] handleSubmit: localStorage'a YAZILACAK VERİ (stringified):`,
          stringifiedData,
        );
        localStorage.setItem(storageKey, stringifiedData);
        console.log(
          `[EXAM_PAGE_DEBUG] handleSubmit: localStorage.setItem ÇAĞRILDI.`,
        );
        const verifier = localStorage.getItem(storageKey);
        console.log(
          `[EXAM_PAGE_DEBUG] handleSubmit: localStorage'dan DOĞRULAMA AMAÇLI OKUNAN VERİ:`,
          verifier ? "VERİ VAR" : "VERİ YOK (NULL)",
        );
        console.log(
          `[EXAM_PAGE_DEBUG] ✅ Veri localStorage'a kaydedildi ve doğrulandı. Anahtar: ${storageKey}`,
        );
      } catch (storageError) {
        console.error(
          "❌ localStorage'a yazılırken hata oluştu:",
          storageError,
        );
        ErrorService.showToast(
          "Sonuçlar geçici olarak saklanamadı, ancak yönlendirme devam ediyor.",
          "warning",
          "Geçici Depolama Hatası",
        );
      }

      console.log(
        `[EXAM_PAGE_DEBUG] handleSubmit: Yönlendirme BAŞLIYOR: /exams/${preparedQuiz.id}/results`,
      );
      router.push(`/exams/${preparedQuiz.id}/results`);
      console.log(`[EXAM_PAGE_DEBUG] handleSubmit: router.push ÇAĞRILDI.`);
    } catch (error) {
      setIsSubmitting(false);
      setIsCompleted(false);
      console.error("❌ Sınav tamamlanırken genel hata:", error);

      // Hata detaylarını konsola yaz
      if (error instanceof Error) {
        console.error("Hata Detayı:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }

      ErrorService.showToast(
        "Sınav tamamlanırken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        "error",
        "Sınav Hatası",
      );
    }
  };

  /**
   * Sınav sonuçlarını hesaplar ve localStorage'a kaydeder
   * Güçlendirilmiş veri doğrulama ve hata yakalama özellikleri ile
   */
  const calculateAndStoreResults = (quizToProcess = quiz): Quiz | null => {
    // Quiz'in varlığını kontrol et
    if (!quizToProcess) {
      console.error("[calculateAndStoreResults] Geçersiz quiz verisi!");
      return null;
    }

    // Quiz ID'sinin string olduğundan emin ol (lint hatasını çözmek için)
    if (!quizToProcess.id) {
      console.warn(
        "[calculateAndStoreResults] Quiz ID bulunamadı, geçici ID atanıyor",
      );
      quizToProcess.id = `temp_quiz_${Date.now()}`;
    }

    // Soruları kontrol et
    if (
      !quizToProcess.questions ||
      !Array.isArray(quizToProcess.questions) ||
      quizToProcess.questions.length === 0
    ) {
      console.error("[calculateAndStoreResults] Geçersiz soru verisi!");
      return null;
    }

    // Kullanıcı cevaplarını kontrol et
    if (!userAnswers || typeof userAnswers !== "object") {
      console.error("[calculateAndStoreResults] Geçersiz kullanıcı cevapları!");
      return null;
    }

    console.log(
      `📊 Sonuçlar hesaplanıyor - Quiz ID: ${quizToProcess.id}, Soru Sayısı: ${quizToProcess.questions.length}`,
    );

    try {
      // Doğru cevapları say
      const correctCount = Object.entries(userAnswers).reduce(
        (count, [questionId, answer]) => {
          const question = quizToProcess.questions.find(
            (q) => q.id === questionId,
          );
          return question && question.correctAnswer === answer
            ? count + 1
            : count;
        },
        0,
      );

      const totalQuestions = quizToProcess.questions.length;
      const scorePercent =
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * 100)
          : 0;

      // Alt konuları grupla ve performans analiz et
      const subTopicPerformance: Record<
        string,
        { correct: number; total: number; score: number }
      > = {};
      const difficultyPerformance: Record<
        string,
        { correct: number; total: number; score: number }
      > = {
        easy: { correct: 0, total: 0, score: 0 },
        medium: { correct: 0, total: 0, score: 0 },
        hard: { correct: 0, total: 0, score: 0 },
        mixed: { correct: 0, total: 0, score: 0 },
      };

      // Her soru için performans analizi yap
      quizToProcess.questions.forEach((q) => {
        try {
          // Soruların alt konu bilgilerini kontrol et ve düzelt
          const subTopic = q.subTopic || "Genel Konu";

          // normalizedSubTopic için string tipini garantile
          let normalizedSubTopic = "genel-konu";
          if (
            typeof q.normalizedSubTopic === "string" &&
            q.normalizedSubTopic
          ) {
            normalizedSubTopic = q.normalizedSubTopic;
          } else if (typeof subTopic === "string") {
            try {
              normalizedSubTopic = subTopic
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9\-]/g, "");
            } catch (error) {
              console.warn(
                `[calculateAndStoreResults] normalizedSubTopic oluştururken hata:`,
                error,
              );
            }
          }

          // Eksik alanları tamamla
          if (!q.subTopic) q.subTopic = subTopic;
          if (!q.normalizedSubTopic) q.normalizedSubTopic = normalizedSubTopic;

          const difficulty = q.difficulty || "mixed";
          const isCorrect = userAnswers[q.id] === q.correctAnswer;

          // Alt konu performansı
          if (!subTopicPerformance[subTopic]) {
            subTopicPerformance[subTopic] = { correct: 0, total: 0, score: 0 };
          }
          subTopicPerformance[subTopic].total++;
          if (isCorrect) {
            subTopicPerformance[subTopic].correct++;
          }

          // Zorluk seviyesi performansı
          difficultyPerformance[difficulty].total++;
          if (isCorrect) {
            difficultyPerformance[difficulty].correct++;
          }
        } catch (error) {
          console.error(
            `[calculateAndStoreResults] Soru analizi sırasında hata: ${q.id}`,
            error,
          );
        }
      });

      // Alt konu ve zorluk seviyesi skorlarını hesapla
      Object.values(subTopicPerformance).forEach((perf) => {
        perf.score =
          perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
      });
      Object.values(difficultyPerformance).forEach((perf) => {
        perf.score =
          perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
      });

      // Analiz sonucunu hazırla
      const performanceBySubTopic: Record<
        string,
        {
          scorePercent: number;
          status: "mastered" | "medium" | "failed";
          questionCount: number;
          correctCount: number;
        }
      > = {};

      Object.entries(subTopicPerformance).forEach(([topic, perf]) => {
        let status: "mastered" | "medium" | "failed" = "failed";
        if (perf.score >= 75) status = "mastered";
        else if (perf.score >= 50) status = "medium";

        performanceBySubTopic[topic] = {
          scorePercent: perf.score,
          status,
          questionCount: perf.total,
          correctCount: perf.correct,
        };
      });

      const performanceByDifficulty: Record<
        string,
        {
          count: number;
          correct: number;
          score: number;
        }
      > = {};

      Object.entries(difficultyPerformance).forEach(([difficulty, perf]) => {
        if (perf.total > 0) {
          performanceByDifficulty[difficulty] = {
            count: perf.total,
            correct: perf.correct,
            score: perf.score,
          };
        }
      });

      // Kategorizasyon
      const performanceCategorization = {
        mastered: [] as string[],
        medium: [] as string[],
        failed: [] as string[],
      };

      Object.entries(performanceBySubTopic).forEach(([topic, data]) => {
        if (data.status === "mastered")
          performanceCategorization.mastered.push(topic);
        else if (data.status === "medium")
          performanceCategorization.medium.push(topic);
        else performanceCategorization.failed.push(topic);
      });
      // Sonuçları oluştur - Quiz tipine uygun olarak
      const quizResult: Quiz = {
        ...quizToProcess,
        id: quizToProcess.id, // ID'nin string olduğundan emin oluyoruz
        userAnswers,
        correctCount,
        totalQuestions,
        score: scorePercent,
        elapsedTime: quizToProcess.preferences?.timeLimit
          ? quizToProcess.preferences.timeLimit * 60 - (remainingTime || 0)
          : 0,
        timestamp: new Date().toISOString(),
        preferences: {
          questionCount: quizToProcess.preferences?.questionCount || 10,
          difficulty: quizToProcess.preferences?.difficulty || "mixed",
          timeLimit: quizToProcess.preferences?.timeLimit,
          prioritizeWeakAndMediumTopics:
            quizToProcess.preferences?.prioritizeWeakAndMediumTopics,
        },
        analysisResult: {
          overallScore: scorePercent,
          performanceBySubTopic,
          performanceCategorization,
          performanceByDifficulty,
          recommendations: [],
        },
      };

      console.log(
        `✅ Sınav sonuçları başarıyla hesaplandı. Skor: ${scorePercent}%`,
      );

      // LocalStorage'a kaydet - eksiksiz veri aktarımı için
      if (window && window.localStorage) {
        try {
          storeQuizResultsInStorage(quizToProcess.id, quizResult);
          console.log(
            `💾 Sınav sonuçları localStorage'a kaydedildi. Quiz ID: ${quizToProcess.id}`,
          );
        } catch (error) {
          console.error("❌ LocalStorage'a kayıt sırasında hata:", error);

          // Hata detaylarını göster
          if (error instanceof Error) {
            console.error("Hata Detayı:", {
              message: error.message,
              stack: error.stack,
              name: error.name,
            });
          }
        }
      }

      return quizResult;
    } catch (error) {
      console.error(
        "❌ Sınav sonuçları hesaplanırken beklenmeyen hata:",
        error,
      );

      // Hata detaylarını göster
      if (error instanceof Error) {
        console.error("Hata Detayı:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      // En azından temel bilgileri içeren basit bir sonuç oluştur
      const fallbackQuizResult: Quiz = {
        ...quizToProcess,
        id: quizToProcess.id, // ID'nin string olduğundan emin oluyoruz
        userAnswers: userAnswers || {},
        correctCount: 0,
        totalQuestions: quizToProcess.questions.length,
        score: 0,
        elapsedTime: 0,
        timestamp: new Date().toISOString(),
        preferences: {
          questionCount: quizToProcess.preferences?.questionCount || 10,
          difficulty: quizToProcess.preferences?.difficulty || "mixed",
          timeLimit: quizToProcess.preferences?.timeLimit,
          prioritizeWeakAndMediumTopics:
            quizToProcess.preferences?.prioritizeWeakAndMediumTopics,
        },
        analysisResult: {
          overallScore: 0,
          performanceBySubTopic: {},
          performanceCategorization: {
            mastered: [],
            medium: [],
            failed: [],
          },
          performanceByDifficulty: {
            easy: { count: 0, correct: 0, score: 0 },
            medium: { count: 0, correct: 0, score: 0 },
            hard: { count: 0, correct: 0, score: 0 },
            mixed: { count: 0, correct: 0, score: 0 },
          },
          recommendations: [],
        },
      };

      return fallbackQuizResult;
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;

    let correctCount = 0;
    quiz.questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    return Math.round((correctCount / quiz.questions.length) * 100);
  };

  const renderQuestionNavigation = () => {
    if (!quiz) {
      return null;
    }
    // Alt konuları grupla ve renklendir
    const subTopicColors: Record<
      string,
      { bg: string; text: string; ring: string }
    > = {};
    const subTopicMap: Record<
      string,
      { count: number; displayName: string; normalizedName: string }
    > = {};

    // Renk seçenekleri (theme variables kullanarak)
    const colorOptions = [
      {
        bg: "bg-state-infoBg",
        text: "text-state-info",
        ring: "ring-state-info",
      },
      {
        bg: "bg-state-successBg",
        text: "text-state-success",
        ring: "ring-state-success",
      },
      {
        bg: "bg-state-warningBg",
        text: "text-state-warning",
        ring: "ring-state-warning",
      },
      {
        bg: "bg-state-errorBg",
        text: "text-state-error",
        ring: "ring-state-error",
      },
      {
        bg: "bg-brand-secondary/20",
        text: "text-brand-secondary",
        ring: "ring-brand-secondary",
      },
      {
        bg: "bg-brand-accent/20",
        text: "text-brand-accent",
        ring: "ring-brand-accent",
      },
      {
        bg: "bg-brand-tertiary/20",
        text: "text-brand-tertiary",
        ring: "ring-brand-tertiary",
      },
      {
        bg: "bg-interactive-hover/20",
        text: "text-interactive-active",
        ring: "ring-interactive-active",
      },
    ];

    // Alt konulara göre renk ataması yapma
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((q) => {
        const subTopic = q.subTopic || "Genel Konu";
        const normalizedSubTopic = q.normalizedSubTopic || "genel-konu";

        if (!subTopicMap[subTopic]) {
          subTopicMap[subTopic] = {
            count: 1,
            displayName: subTopic,
            normalizedName: normalizedSubTopic,
          };
        } else {
          subTopicMap[subTopic].count++;
        }
      });

      const uniqueSubTopics = Object.keys(subTopicMap);
      uniqueSubTopics.forEach((subTopic, index) => {
        subTopicColors[subTopic] = colorOptions[index % colorOptions.length];
      });
    }

    const getSubTopicInfo = (question: Question) => {
      const subTopic = question.subTopic || "Genel Konu";
      const colorSet = subTopicColors[subTopic] || {
        bg: "bg-secondary/30",
        text: "text-secondary",
        ring: "ring-secondary",
      };

      return {
        name: subTopic,
        normalizedName: question.normalizedSubTopic || "genel-konu",
        colorSet,
      };
    };

    return (
      <div className="bg-elevated p-5 rounded-xl shadow-lg sticky top-24 border border-border-primary">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-primary">Sorular</h3>
          <Tooltip content="Renkler farklı alt konuları gösterir. İşaretli sorular bayrak ile belirtilir.">
            <div className="cursor-help p-1 rounded-full hover:bg-surface transition-colors">
              <Info size={18} className="text-tertiary" />
            </div>
          </Tooltip>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 gap-2 mb-4">
          {quiz.questions &&
            quiz.questions.map((question: Question, index: number) => {
              const isAnswered = userAnswers[question.id] !== undefined;
              const isFlagged = flaggedQuestions.has(index);
              const subTopicInfo = getSubTopicInfo(question);

              return (
                <Tooltip
                  key={question.id}
                  content={`${index + 1}. Soru ${isFlagged ? "(İşaretli)" : ""} - ${subTopicInfo.name}`}
                >
                  <button
                    onClick={() => {
                      // Smooth scroll to question
                      document
                        .getElementById(`question-${index}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className={`w-full h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ease-in-out
                               focus:outline-none focus:ring-2 
                                ${
                                  isAnswered
                                    ? `${subTopicInfo.colorSet.bg} ${subTopicInfo.colorSet.text} font-semibold shadow-sm hover:shadow-md`
                                    : `bg-surface text-tertiary hover:bg-surface-hover hover:text-secondary`
                                }
                               relative hover:scale-105`}
                  >
                    {index + 1}
                    {isFlagged && (
                      <Flag
                        size={12}
                        className="absolute top-1 right-1 text-state-error"
                      />
                    )}
                  </button>
                </Tooltip>
              );
            })}
        </div>

        {Object.keys(subTopicMap).length > 0 && (
          <div className="mt-6 pt-4 border-t border-border-secondary">
            <p className="text-sm font-medium text-secondary mb-3 flex items-center">
              <span className="inline-block w-3 h-3 mr-2 bg-brand-primary/20 rounded-sm"></span>
              Alt Konular:
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {Object.entries(subTopicMap).map(([subTopic, info]) => {
                const colorSet = subTopicColors[subTopic] || {
                  bg: "bg-secondary/30",
                  text: "text-tertiary",
                };
                return (
                  <div key={subTopic} className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-sm mr-2 ${colorSet.bg}`}
                    ></span>
                    <span className={`text-xs ${colorSet.text}`}>
                      {info.displayName} ({info.count})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestion = (question: Question, index: number) => {
    const processedQuestion = ensureQuestionSubTopics(question);
    const subTopicName = processedQuestion.subTopic || "Belirtilmemiş";
    const difficultyMap = {
      easy: {
        text: "Kolay",
        color: isDarkMode ? "text-green-400" : "text-green-600",
        bg: isDarkMode ? "bg-green-900/30" : "bg-green-100",
      },
      medium: {
        text: "Orta",
        color: isDarkMode ? "text-yellow-400" : "text-yellow-600",
        bg: isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100",
      },
      hard: {
        text: "Zor",
        color: isDarkMode ? "text-red-400" : "text-red-600",
        bg: isDarkMode ? "bg-red-900/30" : "bg-red-100",
      },
      mixed: {
        text: "Karma",
        color: isDarkMode ? "text-blue-400" : "text-blue-600",
        bg: isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
      },
    };
    const difficultyInfo =
      difficultyMap[processedQuestion.difficulty || "medium"] ||
      difficultyMap.medium;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg p-5 max-w-3xl mx-auto mb-6 shadow-lg ${isDarkMode ? "bg-gray-800/80 backdrop-blur-sm border border-gray-700/50" : "bg-white/90 backdrop-blur-sm border border-gray-200/50"}`}
      >
        {/* Soru Başlığı */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div className="flex items-center">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2 ${isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"}`}
            >
              {index + 1}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${difficultyInfo.bg} ${difficultyInfo.color} border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              {difficultyInfo.text}
            </span>
            <span
              className={`text-xs ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {subTopicName}
            </span>
          </div>

          <Tooltip
            content={
              flaggedQuestions.has(index) ? "İşareti Kaldır" : "İşaretle"
            }
          >
            <button
              onClick={() => {
                const newFlagged = new Set(flaggedQuestions);
                if (newFlagged.has(index)) {
                  newFlagged.delete(index);
                } else {
                  newFlagged.add(index);
                }
                setFlaggedQuestions(newFlagged);
              }}
              className={`p-1.5 rounded-full transition-all ${
                flaggedQuestions.has(index)
                  ? isDarkMode
                    ? "bg-red-900/40 text-red-400 hover:bg-red-900/60"
                    : "bg-red-100 text-red-500 hover:bg-red-200"
                  : isDarkMode
                    ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Flag size={16} />
            </button>
          </Tooltip>
        </div>

        {/* Soru Metni */}
        <p
          className={`text-base mb-5 font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
        >
          {processedQuestion.questionText}
        </p>

        {/* Şıklar */}
        <div className="space-y-3">
          {processedQuestion.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className={`py-2.5 px-4 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                        flex items-center
                        ${
                          optionsEqual(
                            userAnswers[processedQuestion.id],
                            option,
                          )
                            ? isDarkMode
                              ? "bg-blue-900/30 border border-blue-700/50"
                              : "bg-blue-50 border border-blue-200"
                            : isDarkMode
                              ? "hover:bg-gray-700/80 border border-gray-700/50"
                              : "hover:bg-gray-50 border border-gray-200/60"
                        }`}
              onClick={() => {
                setUserAnswers((prev) => ({
                  ...prev,
                  [processedQuestion.id]: option,
                }));
              }}
            >
              <span
                className={`mr-3 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center
                              ${
                                optionsEqual(
                                  userAnswers[processedQuestion.id],
                                  option,
                                )
                                  ? isDarkMode
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-blue-500 bg-blue-500"
                                  : isDarkMode
                                    ? "border-gray-600"
                                    : "border-gray-300"
                              }`}
              >
                {optionsEqual(userAnswers[processedQuestion.id], option) && (
                  <CheckCircle size={12} className="text-white" />
                )}
              </span>
              <span
                className={`${
                  optionsEqual(userAnswers[processedQuestion.id], option)
                    ? isDarkMode
                      ? "text-blue-300 font-medium"
                      : "text-blue-700 font-medium"
                    : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                }`}
              >
                {typeof option === "object" &&
                option !== null &&
                "text" in option
                  ? option.text
                  : String(option)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderResults = () => {
    const score = calculateScore();
    // Analiz sonuçlarını localStorage'dan al
    if (!quiz) {
      return (
        <div
          className={`text-center p-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Sınav sonuçları yükleniyor veya bulunamadı...
        </div>
      );
    }
    const quizAnalysisData =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem(`quizAnalysis_${quiz.id}`) || "{}")
        : {};
    const analysis = quizAnalysisData.analysisResult || {};
    const userAnswersFromStorage = quizAnalysisData.userAnswers || userAnswers; // API hatası durumunda local userAnswers kullanılır

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`p-6 sm:p-8 rounded-xl shadow-xl max-w-3xl mx-auto ${isDarkMode ? "bg-gray-800/80 backdrop-blur-sm border border-gray-700/50" : "bg-white/90 backdrop-blur-sm border border-gray-200/50"}`}
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.5,
              type: "spring",
              stiffness: 120,
            }}
            className={`w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center shadow-lg mb-6 ${
              score >= 70
                ? isDarkMode
                  ? "bg-gradient-to-br from-green-600 to-emerald-500"
                  : "bg-gradient-to-br from-green-500 to-emerald-400"
                : score >= 50
                  ? isDarkMode
                    ? "bg-gradient-to-br from-yellow-600 to-amber-500"
                    : "bg-gradient-to-br from-yellow-500 to-amber-400"
                  : isDarkMode
                    ? "bg-gradient-to-br from-red-600 to-orange-500"
                    : "bg-gradient-to-br from-red-500 to-orange-400"
            }`}
          >
            <Award size={40} className="text-white mb-1" />
            <span className="text-3xl font-bold text-white">{score}%</span>
          </motion.div>
          <h2
            className={`text-4xl font-bold mb-3 ${isDarkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"}`}
          >
            Sınav Tamamlandı!
          </h2>
          <p
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Toplam puanınız:{" "}
            <span
              className={`font-bold ${
                score >= 70
                  ? isDarkMode
                    ? "text-green-400"
                    : "text-green-600"
                  : score >= 50
                    ? isDarkMode
                      ? "text-yellow-400"
                      : "text-yellow-600"
                    : isDarkMode
                      ? "text-red-400"
                      : "text-red-600"
              }`}
            >
              {score}%
            </span>{" "}
            (
            {quiz?.questions?.filter(
              (q) => userAnswersFromStorage[q.id] === q.correctAnswer,
            )?.length || 0}
            /{quiz?.questions?.length || 0} doğru)
          </p>
        </div>

        {/* Detaylı Sonuçlar ve Analiz */}
        {analysis.performanceBySubTopic && (
          <div className="mb-8 p-6 bg-surface rounded-lg">
            <h3 className="text-xl font-semibold text-primary mb-4">
              Konu Bazlı Performans
            </h3>
            <div className="space-y-3">
              {Object.entries(analysis.performanceBySubTopic).map(
                ([topic, data]: [string, any]) => (
                  <div
                    key={topic}
                    className="p-3 bg-elevated rounded-md shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-secondary">
                        {topic}
                      </span>
                      <span
                        className={`font-semibold ${data.scorePercent >= 75 ? "text-state-success" : data.scorePercent >= 50 ? "text-state-warning" : "text-state-error"}`}
                      >
                        %{data.scorePercent}
                      </span>
                    </div>
                    <div className="w-full bg-secondary bg-opacity-20 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${data.scorePercent >= 75 ? "bg-state-success" : data.scorePercent >= 50 ? "bg-state-warning" : "bg-state-error"}`}
                        style={{ width: `${data.scorePercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-tertiary mt-1">
                      {data.correctCount}/{data.questionCount} doğru
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        <div className="space-y-6 mb-10">
          <h3
            className={`text-xl font-semibold mb-5 ${isDarkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"}`}
          >
            Yanıtlarınızın İncelenmesi
          </h3>
          {quiz.questions.map((question, index) => {
            const userAnswer = userAnswersFromStorage[question.id]; // userAnswersFromStorage kullanıldı
            const isCorrect = userAnswer === question.correctAnswer;
            const questionData = ensureQuestionSubTopics(question); // Ensure subtopics are present

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-5 rounded-lg shadow-md mb-4 ${
                  isCorrect
                    ? isDarkMode
                      ? "bg-green-900/20 border-l-4 border-green-500"
                      : "bg-green-50 border-l-4 border-green-500"
                    : isDarkMode
                      ? "bg-red-900/20 border-l-4 border-red-500"
                      : "bg-red-50 border-l-4 border-red-500"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4
                    className={`text-md font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
                  >
                    Soru {index + 1}:{" "}
                    <span
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      ({questionData.subTopic || "Genel Konu"})
                    </span>
                  </h4>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCorrect
                        ? isDarkMode
                          ? "bg-green-900/30 text-green-400"
                          : "bg-green-100 text-green-600"
                        : isDarkMode
                          ? "bg-red-900/30 text-red-400"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                </div>
                <p
                  className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {question.questionText}
                </p>
                <div className="space-y-3 text-sm">
                  <div
                    className={`p-3 rounded-md ${
                      isCorrect
                        ? isDarkMode
                          ? "bg-green-900/20 border border-green-800/50"
                          : "bg-green-50 border border-green-200"
                        : isDarkMode
                          ? "bg-red-900/20 border border-red-800/50"
                          : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        isCorrect
                          ? isDarkMode
                            ? "text-green-400"
                            : "text-green-600"
                          : isDarkMode
                            ? "text-red-400"
                            : "text-red-600"
                      }`}
                    >
                      Sizin Cevabınız:{" "}
                      <span
                        className={`font-normal ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {userAnswer || "Boş bırakıldı"}
                      </span>
                    </p>
                  </div>{" "}
                  {!isCorrect && (
                    <div
                      className={`p-3 rounded-md ${isDarkMode ? "bg-green-900/20 border border-green-800/50" : "bg-green-50 border border-green-200"}`}
                    >
                      <p
                        className={`font-medium ${isDarkMode ? "text-green-400" : "text-green-600"}`}
                      >
                        Doğru Cevap:{" "}
                        <span
                          className={`font-normal ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {typeof question.correctAnswer === "object" &&
                          question.correctAnswer !== null &&
                          "text" in question.correctAnswer
                            ? question.correctAnswer.text
                            : question.correctAnswer}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                {question.explanation && (
                  <div
                    className={`mt-4 pt-3 ${isDarkMode ? "border-t border-gray-700" : "border-t border-gray-200"}`}
                  >
                    <p
                      className={`text-xs font-medium mb-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                    >
                      Açıklama:
                    </p>
                    <p
                      className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {question.explanation}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10 mb-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            <div
              className={`absolute inset-0 rounded-lg blur opacity-30 group-hover:opacity-40 transition-opacity ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
            ></div>
            <Link
              href="/exams"
              className={`relative flex items-center justify-center px-7 py-3.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg ${isDarkMode ? "bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 border border-gray-700/50" : "bg-white/90 hover:bg-gray-50/90 text-gray-700 border border-gray-200/50"}`}
            >
              <ListChecks
                size={18}
                className={`mr-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              />
              Sınav Listesi
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            <div
              className={`absolute inset-0 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity ${isDarkMode ? "bg-blue-500" : "bg-blue-400"}`}
            ></div>
            <Link
              href={`/performance/quiz/${quiz.id}`}
              className={`relative flex items-center justify-center px-7 py-3.5 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${isDarkMode ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white" : "bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white"}`}
            >
              <BarChart3 size={18} className="mr-2" />
              Detaylı Performans Analizi
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Tüm sorular cevaplandı mı?
  const allAnswered =
    quiz &&
    quiz.questions.every(
      (q) => userAnswers[q.id] !== undefined && userAnswers[q.id] !== "",
    );

  // Yükleme durumu
  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"} p-4`}
      >
        <div
          className={`text-center p-8 rounded-2xl shadow-xl ${isDarkMode ? "bg-gray-800/70 border border-gray-700/50" : "bg-white/90 border border-gray-200/50"} backdrop-blur-lg`}
        >
          <div
            className={`w-20 h-20 border-4 ${isDarkMode ? "border-blue-500 border-t-blue-500/20" : "border-blue-600 border-t-blue-600/20"} rounded-full animate-spin mx-auto mb-6`}
          ></div>
          <h2
            className={`text-2xl font-semibold mb-2 ${isDarkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"}`}
          >
            Sınav Yükleniyor...
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Lütfen bekleyin, sınavınız hazırlanıyor.
          </p>
        </div>
      </div>
    );
  }

  // Sınav bulunamadı
  if (!quiz) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"} p-4`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`text-center p-8 rounded-xl shadow-xl max-w-md ${isDarkMode ? "bg-gray-800/80 border border-gray-700/60" : "bg-white/90 border border-gray-200/60"} backdrop-blur-lg`}
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? "bg-red-500/10" : "bg-red-500/10"}`}
          >
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2
            className={`text-3xl font-bold mb-4 ${isDarkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300" : "text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500"}`}
          >
            Sınav Bulunamadı
          </h2>
          <p
            className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-8`}
          >
            Aradığınız sınav mevcut değil veya erişim yetkiniz bulunmuyor.
            Lütfen sınav listesine geri dönün.
          </p>
          <Link
            href="/exams"
            className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
          >
            <ChevronLeft size={20} className="mr-2" />
            Sınav Listesine Dön
          </Link>
        </motion.div>
      </div>
    );
  }

  // This is defined after all the other render functions to ensure it has access to them
  const renderExam = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${
              isDarkMode ? "border-blue-400" : "border-blue-600"
            }`}
          ></div>
          <p
            className={`mt-4 text-lg font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Sınav yükleniyor...
          </p>
        </div>
      );
    }

    if (showResults) {
      return renderResults();
    }

    return (
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          className={`sticky top-0 z-10 py-2 px-4 rounded-lg mb-3 flex items-center ${isDarkMode ? "bg-gray-800/80 backdrop-blur-md shadow-lg border border-gray-700/50" : "bg-white/90 backdrop-blur-md shadow-md border border-gray-200/50"}`}
        >
          <Link
            href="/exams"
            className={`mr-3 p-2 rounded-full transition-all duration-200 ${isDarkMode ? "bg-gray-700/70 hover:bg-gray-600/70 text-gray-300 hover:text-white" : "bg-gray-100/70 hover:bg-gray-200/70 text-gray-600 hover:text-gray-800"}`}
          >
            <ChevronLeft size={20} />
          </Link>
          <h1
            className={`text-xl font-medium ${isDarkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"}`}
          >
            Sınav
          </h1>

          {/* Timer gösterimi */}
          {remainingTime !== null && (
            <div className="ml-auto flex items-center">
              <div
                className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  remainingTime < 60
                    ? isDarkMode
                      ? "bg-red-900/40 text-red-300 border border-red-700/50"
                      : "bg-red-100 text-red-700 border border-red-200/70"
                    : isDarkMode
                      ? "bg-blue-900/30 text-blue-300 border border-blue-700/40"
                      : "bg-blue-50 text-blue-700 border border-blue-200/70"
                }`}
              >
                <Clock
                  size={14}
                  className={`mr-1.5 ${remainingTime < 60 ? (isDarkMode ? "text-red-400" : "text-red-500") : ""}`}
                />
                <span
                  className={`font-mono ${remainingTime < 60 ? "font-bold" : ""}`}
                >
                  {formatTime(remainingTime)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress and question stats */}
        <div className="relative mb-8">
          {/* Progress bar */}
          <div
            className={`h-3 w-full rounded-full mb-6 overflow-hidden ${
              isDarkMode ? "bg-slate-700/50" : "bg-gray-200/80"
            }`}
          >
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                  : "bg-gradient-to-r from-blue-600 to-purple-600"
              }`}
              style={{
                width: `${(Object.keys(userAnswers).length / quiz.questions.length) * 100}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm">
              <span
                className={`font-medium ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {Object.keys(userAnswers).length}
              </span>
              <span
                className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {" "}
                / {quiz.questions.length} cevaplandı
              </span>
            </div>
          </div>
        </div>

        {/* All questions display */}
        <div className="space-y-12 mb-10">
          {quiz.questions.map((question, index) => (
            <div
              key={question.id}
              id={`question-${index}`}
              className="scroll-mt-24"
            >
              {renderQuestion(question, index)}
            </div>
          ))}
        </div>

        {/* New "Sınavı Bitir" button as per Prompt 3 */}
        <div className="flex justify-center">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleFinishExam}
              disabled={isLoadingFinishExam}
              size="lg"
              className={`px-8 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500"
              }`}
            >
              {isLoadingFinishExam ? "Bitiriliyor..." : "Sınavı Bitir"}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen pt-20 relative z-0 selection:bg-blue-500/30 ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200" : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800"}`}
    >
      <div className="container mx-auto px-4 py-4 md:py-8">{renderExam()}</div>
    </div>
  );
}
