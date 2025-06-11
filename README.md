# AI Quiz Platform - Kişiselleştirilmiş Sınav ve Öğrenme Platformu

> Yapay zeka destekli akıllı sınav hazırlama ve öğrenme platformu. Belge analizi, konu çıkarımı ve kişiselleştirilmiş quiz oluşturma yetenekleri sunar.

## 🌟 Öne Çıkan Özellikler

### 🎯 Akıllı Quiz Deneyimi
- **Adaptif Zorluk**: Kullanıcı performansına göre soru zorluğu ayarlanır
- **Gerçek Zamanlı Feedback**: Anlık doğru/yanlış geri bildirimi
- **Açıklayıcı Çözümler**: AI destekli detaylı çözüm açıklamaları
- **Progress Tracking**: Konu bazlı ilerleme takibi

### 🔬 Gelişmiş Analytics
- **Learning Path Optimization**: AI destekli öğrenme rotası önerileri
- **Weakness Detection**: Zayıf konuların otomatik tespiti
- **Study Time Prediction**: Konu hakimiyeti için gereken süre tahmini
- **Comparative Analysis**: Genel kullanıcı performansı ile karşılaştırma

### 🚀 Yüksek Performans
- **Sub-second Loading**: 1 saniyenin altında sayfa yükleme süreleri
- **Optimized Caching**: Çok katmanlı cache stratejileri
- **Lazy Loading**: İhtiyaç anında içerik yükleme
- **Bundle Optimization**: Minimalist JavaScript bundle'ları

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Proje Yapısı](#proje-yapısı)
- [Geliştirme](#geliştirme)
- [Test](#test)
- [Deployment](#deployment)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

## 🎯 Genel Bakış

AI Quiz Platform, her seviyeden öğrencinin ve profesyonelin bilgi düzeylerini ölçmelerine, eksiklerini tespit etmelerine ve öğrenme süreçlerini kişiye özel bir deneyimle optimize etmelerine olanak tanıyan, yapay zeka destekli, yenilikçi bir eğitim teknolojisi çözümüdür.

Platform iki ana sınav türü sunar:

### 🚀 Hızlı Sınav
- Üyelik gerektirmeden anlık quiz oluşturma
- Belge yükleme ile otomatik soru üretimi
- Konu bazlı anlık değerlendirme

### 🎯 Kişiselleştirilmiş Sınav
- Kullanıcı performansına dayalı adaptif sorular
- Öğrenme hedefi takibi ve analizi
- Zayıf konulara odaklı sınav oluşturma
- Kapsamlı performans raporları

## ✨ Özellikler

### 🤖 Yapay Zeka Destekli Özellikler
- **Akıllı Belge Analizi**: PDF ve Word belgeleri otomatik analiz edilir
- **Google Gemini 2.0 Flash**: En güncel AI modeli ile hızlı ve akıllı soru üretimi
- **Konu Çıkarımı**: Belgelerden otomatik alt konu tespit edilir
- **Adaptif Soru Üretimi**: Kullanıcı seviyesine ve performansına uygun sorular
- **Çok Dilli Destek**: Türkçe ve İngilizce içerik desteği
- **Performans Analizi**: AI destekli detaylı öğrenme analizi ve öneriler
- **Akıllı Önbellekleme**: Hızlı yanıt için AI çıktılarının optimize edilmiş cache'lenmesi

### 📚 İçerik Yönetimi
- **Ders (Course) Sistemi**: Organize edilmiş çalışma alanları ve hiyerarşik yapı
- **Alt Konu Normalizasyonu**: AI destekli tutarlı terminoloji yönetimi
- **Gelişmiş Belge Desteği**: PDF, DOCX formatlarında belge yükleme ve işleme
- **Konu Ağacı**: Hiyerarşik konu yapısı ve ilişkili öğrenme rotaları
- **Otomatik İçerik Sınıflandırma**: AI ile içerik kategorilendirme
- **Versiyon Kontrolü**: Belge ve içerik sürüm yönetimi

### 📊 Analiz ve Raporlama
- **Performans Takibi**: Konu bazlı başarı analizi ve trend izleme
- **Öğrenme Hedefleri**: AI destekli kişiselleştirilmiş hedef belirleme
- **İlerleme Raporları**: Chart.js ile görselleştirilmiş detaylı performans
- **Zayıf Konu Tespiti**: Makine öğrenmesi ile gelişim alanlarının belirlenmesi
- **Adaptif İçgörüler**: Kullanıcı davranış analitiği
- **Gerçek Zamanlı Dashboard**: Canlı performans metrikleri
- **Karşılaştırmalı Analiz**: Grup ve bireysel performans karşılaştırması

### 🔐 Güvenlik ve Kullanıcı Yönetimi
- **Firebase Authentication**: Güvenli kullanıcı girişi ve multi-factor authentication
- **JWT Token Sistemi**: API güvenliği ve session yönetimi
- **CORS Koruması**: Cross-origin güvenlik katmanları
- **Rate Limiting**: API istek sınırlaması ve DDoS koruması
- **Input Validation**: Çok katmanlı veri doğrulama (Zod + Class Validator)
- **Helmet Integration**: HTTP güvenlik başlıkları
- **Data Encryption**: Hassas veri şifreleme ve güvenli saklama

### 🎨 Modern Kullanıcı Arayüzü
- **TailwindCSS 4**: Son teknoloji utility-first CSS framework
- **NextUI Entegrasyonu**: Modern ve erişilebilir React bileşenleri
- **Dark/Light Mode**: Sistem tercihine uyumlu tema desteği
- **Responsive Design**: Tüm cihazlarda optimize edilmiş görünüm
- **Framer Motion**: Akıcı animasyonlar ve geçişler
- **Accessibility**: WCAG 2.1 uyumlu erişilebilirlik özellikleri
- **Custom Design System**: Tutarlı renk paleti ve tipografi

### ⚡ Performans Optimizasyonları
- **Next.js 15 App Router**: Server-side rendering ve static generation
- **Bundle Optimization**: Webpack 5 ile optimize edilmiş paket boyutu
- **Image Optimization**: Otomatik WebP/AVIF dönüşümü
- **Code Splitting**: Route bazlı otomatik kod bölünmesi
- **Caching Strategies**: Akıllı önbellekleme mekanizmaları
- **Web Vitals**: Core Web Vitals için optimize edilmiş performans
- **Progressive Loading**: Kademeli içerik yükleme

## 📈 Proje İstatistikleri

- **Backend**: 50+ API endpoint, 25+ servis modülü
- **Frontend**: 100+ React bileşeni, Modern UI/UX
- **AI Integration**: Google Gemini 2.0 Flash ile 15+ AI servisi
- **Database**: 8+ Firestore koleksiyonu, Gerçek zamanlı senkronizasyon
- **Security**: Çok katmanlı güvenlik, OWASP uyumlu
- **Performance**: Core Web Vitals %95+ uyumluluk
- **Code Quality**: TypeScript %100, ESLint + Prettier
- **Documentation**: Kapsamlı API ve kod dokümantasyonu

## 🛠 Teknoloji Yığını

### Backend
- **Framework**: NestJS v10.4+ (TypeScript)
- **Database**: Firebase Firestore v13.3+
- **Authentication**: Firebase Auth + JWT v9.0+
- **AI/ML**: Google Gemini 2.0 Flash (Latest Model)
- **File Processing**: Mammoth v1.9+ (Word), PDF-Parse v1.1+
- **Logging**: Winston v3.17+
- **Validation**: Class Validator v0.14+, Zod v3.25+
- **Security**: Helmet v7.1+, Bcrypt v5.1+

### Frontend
- **Framework**: Next.js 15.2+ (React 19.1+)
- **UI Libraries**: 
  - NextUI v2.6+ (Modern React UI)
  - TailwindCSS v4 (Latest Version)
  - Material-UI v7.1+ (Icons & Components)
- **State Management**: Zustand v5.0+
- **Data Fetching**: TanStack Query v5.74+
- **Charts**: Chart.js v4.4+ + React Chart.js 2 v5.2+
- **Icons**: React Icons v5.5+, Lucide React v0.503+
- **Animation**: Framer Motion v12.16+
- **Styling**: Class Variance Authority, Tailwind Merge
- **Internationalization**: i18next v23.8+

### DevOps & Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Linting & Formatting**: 
  - ESLint v9.28+ + Prettier v3.5+
  - TypeScript ESLint v8.34+
- **Code Quality**: Knip v5.60+, Depcheck v1.4+
- **Bundle Analysis**: Next.js Bundle Analyzer
- **Development**: Nodemon, SWC Compiler, Hot Reload

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ (Önerilen: v20.x)
- npm 8+ (Önerilen: v10.x)
- Firebase projesi (v11.4+ SDK)
- Google AI API anahtarı (Gemini 2.0 Flash)
- Modern web tarayıcı (Chrome 90+, Firefox 88+, Safari 14+)

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd ai-quiz-platform
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```

#### Ortam Değişkenlerini Ayarlayın
```env
# .env dosyası oluşturun
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Firebase Yapılandırması
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Google AI Yapılandırması
GEMINI_API_KEY=your-gemini-2.0-flash-api-key

# Cache ve Performans Ayarları
CACHE_TTL_SECONDS=300
CACHE_MAX_ITEMS=100

# Sentry Hata İzleme (Opsiyonel)
SENTRY_DSN=https://your-sentry-dsn
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
```

#### Frontend Ortam Değişkenleri
```env
# .env.local dosyası oluşturun
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Performans İzleme (Opsiyonel)
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Bundle Analizi (Geliştirme)
ANALYZE=false
```

### 4. Uygulamayı Başlatın

#### Backend'i Başlatın
```bash
cd backend
npm run start:dev  # Geliştirme modu (otomatik yeniden başlatma)
# veya
npm run start:fast # Hızlı başlatma (nodemon ile)
```

#### Frontend'i Başlatın
```bash
cd frontend
npm run dev        # Geliştirme sunucusu
# veya bundle analizi ile
npm run analyze    # Bundle boyutlarını analiz et
```

Uygulama şu adreslerde çalışacaktır:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger API Docs**: http://localhost:3001/api
- **API Health Check**: http://localhost:3001/health

## 💡 Kullanım

### Hızlı Sınav Oluşturma
1. Ana sayfada "Hızlı Sınav" seçeneğini tıklayın
2. Belge yükleyin veya konu seçin
3. Soru sayısı ve zorluk seviyesi belirleyin
4. "Sınav Oluştur" butonuna tıklayın

### Kişiselleştirilmiş Sınav
1. Hesap oluşturun ve giriş yapın
2. Yeni ders oluşturun
3. Belge yükleyin ve öğrenme hedefleri belirleyin
4. Kişiselleştirilmiş sınav türünü seçin:
   - **Zayıf Konulara Odaklı**: Başarısız olunan konulara yoğunlaşır
   - **Yeni Konulara Odaklı**: Henüz çalışılmamış konuları keşfeder
   - **Kapsamlı**: Tüm konulardan dengeli soru dağılımı

### Analiz ve Raporlar
- Sınav tamamlandıktan sonra detaylı analiz görüntüleyin
- Konu bazlı performans grafiklerini inceleyin
- Öğrenme hedeflerinizi takip edin
- Gelişim önerilerini değerlendirin

## 📚 API Dokümantasyonu

Backend API Swagger dokumentasyonu: `http://localhost:3001/api`

### Ana Endpoint'ler

#### Quiz Yönetimi
- `POST /quizzes/generate` - Hızlı sınav oluştur
- `POST /quizzes/personalized` - Kişiselleştirilmiş sınav oluştur
- `POST /quizzes/:id/submit` - Sınav cevaplarını gönder
- `GET /quizzes/:id` - Sınav detayını getir
- `GET /quizzes/course/:courseId` - Kurs sınavlarını listele

#### Kurs Yönetimi
- `POST /courses` - Yeni kurs oluştur
- `GET /courses` - Kullanıcı kurslarını listele
- `GET /courses/:id` - Kurs detayını getir
- `PUT /courses/:id` - Kurs güncelle
- `DELETE /courses/:id` - Kurs sil

#### Belge Yönetimi
- `POST /documents/upload` - Belge yükle
- `POST /documents/analyze` - Belge analiz et
- `GET /documents/:id` - Belge detayını getir

#### Öğrenme Hedefleri
- `GET /learning-targets/course/:courseId` - Kurs öğrenme hedeflerini getir
- `GET /learning-targets/analysis/:courseId` - Öğrenme analizi getir

## 📁 Proje Yapısı

```
ai-quiz-platform/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── ai/                # AI ve ML servisleri
│   │   │   ├── services/      # Quiz oluşturma, doğrulama
│   │   │   ├── prompts/       # AI prompt şablonları
│   │   │   └── schemas/       # Veri doğrulama şemaları
│   │   ├── auth/              # Kimlik doğrulama
│   │   ├── courses/           # Kurs yönetimi
│   │   ├── documents/         # Belge işleme
│   │   ├── quizzes/           # Sınav yönetimi
│   │   ├── learning-targets/  # Öğrenme hedefleri
│   │   ├── firebase/          # Firebase entegrasyonu
│   │   └── common/            # Ortak tipler ve servisler
│   ├── logs/                  # Uygulama logları
│   └── secrets/               # Güvenlik anahtarları
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React bileşenleri
│   │   │   ├── ui/            # UI bileşenleri
│   │   │   ├── quiz/          # Sınav bileşenleri
│   │   │   └── course/        # Kurs bileşenleri
│   │   ├── services/          # API servisleri
│   │   ├── types/             # TypeScript tipleri
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand state management
│   │   └── styles/            # CSS ve styling
│   ├── public/                # Statik dosyalar
│   └── logs/                  # Frontend logları
├── docs/                      # Dokümantasyon
├── prd.md                     # Ürün Gereksinim Dokümanı
└── README.md                  # Bu dosya
```

## 🗂 Dosya Yapısı ve Dokümantasyon

### Proje Dokümantasyonu
- **Ana README**: Genel proje bilgileri ve kurulum rehberi
- **Backend README**: [`backend/README.md`](./backend/README.md) - API dokümantasyonu
- **Frontend README**: [`frontend/README.md`](./frontend/README.md) - UI geliştirme rehberi
- **PRD Dokümantı**: [`prd.md`](./prd.md) - Ürün gereksinim dökümanı
- **Firebase Performance**: [`backend/FIREBASE_PERFORMANCE_GUIDE.md`](./backend/FIREBASE_PERFORMANCE_GUIDE.md)

### Önemli Konfigürasyon Dosyaları
- `firestore.indexes.json` - Firestore index yapılandırması
- `backend/tsconfig.json` - Backend TypeScript ayarları
- `frontend/next.config.ts` - Next.js yapılandırması
- `frontend/tailwind.config.ts` - TailwindCSS ayarları

## 🔧 Geliştirme

### Kod Kalitesi
```bash
# Backend Kod Kalitesi
cd backend
npm run lint          # ESLint kontrolü ve otomatik düzeltme
npm run format        # Prettier formatlaması
npm run knip          # Kullanılmayan kod analizi
npm run depcheck      # Bağımlılık analizi

# Frontend Kod Kalitesi
cd frontend
npm run lint          # Next.js lint + ESLint
npm run knip          # Kullanılmayan kod analizi
npm run depcheck      # Bağımlılık analizi
npm run analyze       # Bundle boyut analizi
```

### TypeScript Tip Kontrolü
```bash
# Backend
cd backend
npx tsc --noEmit      # Tip kontrolü (build olmadan)

# Frontend
cd frontend
npx tsc --noEmit      # Tip kontrolü (build olmadan)
```

### Debug ve Monitoring
- **Backend Logları**: `backend/logs/` klasöründe kategorize edilmiş Winston logları
  - `backend-error.log`: Hata logları
  - `backend-flow-tracker.log`: İş akışı takibi
  - `learning_targets.log`: Öğrenme hedefleri logları
  - `sinav-olusturma.log`: Sınav oluşturma süreç logları
- **Frontend Logları**: Browser console ve `frontend/logs/frontend-general.log`
- **Performance Monitoring**: Firebase Performance Monitoring entegrasyonu
- **Error Tracking**: Detaylı hata logları, stack trace'ler ve Sentry entegrasyonu
- **Health Checks**: API endpoint sağlık kontrolleri
- **Real-time Monitoring**: Gerçek zamanlı sistem durumu

### Veritabanı Yapısı (Firestore)
```
Collections:
├── users/              # Kullanıcı profilleri ve tercihleri
├── courses/            # Kurs verileri ve metadata
├── quizzes/            # Sınav kayıtları ve sonuçları
├── learningTargets/    # Öğrenme hedefleri ve ilerlemeler
├── documents/          # Yüklenen belgeler ve analiz sonuçları
├── failedQuestions/    # Başarısız sorular ve tekrar algoritması
├── topicNormalizations/ # AI normalizasyonu yapılan konular
└── systemMetrics/      # Sistem performans metrikleri
```

### AI Model Konfigürasyonu
- **Model**: Google Gemini 2.0 Flash
- **Temperature**: 0.7 (yaratıcılık dengesi)
- **Max Tokens**: 30,024 (uzun içerik desteği)
- **Safety Settings**: Orta seviye güvenlik filtreleri
- **Prompt Engineering**: Optimize edilmiş Türkçe prompt şablonları

## 🧪 Test

### Backend Test
```bash
cd backend
npm run test           # Unit testler (Jest)
npm run test:watch     # Test izleme modu
npm run test:cov       # Coverage raporu
npm run test:e2e       # End-to-end testler
npm run test:debug     # Debug modunda test
```

### Frontend Test
```bash
cd frontend
npm run test           # Jest testleri (gelecek sürümde)
npm run test:watch     # Test izleme modu
# Not: Test framework kurulumu planlanmaktadır
```

## 🚀 Deployment

### Production Build
```bash
# Backend Production Build
cd backend
npm run build         # TypeScript derlemesi
npm run start:prod    # Production modunda başlat

# Frontend Production Build
cd frontend
npm run build         # Next.js build + optimizasyon
npm start            # Production sunucusu
```

### Docker Deployment (Planlanan)
```bash
# Backend Docker build
cd backend
docker build -t ai-quiz-backend .
docker run -p 3001:3001 ai-quiz-backend

# Frontend Docker build
cd frontend
docker build -t ai-quiz-frontend .
docker run -p 3000:3000 ai-quiz-frontend
```

### Environment Checklist
- [ ] Firebase prodüksiyon projesi kurulumu
- [ ] Google AI API anahtarları (Gemini 2.0 Flash)
- [ ] SSL sertifikaları ve domain yapılandırması
- [ ] CORS ayarları ve güvenlik politikaları
- [ ] Rate limiting ve DDoS koruması
- [ ] Log monitoring ve alerting sistemi
- [ ] Backup stratejisi ve disaster recovery
- [ ] Performance monitoring (Firebase Performance)
- [ ] Error tracking (Sentry) kurulumu
- [ ] CDN yapılandırması (statik dosyalar için)

## 🤝 Katkıda Bulunma

### Geliştirici Katkıları
1. **Repository'yi fork edin**
2. **Feature branch oluşturun** (`git checkout -b feature/amazing-feature`)
3. **Değişikliklerinizi commit edin** (`git commit -m 'feat: Add amazing feature'`)
4. **Branch'inizi push edin** (`git push origin feature/amazing-feature`)
5. **Pull Request oluşturun**

### Commit Konvansiyonları
```bash
feat: yeni özellik ekleme
fix: hata düzeltme
docs: dokümantasyon güncelleme
style: kod formatlaması
refactor: kod yeniden yapılandırma
test: test ekleme veya düzeltme
chore: build process veya yardımcı araç değişiklikleri
```

### Geliştirme Ortamı Kurulumu
```bash
# 1. Projeyi klonlayın
git clone <repository-url>
cd ai-quiz-platform

# 2. Dependencies'leri yükleyin
cd backend && npm install
cd ../frontend && npm install

# 3. Environment dosyalarını oluşturun
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 4. Geliştirme sunucularını başlatın
npm run dev:all  # Hem backend hem frontend
```

### Geliştirme Kuralları
- **TypeScript First**: Tam TypeScript kullanımı, `any` tipinden kaçının
- **ESLint + Prettier**: Kod formatlaması ve kalite standartları
- **Conventional Commits**: Anlamlı commit mesajları
- **Component-Driven**: Yeniden kullanılabilir React bileşenleri
- **Performance First**: Core Web Vitals optimizasyonu
- **Accessibility**: WCAG 2.1 AA uyumluluğu
- **Testing**: Unit test coverage %80+ hedefi
- **Documentation**: Kod içi dokümantasyon ve JSDoc
- **Security**: Input validation ve güvenlik best practices

## 🔮 Gelecek Geliştirmeler

### Kısa Vadeli Hedefler (Q3 2025)
- [ ] **Mobile App**: React Native ile mobil uygulama
- [ ] **Offline Mode**: PWA ile çevrimdışı çalışma desteği
- [ ] **Advanced Analytics**: Makine öğrenmesi ile daha detaylı analiz
- [ ] **Collaborative Learning**: Grup çalışması özellikleri
- [ ] **Voice Questions**: Sesli soru sorma ve cevaplama

### Orta Vadeli Hedefler (Q4 2025)
- [ ] **Multi-language Support**: Tam çok dilli destek
- [ ] **AI Tutoring**: Kişisel AI öğretmen asistanı
- [ ] **Gamification**: Oyunlaştırma ve başarı sistemi
- [ ] **Integration APIs**: LMS entegrasyonları
- [ ] **Advanced Reporting**: Kurumsal raporlama araçları

### Uzun Vadeli Vizyon (2026+)
- [ ] **VR/AR Support**: Sanal ve artırılmış gerçeklik desteği
- [ ] **Blockchain Certificates**: Blockchain tabanlı sertifikasyon
- [ ] **AI Content Generation**: Tam otomatik içerik üretimi
- [ ] **Predictive Learning**: Öğrenme başarısı tahmini
- [ ] **Global Platform**: Çok uluslu eğitim platformu

---

**Son Güncelleme**: Haziran 2025  
**Platform Versiyonu**: v2.1.0  
**Desteklenen Diller**: Türkçe, English  
**Minimum Sistem Gereksinimleri**: Node.js 18+, Modern Browser

## 📞 İletişim ve Destek

### Geliştirici İletişim
- **Email**: [developer@aiquizplatform.com](mailto:developer@aiquizplatform.com)
- **GitHub Issues**: [Hata bildirimi veya özellik talebi](https://github.com/your-repo/issues)
- **Discussions**: [Topluluk tartışmaları](https://github.com/your-repo/discussions)

### Destek Kanalları
- **Teknik Destek**: 7/24 GitHub Issues
- **Dokümantasyon**: Kapsamlı API ve kullanım rehberleri
- **Community**: Discord topluluğu (yakında)
- **Enterprise Support**: Kurumsal müşteriler için özel destek

### Lisans ve Telif Hakları
- **Lisans**: MIT License
- **Copyright**: © 2025 AI Quiz Platform
- **Açık Kaynak**: Topluluk katkılarına açık
- **Ticari Kullanım**: İzin verilen (lisans koşulları dahilinde)

## 🙏 Teşekkürler

### Kullanılan Açık Kaynak Projeler
- **NestJS Team** - Backend framework
- **Vercel Team** - Next.js framework
- **Google** - Gemini AI and Firebase
- **Tailwind Labs** - TailwindCSS
- **NextUI Team** - React UI components
- **React Team** - React ecosystem

### Katkıda Bulunanlar
Bu projeyi mümkün kılan tüm geliştiricilere, test edicilere ve geri bildirim sağlayanlara teşekkürler.
