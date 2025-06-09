/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import {
  FiTarget,
  FiZap,
  FiAward,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentUploader } from "../document";
import TopicSelectionScreen from "./TopicSelectionScreen";
import { ErrorService } from "@/services/error.service";
import ExamCreationProgress from "./ExamCreationProgress";
import CourseTopicSelector from "./CourseTopicSelector";
import courseService from "@/services/course.service";
import learningTargetService from "@/services/learningTarget.service";
import documentService from "@/services/document.service";
import axios from "axios";
import {
  Course,
  DetectedSubTopic,
  QuizPreferences,
  QuizGenerationOptions,
} from "@/types";
import { toast } from "react-hot-toast";
import quizService from "@/services/quiz.service";
import { SubTopicItem as SubTopic } from "@/types/quiz.type"; // Updated import
import { LearningTarget } from "@/types/learningTarget.type";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ApiError } from "@/services/error.service"; 
import { Quiz } from "@/types";
import { downloadExamAsMarkdown } from "@/lib/examFileUtils";

interface ExamCreationWizardProps {
  quizType: "quick" | "personalized"; // Dışarıdan gelen sınav türü
  initialDocumentId?: string; // URL'den gelen belge ID'si
  initialTopics?: string[]; // URL'den gelen konular
  onComplete?: (result: {
    file: File | null;
    quizType: "quick" | "personalized";
    personalizedQuizType?:
      | "weakTopicFocused"
      | "learningObjectiveFocused"
      | "newTopicFocused"
      | "comprehensive";
    preferences: QuizPreferences;
    topicNameMap: Record<string, string>;
    quiz?: Quiz; // Quiz nesnesi (quiz.service.ts'den dönen)
    quizId?: string;
    documentId?: string;
    status?: 'success' | 'error';
    error?: Error | ApiError; // Hata durumu
  }) => void;
}

// API yanıt tipleri için interface tanımları
interface TopicResponse {
  subTopicName: string;
  normalizedSubTopicName: string;
}

interface TopicsResponseData {
  topics?: TopicResponse[];
  message?: string;
}

export default function ExamCreationWizard({
  quizType, // Dışarıdan gelen sınav türü
  initialDocumentId,
  initialTopics,
  onComplete,
}: ExamCreationWizardProps) {
  const router = useRouter();

  // Adım yönetimi
  const [currentStep, setCurrentStep] = useState(1);
  // Kişiselleştirilmiş sınav için 5 adım, hızlı sınav için 3 adım
  const totalSteps = quizType === "personalized" ? 5 : 3;

  // Dosya yükleme durumu
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  // Konu tespiti durumu için yeni state
  const [topicDetectionStatus, setTopicDetectionStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Seçilen konuları takip etmek için state (TopicSelectionScreen için)
  const [selectedTopicsList, setSelectedTopicsList] = useState<string[]>(initialTopics || []);
  const [onInitialLoad, setOnInitialLoad] = useState<boolean>(true);

  // Sınav oluşturma durumu için yeni state
  const [quizCreationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Belge metni ve belge ID'si
  const [documentTextContent, setDocumentTextContent] = useState<string>("");
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string>(initialDocumentId || "");
  
  // Seçilen konular (alt konu olarak)
  const [selectedTopics, setSelectedTopics] = useState<SubTopic[]>([]);

  // Kişiselleştirilmiş sınav alt türü - sadece personalized modda kullanılıyor
  const [personalizedQuizType, setPersonalizedQuizType] = useState<
    "weakTopicFocused" | "learningObjectiveFocused" | "newTopicFocused" | "comprehensive"
  >("comprehensive");

  // Tercihler
  const [preferences, setPreferences] = useState<QuizPreferences>({
    questionCount: 10,
    difficulty: "mixed",
    timeLimit: undefined,
    personalizedQuizType: quizType === "personalized" ? "comprehensive" : undefined, 
  });
  const [useTimeLimit, setUseTimeLimit] = useState<boolean>(false);

  // Kurs ve konu seçimi
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedSubTopicIds, setSelectedSubTopicIds] = useState<string[]>([]);

  // Kurslar ve konu/alt konu state'leri
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [newCourseName, setNewCourseName] = useState<string>(""); // Yeni ders adı için state
  const [creatingCourse, setCreatingCourse] = useState<boolean>(false); // Ders oluşturma durumu için state
  const [showNewCourseForm, setShowNewCourseForm] = useState<boolean>(false); // Yeni ders formu gösterme state'i
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseTopics, setCourseTopics] = useState<DetectedSubTopic[]>([]);
  const [topicSubTopics, setTopicSubTopics] = useState<DetectedSubTopic[]>([]);

  // Tespit edilen konular
  const [detectedTopics, setDetectedTopics] = useState<DetectedSubTopic[]>([]);

  // Öğrenme hedefleri state'i (alt konular -> pending)
  const [learningTargets, setLearningTargets] = useState<LearningTarget[]>([]);

  // Ders seçim işleyici fonksiyonu
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    
    // Seçilen derse bağlı konuları yükle
    if (courseId) {
      // Örnek veri - backend entegrasyonu daha sonra yapılacak
      // Şu anda örnek konular oluşturuyoruz
      const mockTopics: DetectedSubTopic[] = [
        {
          id: `topic-${Date.now()}-1`,
          subTopicName: "Temel Kavramlar",
          normalizedSubTopicName: "temel-kavramlar",
          status: "medium",
          isSelected: false
        },
        {
          id: `topic-${Date.now()}-2`,
          subTopicName: "Uygulama Geliştirme",
          normalizedSubTopicName: "uygulama-gelistirme",
          status: "pending",
          isSelected: false
        },
        {
          id: `topic-${Date.now()}-3`,
          subTopicName: "Veri Yapıları",
          normalizedSubTopicName: "veri-yapilari",
          status: "mastered",
          isSelected: false
        }
      ];
      
      setCourseTopics(mockTopics);
      console.log('[ECW handleCourseChange] Ders konuları yüklendi (örnek veri):', mockTopics.length);
    } else {
      setCourseTopics([]);
      setTopicSubTopics([]);
    }
  };

  // Yeni ders oluşturma işleyici fonksiyonu
  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) {
      ErrorService.showToast("Lütfen geçerli bir ders adı girin", "error");
      return;
    }
    
    // Buton durumunu yükleniyor olarak ayarla
    setCreatingCourse(true);
    
    try {
      // courseService'in createCourse metodunu kullanarak backend'e gerçek bir istek gönder
      // Backend API'si 'description' alanını kabul etmiyor, bu yüzden sadece name alanını gönderiyoruz
      const courseData = { name: newCourseName };
      console.log(`📚 Yeni ders oluşturuluyor: ${newCourseName}`);
      
      // Backend API'sine ders oluşturma isteği gönder
      const createdCourse = await courseService.createCourse(courseData);
      
      console.log(`✅ Ders başarıyla oluşturuldu! ID: ${createdCourse.id}`);
      
      // Yeni oluşturulan dersi kurslar listesine ekle
      setCourses(prevCourses => [...prevCourses, createdCourse]);
      
      // Yeni oluşturulan dersi seç ve adı sıfırla
      setSelectedCourseId(createdCourse.id);
      setNewCourseName("");
      
      // Yeni ders oluşturma formunu gizle
      setShowNewCourseForm(false);
      
      // Başarı mesajı göster
      toast.success("Yeni ders başarıyla oluşturuldu!");
    } catch (error) {
      // Hata durumunda kullanıcıya bilgi ver
      console.error("Ders oluşturma hatası:", error);
      const errorMessage = error instanceof Error && error.message
        ? error.message
        : "Lütfen tekrar deneyin.";
      
      ErrorService.showToast(`Ders oluşturulamadı: ${errorMessage}`, "error");
    } finally {
      // İşlem tamamlandığında buton durumunu normale çevir
      setCreatingCourse(false);
    }
  };
  
  // URL'den belge ID ve konular alındıysa otomatik olarak işle
  useEffect(() => {
    if (initialDocumentId && initialDocumentId.trim() !== "" && currentStep === 1) {
      console.log('[ECW useEffect] URL üzerinden belge ID algılandı:', initialDocumentId);
      setUploadedDocumentId(initialDocumentId);
      
      // Belge metin içeriğini yükle
      documentService.getDocumentText(initialDocumentId)
        .then(response => {
          setDocumentTextContent(response.text);
          console.log('[ECW useEffect] Belge metni yüklendi, uzunluk:', response.text.length);
          
          // Konu teşhisi için adım 2'ye geç
          setCurrentStep(2);
          
          // Belge içeriğinden varsayılan konu oluştur
          if ((!initialTopics || initialTopics.length === 0) && response.text) {
            const defaultTopicId = `belge-${initialDocumentId.substring(0, 8)}`;
            const defaultTopic: DetectedSubTopic = {
              id: defaultTopicId,
              subTopicName: "Belge İçeriği",
              normalizedSubTopicName: defaultTopicId,
              isSelected: true
            };
            
            setDetectedTopics([defaultTopic]);
            setSelectedTopicIds([defaultTopicId]);
            setSelectedSubTopicIds([defaultTopicId]);
            
            const subTopicItem: SubTopic = {
              subTopic: "Belge İçeriği",
              normalizedSubTopic: defaultTopicId
            };
            setSelectedTopics([subTopicItem]);
            
            console.log('[ECW useEffect] Varsayılan konu oluşturuldu:', subTopicItem);
          }
        })
        .catch(error => {
          console.error('[ECW useEffect] Belge metni yüklenirken hata:', error);
          ErrorService.showToast("Belge içeriği yüklenemedi, lütfen tekrar deneyin.", "error");
        });
    }
    
    // İlk konular belirtilmişse
    if (initialTopics && initialTopics.length > 0 && currentStep === 1) {
      console.log('[ECW useEffect] URL üzerinden konular algılandı:', initialTopics);
      setSelectedTopicIds(initialTopics);
      setSelectedSubTopicIds(initialTopics);
      
      // Konu adları bilinmediğinden varsayılan isimleri kullan
      const subTopicItems: SubTopic[] = initialTopics.map((topicId, index) => ({
        subTopic: `Konu ${index + 1}`,
        normalizedSubTopic: topicId
      }));
      
      setSelectedTopics(subTopicItems);
      console.log('[ECW useEffect] URL konuları alt konulara dönüştürüldü:', subTopicItems);
      
      // Belge ve konular hazır, adım 3'e geç
      if (initialDocumentId) {
        setCurrentStep(3);
      }
    }
  }, [initialDocumentId, initialTopics, currentStep]);

  // Kursları yükle
  useEffect(() => {
    courseService.getCourses().then((data) => {
      setCourses(data);
      if (!selectedCourseId && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    });
  }, []);

  // Seçili kurs değişince konuları yükle
  useEffect(() => {
    if (!selectedCourseId) return;
    learningTargetService.getLearningTargets(selectedCourseId).then((targets: LearningTarget[]) => {
      // DetectedSubTopic tipine dönüştür
      const detected: DetectedSubTopic[] = targets.map((t: LearningTarget) => ({
        id: t.id,
        subTopicName: t.subTopicName,
        normalizedSubTopicName: t.normalizedSubTopicName,
        status: t.status,
      }));
      setCourseTopics(detected);
    });
  }, [selectedCourseId]);

  // Seçili konulara göre alt konuları filtrele (örnek: burada alt konu = konu ile aynı, gerçek alt konu ilişkisi yoksa)
  useEffect(() => {
    // Eğer alt konu ilişkisi varsa burada filtrelenmeli, yoksa courseTopics'i kullan
    setTopicSubTopics(
      courseTopics.filter((t) => selectedTopicIds.includes(t.id)),
    );
  }, [selectedTopicIds, courseTopics]);

  // Konu seçimi değiştiğinde alt konu seçimlerini güncelle
  useEffect(() => {
    console.log('[ECW useEffect] selectedTopicIds changed:', JSON.stringify(selectedTopicIds));
    console.log('[ECW useEffect] selectedSubTopicIds before processing:', JSON.stringify(selectedSubTopicIds));
    console.log('[ECW useEffect] topicSubTopics for filtering:', JSON.stringify(topicSubTopics.map(t => t.id)));

    // Önceki seçilen alt konuları filtrele
    const validSubTopicIds = selectedSubTopicIds.filter((id) => {
      const subTopic = topicSubTopics.find(
        (st: DetectedSubTopic) => st.id === id,
      );
      // Ensure subTopic exists and its parent topic (which is subTopic.id itself in this simplified model) is in selectedTopicIds
      // This logic might need adjustment if subTopics have a different parentTopicId field
      return subTopic && selectedTopicIds.includes(subTopic.id); 
    });

    console.log('[ECW useEffect] validSubTopicIds after filtering:', JSON.stringify(validSubTopicIds));

    // Sadece değişiklik varsa state güncelle
    const isSame = validSubTopicIds.length === selectedSubTopicIds.length &&
      validSubTopicIds.every((id, idx) => id === selectedSubTopicIds[idx]);

    if (!isSame) {
      setSelectedSubTopicIds(validSubTopicIds);
      console.log('[ECW useEffect] setSelectedSubTopicIds called with:', JSON.stringify(validSubTopicIds));
      setPreferences((prev) => {
        const newPrefs = {
          ...prev,
          topicIds: [...selectedTopicIds],
          subTopicIds: [...validSubTopicIds],
        };
        console.log('[ECW useEffect] Preferences updated (due to subTopicIds change):', JSON.stringify(newPrefs));
        return newPrefs;
      });
    } else {
      // Eğer değişiklik yoksa yine de preferences güncellensin ki step geçişlerinde kaybolmasın
      // This part ensures preferences.topicIds is also up-to-date if only selectedTopicIds changed without affecting subTopicIds selection logic
      setPreferences((prev: QuizPreferences) => {
        const newPrefs = {
          ...prev,
          topicIds: [...selectedTopicIds], // Ensure latest selectedTopicIds are in prefs
          subTopicIds: [...validSubTopicIds], // And latest validSubTopicIds
        };
        // Log only if there's a meaningful change to preferences from selectedTopicIds part
        if (JSON.stringify(prev.topicIds) !== JSON.stringify(selectedTopicIds) || JSON.stringify(prev.subTopicIds) !== JSON.stringify(validSubTopicIds)) {
            console.log('[ECW useEffect] Preferences updated (potentially from selectedTopicIds directly or ensuring consistency):', JSON.stringify(newPrefs));
        }
        return newPrefs;
      });
    }
  }, [selectedTopicIds, selectedSubTopicIds, topicSubTopics]);

  // Dosya yükleme işlemi tamamlandığında
  const handleFileUploadComplete = async (file: File) => {
    setSelectedFile(file);
    setUploadStatus("success");
    // Belge metnini temizle (yeni dosya yüklendiğinde)
    setDocumentTextContent("");
    // Document ID'yi sıfırla
    setUploadedDocumentId("");
    console.log(`📂 Dosya yükleme başarılı: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Kişiselleştirilmiş sınav için, dosya yüklendikten sonra hemen konuları tespit et
    if (quizType === "personalized") {
      console.log(`🔎 Kişiselleştirilmiş sınav için konu tespiti başlatılıyor...`);
      setTopicDetectionStatus("loading");
      // Konu tespiti için dosyayı gönder
      detectTopicsFromUploadedFile(file);
    }
  };

  // Dosya yükleme hatası
  const handleFileUploadError = (errorMsg: string) => {
    console.error(`❌ HATA: Dosya yükleme hatası: ${errorMsg}`);
    setUploadStatus("error");
    ErrorService.showToast(errorMsg, "error");
  };

  // Konuları tespit et
  const handleTopicsDetected = (selectedTopics: string[], courseId: string) => {
    console.log('[ECW handleTopicsDetected] Received selectedTopics:', JSON.stringify(selectedTopics));
    console.log('[ECW handleTopicsDetected] Received courseId:', courseId);

    if (courseId) {
      setSelectedCourseId(courseId);
    }

    if (selectedTopics && selectedTopics.length > 0) {
      setSelectedTopicIds(selectedTopics); // Update state
      console.log('[ECW handleTopicsDetected] setSelectedTopicIds called with:', JSON.stringify(selectedTopics));
      
      // Alt konular oluştur ve güncelle
      const subTopicItems: SubTopic[] = selectedTopics.map(topicId => {
        const topic = detectedTopics.find(t => t.id === topicId);
        if (!topic) {
          console.warn(`[ECW handleTopicsDetected] UYARI: ${topicId} ID'li konu bulunamadı!`);
          return {
            subTopic: topicId,  // Konu bulunamazsa ID'yi kullan
            normalizedSubTopic: topicId
          };
        }
        return {
          subTopic: topic.subTopicName,
          normalizedSubTopic: topic.id
        };
      });
      
      console.log('[ECW handleTopicsDetected] Created subTopicItems:', JSON.stringify(subTopicItems));
      setSelectedTopics(subTopicItems);
      
      // --- ÖNEMLİ: Alt konulardan öğrenme hedefleri oluştur (status: pending) ---
      const initialTargets: LearningTarget[] = selectedTopics.map(topicId => {
        const topic = detectedTopics.find(t => t.id === topicId);
        return {
          id: topicId,
          courseId: selectedCourseId,
          userId: 'current-user', // örnek
          subTopicName: topic?.subTopicName || topicId,
          normalizedSubTopicName: topic?.normalizedSubTopicName || topicId,
          status: 'pending',
          failCount: 0,
          mediumCount: 0,
          successCount: 0,
          lastAttemptScorePercent: 0,
          firstEncountered: new Date().toISOString(),
        };
      });
      setLearningTargets(initialTargets);
      console.log('[ECW handleTopicsDetected] Öğrenme hedefleri (pending) oluşturuldu:', initialTargets);
      // --- ---
      
      // Alt konu ID'lerini güncelle
      const subTopicIds = selectedTopics.map(topicId => topicId);
      setSelectedSubTopicIds(subTopicIds);
      console.log('[ECW handleTopicsDetected] setSelectedSubTopicIds called with:', JSON.stringify(subTopicIds));
      
      // Tercihleri güncelle
      setPreferences(prev => ({
          ...prev,
        topicIds: selectedTopics,
        subTopicIds: subTopicIds
      }));
    } else {
      // Seçilen konular boş ama belge ID varsa, varsayılan bir konu oluştur
      if (uploadedDocumentId) {
        console.log('[ECW handleTopicsDetected] Seçilen konular boş ancak belge yüklenmiş, varsayılan konu oluşturuluyor');
        
        const fileName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "Belge İçeriği";
        const defaultTopicId = `default-${uploadedDocumentId.substring(0, 8)}`;
        
        // Tek bir varsayılan konu oluştur
        const defaultTopics = [defaultTopicId];
        setSelectedTopicIds(defaultTopics);
        
        // Aynı konu ID'sini alt konu olarak da kullan
        setSelectedSubTopicIds(defaultTopics);
        
        // Görüntülenecek alt konu nesnesi oluştur
        const subTopicItem: SubTopic = {
          subTopic: fileName,
          normalizedSubTopic: defaultTopicId
        };
        setSelectedTopics([subTopicItem]);
        
        console.log('[ECW handleTopicsDetected] Varsayılan konu oluşturuldu:', defaultTopicId, fileName);
        
        // Tercihleri güncelle
        setPreferences(prev => ({
          ...prev,
          topicIds: defaultTopics,
          subTopicIds: defaultTopics
        }));
      }
    }
    
    // Adım 3'e geç
    if (currentStep === 2) {
    setCurrentStep(3);
    }
  };

  // Konu tespiti iptal
  const handleTopicDetectionCancel = () => {

    setCurrentStep(3);
  };

  // Konu seçimini değiştir
  const handleTopicToggle = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  // Konu seçimlerini değiştirme fonksiyonu - topicSelectionScreen için
  const handleTopicSelectionChange = (selectedTopicIds: string[]) => {
    console.log(`[ECW handleTopicSelectionChange] Konu seçimleri değişiyor: ${selectedTopicIds.length} konu seçildi`);
    
    // Hızlı sınav yaklaşımı: Eğer hiç konu seçilmemişse, tüm konuları seç
    if (selectedTopicIds.length === 0 && detectedTopics.length > 0) {
      console.log(`[ECW handleTopicSelectionChange] Hiç konu seçilmedi, tüm konular otomatik seçiliyor.`);
      selectedTopicIds = detectedTopics.map(topic => topic.id);
    }
    
    // Maksimum 10 konu seçilebilir - sınırlama ekle
    const MAX_TOPICS = 10;
    
    // Seçilen konu sayısı 10'dan fazla ise, sadece ilk 10'unu al
    if (selectedTopicIds.length > MAX_TOPICS) {
      console.warn(`[ECW handleTopicSelectionChange] Seçilen konu sayısı (${selectedTopicIds.length}) maksimum sınırı (${MAX_TOPICS}) aşıyor. İlk ${MAX_TOPICS} konu seçilecek.`);
      selectedTopicIds = selectedTopicIds.slice(0, MAX_TOPICS);
    }
    
    // Seçilen konu ID'lerini güncelle
    setSelectedTopicIds(selectedTopicIds);
    
    // Seçilen konuların listesini de güncelleyelim
    setSelectedTopicsList(selectedTopicIds);
    
    // Konu listesini güncelle
    const updatedTopics: SubTopic[] = selectedTopicIds.map(topicId => {
      const topic = detectedTopics.find(t => t.id === topicId);
      return {
        subTopic: topic ? topic.subTopicName : topicId,
        normalizedSubTopic: topicId
      };
    });
    
    console.log(`[ECW handleTopicSelectionChange] Güncellenmiş konu listesi: ${JSON.stringify(updatedTopics)}`);
    setSelectedTopics(updatedTopics);
    
    // Alt konuları da güncelle
    setSelectedSubTopicIds(selectedTopicIds);
    
    // Tercihleri güncelle
    setPreferences(prev => ({
      ...prev,
      topicIds: selectedTopicIds,
      subTopicIds: selectedTopicIds
    }));
  };

  // Alt konu seçimini değiştir
  const handleSubTopicToggle = (subTopicId: string) => {
    console.log(`🔄 Alt konu seçimi değişiyor: ${subTopicId}`);
    
    setSelectedSubTopicIds((prev) => {
      const updated = prev.includes(subTopicId)
        ? prev.filter((id) => id !== subTopicId)
        : [...prev, subTopicId];
      
      console.log(`${prev.includes(subTopicId) ? "➖ Alt konu kaldırıldı:" : "➕ Alt konu eklendi:"} ${subTopicId}`);
      console.log(`✅ Güncel alt konu sayısı: ${updated.length}`);
      
      // Tercihleri güncelle
      setPreferences((prev) => ({
        ...prev,
        subTopicIds: updated,
      }));
      console.log(`✅ Quiz tercihleri güncellendi. Alt konu ID'leri: ${updated.length} adet`);
      
      return updated;
    });

    // selectedTopics listesini güncelle (handleFinalSubmit'e gönderilecek olan)
    // Alt konu nesnesini bul
    const subTopic = detectedTopics.find(topic => topic.id === subTopicId);
    
    if (subTopic) {
      setSelectedTopics(prev => {
        // Alt konu zaten var mı kontrol et
        const existingIndex = prev.findIndex(item => item.normalizedSubTopic === subTopicId);
        
        if (existingIndex >= 0) {
          // Alt konu varsa listeden çıkar
          console.log(`✅ Konu selectedTopics listesinden kaldırıldı: ${subTopicId}`);
          return prev.filter(item => item.normalizedSubTopic !== subTopicId);
        } else {
          // Alt konu yoksa listeye ekle
          const newSubTopicItem = {
            subTopic: subTopic.subTopicName,
            normalizedSubTopic: subTopicId
          };
          console.log(`✅ Konu selectedTopics listesine eklendi:`, newSubTopicItem);
          return [...prev, newSubTopicItem];
        }
      });
      console.log(`✅ selectedTopics listesi güncellendi. Şu anda seçili konular:`, selectedTopics);
    }};  
  // Kişiselleştirilmiş sınav alt türü
  const handlePersonalizedQuizTypeSelect = (
    type: "weakTopicFocused" | "learningObjectiveFocused" | "newTopicFocused" | "comprehensive",
  ) => {
    console.log(`🔄 Kişiselleştirilmiş sınav alt türü değişiyor: ${personalizedQuizType} -> ${type}`);
    setPersonalizedQuizType(type);
    
    // Tip hatası giderme: QuizPreferences tipine uygun olacak şekilde
    const updatedPreferences: QuizPreferences = {
      ...preferences,
      personalizedQuizType: type,
    };
    
    console.log(`✅ Quiz tercihleri güncellendi: personalizedQuizType = ${type}`);
    setPreferences(updatedPreferences);
    
    // Eğer "Yeni Konular" türü seçilmişse, tespit edilen konuları "yeni" olarak işaretle
    if (type === "newTopicFocused" && detectedTopics.length > 0) {
      // Mevcut konuları güncelle, isNew alanını true olarak ayarla
      const updatedTopics = detectedTopics.map(topic => ({
        ...topic,
        isNew: true
      }));
      
      console.log(`✅ Yeni Konular türü seçildi, ${updatedTopics.length} konu "yeni" olarak işaretlendi`);
      setDetectedTopics(updatedTopics);
    }
  };

  // Tercih işlemleri
  const handlePreferenceChange = (
    key: keyof QuizPreferences,
    value: unknown,
  ) => {
    setPreferences((prev: QuizPreferences) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Zaman sınırı checkbox değişimi
  const handleUseTimeLimitChange = (checked: boolean) => {
    setUseTimeLimit(checked);
    if (!checked) {
      // Zaman sınırı kullanılmıyorsa değeri sıfırla
      handlePreferenceChange("timeLimit", undefined);
    } else {
      // Zaman sınırı ilk kez seçiliyorsa varsayılan bir değer ata (örn: 20dk)
      if (preferences.timeLimit === undefined) {
        handlePreferenceChange("timeLimit", 20);
      }
    }
  };

  // Zaman sınırı input değişimi
  const handleTimeLimitInputChange = (value: string) => {
    const numValue = parseInt(value, 10);
    // Geçerli bir sayı ise veya boş ise güncelle
    if (!isNaN(numValue) && numValue >= 1) {
      handlePreferenceChange("timeLimit", numValue);
    } else if (value === "") {
      // Input boşsa state'i undefined yapabiliriz ama kullanıcı deneyimi için 0 veya 1 gibi min değer daha iyi olabilir.
      // Şimdilik minimum 1 varsayalım.
      handlePreferenceChange("timeLimit", 1);
    }
  };

  // Adım işlemleri
  const nextStep = () => {
    console.log(`📋 SINAV OLUŞTURMA AŞAMASI: ${currentStep}/${totalSteps} adımdan bir sonrakine geçiliyor...`);
    
    // Adım 1 Doğrulama: Quizz Type'a göre farklı doğrulama
    if (currentStep === 1) {
      // Kişiselleştirilmiş sınav için Adım 1: Ders Seçimi kontrolü
      if (quizType === "personalized") {
        if (!selectedCourseId) {
          console.error(`❌ HATA: Ders seçimi yapılmadı.`);
          ErrorService.showToast("Lütfen bir ders seçin veya oluşturun.", "error");
          return;
        }
      } 
      // Hızlı sınav için Adım 1: Dosya Yükleme kontrolü
      else if (quizType === "quick" && (!selectedFile || uploadStatus !== "success")) {
        console.error(`❌ HATA: Dosya yükleme başarısız. Durum: ${uploadStatus}`);
        ErrorService.showToast("Lütfen geçerli bir dosya yükleyin.", "error");
        return;
      }
    }
    
    // Adım 3 Doğrulama: Kişiselleştirilmiş Sınav için Dosya Yükleme
    if (currentStep === 3 && quizType === "personalized" && (!selectedFile || uploadStatus !== "success")) {
      console.error(`❌ HATA: Dosya yükleme başarısız. Durum: ${uploadStatus}`);
      ErrorService.showToast("Lütfen geçerli bir dosya yükleyin.", "error");
      return;
    }

    // Eğer adım 1'den 2'ye geçiyorsak ve dosya yüklüyse konu tespitini başlat
    if (currentStep === 1 && selectedFile && uploadStatus === "success" && topicDetectionStatus !== "loading") {
      // Zayıf/Orta odaklı kişiselleştirilmiş sınav için konu tespiti atlanabilir
      if (quizType === "personalized" && personalizedQuizType === "weakTopicFocused") {
        console.log(`🔄 Akış değişikliği: Zayıf/Orta odaklı sınav türü için Adım 1'den Adım 3'e atlıyoruz`);
        setCurrentStep(3);
        return;
      }

      // Konu tespiti durumunu yükleniyor olarak ayarla
      setTopicDetectionStatus("loading");

      // Konu tespiti fonksiyonunu çağır
      detectTopicsFromUploadedFile(selectedFile)
      return;
    }

    // Adım 2 Doğrulama: Kişiselleştirilmiş sınav türünün seçilip seçilmediğini kontrol et
    if (currentStep === 2 && quizType === "personalized" && !personalizedQuizType) {
      console.error(`❌ HATA: Kişiselleştirilmiş sınav türü seçilmedi.`);
      ErrorService.showToast("Lütfen bir sınav türü seçin.", "error");
      return;
    }
    
    // Adım 4 Doğrulama: Konu Seçimi (Alt konuların seçildiği adım)
    if (
      currentStep === 4 &&
      quizType === "personalized" &&
      personalizedQuizType !== "weakTopicFocused" &&
      selectedTopicIds.length === 0
    ) {
      console.error(`❌ HATA: Alt konu seçimi yapılmadı. Seçilen konular: ${selectedTopicIds.length}`);
      ErrorService.showToast("Lütfen en az bir alt konu seçin.", "error");
      return;
    }

    if (currentStep < totalSteps) {
      let nextStepNumber = currentStep + 1;

      // Akış Atlama Mantığı
      // Zayıf/Orta Odaklı: Adım 1'den Adım 3'e atla (Konu Seçimi yok)
      if (
        quizType === "personalized" &&
        personalizedQuizType === "weakTopicFocused" &&
        currentStep === 1
      ) {
        console.log(`🔄 Akış değişikliği: Zayıf/Orta odaklı sınav türü için Adım 1'den Adım 3'e atlıyoruz`);
        nextStepNumber = 3;
      }

      console.log(`✅ Adım ${currentStep}'den Adım ${nextStepNumber}'e ilerletiliyor...`);
      setCurrentStep(nextStepNumber);
    } else {
      // Son adımda handleFinalSubmit fonksiyonunu çağır
      handleFinalSubmit();
    }
  };

  // Bir önceki adıma dön
  const prevStep = () => {
    console.log(`⏪ GERİ: Adım ${currentStep}'den bir öncekine dönülüyor...`);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    if (currentStep > 1) {
      let prevStep = currentStep - 1;

      // Konu Seçimini Atlayan Durumlar İçin Geri Gitme Mantığı
      if (
        quizType === "personalized" &&
        personalizedQuizType === "weakTopicFocused" &&
        currentStep === 3
      ) {
        console.log(`🔄 Akış değişikliği: Zayıf/Orta odaklı sınav türü için Adım 3'ten Adım 1'e dönüyoruz`);
        prevStep = 1;
      }

      console.log(`✅ Adım ${currentStep}'den Adım ${prevStep}'e geri dönülüyor...`);
      setCurrentStep(prevStep);
    } else {
      // İlk adımda geri butonuna tıklandığında ana sayfaya dön
      console.log('🏠 İlk adımda geri butonuna tıklandı, ana sayfaya dönülüyor...');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('wizard');
      
      // Next.js router ile ana sayfaya dön
      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      router.push(newUrl);
    }
  };

  // CourseTopicSelector ve TopicSelectionScreen arasında uyumluluk sağlayan adapter fonksiyonları
  
  // TopicSelectionScreen için courseId string alacak şekilde adapter
  const handleCourseChangeForTopicSelection = (courseId: string) => {
    setSelectedCourseId(courseId);
    
    // Kurs değiştiğinde seçilen konuları sıfırla
    setSelectedTopicIds([]);
    setSelectedSubTopicIds([]);
  };
  
  // CourseTopicSelector için event alacak şekilde adapter
  const handleCourseChangeAdapter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    handleCourseChangeForTopicSelection(courseId);
  };

  /**
   * TopicSelectionScreen bileşeni
   */
  // TopicSelectionScreenWithAdapter bileşenini kaldırıyorum

  // Dosya adından varsayılan konular oluştur (konu tespit edilemediğinde)
  const generateDefaultTopicsFromFileName = (fileName: string): Array<{
    id: string;
    subTopicName: string;
    normalizedSubTopicName: string;
    isSelected: boolean;
  }> => {
    try {
      // Dosya adını ve uzantısını ayır
      const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
      
      // Dosya adını boşluk, tire, alt çizgi gibi karakterlere göre böl
      const parts = nameWithoutExt.split(/[\s\-_]+/).filter(part => part.length > 2);
      
      // Dosya adı parçaları yeterince anlamlı değilse genel konular kullan
      if (parts.length === 0) {
        return [
          {
            id: 'default-document',
            subTopicName: 'Belge İçeriği',
            normalizedSubTopicName: 'belge-icerigi',
            isSelected: true
          },
          {
            id: 'default-general',
            subTopicName: 'Genel Konular',
            normalizedSubTopicName: 'genel-konular',
            isSelected: false
          }
        ];
      }
      
      // Dosya adı parçalarından konular oluştur
      const topics = parts.map((part, index) => {
        // İlk harfi büyük diğerleri küçük olacak şekilde formatla
        const formattedName = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        const normalizedName = formattedName.toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/[^a-z0-9]/g, '-');
        
        return {
          id: `default-${normalizedName}`,
          subTopicName: formattedName,
          normalizedSubTopicName: normalizedName,
          isSelected: index === 0 // İlk konu otomatik seçili
        };
      });
      
      // Dosya adından oluşturulan konulara ek olarak genel bir konu daha ekle
      topics.push({
        id: 'default-content',
        subTopicName: 'Belge İçeriği',
        normalizedSubTopicName: 'belge-icerigi',
        isSelected: false
      });
      
      return topics;
    } catch (error) {
      console.error(`⚠️ Varsayılan konular oluşturulurken hata:`, error);
      
      // Hata durumunda en basit bir konu listesi döndür
      return [
        {
          id: 'error-default',
          subTopicName: 'Belge İçeriği',
          normalizedSubTopicName: 'belge-icerigi',
          isSelected: true
        }
      ];
    }
  };

  // Bu bölümdeki tekrarlı tanımlar kaldırıldı

  // Yüklenen dosyadan konuları tespit eden fonksiyon
  const detectTopicsFromUploadedFile = async (file: File) => {
    try {
      console.log(`[ECW detectTopicsFromUploadedFile] 📂 Dosya konu tespiti başlatılıyor: ${file.name}`);
      
      let uploadedDocument = null;
      try {
        uploadedDocument = await documentService.uploadDocument(
          file,
          undefined,
          (progress) => {
            console.log(`[ECW detectTopicsFromUploadedFile] 📤 Yükleme ilerleme: %${progress.toFixed(0)}`);
          }
        );
        const documentId = uploadedDocument.id;
        // BELGE ID'SINI STATE'E KAYDET
        setUploadedDocumentId(documentId);
        console.log(`[ECW detectTopicsFromUploadedFile] 📄 Belge yükleme başarılı! Belge ID: ${documentId}`);

        // Belge metni yükleme işlemini hemen başlat
        try {
          console.log(`[ECW detectTopicsFromUploadedFile] 📄 Belge metni yükleniyor (ID: ${documentId})...`);
          const docTextResponse = await documentService.getDocumentText(documentId);
          
          if (docTextResponse && docTextResponse.text && docTextResponse.text.trim() !== '') {
            setDocumentTextContent(docTextResponse.text);
            console.log(`[ECW detectTopicsFromUploadedFile] ✅ Belge metni başarıyla yüklendi (${docTextResponse.text.length} karakter)`);
          } else {
            console.warn(`[ECW detectTopicsFromUploadedFile] ⚠️ Belge metni boş veya geçersiz format`);
          }
        } catch (textError) {
          console.error(`[ECW detectTopicsFromUploadedFile] ❌ Belge metni yüklenirken hata: ${textError instanceof Error ? textError.message : 'Bilinmeyen hata'}`);
          // Metin yükleme hatası olsa bile konu tespiti devam edebilir
        }
      } catch (uploadError) {
        console.error(`[ECW detectTopicsFromUploadedFile] ❌ HATA: Dosya yükleme başarısız! ${uploadError instanceof Error ? uploadError.message : 'Bilinmeyen hata'}`);
        ErrorService.showToast(
          `Dosya yükleme hatası: ${uploadError instanceof Error ? uploadError.message : 'Bilinmeyen hata'}`,
          "error"
        );
        setTopicDetectionStatus("error");
        return;
      }

      const documentId = uploadedDocument?.id;
      if (documentId) {
        try {
          console.log(`[ECW detectTopicsFromUploadedFile] 🔍 Belge ID ${documentId} için konu tespiti başlatılıyor...`);
          const detectedTopicsRequest = {
            documentId: documentId,
            ...(quizType === "personalized" && selectedCourseId ? { courseId: selectedCourseId } : {})
          };
          console.log(`[ECW detectTopicsFromUploadedFile] 📤 Konu tespiti isteği gönderilecek:`, detectedTopicsRequest);
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (quizType === "personalized") {
            try {
              const token = localStorage.getItem("auth_token");
              if (!token) console.warn("[ECW detectTopicsFromUploadedFile] ⚠️ Token bulunamadı, anonim istek gönderilecek");
              else { headers['Authorization'] = `Bearer ${token}`; console.log("[ECW detectTopicsFromUploadedFile] 🔑 Authorization token başarıyla eklendi"); }
            } catch (tokenError) {
              console.warn(`[ECW detectTopicsFromUploadedFile] ⚠️ Token alma hatası: ${tokenError instanceof Error ? tokenError.message : 'Bilinmeyen hata'}`);
            }
          }
          console.log(`[ECW detectTopicsFromUploadedFile] 🔍 ${quizType === "personalized" ? "Yetkilendirilmiş" : "Anonim"} konu tespiti isteği gönderiliyor...`);
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/learning-targets/detect-topics`;
          console.log(`[ECW detectTopicsFromUploadedFile] 🌐 API isteği: POST ${apiUrl}`);
          
          const response = await axios.post(apiUrl, detectedTopicsRequest, { headers });
          console.log(`[ECW detectTopicsFromUploadedFile] ✅ Konu tespiti yanıtı alındı. Durum kodu: ${response.status}`);
          console.log(`[ECW detectTopicsFromUploadedFile] 📊 Yanıt verileri:`, JSON.stringify(response.data));
          
          if (!response.data) {
            console.error(`[ECW detectTopicsFromUploadedFile] ❌ HATA: Boş yanıt alındı!`);
            ErrorService.showToast("Yanıt alınamadı. Lütfen tekrar deneyin.", "error");
            setTopicDetectionStatus("error");
            return;
          }
          
          let processedTopics: DetectedSubTopic[] = [];
          const responseData = response.data as TopicsResponseData | DetectedSubTopic[] | string[];
          console.log(`[ECW detectTopicsFromUploadedFile] 🔍 Yanıt formatı değerlendiriliyor:`, { isObject: typeof responseData === 'object', hasTopics: responseData && 'topics' in responseData, isArray: Array.isArray(responseData), type: typeof responseData });
          
          const generateId = (base: string = 'generated') => `${base}-${Math.random().toString(36).substring(2, 9)}`;
          
          // Türkçe karakterleri koruyan daha iyi bir normalleştirme fonksiyonu
          const normalizeStr = (str: string = '') => {
            if (!str) return '';
            
            // Adım 1: Trim yapılır
            const trimmed = str.trim();
            
            // Adım 2: Küçük harfe dönüştürülür
            const lowercased = trimmed.toLowerCase();
            
            // Adım 3: Boşluklar çizgiye dönüştürülür
            const replaced = lowercased.replace(/\s+/g, '-');
            
            // Adım 4: Diğer özel karakterler temizlenir ama Türkçe karakterler korunur
            const normalized = replaced.replace(/[^a-z0-9çğıöşüñ\-]/g, '');
            
            console.log(`[ECW normalizeStr] Normalleştirme: "${str}" --> "${normalized}"`);
            
            return normalized;
          };

          if (responseData && typeof responseData === 'object' && 'topics' in responseData && Array.isArray((responseData as TopicsResponseData).topics)) {
            console.log(`[ECW detectTopicsFromUploadedFile] 📋 Yeni API formatı tespit edildi (topics nesnesi)`);
            processedTopics = (responseData as TopicsResponseData).topics!.map((topic: TopicResponse): DetectedSubTopic => ({
              id: topic.normalizedSubTopicName || topic.subTopicName || generateId('topic'),
              subTopicName: topic.subTopicName || 'Bilinmeyen Konu',
              normalizedSubTopicName: normalizeStr(topic.normalizedSubTopicName || topic.subTopicName),
              isSelected: false,
              status: undefined, 
              isNew: undefined,
              parentTopic: undefined,
            }));
            console.log(`[ECW detectTopicsFromUploadedFile] ✓ ${processedTopics.length} konu işlendi (yeni format)`);
          } else if (Array.isArray(responseData)) {
            console.log(`[ECW detectTopicsFromUploadedFile] 📋 Eski API formatı tespit edildi (dizi)`);
            processedTopics = responseData.map((topic: unknown, index: number): DetectedSubTopic => {
              if (typeof topic === 'string') {
                return {
                  id: normalizeStr(topic) || generateId(`str-${index}`),
                  subTopicName: topic, 
                  normalizedSubTopicName: normalizeStr(topic),
                  isSelected: false,
                  status: undefined, 
                  isNew: personalizedQuizType === "newTopicFocused" ? true : undefined, 
                  parentTopic: undefined,
                };
              } else if (typeof topic === 'object' && topic !== null) {
                  const t = topic as Partial<DetectedSubTopic & { name?: string }>;
                  return {
                    id: normalizeStr(String(t.id || t.normalizedSubTopicName || t.subTopicName)) || generateId(`obj-${index}`),
                    subTopicName: String(t.subTopicName || t.name || `Bilinmeyen Konu ${index + 1}`),
                    normalizedSubTopicName: normalizeStr(String(t.normalizedSubTopicName || t.id || t.subTopicName)),
                    isSelected: false,
                    status: t.status, 
                    // Eğer "newTopicFocused" ise ve t.isNew tanımlı değilse, true olarak ayarla
                    isNew: personalizedQuizType === "newTopicFocused" ? true : t.isNew, 
                    parentTopic: t.parentTopic,
                  };
              }
              // Fallback for unexpected topic structure
              console.warn('[ECW detectTopicsFromUploadedFile] Unexpected topic structure in array:', topic);
              return {
                id: generateId(`fallback-${index}`),
                subTopicName: 'Hatalı Konu Yapısı',
                normalizedSubTopicName: 'hatali-konu-yapisi',
                isSelected: false,
                status: undefined, 
                isNew: personalizedQuizType === "newTopicFocused" ? true : undefined, 
                parentTopic: undefined,
              };
            });
            console.log(`[ECW detectTopicsFromUploadedFile] ✓ ${processedTopics.length} konu işlendi (eski format - dizi)`);
          } else {
            console.error(`[ECW detectTopicsFromUploadedFile] ❌ HATA: Beklenmeyen API yanıt formatı:`, responseData);
            processedTopics = [];
          }
          
          console.log(`[ECW detectTopicsFromUploadedFile] 📊 Son işlenen konular (${processedTopics.length}):`, JSON.stringify(processedTopics.map(t => ({id: t.id, name: t.subTopicName, selected: t.isSelected}))));
          
          if (processedTopics.length > 0) {
            // Hızlı sınav yaklaşımı: Tüm konuları otomatik olarak seçili hale getir
            const selectedTopics = processedTopics.map(topic => ({
              ...topic,
              isSelected: true,
              // "Yeni Konular" özelliği için konuları "yeni" olarak işaretle
              isNew: personalizedQuizType === "newTopicFocused" ? true : topic.isNew
            }));
            
            setDetectedTopics(selectedTopics);
            setTopicDetectionStatus("success");
            console.log(`[ECW detectTopicsFromUploadedFile] ✅ Konu tespiti başarılı, adım 2'ye geçiliyor.`);
            setCurrentStep(2); 
            ErrorService.showToast(`${processedTopics.length} konu tespit edildi.`, "success");

            // Hızlı sınav yaklaşımı: Tüm konuları otomatik olarak seç
            const allTopicIds = selectedTopics.map(topic => topic.id);
            
            // Maksimum 10 konu sınırlaması
            const MAX_TOPICS = 10;
            const limitedTopicIds = allTopicIds.length > MAX_TOPICS ? allTopicIds.slice(0, MAX_TOPICS) : allTopicIds;
            
            if (allTopicIds.length > MAX_TOPICS) {
              console.warn(`[ECW detectTopicsFromUploadedFile] Tespit edilen konu sayısı (${allTopicIds.length}) maksimum sınırı (${MAX_TOPICS}) aşıyor. İlk ${MAX_TOPICS} konu seçilecek.`);
            }
            
            setSelectedTopicIds(limitedTopicIds);
            setSelectedSubTopicIds(limitedTopicIds); 
            setPreferences(prev => ({ 
              ...prev, 
              topicIds: limitedTopicIds,
              subTopicIds: limitedTopicIds 
            }));
            console.log(`[ECW detectTopicsFromUploadedFile] Tüm konular (${limitedTopicIds.length}) otomatik seçildi.`);
            
            // Kişiselleştirilmiş sınav için adım 4'e (alt konu seçimi) geç
            if (quizType === "personalized") {
              console.log(`[ECW detectTopicsFromUploadedFile] ✅ Kişiselleştirilmiş sınav için adım 4'e (alt konu seçimi) geçiliyor.`);
              setCurrentStep(4);
              // Başarı mesajı göster
              ErrorService.showToast(`${processedTopics.length} alt konu tespit edildi. Şimdi istediğiniz alt konuları seçebilirsiniz.`, "success");
            } else {
              // Hızlı sınav için adım 2'ye geç
              setCurrentStep(2);
              ErrorService.showToast(`${processedTopics.length} konu tespit edildi.`, "success");
            }
          } else { 
            console.warn(`[ECW detectTopicsFromUploadedFile] ⚠️ UYARI: Tespit edilen konu yok!`);
            ErrorService.showToast("Belgede konu tespit edilemedi. Varsayılan konular kullanılacak.", "info");
            
            // Varsayılan bir konu oluştur
            const defaultTopicId = `default-${uploadedDocumentId.substring(0, 8)}`;
            const defaultTopicName = selectedFile 
              ? selectedFile.name.replace(/\.[^/.]+$/, "") // Dosya uzantısını kaldır
              : "Belge İçeriği";
            
            const defaultTopic: DetectedSubTopic = {
              id: defaultTopicId,
              subTopicName: defaultTopicName,
              normalizedSubTopicName: defaultTopicName.toLowerCase().replace(/\s+/g, '-'),
              isSelected: true,
              status: undefined,
              // "Yeni Konular" özelliği için varsayılan olarak işaretle
              isNew: personalizedQuizType === "newTopicFocused" ? true : undefined
            };
            
            const defaultTopics = [defaultTopic];
              setDetectedTopics(defaultTopics);
              setTopicDetectionStatus("success");
            
            setSelectedTopicIds([defaultTopicId]);
            setSelectedSubTopicIds([defaultTopicId]);
            
            // Alt konu olarak da ekle
            const subTopicItem: SubTopic = {
              subTopic: defaultTopicName,
              normalizedSubTopic: defaultTopicId // Değiştirildi: ID'yi kullan, daha tutarlı olması için
            };
            setSelectedTopics([subTopicItem]);
            
            setPreferences(prev => ({
              ...prev,
              topicIds: [defaultTopicId],
              subTopicIds: [defaultTopicId]
            }));
            
            console.log('[ECW detectTopicsFromUploadedFile] ℹ️ Varsayılan konu oluşturuldu, adım 2\'ye geçiliyor.');
              setCurrentStep(2);
            console.log(`[ECW detectTopicsFromUploadedFile] Varsayılan konu ID: ${defaultTopicId}, isim: ${defaultTopicName}`);
          }
        } catch (error: unknown) {
          console.error(`[ECW detectTopicsFromUploadedFile] ❌ HATA: API isteği başarısız!`, error);
          setTopicDetectionStatus("error");
          
          // Hata AxiosError tipinde mi kontrol et
          const isAxiosError = axios.isAxiosError(error);
          
          // Hata detaylarını kapsamlı bir şekilde logla
          console.error(`🔍 Hata detayları:`, { 
            message: isAxiosError ? error.message : String(error),
            status: isAxiosError && error.response ? error.response.status : 'N/A',
            statusText: isAxiosError && error.response ? error.response.statusText : 'N/A',
            data: isAxiosError && error.response ? error.response.data : {},
            config: isAxiosError ? {
              url: error.config?.url,
              method: error.config?.method,
              headers: error.config?.headers,
            } : {}
          });
          
              ErrorService.showToast(
            `Konu tespiti başarısız oldu: ${isAxiosError && error.response ? error.response.status : 'Bağlantı hatası'}`,
                "error"
              );
          
          // Hızlı sınav yaklaşımı: Hata durumunda bile varsayılan konularla devam et
          if (quizType === "quick" || quizType === "personalized") {
            console.log("🚀 Hızlı sınav yaklaşımı kullanılıyor: Konu tespiti başarısız olsa bile varsayılan konularla devam ediyoruz");
            console.log("🔍 Önce seçili kurstan veya API'den gerçek konu verilerini almayı deniyoruz");
            
            try {
              // Seçili ders varsa, bu dersten konuları al
              if (selectedCourseId) {
                console.log(`📚 Seçili dersten (${selectedCourseId}) konuları almaya çalışıyoruz`);
                
                // Örnek kurs konularını getir (backend entegrasyonu hazır olana kadar)
                const getCourseTopics = async (courseId: string): Promise<{id: string, subTopicName: string, normalizedSubTopicName: string}[]> => {
                  // Gerçek API entegrasyonu hazır olduğunda aşağıdaki kod kullanılabilir:
                  // return await apiService.get<{id: string, subTopicName: string, normalizedSubTopicName: string}[]>(`/courses/${courseId}/topics`);
                  
                  // Örnek veri döndür
                  console.log(`🔍 Kurs için örnek konular oluşturuluyor (kurs ID: ${courseId})`);
                  return [
                    { id: `${courseId}-topic1`, subTopicName: 'Temel Kavramlar', normalizedSubTopicName: 'temel-kavramlar' },
                    { id: `${courseId}-topic2`, subTopicName: 'İleri Konular', normalizedSubTopicName: 'ileri-konular' },
                    { id: `${courseId}-topic3`, subTopicName: 'Özel Konular', normalizedSubTopicName: 'ozel-konular' },
                    { id: `${courseId}-topic4`, subTopicName: 'Pratik Uygulamalar', normalizedSubTopicName: 'pratik-uygulamalar' },
                  ];
                };
                
                // Konuları al
                const courseTopics = await getCourseTopics(selectedCourseId);
                
                if (courseTopics && courseTopics.length > 0) {
                  // Kurs konularını uygun formata dönüştür
                  const mappedTopics: DetectedSubTopic[] = courseTopics.map((topic: {id: string, subTopicName: string, normalizedSubTopicName: string}) => ({
                    id: topic.id || topic.normalizedSubTopicName || `topic-${Math.random().toString(36).substring(2, 9)}`,
                    subTopicName: topic.subTopicName || 'Konu',
                    normalizedSubTopicName: topic.normalizedSubTopicName || topic.id || `topic-${Math.random().toString(36).substring(2, 9)}`,
                    isSelected: true,
                    status: undefined,
                    isNew: false,
                    parentTopic: undefined
                  }));
                  
                  console.log(`✅ Dersten ${mappedTopics.length} konu başarıyla alındı`);
                  setDetectedTopics(mappedTopics);
                  setTopicDetectionStatus("success");
                  
                  // Tüm konuları otomatik olarak seç
                  const allTopicIds = mappedTopics.map(topic => topic.id);
                  setSelectedTopicIds(allTopicIds);
                  setSelectedSubTopicIds(allTopicIds);
                  setPreferences(prev => ({
                    ...prev,
                    topicIds: allTopicIds,
                    subTopicIds: allTopicIds
                  }));
                  
                  setCurrentStep(2);
                  return;
                } else {
                  console.warn('⚠️ Seçili derste konu bulunamadı');
                }
              }
              
              // Son çare olarak, belge adından bir konu oluştur ama gerçek API entegrasyonu kullan
              console.log('🔍 Belge adından bir konu oluşturuluyor, ancak API ile');
              
              // Belge için varsayılan konu oluştur
              const defaultTopicId = `doc-${documentId || uploadedDocumentId || Date.now().toString()}`;
              const defaultTopicName = file.name.replace(/\.[^/.]+$/, "") || 'Belge İçeriği';
              
              // Belge adı bilgisiyle API'ye istek at
              try {
                const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/learning-targets/suggest-topics`;
                const response = await axios.post(apiUrl, {
                  documentName: file.name,
                  documentId: documentId || uploadedDocumentId,
                  courseId: selectedCourseId
                });
                
                if (response.data && Array.isArray(response.data)) {
                  const suggestedTopics: DetectedSubTopic[] = response.data.map((topic: any, index: number) => ({
                    id: topic.id || `suggested-${index}`,
                    subTopicName: topic.name || topic.subTopicName || `Önerilen Konu ${index+1}`,
                    normalizedSubTopicName: topic.normalizedName || topic.normalizedSubTopicName || `onerilen-konu-${index+1}`,
                    isSelected: true,
                    status: undefined,
                    isNew: true
                  }));
                  
                  console.log(`✅ API'den ${suggestedTopics.length} önerilen konu alındı`);
                  setDetectedTopics(suggestedTopics);
                  
                  // Tüm konuları otomatik olarak seç
                  const allTopicIds = suggestedTopics.map(topic => topic.id);
                  setSelectedTopicIds(allTopicIds);
                  setSelectedSubTopicIds(allTopicIds);
                  setPreferences(prev => ({
                    ...prev,
                    topicIds: allTopicIds,
                    subTopicIds: allTopicIds
                  }));
                  
                  setTopicDetectionStatus("success");
                  setCurrentStep(2);
                  return;
                }
              } catch (apiError) {
                console.error('❌ Önerilen konular alınırken hata:', apiError);
              }
              
              // Son çare: Tek bir varsayılan konu ile devam et
              const singleTopic: DetectedSubTopic = {
                id: defaultTopicId,
                subTopicName: defaultTopicName,
                normalizedSubTopicName: defaultTopicName.toLowerCase().replace(/\s+/g, '-'),
                isSelected: true,
                status: undefined,
                isNew: true
              };
              
              console.log('✅ Tek varsayılan konu oluşturuldu:', singleTopic);
              setDetectedTopics([singleTopic]);
              setSelectedTopicIds([defaultTopicId]);
              setSelectedSubTopicIds([defaultTopicId]);
              setPreferences(prev => ({
                ...prev,
                topicIds: [defaultTopicId],
                subTopicIds: [defaultTopicId]
              }));
              
              setTopicDetectionStatus("success");
              setCurrentStep(2);
            } catch (fallbackError) {
              console.error('❌ Tüm konu alma yöntemleri başarısız oldu:', fallbackError);
              ErrorService.showToast('Konular alınamadı. Lütfen tekrar deneyin.', 'error');
              setTopicDetectionStatus("error");
            }
          }
        }
      } else {
        console.error(`[ECW detectTopicsFromUploadedFile] ❌ HATA: Belge ID bulunamadı!`);
        setTopicDetectionStatus("error");
        ErrorService.showToast(
          "Belge yüklendi ancak ID alınamadı. Lütfen tekrar deneyin.",
          "error"
        );
      }
    } catch (error) {
      console.error(`[ECW detectTopicsFromUploadedFile] ❌ HATA: Dosya işleme genel hata! ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      setTopicDetectionStatus("error");
      ErrorService.showToast(
        `Dosya işlenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        "error"
      );
    }
  };

  // Final gönderim işleyicisi
  const handleFinalSubmit = async () => {
    // Sınav verisini markdown olarak indir (backend'e göndermeden önce)
    try {
      const examData = {
        quizType,
        personalizedQuizType,
        preferences,
        selectedTopics,
        selectedTopicIds,
        selectedSubTopicIds,
        selectedCourseId,
        documentTextContent,
        uploadedDocumentId,
        // Gerekirse başka önemli state'ler de eklenebilir
      };
      downloadExamAsMarkdown(examData, "giden_sinav.md");
    } catch (err) {
      console.error("Sınav verisi markdown indirme sırasında hata:", err);
    }
    // 1. Sınav analizini simüle et (örnek mock analiz)
    // Gerçek uygulamada quiz.analysisResult.performanceBySubTopic kullanılacak
    const mockAnalysis: Record<string, { status: LearningTarget["status"], scorePercent: number }> = {};
    learningTargets.forEach((t, idx) => {
      // Simülasyon: ilk alt konu failed, ikincisi medium, üçüncüsü mastered, diğerleri pending kalsın
      if (idx === 0) mockAnalysis[t.normalizedSubTopicName] = { status: 'failed', scorePercent: 30 };
      else if (idx === 1) mockAnalysis[t.normalizedSubTopicName] = { status: 'medium', scorePercent: 60 };
      else if (idx === 2) mockAnalysis[t.normalizedSubTopicName] = { status: 'mastered', scorePercent: 95 };
    });
    // 2. Öğrenme hedeflerini güncelle (analize göre)
    const updatedTargets = learningTargets.map(target => ({
      ...target,
      status: mockAnalysis[target.normalizedSubTopicName]?.status || target.status,
      lastAttemptScorePercent: mockAnalysis[target.normalizedSubTopicName]?.scorePercent ?? target.lastAttemptScorePercent,
    }));
    setLearningTargets(updatedTargets);
    console.log('[ECW handleFinalSubmit] Sınav sonrası öğrenme hedefleri güncellendi:', updatedTargets);
    
    // 3. Backend'e batch gönderim (GERÇEK API)
    // Eğer öğrenme hedefleri yoksa, API çağrısı yapmayalım
    if (updatedTargets.length === 0) {
      console.log('[ECW] Öğrenme hedefi bulunmadığı için API çağrısı yapılmıyor.');
      toast('Sınav tamamlandı! Öğrenme hedefi bulunmadığı için güncelleme yapılmadı.', { icon: 'ℹ️' });
    } else {
      try {
        console.log('[ECW] Backend\'e öğrenme hedefleri gönderiliyor:', updatedTargets);
        
        // Convert learning targets to the format expected by the new API
        const convertedTargets = updatedTargets.map(target => ({
          subTopicName: target.subTopicName,
          status: target.status?.toLowerCase() as 'pending' | 'failed' | 'medium' | 'mastered',
          lastScore: target.lastAttemptScorePercent
        }));
        
        const batchResult = await learningTargetService.batchUpdateTargets(convertedTargets);
        
        if (batchResult.success) {
          console.log('[ECW] Öğrenme hedefleri başarıyla backend\'e kaydedildi:', batchResult);
          toast(`Öğrenme hedefleriniz başarıyla güncellendi! (${batchResult.processedCount} hedef)`, { icon: '✅' });
        } else {
          console.warn('[ECW] Backend güncellemesi başarısız oldu');
          toast('Öğrenme hedefleri güncellenirken bir sorun oluştu.', { icon: '⚠️' });
        }
      } catch (error) {
        console.error('[ECW] Backend güncelleme hatası:', error);
        toast('Öğrenme hedefleri kaydedilirken hata oluştu.', { icon: '❌' });
      }
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    
    console.log(
      "[ECW handleFinalSubmit] Başlatıldı. Seçili konular:",
      JSON.stringify(selectedTopics),
      "Tercihler:",
      JSON.stringify(preferences),
      "Dosya:",
      selectedFile?.name,
      "Belge ID:",
      uploadedDocumentId,
      "Metin İçeriği Var Mı:",
      !!documentTextContent,
    );
    
 
    
    // Hızlı bir son kontrol yapalım - belge yüklendiyse ama alt konu yoksa
    if (uploadedDocumentId && (!selectedTopics || selectedTopics.length === 0)) {
      console.log("[ECW handleFinalSubmit] Belge yüklendi fakat alt konu seçilmedi - otomatik konu oluşturuluyor");
      
      // Varsayılan bir konu oluştur
      const fileName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "Belge";
      const defaultTopicId = `belge-${uploadedDocumentId.substring(0, 8)}`;
      
      // Alt konu olarak ekle
      const subTopicItem: SubTopic = {
        subTopic: `${fileName} İçeriği`,
        normalizedSubTopic: defaultTopicId
      };
      
      // State'leri güncelle
      setSelectedTopicIds([defaultTopicId]);
      setSelectedSubTopicIds([defaultTopicId]);
      setSelectedTopics([subTopicItem]);
      
      console.log("[ECW handleFinalSubmit] Varsayılan konu eklendi:", subTopicItem);
    }

    if (quizType === "quick") {
      if (
        !selectedFile &&
        !uploadedDocumentId &&
        selectedTopics.length === 0
      ) {
        toast.error(
          "Lütfen bir dosya yükleyin veya en az bir konu seçin.",
        );
        setIsSubmitting(false);
        return;
      }
    }

    // Diğer quiz tipleri için diğer doğrulamalar
    if (quizType === "personalized") {
      if (!selectedCourseId) {
        toast.error("Lütfen bir kurs seçin.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      console.log("[ECW handleFinalSubmit] Kontrol: selectedTopics dizisi:", selectedTopics);
      console.log("[ECW handleFinalSubmit] selectedTopics uzunluğu:", selectedTopics.length);
      
      // Çalışacağımız konuların listesi - varsayılan bir konu eklememiz gerekebilir
      let topicsToUse = [...selectedTopics];
      
      // Eğer topicsToUse boşsa ve bir belge yüklemişse, otomatik bir konu oluştur
      if (topicsToUse.length === 0 && (uploadedDocumentId || selectedFile)) {
        console.log("[ECW handleFinalSubmit] Konu seçilmedi ama belge var, otomatik konu oluşturuluyor");
        const fileName = selectedFile?.name || 'belge';
        const defaultTopicId = `belge-${uploadedDocumentId ? uploadedDocumentId.substring(0, 8) : new Date().getTime()}`;
        topicsToUse = [{
          subTopic: `${fileName.replace(/\.[^/.]+$/, "")} İçeriği`,
          normalizedSubTopic: defaultTopicId
        }];
        console.log("[ECW handleFinalSubmit] Otomatik oluşturulan konu:", topicsToUse);
        
        // State güncellemesi
        setSelectedTopicIds([defaultTopicId]);
        setSelectedSubTopicIds([defaultTopicId]);
        setSelectedTopics(topicsToUse);
      }
      

      // API için alt konu nesnelerini oluştur
      const mappedSubTopics = topicsToUse.map((topic) => {
        return {
          subTopic: topic.subTopic,
          normalizedSubTopic: topic.normalizedSubTopic,
        };
      });
      
      console.log("[ECW handleFinalSubmit] Hazırlanan alt konu nesneleri:", mappedSubTopics);
      console.log("[ECW handleFinalSubmit] Alt konuların sayısı:", mappedSubTopics.length);
      
      // HATA KONTROLÜ: Alt konu sayısı 0 ise, belge ID kontrolü yap
      if (mappedSubTopics.length === 0) {
        console.error("[ECW handleFinalSubmit] KRİTİK HATA: Alt konu nesneleri boş!");
        
        if (uploadedDocumentId || selectedFile) {
          console.log("[ECW handleFinalSubmit] Belge var, varsayılan bir konu ekleniyor");
          const fileName = selectedFile?.name || 'belge';
          mappedSubTopics.push({
            subTopic: `${fileName.replace(/\.[^/.]+$/, "")} İçeriği`,
            normalizedSubTopic: `belge-${uploadedDocumentId || Date.now()}`
          });
          console.log("[ECW handleFinalSubmit] Varsayılan konu eklendi:", mappedSubTopics);
        } else {
          console.error("[ECW handleFinalSubmit] Ne konu seçimi ne de belge var! İşlem durduruluyor.");
          toast.error("Lütfen en az bir konu seçin veya bir belge yükleyin.");
          setIsSubmitting(false);
          return;
        }
      }
      
      // preferences.subTopicIds var mı kontrol et
      const updatedPreferences = {
        ...preferences,
        subTopicIds: mappedSubTopics.map(topic => topic.normalizedSubTopic)
      };
      
      // Sınav oluşturma seçenekleri
      const quizOptions: QuizGenerationOptions = {
        quizType: quizType === "quick" ? "general" : quizType,
        courseId: selectedCourseId || undefined,
        personalizedQuizType: quizType === "personalized" ? personalizedQuizType : undefined,
        // Doğru format için sadece bir tanım kullanıyoruz
        selectedSubTopics: mappedSubTopics.map(topic => topic.normalizedSubTopic),
        documentId: uploadedDocumentId || undefined,
        // Belge metnini ekleyelim, ama çok uzunsa kısalt (AI'nin daha iyi çalışması için)
        documentText: documentTextContent ? (
          documentTextContent.length > 5000 
            ? documentTextContent.substring(0, 5000) + "...(Kısaltıldı)"
            : documentTextContent
        ) : "",
        preferences: {
          questionCount: preferences.questionCount,
          difficulty: preferences.difficulty as "easy" | "medium" | "hard" | "mixed",
          timeLimit: preferences.timeLimit,
          prioritizeWeakAndMediumTopics: true,
        },
      };

      console.log("[ECW handleFinalSubmit] quizService.generateQuiz çağrılıyor. Seçenekler:", JSON.stringify(quizOptions, null, 2));

      try {
        // Sınav oluştur
        console.log("[ECW handleFinalSubmit] Sınav oluşturma öncesi son kontroller:");
        console.log("[ECW handleFinalSubmit] quizOptions:", JSON.stringify(quizOptions, null, 2));
        console.log("[ECW handleFinalSubmit] selectedSubTopics uzunluğu:", quizOptions.selectedSubTopics?.length);
        console.log("[ECW handleFinalSubmit] documentId:", quizOptions.documentId);
        console.log("[ECW handleFinalSubmit] preferences:", JSON.stringify(quizOptions.preferences, null, 2));
        
        // API çağrısını izle
        console.time("[ECW handleFinalSubmit] quizService.generateQuiz süresi");
        let quiz = null;
        
        // Yeniden deneme mekaniği - geliştirilmiş strateji ile
        let retryCount = 0;
        const maxRetries = 5;
        let lastError = null;
        
        while (retryCount < maxRetries) {
          try {
            // Konular deneme sayısı artıkça azaltılabilir, böylece başarı şansı artar
            if (retryCount > 1 && topicsToUse.length > 1) {
              // İlk denemeler başarısız olduysa, konu sayısını daha da azalt
              const reducedTopicCount = Math.max(1, topicsToUse.length - retryCount + 1);
              const reducedTopics = topicsToUse.slice(0, reducedTopicCount);
              
              console.log(`[ECW handleFinalSubmit] Deneme ${retryCount}/${maxRetries}: Konu sayısı ${topicsToUse.length}'den ${reducedTopics.length}'e düşürülüyor`);
              
              // Quiz seçeneklerini güncelle
              quizOptions.selectedSubTopics = reducedTopics.map(topic => topic.normalizedSubTopic);
              console.log(`[ECW handleFinalSubmit] Azaltılmış konu listesi:`, quizOptions.selectedSubTopics);
            }
            
            console.log(`[ECW handleFinalSubmit] Deneme ${retryCount + 1}/${maxRetries} başlatılıyor...`);
            quiz = await quizService.generateQuiz(quizOptions);
            
            // Boş soru dizisi kontrolü
            if (!quiz || !quiz.questions || quiz.questions.length === 0) {
              retryCount++;
              console.warn(`[ECW handleFinalSubmit] Quiz soru dizisi boş. Yeniden deneniyor (${retryCount}/${maxRetries})`);
              
              if (retryCount >= maxRetries) {
                throw new Error("Maksimum deneme sayısına ulaşıldı. Sınav soruları oluşturulamadı.");
              }
              
              // Bekleme süresi ekle - her denemede biraz daha uzun bekle
              const waitTime = 3000 + (retryCount * 1000); // 3s, 4s, 5s, 6s, 7s
              console.log(`[ECW handleFinalSubmit] ${waitTime/1000} saniye bekleniyor ve yeniden deneniyor...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            
            // Başarılı olduysa döngüden çık
            console.log(`[ECW handleFinalSubmit] Soru üretme başarılı! ${quiz.questions?.length || 0} soru oluşturuldu.`);
            break;
          } catch (error) {
            retryCount++;
            lastError = error;
            console.error(`[ECW handleFinalSubmit] Sınav oluşturma hatası (${retryCount}/${maxRetries}):`, error);
            
          
            if (retryCount >= maxRetries) {
              throw error;
            }
            
            // Bekleme süresi ekle - her denemede biraz daha uzun bekle
            const waitTime = 3000 + (retryCount * 1000); // 3s, 4s, 5s, 6s, 7s
            console.log(`[ECW handleFinalSubmit] ${waitTime/1000} saniye bekleniyor ve yeniden deneniyor...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        
        console.timeEnd("[ECW handleFinalSubmit] quizService.generateQuiz süresi");
        
        // Detaylı sonuç kontrolü
        console.log("[ECW handleFinalSubmit] Sınav oluşturma sonucu:", quiz);
        console.log("[ECW handleFinalSubmit] Quiz ID:", quiz?.id);
        console.log("[ECW handleFinalSubmit] Quiz soru sayısı:", quiz?.questions?.length || 0);
        
        if (!quiz) {
          console.error("[ECW handleFinalSubmit] KRİTİK HATA: quiz nesnesi boş veya undefined!");
          throw new Error("Quiz oluşturulamadı - API yanıtı boş");
        }
        
        if (!quiz.id) {
          console.error("[ECW handleFinalSubmit] KRİTİK HATA: quiz.id yok veya boş!");
          throw new Error("Quiz ID alınamadı");
        }

        const wizardResultData = {
          file: selectedFile,
          quizType: quizType,
          personalizedQuizType,
          preferences: updatedPreferences,
          topicNameMap: mappedSubTopics.reduce((acc, item) => {
            acc[item.normalizedSubTopic] = item.subTopic;
            return acc;
          }, {} as Record<string, string>),
          quiz: quiz,
          quizId: quiz?.id,
          documentId: uploadedDocumentId || undefined,
          status: quiz?.id ? 'success' as const : 'error' as const,
          error: quiz?.id ? undefined : new ApiError("Sınav oluşturulamadı veya ID alınamadı."),
        };

        console.log("[ECW handleFinalSubmit] Wizard sonuç verisi oluşturuldu:", 
          JSON.stringify({
            ...wizardResultData,
            file: wizardResultData.file ? `File: ${wizardResultData.file.name}` : null 
          }, null, 2)
        );

        // Başarı durumuna göre yönlendir
        if (quiz?.id) {
          // Yükleme toast mesajını kapat ve başarı mesajı göster
          toast.dismiss("quiz-generation-toast");
          toast.success("Sınav başarıyla oluşturuldu! Yönlendiriliyorsunuz...");
          
          if (onComplete) {
            console.log(`[ECW handleFinalSubmit] onComplete fonksiyonu çağrılıyor, quizId: ${quiz.id}`);
            onComplete(wizardResultData);
          } else {
            console.log(`[ECW handleFinalSubmit] onComplete fonksiyonu tanımlı değil, manuel yönlendirme yapılıyor: /exams/${quiz.id}/results`);
            router.push(`/exams/${quiz.id}/results`);
          }
        } else {
          console.error("[ECW handleFinalSubmit] Sınav ID alınamadı!");
          setErrorMessage("Sınav oluşturuldu ancak ID alınamadı.");
        }
      } catch (error) {
        console.error("[ECW handleFinalSubmit] Sınav oluşturma hatası:", error);
        
        // Detaylı hata bilgisi
        const errorDetails = {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          apiError: error instanceof ApiError ? {
            cause: error.cause,
            name: error.name,
            message: error.message
          } : undefined
        };
        console.error("[ECW handleFinalSubmit] Hata detayları:", errorDetails);
        
        // Daha detaylı hata bilgisi
        if (error instanceof ApiError) {
          console.error("[ECW handleFinalSubmit] API Hatası:", error.message, error.cause);
          setErrorMessage(`API Hatası: ${error.message}`);
        } else {
          console.error("[ECW handleFinalSubmit] Genel hata:", error);
          setErrorMessage(`Hata: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Yükleme mesajını kapat
        toast.dismiss("quiz-generation-toast");
        toast.error(`Sınav oluşturulurken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error("[ECW handleFinalSubmit] Beklenmeyen genel hata:", error);
      setErrorMessage(`Beklenmeyen hata: ${error instanceof Error ? error.message : String(error)}`);
      
      // Yükleme mesajını kapat
      toast.dismiss("quiz-generation-toast");
      toast.error("Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adım 3 (ya da son adım): Tercihler
  const renderPreferencesStep = () => {
    return (
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold">Sınav Tercihleri</h2>
          
          {/* Seçilen konu ve dosya bilgileri */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Sınav İçeriği</h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <div className="flex items-center text-sm">
                <span className="font-medium mr-1">Belge:</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {selectedFile ? selectedFile.name : (documentTextContent ? 'Metin içeriği' : 'Belge yok')}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <span className="font-medium mr-1">Seçili Konu Sayısı:</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {selectedTopicsList.length} konu
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <span className="font-medium mr-1">Belge Metni:</span>
                <span className={`${documentTextContent ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {documentTextContent ? `Yüklendi (${documentTextContent.length} karakter)` : 'Yüklenmedi'}
                </span>
              </div>
            </div>
            
            {/* Belge metni durumu bildirimi */}
            {!documentTextContent && uploadedDocumentId && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded mt-2 text-sm">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">Belge metni henüz yüklenmedi!</p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Sınav oluşturmak için belge metni gereklidir. Lütfen şunları deneyin:
                </p>
                <ul className="list-disc pl-5 mt-1 text-yellow-700 dark:text-yellow-300">
                  <li>Sayfayı yenileyip tekrar deneyin</li>
                  <li>Belgeyi tekrar yükleyin</li>
                  <li>Daha küçük boyutlu bir belge kullanın</li>
                </ul>
                <div className="mt-3">
                  <button 
                    onClick={async () => {
                      try {
                        toast.loading("Belge metni yükleniyor...");
                        const docTextResponse = await documentService.getDocumentText(uploadedDocumentId);
                        
                        if (docTextResponse && docTextResponse.text && docTextResponse.text.trim() !== '') {
                          setDocumentTextContent(docTextResponse.text);
                          console.log(`Belge metni manuel olarak yüklendi: ${docTextResponse.text.length} karakter`);
                          toast.dismiss();
                          toast.success("Belge metni başarıyla yüklendi!");
                        } else {
                          toast.dismiss();
                          toast.error("Belge metni yüklenemedi, metin boş veya geçersiz!");
                        }
                      } catch (error) {
                        console.error("Belge metni yükleme hatası:", error);
                        toast.dismiss();
                        toast.error("Belge metni yüklenirken hata oluştu!");
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md flex items-center space-x-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Belge Metnini Yeniden Yükle
                  </button>
                </div>
              </div>
            )}
            
            {/* Hata mesajı */}
            {errorMessage && (
              <div className="bg-red-50 text-red-700 p-2 rounded mt-2 text-sm">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Soru sayısı seçimi ve diğer tercihler */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="questionCount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Soru Sayısı
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="questionCount"
                  min="5"
                  max={quizType === "quick" ? 20 : 30}
                  step="1"
                  value={preferences.questionCount}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "questionCount",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                />
                <span className="w-12 text-center text-sm font-medium text-gray-700 dark:text-gray-300 ml-4 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {preferences.questionCount}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {quizType === "quick" ? "5-20 arası." : "5-30 arası."} Daha
                fazla soru, daha detaylı analiz sağlar.
              </p>
            </div>

            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Zorluk Seviyesi
              </label>
              <select
                id="difficulty"
                value={preferences.difficulty}
                onChange={(e) =>
                  handlePreferenceChange(
                    "difficulty",
                    e.target.value as
                      | "easy"
                      | "medium"
                      | "hard"
                      | "mixed",
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="easy">Kolay</option>
                <option value="medium">Orta</option>
                <option value="hard">Zor</option>
                <option value="mixed">Karışık (Önerilen)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sınavdaki soruların zorluk seviyesini belirler.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zaman Sınırı
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useTimeLimit"
                    checked={useTimeLimit}
                    onChange={(e) =>
                      handleUseTimeLimitChange(e.target.checked)
                    }
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="useTimeLimit"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Zaman sınırı uygula
                  </label>
                </div>
                {useTimeLimit && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center overflow-hidden"
                  >
                    <input
                      type="number"
                      id="timeLimitInput"
                      min="1"
                      max="180"
                      value={preferences.timeLimit || ""}
                      onChange={(e) =>
                        handleTimeLimitInputChange(e.target.value)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      placeholder="örn: 30"
                    />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      dakika
                    </span>
                  </motion.div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sınav için bir süre belirleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Adıma tıklama işleyicisi
  const handleStepClick = (step: number) => {
    // Sadece tamamlanmış adımlara geri dönebilir
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  // Render
  return (
    <div className="w-full h-full bg-background">
      <ExamCreationProgress 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        quizType={quizType}
        onStepClick={handleStepClick}
      >
        <AnimatePresence mode="wait">
          {/* Adım 1: Ders Seçimi (Kişiselleştirilmiş sınav için) */}
          {currentStep === 1 && quizType === "personalized" && (
            <motion.div
              key="step1-course"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                1. Ders Seçimi veya Oluşturma
              </h3>
              
              <div className="mb-6">
                {!showNewCourseForm ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Çalışmak istediğiniz dersi seçin
                    </label>
                    <div className="flex flex-col space-y-4">
                      <select
                        value={selectedCourseId}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Ders seçin</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                      
                      <button 
                        type="button"
                        className="w-full py-2 px-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={() => setShowNewCourseForm(true)}
                      >
                        <span className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Yeni Ders Oluştur
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
                        Yeni Ders Oluştur
                      </h4>
                      <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                        onClick={() => {
                          setShowNewCourseForm(false);
                          setNewCourseName("");
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <input 
                        type="text" 
                        placeholder="Ders adı girin" 
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleCreateCourse}
                        disabled={!newCourseName.trim() || creatingCourse}
                      >
                        {creatingCourse ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Oluşturuluyor...
                          </div>
                        ) : (
                          "Ders Oluştur"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Adım 2: Kişiselleştirilmiş Sınav Türü Seçimi */}
          {currentStep === 2 && quizType === "personalized" && (
            <motion.div
              key="step2-quiz-type"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                2. Kişiselleştirilmiş Sınav Türü Seçimi
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* Zayif Konular */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${personalizedQuizType === "weakTopicFocused" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"}`}
                  onClick={() => setPersonalizedQuizType("weakTopicFocused")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${personalizedQuizType === "weakTopicFocused" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                      <FiTarget className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Zayıf Konular</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Geçmiş performansınıza göre zayıf olduğunuz konulardan soru oluştur</p>
                    </div>
                  </div>
                </div>

            
                {/* Yeni Konular */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${personalizedQuizType === "newTopicFocused" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"}`}
                  onClick={() => setPersonalizedQuizType("newTopicFocused")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${personalizedQuizType === "newTopicFocused" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                      <FiZap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Yeni Konular</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Daha önce çalışmadığınız yeni konulardan soru oluştur</p>
                    </div>
                  </div>
                </div>

                {/* Kapsamlı */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${personalizedQuizType === "comprehensive" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"}`}
                  onClick={() => setPersonalizedQuizType("comprehensive")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${personalizedQuizType === "comprehensive" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                      <FiTarget className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Kapsamlı</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tüm konulardan dengeli bir şekilde soru oluştur</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Adım 1: Belge Yükleme (Hızlı sınav için) veya Adım 3: Belge Yükleme (Kişiselleştirilmiş sınav için) */}
          {((currentStep === 1 && quizType === "quick") || (currentStep === 3 && quizType === "personalized")) && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                1. Belge Yükleme
              </h3>

              <DocumentUploader
                onFileUpload={handleFileUploadComplete}
                onError={handleFileUploadError}
                maxSize={40} // MB cinsinden
                allowedFileTypes={[".pdf", ".docx", ".doc", ".txt"]}
                className="mb-4"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Desteklenen formatlar: PDF, DOCX, DOC, TXT (Maks 40MB). Yapay zeka bu belgeleri analiz ederek sizin için en uygun soruları oluşturacaktır.
              </p>
              {quizType === "personalized" && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <b>Not:</b> Kişiselleştirilmiş sınav türü için farklı odak seçenekleri bir sonraki adımda sunulacaktır.
                  {personalizedQuizType === "weakTopicFocused" ? " Zayıf/Orta Odaklı sınav türü için belge yüklemeniz gerekmez." : ""}
                </p>
              )}
              
              {/* Konu tespiti yüklenme durumu */}
              {topicDetectionStatus === "loading" && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Belge içeriği analiz ediliyor ve konular tespit ediliyor...
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Bu işlem belge boyutuna bağlı olarak 10-30 saniye sürebilir. Lütfen bekleyin.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Adım 2: Kişiselleştirilmiş Sınav Alt Türü veya Konu Seçimi */}
          {currentStep === 2 && quizType === "quick" && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {quizType === "personalized" && (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    2. Sınav Odağı ve Konu Seçimi
                  </h3>
                  
                  {/* Kişiselleştirilmiş Sınav Alt Türleri */}
                  <div className="mt-2 mb-6">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Sınav Odağı Seçin:
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {/* Zayıf/Orta Odaklı Sınav */}
                      <div
                        className={`
                          flex items-center border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out
                          ${
                            personalizedQuizType === "weakTopicFocused"
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/50 shadow-sm"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                          }
                        `}
                        onClick={() =>
                          handlePersonalizedQuizTypeSelect("weakTopicFocused")
                        }
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-red-600 dark:text-red-400">
                          <FiZap />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            Zayıf/Orta Odaklı
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Yapay zeka, geçmiş performansınıza göre zayıf olduğunuz konulara odaklanır. (Belge gerekmez)
                          </p>
                        </div>
                      </div>

                      {/* Öğrenme Hedefi Odaklı Sınav */}
                      <div
                        className={`
                          flex items-center border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out
                          ${
                            personalizedQuizType === "learningObjectiveFocused"
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/50 shadow-sm"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                          }
                        `}
                        onClick={() =>
                          handlePersonalizedQuizTypeSelect("learningObjectiveFocused")
                        }
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-green-600 dark:text-green-400">
                          <FiTarget />
                        </div>
                        <div>
                                                   <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            Öğrenme Hedefi Odaklı
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Belirlediğiniz öğrenme hedeflerine ulaşma durumunuzu yapay zeka yardımıyla ölçer. (Belge gerekir)
                          </p>
                        </div>
                      </div>

                      {/* Yeni Konu Odaklı Sınav */}
                      <div
                        className={`
                          flex items-center border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out
                          ${
                            personalizedQuizType === "newTopicFocused"
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/50 shadow-sm"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                          }
                        `}
                        onClick={() =>
                          handlePersonalizedQuizTypeSelect("newTopicFocused")
                        }
                      >
                        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-yellow-600 dark:text-yellow-400">
                          <FiZap />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            Yeni Konu Odaklı
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Yüklenen belgeden yapay zeka ile tespit edilen yeni konuları test eder. (Belge gerekir)
                          </p>
                        </div>
                      </div>

                      {/* Kapsamlı Sınav */}
                      <div
                        className={`
                          flex items-center border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out
                          ${
                            personalizedQuizType === "comprehensive"
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/50 shadow-sm"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                          }
                        `}
                        onClick={() =>
                          handlePersonalizedQuizTypeSelect("comprehensive")
                        }
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400">
                          <FiAward />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            Kapsamlı
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Yapay zeka, yeni içerik ile mevcut öğrenme hedeflerinizi birleştiren karma bir sınav oluşturur. (Belge gerekir)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Konu Seçimi - Hem hızlı sınav hem de kişiselleştirilmiş sınav için */}
              <div className={quizType === "personalized" ? "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700" : ""}>
             

                {personalizedQuizType === "weakTopicFocused" ? (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-800 dark:text-yellow-200">
                    <p className="text-sm font-medium">Bilgi:</p>
                    <p className="text-sm">
                      Zayıf/Orta Odaklı Sınav seçildiğinde, durumu
                      &lsquo;başarısız&apos; veya &#39;orta&#39; olan mevcut
                      öğrenme hedefleriniz otomatik olarak kullanılır. Bu
                      adımda ek konu seçimi gerekmez.
                    </p>
                  </div>
                ) : (
                  <>
                   
                    {/* AI Konu Tespiti ve Seçim Ekranı */}
                    <TopicSelectionScreen
                      detectedTopics={detectedTopics}
                      existingTopics={courseTopics} 
                      availableCourses={courses}
                      selectedCourseId={selectedCourseId}
                      quizType={quizType}
                      personalizedQuizType={personalizedQuizType}
                      isLoading={topicDetectionStatus === "loading"}
                      error={undefined}
                      onTopicsSelected={(selectedTopics, courseId) => {
                        // Konsolda detaylı log göster
                        console.log("[ECW TopicSelectionScreen.onTopicsSelected] Seçilen konular:", JSON.stringify(selectedTopics));
                        console.log("[ECW TopicSelectionScreen.onTopicsSelected] Seçilen kurs ID:", courseId);

                        // Alt konuları da güncelle - direkt olarak handleTopicSelectionChange çağır
                        handleTopicSelectionChange(selectedTopics);
                        
                        // topicId ve courseId parametrelerini birleştir
                        handleTopicsDetected(selectedTopics, courseId);
                      }}
                      onCourseChange={handleCourseChangeForTopicSelection}
                      onCancel={handleTopicDetectionCancel}
                      initialSelectedTopicIds={selectedTopicIds}
                      onTopicSelectionChange={handleTopicSelectionChange}
                      onInitialLoad={onInitialLoad}
                      setOnInitialLoad={setOnInitialLoad}
                    />
                  </>
                )}

                {/* Ders ve Alt Konu Seçici - Kişiselleştirilmiş sınav için gerekli */}
                {quizType === "personalized" && personalizedQuizType !== "weakTopicFocused" && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Ders ve Alt Konu Seçimi
                    </h4>
                    <CourseTopicSelector
                      courses={courses}
                      selectedCourseId={selectedCourseId}
                      handleCourseChange={handleCourseChangeAdapter}
                      courseTopics={courseTopics}
                      selectedTopicIds={selectedTopicIds}
                      handleTopicToggle={handleTopicToggle}
                      topicSubTopics={topicSubTopics}
                      selectedSubTopicIds={selectedSubTopicIds}
                      handleSubTopicToggle={handleSubTopicToggle}
                      quizType={quizType}
                      personalizedQuizType={personalizedQuizType}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Adım 4: Alt Konu Seçimi (Kişiselleştirilmiş sınav için) */}
          {currentStep === 4 && quizType === "personalized" && (
            <motion.div
              key="step4-subtopics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                4. Alt Konu Seçimi
              </h3>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sınavınızın içereceği alt konuları seçin. Seçilen konulara göre size özel sorular oluşturulacaktır.
                </p>

                {/* Topic Selection Screen Component */}
                <TopicSelectionScreen
                  detectedTopics={detectedTopics}
                  existingTopics={courseTopics} 
                  availableCourses={courses}
                  selectedCourseId={selectedCourseId}
                  quizType={quizType}
                  personalizedQuizType={personalizedQuizType}
                  isLoading={topicDetectionStatus === "loading"}
                  error={undefined}
                  onTopicsSelected={(selectedTopics, courseId) => {
                    console.log("[ECW TopicSelectionScreen.onTopicsSelected] Seçilen konular:", JSON.stringify(selectedTopics));
                    console.log("[ECW TopicSelectionScreen.onTopicsSelected] Seçilen kurs ID:", courseId);
                    handleTopicSelectionChange(selectedTopics);
                    handleTopicsDetected(selectedTopics, courseId);
                  }}
                  onCourseChange={handleCourseChangeForTopicSelection}
                  onCancel={handleTopicDetectionCancel}
                  initialSelectedTopicIds={selectedTopicIds}
                  onTopicSelectionChange={handleTopicSelectionChange}
                  onInitialLoad={onInitialLoad}
                  setOnInitialLoad={setOnInitialLoad}
                />
              </div>
            </motion.div>
          )}

          {/* Adım 5: Tercihler (Kişiselleştirilmiş sınav için) veya Adım 3: Tercihler (Hızlı sınav için) */}
          {((currentStep === 5 && quizType === "personalized") || (currentStep === 3 && quizType === "quick")) && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderPreferencesStep()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gezinme Butonları */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              currentStep === 1
                ? "text-gray-400 dark:text-gray-600"
                : "text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
          >
            <FiArrowLeft className="mr-1.5" size={16} /> Geri
          </button>

          <button
            onClick={nextStep}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-sm flex items-center transition-colors shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={
              // Adım 1: Kişiselleştirilmiş sınav için ders seçilmemişse butonu devre dışı bırak
              (currentStep === 1 && quizType === "personalized" && !selectedCourseId) ||
              // Adım 3: Dosya yükleme adımında yükleme bitmemişse butonu devre dışı bırak
              (((currentStep === 3 && quizType === "personalized") || (currentStep === 1 && quizType === "quick")) && uploadStatus !== "success") ||
              // Adım 4: Konu seçimi adımında konu seçilmemişse ileri butonu devre dışı bırak
              (((currentStep === 4 && quizType === "personalized") || (currentStep === 2 && quizType === "quick")) && selectedTopics.length === 0) ||
              // İşlemler devam ederken butonu devre dışı bırak
              topicDetectionStatus === "loading" || 
              quizCreationLoading 
            }
          >
            {currentStep === totalSteps 
              ? quizCreationLoading 
                ? "Sınav Oluşturuluyor..."
                : "Sınavı Oluştur" 
              : "Devam Et"
            }{" "}
            {topicDetectionStatus === "loading" || quizCreationLoading ? (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
            <FiArrowRight className="ml-1.5" size={16} />
            )}
          </button>
        </div>
      </ExamCreationProgress>
    </div>
  );
  }

