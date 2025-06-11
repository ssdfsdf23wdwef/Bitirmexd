# Tez için AI Quiz Platformu Dokümantasyonu

## 1. Giriş ve Proje Genel Bakışı

### 1.1. Proje Vizyonu ve Amacı
AI Quiz Platform, her seviyeden öğrencinin ve profesyonelin bilgi düzeylerini ölçmelerine, eksiklerini tespit etmelerine ve öğrenme süreçlerini kişiye özel bir deneyimle optimize etmelerine olanak tanıyan, yapay zeka destekli, yenilikçi bir eğitim teknolojisi çözümüdür. Geleneksel sınav ve değerlendirme yöntemlerinin ötesine geçerek, öğrenmeyi daha etkileşimli, motive edici ve verimli hale getirmeyi amaçlar.

**Temel Hedefler:**
- Kişiselleştirilmiş öğrenme deneyimleri sunmak.
- Yapay zeka ile akıllı sınavlar ve içerik üretmek.
- Kullanıcıların öğrenme hedeflerini takip etmelerini ve ulaşmalarını sağlamak.
- Kapsamlı performans analizi ve geri bildirimler sunmak.
- Modern, kullanıcı dostu ve erişilebilir bir platform oluşturmak.

### 1.2. Temel Çalışma Prensibi
Platform, iki ana sınav türü sunar:
- **Hızlı Sınav:** Üyelik gerektirmeden, belge yükleyerek veya konu seçerek anlık quiz oluşturma ve değerlendirme.
- **Kişiselleştirilmiş Sınav:** Kullanıcı performansına, öğrenme geçmişine ve hedeflerine dayalı adaptif sınavlar, detaylı analizler ve öğrenme rotası önerileri.

Yapay zeka (Google Gemini 2.0 Flash), belge analizi, konu çıkarımı, soru üretimi, performans değerlendirmesi ve kişiselleştirilmiş geri bildirimler gibi kritik süreçlerde aktif rol oynar.

### 1.3. Hedef Kitle
- **Öğrenciler (K-12, Üniversite, Lisansüstü):** Sınavlara hazırlık, konu tekrarı, eksik giderme.
- **Profesyoneller ve Yaşam Boyu Öğrenenler:** Mesleki gelişim, yeni beceri kazanımı, sertifika hazırlığı.
- **Eğitmenler ve Öğretmenler:** Özelleştirilmiş sınav oluşturma, öğrenci takibi.
- **Kurumlar ve Şirketler:** Çalışan eğitimi, yetkinlik ölçümü.

## 2. Temel Kavramlar ve Terminoloji

- **Kullanıcı (User):** Platforma erişen ve hizmetlerden faydalanan birey/kurum.
- **Ders (Course / Çalışma Alanı):** Organize edilmiş içerik, sınav ve öğrenme hedeflerinin bulunduğu sanal ortam.
- **İçerik Öğesi (Content Item):** Öğrenme materyali (metin, video, PDF vb.).
- **Konu/Alt Konu (Topic/Sub-topic):** Dersin mantıksal alt bölümleri.
    - **Alt Konu Normalizasyonu:** Farklı kaynaklardan gelen benzer konuların standartlaştırılması.
- **Öğrenme Hedefi (Learning Objective):** Kullanıcının kazanması beklenen bilgi/beceri.
- **Sınav (Quiz):** Bilgi düzeyini ölçme aracı (Hızlı veya Kişiselleştirilmiş).

## 3. Platform Özellikleri

### 3.1. Yapay Zeka Destekli Özellikler
- **Akıllı Belge Analizi:** PDF, Word belgelerinden otomatik konu ve içerik çıkarımı.
- **Google Gemini 2.0 Flash Entegrasyonu:** Güncel AI modeli ile soru üretimi, içerik analizi.
- **Adaptif Soru Üretimi:** Kullanıcı seviyesine ve performansına uygun sorular.
- **Çok Dilli Destek:** Türkçe ve İngilizce içerik.
- **Performans Analizi ve Öneriler:** AI destekli öğrenme analizi.
- **Akıllı Önbellekleme:** AI çıktılarının optimize edilmiş cache'lenmesi.

### 3.2. İçerik Yönetimi
- **Ders (Course) Sistemi:** Hiyerarşik çalışma alanları.
- **Gelişmiş Belge Desteği:** PDF, DOCX işleme.
- **Konu Ağacı:** Hiyerarşik konu yapısı.
- **Otomatik İçerik Sınıflandırma:** AI ile kategorilendirme.
- **Versiyon Kontrolü:** Belge ve içerik sürüm yönetimi.

### 3.3. Analiz ve Raporlama
- **Performans Takibi:** Konu bazlı başarı analizi.
- **Öğrenme Hedefleri Takibi:** Kişiselleştirilmiş hedef belirleme ve izleme.
- **İlerleme Raporları:** Chart.js ile görselleştirilmiş performans.
- **Zayıf Konu Tespiti:** Makine öğrenmesi ile gelişim alanlarının belirlenmesi.
- **Gerçek Zamanlı Dashboard:** Canlı performans metrikleri.

### 3.4. Güvenlik ve Kullanıcı Yönetimi
- **Firebase Authentication:** Güvenli kullanıcı girişi, MFA.
- **JWT Token Sistemi:** API güvenliği.
- **CORS Koruması, Rate Limiting, Helmet Integration.**
- **Input Validation:** Zod + Class Validator.
- **Data Encryption.**

### 3.5. Modern Kullanıcı Arayüzü (UI/UX)
- **TailwindCSS 4, NextUI Entegrasyonu.**
- **Dark/Light Mode.**
- **Responsive Design.**
- **Framer Motion ile Animasyonlar.**
- **Erişilebilirlik (WCAG 2.1).**

### 3.6. Performans Optimizasyonları
- **Next.js 15 App Router (SSR, SSG).**
- **Bundle Optimization (Webpack 5).**
- **Image Optimization (WebP/AVIF).**
- **Code Splitting, Caching Strategies.**
- **Core Web Vitals Odaklı.**

## 4. Teknoloji Yığını ve Mimari

### 4.1. Genel Mimari
- **Frontend (Sunum Katmanı):** Next.js, React, TailwindCSS, NextUI.
- **Backend (Uygulama Katmanı):** NestJS, TypeScript.
- **Veri Katmanı:** Firebase Firestore, Firebase Storage.
- **Yapay Zeka Katmanı:** Google Gemini 2.0 Flash API.
- **İletişim:** RESTful API (HTTPS, JSON), JWT ile kimlik doğrulama.

### 4.2. Frontend Teknolojileri
- **Framework:** Next.js 15.2+ (React 19.1+)
- **UI Kütüphaneleri:**
    - NextUI v2.6+
    - TailwindCSS v4 (Latest)
    - Material-UI v7.1+ (Icons)
- **State Management:** Zustand v5.0+
- **Data Fetching:** TanStack Query v5.74+ (React Query)
- **Charts:** Chart.js v4.4+, React Chart.js 2 v5.2+
- **Icons:** React Icons v5.5+, Lucide React v0.503+
- **Animation:** Framer Motion v12.16+
- **Styling Helpers:** Class Variance Authority, Tailwind Merge
- **Internationalization:** i18next v23.8+
- **Build Tools:** Webpack 5, SWC Compiler

### 4.3. Backend Teknolojileri
- **Framework:** NestJS v10.4+ (TypeScript)
- **Veritabanı:** Firebase Firestore v13.3+
- **Kimlik Doğrulama:** Firebase Auth + JWT v9.0+
- **AI/ML:** Google Gemini 2.0 Flash (Latest Model)
- **Dosya İşleme:** Mammoth v1.9+ (Word), PDF-Parse v1.1+
- **Loglama:** Winston v3.17+
- **Validasyon:** Class Validator v0.14+, Zod v3.25+
- **Güvenlik:** Helmet v7.1+, Bcrypt v5.1+

### 4.4. Veritabanı Modeli (Firestore)
Google Cloud Firestore (NoSQL doküman veritabanı) kullanılır.
**Ana Koleksiyonlar:**
-   `users`: Kullanıcı profilleri ve kimlik bilgileri.
-   `courses`: Dersler, konular, içerik öğeleri, öğrenme hedefleri, kayıtlar.
-   `quizzes`: Sınav kayıtları, sonuçları, sınav soruları.
-   `questions`: Genel soru bankası.
-   `userLearningObjectives`: Kullanıcıya özel öğrenme hedefleri ve ilerlemeleri.
-   `quickQuizResults`: Hızlı sınav geçici sonuçları.
(Kaynak: `prd.md` Bölüm 7 - Detaylı alanlar ve alt koleksiyonlar için bu kaynağa bakınız.)
Uygun indeksleme ve denormalizasyon teknikleri performans için önemlidir.

### 4.5. API Mimarisi (Backend)
- **Modüler NestJS Yapısı:** `auth`, `courses`, `documents`, `quizzes`, `ai`, `firebase` gibi modüller.
- **Controller'lar:** HTTP isteklerini yönetir.
- **Servisler:** İş mantığını içerir.
- **DTO'lar:** Veri transfer objeleri.
- **Swagger/OpenAPI:** API dokümantasyonu (`http://localhost:3001/api`).

**Ana API Endpoint'leri:**
- **Quiz Yönetimi:** `/quizzes/generate`, `/quizzes/personalized`, `/quizzes/:id/submit`
- **Kurs Yönetimi:** `/courses`, `/courses/:id`
- **Belge Yönetimi:** `/documents/upload`, `/documents/analyze`
- **Öğrenme Hedefleri:** `/learning-targets/course/:courseId`
- **Kimlik Doğrulama:** `/auth/login`, `/auth/register`
- **Sistem Sağlığı:** `/health`

### 4.6. Frontend Mimarisi
- **Next.js App Router:** `/app` dizini altında sayfalar ve rotalar.
- **Bileşenler (`/components`):**
    - `/ui`: Temel UI (Button, Card).
    - `/quiz`, `/course`: Özelleşmiş bileşenler.
- **Hook'lar (`/hooks`):** `useAuth`, `useQuiz`.
- **State Yönetimi (`/store`):** Zustand store'ları (authStore, quizStore).
- **Servisler (`/services`):** API iletişim katmanı.
- **Tipler (`/types`):** TypeScript tanımlamaları.

## 5. Kurulum ve Kullanım

### 5.1. Gereksinimler
- Node.js 18+ (Önerilen: v20.x)
- npm 8+ (Önerilen: v10.x)
- Firebase projesi (SDK v11.4+)
- Google AI API anahtarı (Gemini 2.0 Flash)

### 5.2. Kurulum Adımları
1.  **Projeyi Klonlama:** `git clone <repository-url>`
2.  **Backend Kurulumu:**
    ```bash
    cd backend
    npm install
    # .env dosyası oluşturup Firebase ve Gemini API anahtarlarını girin.
    # Örnek .env içeriği backend/README.md'de mevcut.
    ```
3.  **Frontend Kurulumu:**
    ```bash
    cd frontend
    npm install
    # .env.local dosyası oluşturup API URL ve Firebase yapılandırmasını girin.
    # Örnek .env.local içeriği frontend/README.md'de mevcut.
    ```
4.  **Uygulamayı Başlatma:**
    - **Backend:** `cd backend && npm run start:dev` (veya `npm run start:fast`)
    - **Frontend:** `cd frontend && npm run dev`
    - **Erişim:**
        - Frontend: `http://localhost:3000`
        - Backend API: `http://localhost:3001`
        - Swagger API Docs: `http://localhost:3001/api`

### 5.3. Kullanım Senaryoları
- **Hızlı Sınav:** Ana sayfadan belge yükleyerek veya konu seçerek anında sınav.
- **Kişiselleştirilmiş Sınav:** Hesap oluşturup giriş yaparak; ders oluşturma, belge yükleme, öğrenme hedefleri belirleme ve adaptif sınavlar çözme.
- **Analiz ve Raporlar:** Sınav sonrası detaylı performans analizi, konu bazlı grafikler.

## 6. API Dokümantasyonu (Özet)

Detaylı Swagger dokümantasyonu: `http://localhost:3001/api`

**Temel Endpoint Grupları:**
- **Quiz Yönetimi (`/quizzes`):** Sınav oluşturma, gönderme, sonuç alma.
- **Kurs Yönetimi (`/courses`):** Kurs oluşturma, listeleme, detay alma, güncelleme, silme.
- **Belge Yönetimi (`/documents`):** Belge yükleme, analiz etme, detay alma.
- **Öğrenme Hedefleri (`/learning-targets`):** Hedef listeleme, analiz alma.
- **Kimlik Doğrulama (`/auth`):** Giriş, kayıt, profil.
- **Sistem (`/health`, `/metrics`):** Sağlık durumu, performans metrikleri.

## 7. Geliştirme Süreçleri

### 7.1. Kod Kalitesi ve Standartları
- **TypeScript First:** Tam TypeScript kullanımı.
- **Linting & Formatting:** ESLint + Prettier (Backend & Frontend).
- **Kullanılmayan Kod Analizi:** Knip (Backend & Frontend).
- **Bağımlılık Analizi:** Depcheck (Backend & Frontend).
- **Commit Konvansiyonları:** `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
- **Component-Driven Development (Frontend).**
- **Performance First & Accessibility (WCAG 2.1 AA).**

### 7.2. Test Stratejileri
- **Backend (Jest):**
    - Unit Testler (`npm run test`)
    - End-to-End Testler (`npm run test:e2e`)
    - Coverage Raporu (`npm run test:cov`)
- **Frontend (Jest planlanıyor):** Test framework kurulumu ve test yazımı gelecek sürümlerde.

### 7.3. Debug ve Monitoring
- **Backend Logları:** Winston ile `backend/logs/` altında (error, flow-tracker, learning_targets, sinav-olusturma).
- **Frontend Logları:** Browser console ve `frontend/logs/frontend-general.log`.
- **Performance Monitoring:** Firebase Performance Monitoring.
- **Error Tracking:** Sentry entegrasyonu.
- **Health Checks:** API endpoint sağlık kontrolleri.

### 7.4. AI Model Konfigürasyonu
- **Model:** Google Gemini 2.0 Flash
- **Temperature:** 0.7
- **Max Tokens:** 30,024
- **Safety Settings:** Orta seviye
- **Prompt Engineering:** Optimize edilmiş Türkçe prompt şablonları (`backend/src/ai/prompts/`).

### 7.5. Proje Yapısı
```
ai-quiz-platform/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── ai/                # AI servisleri (Gemini, prompts, schemas)
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── documents/
│   │   ├── quizzes/
│   │   ├── learning-targets/
│   │   ├── firebase/
│   │   └── common/
│   ├── logs/
│   └── package.json
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React bileşenleri (ui, quiz, course)
│   │   ├── services/          # API servisleri
│   │   ├── store/             # Zustand state
│   │   ├── hooks/
│   │   └── types/
│   ├── public/
│   └── package.json
├── docs/
├── prd.md
└── README.md
```

## 8. Kullanıcı Deneyimi (UX/UI) ve Tasarım İlkeleri

- **Kullanıcı Odaklılık, Basitlik, Tutarlılık, Erişilebilirlik (WCAG).**
- **Modern ve Çekici Arayüz:** TailwindCSS, NextUI, Framer Motion.
- **Renk Paleti:** Ana: Mavi (#3b82f6), İkincil: Mor (#8b5cf6), Vurgu: Amber (#f59e0b).
- **Tipografi:** Inter (Primary), JetBrains Mono (Code).
- **Mobil Uyumluluk (Responsive Design).**
- **Karanlık Mod (Dark Mode) Desteği.**
- **Net Navigasyon, Anlaşılır Formlar, Etkili Bildirimler.**
- **Onboarding Süreci (Planlanan).**

## 9. Gelecek Planları ve İyileştirmeler

### Kısa Vadeli (Q3 2025)
- Mobil Uygulama (React Native)
- Offline Mode (PWA)
- Gelişmiş Analitikler (ML)
- İşbirlikçi Öğrenme
- Sesli Sorular

### Orta Vadeli (Q4 2025)
- Tam Çok Dilli Destek
- AI Öğretmen Asistanı
- Oyunlaştırma
- LMS Entegrasyonları
- Kurumsal Raporlama

### Uzun Vadeli (2026+)
- VR/AR Desteği
- Blockchain Sertifikaları
- Tam Otomatik İçerik Üretimi
- Öğrenme Başarısı Tahmini

## 10. Ek Bilgiler

### Proje İstatistikleri (Tahmini/Hedef)
- **Backend:** 50+ API endpoint, 25+ servis modülü.
- **Frontend:** 100+ React bileşeni.
- **AI Integration:** Google Gemini 2.0 Flash ile 15+ AI servisi.
- **Database:** 8+ Firestore koleksiyonu.
- **Code Quality:** TypeScript %100, ESLint + Prettier.

### Lisans
- MIT License

### Katkıda Bulunma
- Standart GitHub fork & pull request süreci.
- Conventional Commits kullanımı.

### İletişim ve Destek
- Email: developer@aiquizplatform.com (Örnek)
- GitHub Issues.

Bu doküman, AI Quiz Platformu'nun kapsamlı bir özetini sunmaktadır. Projenin geliştirme süreci boyunca detaylar güncellenebilir ve genişletilebilir.
