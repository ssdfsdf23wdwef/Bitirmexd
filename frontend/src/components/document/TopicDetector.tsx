import { useState, useEffect, useCallback } from "react";
import { FiInfo, FiAlertCircle, FiChevronRight } from "react-icons/fi";
import { LearningTargetStatusLiteral, DetectedSubTopic } from "@/types";
import documentService from "@/services/document.service";
import { useNewTopicsStore } from "@/store/useNewTopicsStore"; // Added import

interface TopicDetectorProps {
  documentId: string;
  fileName?: string;
  onTopicsSelected: (selectedTopics: string[]) => void;
  onCancel: () => void;
  onError?: (message: string) => void;
}

export default function TopicDetector({
  documentId,
  fileName,
  onTopicsSelected,
  onCancel,
  onError,
}: TopicDetectorProps) {
  // State tanımlamaları
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<DetectedSubTopic[]>([]);
  const { setPendingTopics } = useNewTopicsStore(); // Added store hook

  // Konu tespiti işlemi
  useEffect(() => {
    console.group("🔍 [TopicDetector] useEffect - Konu tespiti başlatılıyor");
    console.log("📋 Başlangıç parametreleri:", {
      documentId,
      fileName,
      timestamp: new Date().toISOString(),
    });

    // Boş documentId kontrolü
    if (!documentId) {
      console.error("❌ DocumentId bulunamadı!", { documentId });
      setError("Belge ID'si bulunamadı.");
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    const detectTopics = async () => {
      try {
        console.log("🔄 Konu tespiti işlemi başlatılıyor...");
        setIsLoading(true);
        setError(null);

        // API'den konuları getir
        try {
          console.log("🌐 Document service API çağrısı yapılıyor...", {
            documentId,
            service: "documentService.detectTopics",
          });

          // Backend API'yi çağır
          const startTime = performance.now();
          const detectedTopics = await documentService.detectTopics(documentId);
          const endTime = performance.now();
          const apiDuration = endTime - startTime;

          console.log("✅ API başarılı! Konular tespit edildi:", {
            detectedTopicsCount: detectedTopics.length,
            detectedTopicsPreview: detectedTopics.slice(0, 3),
            allDetectedTopics: detectedTopics,
            apiDuration: `${apiDuration.toFixed(2)}ms`,
            timestamp: new Date().toISOString(),
          });

          // Store'a pending topic'leri kaydet
          const topicNames = detectedTopics.map((topic) => topic.subTopicName);
          console.log("💾 Store'a pending topics kaydediliyor...", {
            topicNames,
            topicCount: topicNames.length,
          });
          setPendingTopics(topicNames); // Call setPendingTopics

          // Tespit edilen konuları işle ve görüntüleme için hazırla
          console.log(
            "⚙️ Konular işleniyor ve görüntüleme için hazırlanıyor...",
          );
          const processedTopics = detectedTopics.map((topic) => ({
            ...topic,
            id: topic.normalizedSubTopicName, // ID olarak normalize edilmiş konu adını kullan
            name: topic.subTopicName, // Görüntüleme için konu adını kullan
            isSelected: true, // Varsayılan olarak seçili

            isNew: !topic.parentTopic, // Eğer bir üst konusu yoksa yeni kabul et
          }));

          console.log("✅ Konular başarıyla işlendi:", {
            processedTopicsCount: processedTopics.length,
            processedTopicsPreview: processedTopics.slice(0, 3),
            selectedCount: processedTopics.filter((t) => t.isSelected).length,
            newTopicsCount: processedTopics.filter((t) => t.isNew).length,
            statusDistribution: processedTopics.reduce(
              (acc, topic) => {
                acc[topic.status] = (acc[topic.status] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>,
            ),
          });

          setTopics(processedTopics);
          console.log("🎉 Konu tespiti başarıyla tamamlandı!");
        } catch (error) {
          console.error("❌ API HATASI:", {
            error,
            errorMessage:
              error instanceof Error ? error.message : "Bilinmeyen hata",
            errorStack: error instanceof Error ? error.stack : "Stack yok",
            documentId,
            timestamp: new Date().toISOString(),
          });

          // Gerçek hata durumunda hata göster
          const errorMessage =
            (error as Error)?.message || "Konular tespit edilemedi.";
          setError(errorMessage);

          // Hata callback'ini çağır
          if (onError) {
            console.log("📞 onError callback çağrılıyor...", { errorMessage });
            onError(errorMessage);
          }
        }
      } catch (error) {
        console.error("❌ GENEL HATA:", {
          error,
          errorMessage:
            error instanceof Error ? error.message : "Bilinmeyen hata",
          errorStack: error instanceof Error ? error.stack : "Stack yok",
          documentId,
          timestamp: new Date().toISOString(),
        });

        // Hata durumunu güncelle
        const errorMessage = (error as Error)?.message || "Bir hata oluştu.";
        setError(errorMessage);

        // Hata callback'ini çağır
        if (onError) {
          console.log("📞 onError callback çağrılıyor...", { errorMessage });
          onError(errorMessage);
        }

        // Statik logError metodunu kullanalım
        console.error("Konu tespit hatası:", error);
      } finally {
        console.log("🏁 Loading durumu false yapılıyor...");
        setIsLoading(false);
        console.log("💥 Konu tespiti işlemi sonlandı");
        console.groupEnd();
      }
    };

    // Konu tespiti işlemini başlat
    detectTopics();
  }, [documentId, onError, setPendingTopics]); // Added setPendingTopics to dependency array

  // Tüm konuları seçme/seçimi kaldırma
  const toggleAll = useCallback(
    (selectAll: boolean) => {
      console.group(
        "🔄 [TopicDetector] toggleAll - Tüm konuların seçimi değiştiriliyor",
      );
      console.log("📋 Parametreler:", {
        selectAll,
        currentTopicsCount: topics.length,
        currentSelectedCount: topics.filter((t) => t.isSelected).length,
        timestamp: new Date().toISOString(),
      });

      setTopics((prevTopics: DetectedSubTopic[]) => {
        const updatedTopics = prevTopics.map((topic) => ({
          ...topic,
          isSelected: selectAll,
        }));

        console.log("✅ Konular güncellendi:", {
          totalTopics: updatedTopics.length,
          selectedTopics: updatedTopics.filter((t) => t.isSelected).length,
          action: selectAll ? "Tümü seçildi" : "Tümünün seçimi kaldırıldı",
        });

        console.groupEnd();
        return updatedTopics;
      });
    },
    [topics.length],
  );

  // Tek bir konunun seçimini değiştirme
  const toggleTopic = useCallback(
    (topicId: string) => {
      console.group(
        "🔄 [TopicDetector] toggleTopic - Tek konu seçimi değiştiriliyor",
      );
      console.log("📋 Parametreler:", {
        topicId,
        currentTopicsCount: topics.length,
        currentSelectedCount: topics.filter((t) => t.isSelected).length,
        targetTopic: topics.find((t) => t.id === topicId),
        timestamp: new Date().toISOString(),
      });

      setTopics((prevTopics: DetectedSubTopic[]) => {
        const updatedTopics = prevTopics.map((topic) =>
          topic.id === topicId
            ? { ...topic, isSelected: !topic.isSelected }
            : topic,
        );

        const targetTopic = updatedTopics.find((t) => t.id === topicId);
        console.log("✅ Konu güncellendi:", {
          topicId,
          topicName: targetTopic?.name,
          newSelectionState: targetTopic?.isSelected,
          totalSelectedCount: updatedTopics.filter((t) => t.isSelected).length,
        });

        console.groupEnd();
        return updatedTopics;
      });
    },
    [topics],
  );

  // Seçilen konuları gönderme
  const handleConfirm = useCallback(() => {
    console.group(
      "✅ [TopicDetector] handleConfirm - Seçilen konular onaylanıyor",
    );

    const selectedTopics = topics.filter((topic) => topic.isSelected);
    const selectedTopicIds = selectedTopics.map((topic) => topic.id);

    console.log("📋 Onay bilgileri:", {
      totalTopics: topics.length,
      selectedTopicsCount: selectedTopics.length,
      selectedTopicIds,
      selectedTopicNames: selectedTopics.map((t) => t.name),
      selectedTopicDetails: selectedTopics,
      timestamp: new Date().toISOString(),
    });

    console.log("📞 onTopicsSelected callback çağrılıyor...", {
      selectedTopicIds,
      callbackFunction: "onTopicsSelected",
    });

    onTopicsSelected(selectedTopicIds);

    console.log("🎉 handleConfirm başarıyla tamamlandı!");
    console.groupEnd();
  }, [topics, onTopicsSelected]);

  // Durum sınıfları
  const getStatusClass = useCallback((status?: LearningTargetStatusLiteral) => {
    switch (status) {
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "mastered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  }, []);

  // Hata durumu gösterimi
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <FiAlertCircle className="text-red-500 mr-2" />
              Konu Tespiti Başarısız
            </h2>
          </div>

          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
              <p className="text-red-700 dark:text-red-300">
                {error ||
                  "Belgeden otomatik olarak konu çıkarılamadı. Lütfen farklı bir belge deneyin veya belgenin içeriğini kontrol edin."}
              </p>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Bu durumda aşağıdaki seçenekleri deneyebilirsiniz:
            </p>

            <ul className="list-disc pl-5 mb-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Farklı bir belge yüklemeyi deneyin</li>
              <li>
                Belgenizin formatını kontrol edin (PDF, Word veya metin dosyası
                olmalı)
              </li>
              <li>
                Belgenin içeriğini zenginleştirin veya daha açık ifadeler içeren
                bir belge deneyin
              </li>
              <li>
                Yüklediğiniz belgenin dili sisteminizin desteklediği diller
                arasında olduğundan emin olun
              </li>
            </ul>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={onCancel}
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Yükleniyor durumu
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Konular Tespit Ediliyor
            </h2>
          </div>

          <div className="p-6 flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 mb-4 border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Yapay zeka belgenizdeki konuları tespit ediyor...
            </p>
            {fileName && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                &quot;{fileName}&quot; dosyası analiz ediliyor
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Normal durum - konu seçim ekranı
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Konu Seçimi
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Belgenizde tespit edilen konuları seçin veya düzenleyin
          </p>
        </div>

        <div className="p-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Bu liste yapay zeka tarafından oluşturulan{" "}
                  <strong>önerilerdir</strong>. Son seçim size aittir. Sınava
                  dahil etmek istediğiniz konuları seçili bırakın, dahil etmek
                  istemediklerinizin seçimini kaldırın.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Tespit Edilen Konular ({topics.filter((t) => t.isSelected).length}
              /{topics.length})
            </h3>

            <div className="flex space-x-3">
              <button
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => toggleAll(true)}
              >
                Tümünü Seç
              </button>
              <button
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                onClick={() => toggleAll(false)}
              >
                Tümünü Kaldır
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 max-h-64 overflow-y-auto">
            {topics.length === 0 ? (
              <div className="text-center py-12">
                <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Belgede tespit edilebilen konu bulunamadı.
                </p>
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Farklı bir belge yüklemeyi veya konuları manuel olarak seçmeyi
                  deneyebilirsiniz.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {topics.map((topic) => (
                  <li key={topic.id} className="py-2 flex items-center">
                    <div className="mr-3">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600"
                          checked={topic.isSelected}
                          onChange={() => toggleTopic(topic.id)}
                        />
                      </label>
                    </div>

                    <div className="flex-grow">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {topic.name}
                      </p>
                    </div>

                    <div className="ml-3 flex items-center space-x-2">
                      {topic.isNew ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Yeni
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(topic.status)}`}
                        >
                          {topic.status || "Yeni"}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={onCancel}
          >
            İptal
          </button>

          <button
            className={`px-4 py-2 rounded-lg text-white flex items-center ${
              topics.some((t) => t.isSelected)
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleConfirm}
            disabled={!topics.some((t) => t.isSelected)}
          >
            Devam Et <FiChevronRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
