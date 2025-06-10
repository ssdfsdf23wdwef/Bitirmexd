import apiService, { httpClient } from "@/services/api.service";
import {
  DocumentType,
  DOCUMENT_UPLOAD_CONSTRAINTS,
} from "@/types/document.type";
import { DetectedSubTopic } from "@/types";

// Tip tanımlamaları
interface UploadAndDetectTopicsResponse {
  document: {
    id: string;
    fileName: string;
    fileUrl: string;
    extractedTextLength: number;
  };
  topics: DetectedSubTopic[];
}

interface QuizFromDocumentOptions {
  subTopics: {
    subTopicName: string;
    normalizedSubTopicName: string;
  }[];
  questionCount: number;
  difficulty: string;
  timeLimit?: number;
}

interface QuizResponse {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    subTopicName: string;
    normalizedSubTopicName: string;
    difficulty: string;
  }>;
  questionCount: number;
  sourceDocument: {
    documentId: string;
    fileName: string;
  };
  createdAt: string;
}


class DocumentService {

  async detectTopics(documentId: string): Promise<DetectedSubTopic[]> {
 
    
    try {
   
      
      // API isteği yap
      const response = await apiService.post<{
        success: boolean;
        documentId: string;
        topics: DetectedSubTopic[];
        analysisTime: string;
      }>(`/documents/${documentId}/analyze`);
      
     
      return response.topics;
    } catch (error) {
      throw error;
    }
  }


  
  async getDocuments(courseId?: string): Promise<DocumentType[]> {
    try {
      const url = courseId ? `/documents?courseId=${courseId}` : "/documents";
      const documents = await apiService.get<DocumentType[]>(url);
      return documents;
    } catch (error) {
      throw error;
    }
  }



  async getDocumentText(id: string): Promise<{ id: string; text: string }> {
    try {
      const documentText = await apiService.get<{ id: string; text: string }>(`/documents/${id}/text`);
      // Başarılı sonuç
      
      return documentText;
    } catch (error) {
      throw error;
    }
  }

  async uploadDocument(
    file: File,
    courseId?: string,
    onProgress?: (percentage: number) => void,
  ): Promise<DocumentType> {
  
    
    try {
      // Dosya boyutu kontrolü
      if (file.size > DOCUMENT_UPLOAD_CONSTRAINTS.maxSizeBytes) {
       
        throw new Error(
          `Dosya boyutu ${DOCUMENT_UPLOAD_CONSTRAINTS.maxSizeFormatted} sınırını aşamaz`,
        );
      }

      // Dosya tipi kontrolü
      const fileType = file.type.toLowerCase();
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      const isValidType = DOCUMENT_UPLOAD_CONSTRAINTS.allowedFileTypes.some(
        (type) =>
          type === fileType || (fileExtension && type === `.${fileExtension}`),
      );

      if (!isValidType) {
        throw new Error(
          `Desteklenmeyen dosya formatı. Desteklenen formatlar: PDF, DOCX, TXT`,
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      if (courseId) {
        formData.append("courseId", courseId);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percentage);
            
            // İlerleme durumunu izle
            if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
              
            }
          }
        },
      };

      
      const response = await httpClient.post<DocumentType>(
        "/documents/upload",
        formData,
        config,
      );
      
    
      
      return response.data;
    } catch (error) {
 
      throw error;
    }
  }


  /**
   * Belge yükle ve konuları tespit et
   */
  async uploadAndDetectTopics(file: File, courseId?: string): Promise<UploadAndDetectTopicsResponse> {
  
    try {
 
      
      // Form verisi oluştur
      const formData = new FormData();
      formData.append('file', file);
      
      if (courseId) {
        formData.append('courseId', courseId);
      }
      
      // API isteği yap
      const response = await httpClient.post<UploadAndDetectTopicsResponse>(
        "/documents/upload-and-detect-topics",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Belge ID'sinden sınav oluştur
   */
  async createQuizFromDocument(documentId: string, options: QuizFromDocumentOptions): Promise<QuizResponse> {
    
    try {
  
      
      // API isteği yap
      const response = await httpClient.post<QuizResponse>(
        `/documents/${documentId}/create-quiz`,
        options
      );
      
      return response.data;
    } catch (error) {
     throw error;
    }
  }
}

// Singleton instance oluştur ve export et
const documentService = new DocumentService();
export default documentService;
