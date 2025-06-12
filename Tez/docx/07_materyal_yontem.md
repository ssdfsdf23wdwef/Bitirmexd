# MATERYAL VE YÖNTEM
<!--
Bu bölümde proje yapılırken hangi yöntemlerin takip edildiği ve uygulanan adımlar anlatılmalıdır. 

Yazılım (masaüstü, web, mobil vs) projelerinde (aşağıdaki modellerden en az 2'si danışman tarafından seçilerek):
-	Kullanım Durumu (Use Case) diyagram ve belirtimleri
-	UML Aktivite Diyagramları
-	Yazılım Mimarisi
-	UML Sınıf (Class) Diyagramları
-	UML Sıra (Sequence) Diyagramları
Veritabanı içeren projelerde:
-	ER Diyagramları
-	Veritabanı Şeması
sunulmalıdır. 
-->

<!-- Bu bölüm materyal ve yöntem için ayrılmıştır -->
<!-- Önerilen uzunluk: 5 sayfa (~13.500 karakter) -->

## 3.1. Sistem Mimarisi ve Tasarım

AI Quiz Platformu, modern mikroservis mimarisi prensipleri temel alınarak tasarlanmış katmanlı bir sistem yapısına sahiptir. Platform, client-server modeli üzerine inşa edilmiş olup, frontend ve backend bileşenleri arasında RESTful API protokolü ile iletişim kurulmaktadır.

**Sistem Katmanları:**

- **Presentation Layer:** Next.js 15 ile geliştirilen responsive web uygulaması
- **API Gateway:** NestJS framework'ü ile RESTful API servisleri  
- **Business Logic:** Domain-driven design prensiplerine uygun modüler yapı
- **Data Access:** Firebase Firestore NoSQL veritabanı entegrasyonu
- **External Services:** Google Gemini 2.0 Flash API ve Firebase Authentication

**Mikroservis Bileşenleri:**
Platform aşağıdaki ana servislerden oluşur: User Management, Course Management, Quiz Generation, Assessment, Analytics, Document Processing ve Notification servisleri.

## 3.2. Kullanılan Teknolojiler

**Frontend Teknoloji Yığını:**
- **Next.js 15.0.2:** App Router, Server Components, Edge Runtime desteği
- **React 19.0.0:** Concurrent rendering, Suspense, Error Boundaries özellikleri
- **TailwindCSS 4.0.0:** Utility-first CSS framework, JIT compilation
- **NextUI 2.4.8:** Modern component library, accessibility desteği
- **Zustand 4.5.0:** Lightweight state management çözümü
- **TanStack Query 5.8.1:** Server state management ve intelligent caching

**Backend Teknoloji Yığını:**
- **NestJS 10.4.4:** Enterprise-grade Node.js framework
- **Firebase Admin SDK:** Veritabanı ve authentication yönetimi
- **Google Gemini API:** AI destekli soru üretimi ve içerik analizi
- **Multer & Sharp:** Dosya yükleme ve görsel işleme kütüphaneleri
- **Class Validator:** DTO validation ve data sanitization

**Veritabanı ve Depolama:**
- **Firebase Firestore:** Gerçek zamanlı NoSQL document database
- **Firebase Cloud Storage:** Güvenli dosya depolama servisi
- **Redis Cache:** Session management ve performance optimization (production)

## 3.3. Kullanım Durumu Diyagramları

**Ana Kullanım Durumları:**

**Şekil 3.1: Genel Sistem Kullanım Durumu Diyagramı**
```
                    [Öğretmen]
                        |
            +-----------+-----------+
            |           |           |
    [Ders Oluştur] [Quiz Oluştur] [Rapor Görüntüle]
            |           |           |
            |           |           |
    [İçerik Yükle]  [AI Soru      [Analytics
                     Üretimi]       Dashboard]
                        |
                        |
                   [Gemini API]
                        
                    [Öğrenci]
                        |
            +-----------+-----------+
            |           |           |
    [Ders Görüntüle] [Quiz Çöz]  [Sonuç Görüntüle]
            |           |           |
            |           |           |
    [PDF İndir]    [Cevapla]    [Performans
                                  Analizi]
```

**Detaylü Kullanım Durumu Senaryoları:**

**UC-001: Quiz Oluşturma**
- **Aktör:** Öğretmen
- **Ön Koşul:** Sistem girişi yapılmış, ders seçilmiş
- **Ana Akış:** 
  1. Öğretmen "Quiz Oluştur" seçeneğini tıklar
  2. Quiz başlığı ve açıklamasını girer
  3. İçerik kaynağını seçer (PDF/DOCX yükleme veya metin girişi)
  4. AI soru üretimi parametrelerini ayarlar (soru sayısı, zorluk seviyesi)
  5. Sistem Gemini API'yi çağırarak otomatik sorular üretir
  6. Öğretmen soruları gözden geçirir, düzenler ve onaylar
- **Son Koşul:** Quiz başarıyla oluşturulur ve öğrencilere atanır

**UC-002: Quiz Çözme**
- **Aktör:** Öğrenci  
- **Ön Koşul:** Sistem girişi yapılmış, atanmış quiz mevcut
- **Ana Akış:**
  1. Öğrenci dashboard'da mevcut quizleri görüntüler
  2. Çözmek istediği quiz'i seçer ve detaylarını inceler
  3. Quiz kurallarını okur ve "Başlat" butonuna tıklar
  4. Soruları sırayla cevaplayıp "Sonraki" ile ilerler
  5. Sistem cevapları gerçek zamanlı olarak kaydeder
  6. Quiz tamamlandığında sonuçları görüntüler
- **Son Koşul:** Quiz tamamlanır, sonuç veritabanına kaydedilir

## 3.4. UML Sınıf Diyagramları

**Şekil 3.2: Core Domain Model Class Diagram**

```typescript
class User {
  +id: string
  +email: string
  +name: string
  +role: UserRole
  +profileImage: string
  +createdAt: Date
  +authenticate(): boolean
  +getProfile(): UserProfile
  +updateProfile(data: UserUpdateDto): void
}

class Course {
  +id: string
  +title: string
  +description: string
  +instructorId: string
  +students: string[]
  +createdAt: Date
  +updatedAt: Date
  +addStudent(studentId: string): void
  +removeStudent(studentId: string): void
  +createQuiz(quizData: QuizCreateDto): Quiz
  +getQuizzes(): Quiz[]
}

class Quiz {
  +id: string
  +title: string
  +description: string
  +courseId: string
  +questions: Question[]
  +timeLimit: number
  +maxAttempts: number
  +isActive: boolean
  +attempts: QuizAttempt[]
  +generateQuestions(content: string): Question[]
  +evaluate(attempt: QuizAttempt): QuizResult
  +activate(): void
  +deactivate(): void
}

class Question {
  +id: string
  +text: string
  +type: QuestionType
  +options: string[]
  +correctAnswer: string
  +explanation: string
  +difficulty: DifficultyLevel
  +points: number
  +validate(answer: string): boolean
}

class QuizAttempt {
  +id: string
  +quizId: string
  +studentId: string
  +answers: Answer[]
  +startTime: Date
  +endTime: Date
  +score: number
  +isCompleted: boolean
  +submit(): QuizResult
  +saveProgress(): void
}

// İlişkiler
User ||--o{ Course : instructs
Course ||--o{ Quiz : contains
Quiz ||--o{ Question : includes
Quiz ||--o{ QuizAttempt : tracks
User ||--o{ QuizAttempt : attempts
```

## 3.5. UML Aktivite Diyagramları

**Şekil 3.3: AI Soru Üretimi Akış Diyagramı**

```
[Başla]
    |
    v
[İçerik Kaynağı Seç] --> [PDF/DOCX?] --Evet--> [Dosya Parse Et]
    |                         |                       |
    |                        Hayır                    v
    v                         |                [Metin Çıkar]
[Direkt Metin Gir] <---------+                       |
    |                                                 |
    v                                                 |
[Metin Ön İşleme] <-----------------------------------+
    |
    v
[Anahtar Kelime Analizi]
    |
    v
[Gemini API Prompt Hazırla]
    |
    v
[API Çağrısı Yap]
    |
    v
[Yanıt Al] --> [Hata Var?] --Evet--> [Hata Logla] --> [Yeniden Dene]
    |               |                                        |
    |              Hayır                                     |
    v               |                                        |
[JSON Parse Et] <---+                                       |
    |                                                       |
    v                                                       |
[Soru Formatı Kontrol] --> [Format Hatalı?] --Evet---------+
    |                           |
    |                          Hayır
    v                           |
[Soru Kalite Kontrolü] <-------+
    |
    v
[Veritabanına Kaydet]
    |
    v
[Başarı Mesajı]
    |
    v
[Bitir]
```

**Şekil 3.4: Quiz Çözme Süreci Aktivite Diyagramı**

```
[Öğrenci Dashboard]
    |
    v
[Mevcut Quizleri Listele]
    |
    v
[Quiz Seç] --> [Quiz Detayları Göster]
    |                  |
    v                  v
[Başlat Onayı] --> [Quiz Başlat]
    |                  |
    v                  v
[İlk Soruyu Göster] <--+
    |
    v
[Soru Cevapla] --> [Cevap Geçerli?] --Hayır--> [Hata Mesajı]
    |                   |                           |
    |                  Evet                        |
    v                   |                          |
[Cevabı Kaydet] <------+                          |
    |                                              |
    v                                              |
[Son Soru?] --Hayır--> [Sonraki Soru] --> [Soruyu Göster]
    |                                              |
   Evet                                            |
    |                                              |
    v                                              |
[Quiz Değerlendir] <-------------------------------+
    |
    v
[Skor Hesapla]
    |
    v
[Sonuçları Göster]
    |
    v
[Quiz Tamamlandı]
```

## 3.6. Veritabanı Şeması

**Firebase Firestore Collections Yapısı:**

**Users Collection:**
```typescript
users/{userId} {
  email: string,
  name: string,
  role: 'instructor' | 'student',
  profileImage?: string,
  preferences: {
    language: string,
    notifications: boolean,
    theme: 'light' | 'dark'
  },
  createdAt: timestamp,
  lastLogin: timestamp,
  isActive: boolean
}
```

**Courses Collection:**
```typescript
courses/{courseId} {
  title: string,
  description: string,
  instructorId: string,
  students: string[],
  tags: string[],
  isPublic: boolean,
  settings: {
    allowLateSubmissions: boolean,
    showCorrectAnswers: boolean,
    maxAttempts: number
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Quizzes Collection:**
```typescript
quizzes/{quizId} {
  title: string,
  description: string,
  courseId: string,
  questions: Question[],
  settings: {
    timeLimit: number,
    maxAttempts: number,
    shuffleQuestions: boolean,
    showResults: boolean
  },
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Quiz Attempts Collection:**
```typescript
quiz-attempts/{attemptId} {
  quizId: string,
  studentId: string,
  answers: {
    questionId: string,
    selectedAnswer: string,
    isCorrect: boolean,
    timeSpent: number
  }[],
  score: number,
  percentage: number,
  startTime: timestamp,
  endTime: timestamp,
  completionTime: number,
  isCompleted: boolean
}
```

## 3.7. Geliştirme Metodolojisi

**Agile Scrum Yaklaşımı:**
Proje geliştirmesi 2 haftalık sprint döngüleri ile yürütülmüştür. Her sprint sonunda çalışan yazılım artımı teslim edilmiş, paydaş geri bildirimleri bir sonraki sprint planlamasına dahil edilmiştir.

**Sprint Planlaması:**
- **Sprint 1-2:** Proje kurulumu, teknoloji stack seçimi, temel mimari tasarım
- **Sprint 3-4:** Kullanıcı kimlik doğrulama ve yetkilendirme sistemi
- **Sprint 5-6:** Ders ve quiz yönetim modülleri geliştirme
- **Sprint 7-8:** AI entegrasyonu ve otomatik soru üretimi özelliği
- **Sprint 9-10:** Test süreçleri, performans optimizasyonu ve dağıtım

**Kalite Güvence Süreçleri:**
- **Unit Testing:** Jest framework ile %85+ kod kapsama oranı
- **Integration Testing:** API endpoint'lerin kapsamlı test edilmesi
- **E2E Testing:** Cypress ile kritik kullanıcı yolculuklarının otomasyonu
- **Code Review:** Pull request tabanlı akran değerlendirme süreci
- **Performance Monitoring:** Lighthouse ve PageSpeed Insights ile sürekli izleme

**CI/CD Pipeline:**
GitHub Actions kullanılarak otomatik build, test ve deployment süreçleri kurulmuştur. Master branch'e yapılan her commit, otomatik test pipeline'ından geçerek production ortamına dağıtılmaktadır.

Bu metodoloji ile platform geliştirme sürecinde sürekli geri bildirim döngüsü sağlanarak, kullanıcı ihtiyaçlarına uygun, kaliteli ve sürdürülebilir bir yazılım ürünü ortaya çıkarılmıştır.
