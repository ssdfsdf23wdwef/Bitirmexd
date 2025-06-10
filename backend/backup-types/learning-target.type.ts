
enum LearningTargetStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}


export enum LearningTargetSource {
  MANUAL = 'manual',
}


export interface LearningTarget {
  id: string; // Firestore tarafından otomatik atanacak
  userId: string;
  courseId?: string; // Opsiyonel, bir derse bağlıysa
  topicName: string;
  mainTopic?: string; // Ana konu kategorisi (örn: "Temel Programlama", "Matematik Analiz")
  status: LearningTargetStatus;
  isNewTopic: boolean; // Bu hedef bir "yeni konu" ise true
  source: LearningTargetSource; // Hedefin kaynağı
  originalProposedId?: string; // Eğer source === 'ai_proposal', AI'dan gelen geçici ID
  notes?: string; // Kullanıcının ekleyebileceği notlar
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

