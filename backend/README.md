# AI Quiz Backend API

> Yapay zeka destekli quiz platformu backend API'si - NestJS, TypeScript, Firebase ve Google Gemini 2.0 Flash ile geliştirilmiş enterprise-grade eğitim teknolojisi çözümü.

## 🚀 Özellikler

- **Modern NestJS Framework**: TypeScript ile tip güvenli geliştirme
- **Google Gemini 2.0 Flash**: En güncel AI modeli entegrasyonu
- **Firebase Firestore**: NoSQL veritabanı ve gerçek zamanlı senkronizasyon
- **JWT Authentication**: Güvenli kimlik doğrulama sistemi
- **Swagger Documentation**: Otomatik API dokümantasyonu
- **Winston Logging**: Kategorize edilmiş loglama sistemi
- **Performance Monitoring**: Sistem sağlığı ve performans takibi

## Ortam Değişkenleri

Backend uygulaması, `.env` dosyasında tanımlanan aşağıdaki ortam değişkenlerini kullanır:

### API Yapılandırması

```
PORT=3001                        # API port numarası
NODE_ENV=development             # Ortam (development, production)
APP_VERSION=1.0.0                # Uygulama versiyonu
CORS_ORIGIN=http://localhost:3000  # CORS origin URL
```

### Önbellekleme Ayarları

```
CACHE_TTL_SECONDS=300           # Önbellek süresi (saniye)
CACHE_MAX_ITEMS=100             # Maksimum önbellek öğe sayısı
```

### Firebase Yapılandırması

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY_JSON='{"type":"service_account",...}'
```

### Google AI Yapılandırması

```
# Google Gemini 2.0 Flash API
GEMINI_API_KEY=your-gemini-2.0-flash-api-key

# AI Model Ayarları (Opsiyonel)
AI_MODEL=gemini-2.0-flash
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=30024
```

### Sentry Yapılandırması

```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## 📚 API Endpoints

### 🎯 Quiz Management
```
POST   /quizzes/generate           # Hızlı sınav oluşturma
POST   /quizzes/personalized       # Kişiselleştirilmiş sınav
POST   /quizzes/:id/submit         # Cevap gönderme
GET    /quizzes/:id                # Sınav detayı
GET    /quizzes/course/:courseId   # Kurs sınavları
DELETE /quizzes/:id                # Sınav silme
```

### 📖 Course Management
```
POST   /courses                    # Yeni kurs oluşturma
GET    /courses                    # Kullanıcı kursları
GET    /courses/:id                # Kurs detayı
PUT    /courses/:id                # Kurs güncelleme
DELETE /courses/:id                # Kurs silme
```

### 📄 Document Processing
```
POST   /documents/upload           # Belge yükleme
POST   /documents/analyze          # Belge analizi
GET    /documents/:id              # Belge detayı
DELETE /documents/:id              # Belge silme
```

### 🎯 Learning Targets
```
GET    /learning-targets/course/:courseId    # Kurs hedefleri
GET    /learning-targets/analysis/:courseId  # Öğrenme analizi
POST   /learning-targets                     # Hedef oluşturma
PUT    /learning-targets/:id                 # Hedef güncelleme
```

### 🔐 Authentication
```
POST   /auth/login                 # Kullanıcı girişi
POST   /auth/register              # Kullanıcı kaydı
POST   /auth/refresh               # Token yenileme
POST   /auth/logout                # Çıkış yapma
GET    /auth/profile               # Kullanıcı profili
```

### 📊 System Health
```
GET    /health                     # Sistem durumu
GET    /health/detailed            # Detaylı sistem bilgisi
GET    /metrics                    # Performans metrikleri
```

## 🔨 Development Commands

### Build & Start
```bash
npm run build              # TypeScript derlemesi
npm run start              # Production modunda başlat
npm run start:dev          # Development modunda başlat
npm run start:debug        # Debug modunda başlat
npm run start:fast         # Nodemon ile hızlı başlat
```

### Code Quality
```bash
npm run lint               # ESLint kontrolü
npm run format             # Prettier formatlaması
npm run knip               # Kullanılmayan kod analizi
npm run depcheck           # Bağımlılık kontrolü
```

### Testing
```bash
npm run test               # Unit testler
npm run test:watch         # Test izleme modu
npm run test:cov           # Coverage raporu
npm run test:e2e           # End-to-end testler
npm run test:debug         # Debug modunda test
```

### Docker
```bash
npm run docker:build       # Docker image oluştur
# docker run -p 3001:3001 quiz-platform-backend
```

## 🔧 Kod İyileştirmeleri

Backend kodunda yapılan önemli iyileştirmeler:

### 1. **AI Service Architecture**
   - **Google Gemini 2.0 Flash** entegrasyonu
   - Provider pattern ile multiple AI service desteği
   - Intelligent prompt engineering ve template management
   - Response parsing ve validation optimizasyonları

### 2. **Performance Optimizations**
   - **Intelligent Caching**: Redis benzeri cache mekanizması
   - **Request Batching**: Çoklu isteklerin optimize edilmesi
   - **Connection Pooling**: Firebase connection optimization
   - **Memory Management**: Efficient garbage collection

### 3. **Security Enhancements**
   - **Multi-layer Validation**: Zod + Class Validator
   - **JWT Security**: Secure token management
   - **Input Sanitization**: XSS ve injection koruması
   - **Rate Limiting**: API abuse protection
   - **CORS Policy**: Secure cross-origin handling

### 4. **Error Handling & Monitoring**
   - **Sentry Integration**: Comprehensive error tracking
   - **Winston Logging**: Categorized log management
   - **Health Checks**: System status monitoring
   - **Performance Metrics**: Response time tracking

### 5. **Firebase Transaction Support**
   - Atomic operations için transaction desteği
   - Data consistency garantisi
   - Rollback mekanizmaları

### 6. **Code Quality Improvements**
   - Kullanılmayan kod ve dosyaların temizlenmesi
   - Type safety ile %100 TypeScript coverage
   - ESLint + Prettier ile consistent code style

## 🏗 Mimari Yapı

### Modüler NestJS Yapısı
```
src/
├── ai/                 # AI servisleri ve Gemini entegrasyonu
│   ├── providers/      # AI sağlayıcı abstraction layer
│   ├── services/       # Quiz üretimi, doğrulama servisleri
│   ├── prompts/        # AI prompt şablonları
│   └── schemas/        # Veri validasyon şemaları
├── auth/               # Firebase Auth entegrasyonu
├── courses/            # Kurs yönetimi
├── documents/          # Belge işleme (PDF, DOCX)
├── quizzes/            # Quiz CRUD operasyonları
├── learning-targets/   # Öğrenme hedefleri
├── firebase/           # Firebase service abstractions
└── common/             # Shared utilities ve interceptors
```

### Dependency Injection Pattern
- **Service Layer**: Business logic encapsulation
- **Repository Pattern**: Data access abstraction
- **Provider Pattern**: AI service abstractions
- **Guard Pattern**: Authentication ve authorization
