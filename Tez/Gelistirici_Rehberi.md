# AI Quiz Platformu - Geliştirici Rehberi

## 1. Giriş

Bu rehber, AI Quiz Platformu projesinin teknik detaylarını, mimarisini, kurulumunu ve geliştirme süreçlerini anlamanıza yardımcı olmak amacıyla hazırlanmıştır. Projemiz, yapay zeka destekli kişiselleştirilmiş bir sınav ve öğrenme deneyimi sunmayı hedefler.

**Hedef Kitle:** Bu rehber, projeye katkıda bulunmak isteyen veya projenin teknik altyapısını merak eden yazılım geliştiriciler için tasarlanmıştır.

## 2. Teknoloji Yığını

Proje, modern ve ölçeklenebilir teknolojiler kullanılarak geliştirilmiştir:

*   **Frontend:** Next.js (React), TailwindCSS, NextUI, Zustand, TanStack Query
*   **Backend:** NestJS (Node.js, TypeScript), Firebase Admin SDK
*   **Veritabanı:** Firebase Firestore (NoSQL), Firebase Storage
*   **Yapay Zeka:** Google Gemini 2.0 Flash API
*   **Kimlik Doğrulama:** Firebase Authentication, JWT

## 3. Mimari Genel Bakış

### 3.1. Katmanlı Mimari
Platform, birbirinden bağımsız çalışabilen ancak entegre bir şekilde hizmet veren katmanlardan oluşur:

*   **Sunum Katmanı (Frontend):** Kullanıcı arayüzü ve etkileşimleri yönetir.
*   **Uygulama Katmanı (Backend):** İş mantığı, API servisleri ve üçüncü parti entegrasyonları (AI, Firebase) barındırır.
*   **Veri Katmanı:** Firebase Firestore ve Storage üzerinde veri depolama ve yönetimi.
*   **Yapay Zeka Katmanı:** Google Gemini API'si ile doğal dil işleme, soru üretme ve analiz görevlerini üstlenir.

### 3.2. Backend Mimarisi (NestJS)

*   **Modüler Yapı:** Proje, `auth`, `courses`, `documents`, `quizzes`, `ai`, `firebase` gibi işlevsel modüllere ayrılmıştır. Her modül kendi controller, service ve DTO (Data Transfer Object) tanımlarına sahiptir.
*   **Controller'lar:** HTTP isteklerini alır, doğrular ve ilgili servislere yönlendirir.
*   **Servisler:** İş mantığını içerir, veritabanı işlemleri ve AI servis çağrılarını gerçekleştirir.
*   **DTO'lar:** İstek ve yanıt verilerinin yapısını tanımlar, validasyon için `class-validator` ve `zod` kullanılır.
*   **Guard'lar ve Interceptor'lar:** Kimlik doğrulama, yetkilendirme ve loglama gibi kesişen ilgileri yönetir.

### 3.3. Frontend Mimarisi (Next.js)

*   **App Router:** Sayfa yönlendirmeleri ve layout'lar `/app` dizini altında yönetilir. Sunucu Taraflı Oluşturma (SSR) ve Statik Site Üretimi (SSG) yeteneklerinden faydalanılır.
*   **Bileşenler (`/src/components`):**
    *   `/ui`: Genel amaçlı, yeniden kullanılabilir UI bileşenleri (Button, Card, Input vb.).
    *   Özelleşmiş Bileşenler: `/quiz`, `/course` gibi belirli özelliklere yönelik bileşenler.
*   **Hook'lar (`/src/hooks`):** Tekrarlayan mantık ve state yönetimini soyutlamak için (örn: `useAuth`, `useQuizData`).
*   **State Yönetimi (`/src/store`):** Global state yönetimi için Zustand kullanılır (örn: `authStore`, `quizStore`).
*   **Servisler (`/src/services`):** Backend API'leri ile iletişim kuran fonksiyonları içerir. TanStack Query (React Query) ile veri çekme, önbellekleme ve senkronizasyon işlemleri yönetilir.
*   **Tipler (`/src/types`):** Proje genelinde kullanılan TypeScript arayüzleri ve tipleri.

### 3.4. Veritabanı Modeli (Firebase Firestore)

Google Cloud Firestore (NoSQL doküman veritabanı) kullanılır. Ana koleksiyonlar:
*   `users`: Kullanıcı profilleri, ayarları ve kimlik bilgileri.
*   `courses`: Dersler, bu derslere ait konular, içerik öğeleri, öğrenme hedefleri ve kullanıcı kayıtları.
*   `quizzes`: Oluşturulan sınavlar, kullanıcıların bu sınavlara verdiği cevaplar, sonuçlar ve AI tarafından üretilen sorular.
*   `questions`: Genel bir soru bankası (gelecekteki genişletmeler için).
*   `userLearningObjectives`: Kullanıcıların belirli dersler için tanımladığı öğrenme hedefleri ve bu hedeflere ulaşma ilerlemeleri.
*   `quickQuizResults`: Üyeliksiz oluşturulan hızlı sınavların geçici sonuçları.

Veri modelinde performans ve sorgu esnekliği için uygun indeksleme ve gerektiğinde denormalizasyon teknikleri kullanılır.

### 3.5. API Mimarisi

*   **RESTful API:** Backend, standart HTTP metotları (GET, POST, PUT, DELETE) ile erişilebilen RESTful endpoint'ler sunar.
*   **Kimlik Doğrulama:** API istekleri JWT (JSON Web Token) ile korunur. Firebase Auth ile kullanıcı kimlik doğrulaması yapılır ve token'lar üretilir.
*   **Swagger/OpenAPI Dokümantasyonu:** API endpoint'leri, istek/yanıt formatları ve parametreleri `http://localhost:3001/api` adresinde Swagger arayüzü ile belgelenir.

**Ana API Endpoint Grupları:**
*   `/auth`: Kullanıcı kayıt, giriş, profil işlemleri.
*   `/courses`: Ders oluşturma, listeleme, detay alma, güncelleme, silme.
*   `/documents`: Belge yükleme, analiz etme, içerik çıkarma.
*   `/quizzes`: Sınav oluşturma (hızlı/kişiselleştirilmiş), cevap gönderme, sonuç alma.
*   `/learning-targets`: Öğrenme hedefleri yönetimi.
*   `/ai`: Doğrudan AI servisleriyle ilgili işlemler (gerekirse).

## 4. Kurulum Adımları

### 4.1. Ön Gereksinimler
*   Node.js: v18.x veya üzeri (Önerilen: v20.x)
*   npm: v8.x veya üzeri (Önerilen: v10.x)
*   Firebase Projesi: Firestore, Firebase Storage ve Firebase Authentication servisleri aktif edilmiş olmalı.
*   Google AI API Anahtarı: Google Gemini 2.0 Flash modeline erişim için.

### 4.2. Projeyi Klonlama
```bash
git clone <repository-url>
cd ai-quiz-platform
```

### 4.3. Backend Kurulumu
```bash
cd backend
npm install
```
Projenin kök dizininde (`backend/`) bir `.env` dosyası oluşturun ve aşağıdaki gibi Firebase servis hesabı anahtarınızı (JSON formatında base64 encode edilmiş hali) ve Google Gemini API anahtarınızı girin:
```env
# backend/.env örneği
NODE_ENV=development
PORT=3001

# Firebase Admin SDK (JSON içeriğini base64 encode edin)
FIREBASE_SERVICE_ACCOUNT_BASE64=YOUR_BASE64_ENCODED_FIREBASE_SERVICE_ACCOUNT_JSON
FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET_URL # Örneğin: my-project.appspot.com

# Google Gemini API
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY

# JWT Ayarları
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY
JWT_EXPIRATION_TIME=3600s # 1 saat
```
Firebase servis hesabı anahtarını Firebase konsolundan indirip içeriğini base64'e çevirerek kullanabilirsiniz.

### 4.4. Frontend Kurulumu
```bash
cd ../frontend
npm install
```
Projenin kök dizininde (`frontend/`) bir `.env.local` dosyası oluşturun ve aşağıdaki gibi API URL'nizi ve Firebase istemci SDK yapılandırmanızı girin:
```env
# frontend/.env.local örneği
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID # Opsiyonel
```
Bu değerleri Firebase projenizin ayarlarından (Project settings > General > Your apps > Web app) alabilirsiniz.

### 4.5. Uygulamayı Başlatma

*   **Backend API:**
    ```bash
    cd backend
    npm run start:dev
    ```
    API `http://localhost:3001` adresinde çalışmaya başlayacaktır. Swagger dokümantasyonu için `http://localhost:3001/api`.

*   **Frontend Uygulaması:**
    ```bash
    cd frontend
    npm run dev
    ```
    Uygulama `http://localhost:3000` adresinde erişilebilir olacaktır.

## 5. Proje Yapısı (Özet)

```
ai-quiz-platform/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── ai/                 # AI servisleri (Gemini entegrasyonu, prompt'lar, şemalar)
│   │   ├── auth/               # Kimlik doğrulama modülü
│   │   ├── courses/            # Ders yönetimi modülü
│   │   ├── documents/          # Belge işleme ve analiz modülü
│   │   ├── quizzes/            # Sınav oluşturma ve değerlendirme modülü
│   │   ├── learning-targets/   # Öğrenme hedefleri modülü
│   │   ├── firebase/           # Firebase Admin SDK entegrasyonu
│   │   ├── common/             # Paylaşılan modüller, DTO'lar, utility'ler
│   │   ├── config/             # Konfigürasyon yönetimi
│   │   ├── main.ts             # Uygulama giriş noktası
│   │   └── app.module.ts       # Ana uygulama modülü
│   ├── logs/                   # Backend log dosyaları
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Next.js Frontend Uygulaması
│   ├── src/
│   │   ├── app/                # Next.js App Router (sayfalar, layout'lar)
│   │   ├── components/         # React bileşenleri (ui, quiz, course vb.)
│   │   ├── services/           # API iletişim katmanı (TanStack Query ile)
│   │   ├── store/              # Global state yönetimi (Zustand)
│   │   ├── hooks/              # Özel React hook'ları
│   │   ├── lib/                # Yardımcı fonksiyonlar, istemci taraflı Firebase kurulumu
│   │   ├── styles/             # Global stiller, TailwindCSS konfigürasyonu
│   │   └── types/              # TypeScript tip tanımlamaları
│   ├── public/                 # Statik dosyalar (resimler, ikonlar)
│   ├── package.json
│   └── tsconfig.json
├── docs/                       # Proje dokümantasyonları (bu rehber gibi)
├── prd.md                      # Ürün Gereksinimleri Dokümanı
└── README.md                   # Ana README dosyası
```

## 6. Geliştirme Süreçleri

### 6.1. Kod Kalitesi ve Standartları
*   **TypeScript First:** Hem backend hem de frontend'de statik tipleme için TypeScript kullanılır.
*   **Linting ve Formatlama:** ESLint ve Prettier ile kod standartları ve formatlama otomatikleştirilmiştir.
    *   Backend: `npm run lint` ve `npm run format`
    *   Frontend: `npm run lint` ve `npm run format`
*   **Kullanılmayan Kod Analizi:** Knip aracı ile periyodik olarak kullanılmayan dosyalar, bağımlılıklar ve export'lar tespit edilir.
*   **Bağımlılık Analizi:** Depcheck ile gereksiz veya kullanılmayan bağımlılıklar kontrol edilir.
*   **Commit Konvansiyonları:** Anlamlı ve takip edilebilir bir commit geçmişi için "Conventional Commits" standardı benimsenmiştir (örn: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`).
*   **Component-Driven Development (Frontend):** Arayüz, yeniden kullanılabilir ve test edilebilir bileşenler üzerine kuruludur.
*   **Performans ve Erişilebilirlik:** Core Web Vitals metrikleri ve WCAG 2.1 AA erişilebilirlik standartları göz önünde bulundurulur.

### 6.2. Test Stratejileri
*   **Backend (Jest):**
    *   **Unit Testler:** Servislerdeki ve controller'lardaki iş mantığını test etmek için (`npm run test`).
    *   **End-to-End (E2E) Testler:** API endpoint'lerinin tam entegrasyonunu test etmek için (`npm run test:e2e`).
    *   **Coverage Raporu:** Test kapsamını ölçmek için (`npm run test:cov`).
*   **Frontend (Jest + React Testing Library):**
    *   Bileşen testleri, hook testleri ve kullanıcı etkileşim testleri yazılması hedeflenmektedir. (Kurulum ve test yazımı devam etmektedir).

### 6.3. Debug ve Monitoring
*   **Backend Logları:** Winston kütüphanesi ile detaylı loglama yapılır. Loglar `backend/logs/` dizininde tutulur (örn: `backend-error.log`, `backend-flow-tracker.log`).
*   **Frontend Logları:** Tarayıcı konsolu ve `frontend/logs/frontend-general.log` dosyası üzerinden takip edilebilir.
*   **Performans İzleme:** Firebase Performance Monitoring entegrasyonu ile uygulama performansı izlenir.
*   **Hata Takibi:** Sentry gibi bir araçla canlı ortamdaki hataların takibi ve raporlanması planlanmaktadır.
*   **Sağlık Kontrolleri:** Backend API'sinde `/health` gibi endpoint'ler ile sistem sağlığı kontrol edilebilir.

### 6.4. AI Model Konfigürasyonu (Google Gemini 2.0 Flash)
*   **Model:** `gemini-2.0-flash` (veya en güncel uygun model).
*   **Temperature:** Genellikle `0.7` civarında, yaratıcılık ve tutarlılık dengesi için.
*   **Max Output Tokens:** İhtiyaca göre ayarlanır, genellikle `30000` civarı geniş bir aralık sunar.
*   **Safety Settings:** Google AI Studio'daki varsayılan veya projeye özel güvenlik ayarları kullanılır.
*   **Prompt Engineering:** Etkili ve doğru sonuçlar almak için optimize edilmiş Türkçe prompt şablonları kullanılır. Bu şablonlar `backend/src/ai/prompts/` dizininde bulunabilir. Prompt'lar, göreve özel olarak (soru üretme, konu analizi vb.) tasarlanmıştır.

## 7. API Dokümantasyonu

Backend API'sinin detaylı ve interaktif dokümantasyonuna, backend sunucusu çalışırken aşağıdaki adresten erişebilirsiniz:
*   **Swagger UI:** `http://localhost:3001/api`

Bu arayüz üzerinden tüm endpoint'leri, beklenen istek formatlarını, yanıt şemalarını ve örnek kullanımları görebilir, hatta doğrudan API'ye test istekleri gönderebilirsiniz.

## 8. Katkıda Bulunma

Projeye katkıda bulunmak isterseniz, lütfen aşağıdaki adımları izleyin:
1.  Projeyi fork'layın.
2.  Yeni bir özellik veya hata düzeltmesi için kendi branch'inizi oluşturun (`git checkout -b feat/yeni-ozellik` veya `fix/hata-duzeltmesi`).
3.  Değişikliklerinizi yapın ve commit'leyin (Conventional Commits formatında).
4.  Kendi fork'unuza push'layın (`git push origin feat/yeni-ozellik`).
5.  Ana projeye bir Pull Request (PR) açın.
6.  PR'ınız gözden geçirilecek ve uygun bulunursa birleştirilecektir.

Lütfen kodlama standartlarına ve test gereksinimlerine uymaya özen gösterin.

---

Bu rehber, projenin geliştirme sürecine hızlı bir başlangıç yapmanızı sağlamayı amaçlamaktadır. Daha fazla detay veya spesifik sorularınız için proje içindeki diğer dokümanlara (`prd.md`, `README.md` dosyaları) ve kod yorumlarına başvurabilirsiniz.
