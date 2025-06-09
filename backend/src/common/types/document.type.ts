/**
 * Belge (Document) modelini temsil eden interface
 * @see PRD 7.8
 */
export interface Document {
  id: string;
  userId: string;
  courseId?: string | null;
  fileName: string;
  storagePath: string;
  storageUrl: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Belge listeleme için minimal alanlar
 */
interface DocumentListItem {
  id: string;
  fileName: string;
  storagePath: string;
  storageUrl: string;
  fileType: string;
  fileSize: number;
  courseId?: string | null;
  createdAt: string;
}

/**
 * Belge yükleme DTO
 */
interface UploadDocumentDto {
  fileName: string;
  fileType: string;
  fileSize: number;
  courseId?: string | null;
}

/**
 * Belge güncelleme DTO
 */
interface UpdateDocumentDto {
  fileName?: string;
  courseId?: string | null;
}

/**
 * Belge kaynak bilgisi
 * Not: Bu tip quiz.type.ts'de de DocumentSource olarak tanımlanmıştır.
 * İki tipi birleştirmek yerine, uygulama içinde iki farklı bağlamda
 * (belge ve quiz) kullanıldığı için ayrı tutulmuştur.
 * İçe aktarma çakışmalarını önlemek için index.ts'de özel düzenleme gerekebilir.
 */
interface DocumentSource {
  documentId: string;
  fileName: string;
  fileType: string;
  storagePath: string;
}
