# MATERYAL VE YÖNTEM
<!--
Bu bölümde proje yapılırken hangi yöntemlerin takip edildiği ve uygulanan adımlar anlatılmalıdır. 

Yazılım (masaüstü, web, mobil vs) projelerinde (aşağıdaki modellerden en az 2’si danışman tarafından seçilerek):
-	Kullanım Durumu (Use Case) diyagram ve belirtimleri
-	UML Aktivite Diyagramları
-	Yazılım Mimarisi
-	UML Sınıf (Class) Diyagramları
-	UML Sıra (Sequence) Diyagramları
Veritabanı içeren projelerde:
-	ER Diyagramları
-	Veritabanı Şeması
Elektronik Bileşen içeren projelerde:
-	Elektronik devre tasarım modeli
-	Sistem Mimarisi
sunulmalıdır. 
-->


<!-- Bu bölüm materyal ve yöntem için ayrılmıştır -->
<!-- Önerilen uzunluk: 5 sayfa (~13.500 karakter) -->
<!-- UML diyagramları/donanım şemaları vs. görseller dahil -->

## 3.1. Sistem Mimarisi ve Tasarım

AI Quiz Platformu, modern mikroservis mimarisi prensipleri temel alınarak tasarlanmış, katmanlı bir sistem yapısına sahiptir. Platform, client-server modeli üzerine inşa edilmiş olup, frontend ve backend bileşenleri arasında RESTful API protokolü ile iletişim kurulmaktadır.

**Genel Sistem Mimarisi:**

Sistem mimarisi, aşağıdaki ana katmanlardan oluşmaktadır:

**Presentation Layer (Sunum Katmanı):**
Next.js 15 framework'ü ile geliştirilen modern web uygulaması, React 19'un sunduğu concurrent rendering ve server-side rendering (SSR) özelliklerini kullanarak optimal performans sağlar. Responsive design prensipleri ile mobile-first yaklaşımı benimsenmiştir.

**API Gateway Katmanı:**
NestJS framework'ü ile geliştirilmiş RESTful API servisleri, mikroservis mimarisi prensiplerine uygun olarak modüler yapıda organize edilmiştir. Express.js tabanlı HTTP server, CORS politikaları ve rate limiting ile güvenlik önlemleri alınmıştır.

**Business Logic Katmanı:**
Platform'un core business logic'i, domain-driven design (DDD) prensiplerine uygun olarak organize edilmiştir. Dependency Injection pattern'i kullanılarak loose coupling sağlanmış, SOLID prensiplerine uygun kod yapısı geliştirilmiştir.

**Data Access Katmanı:**
Firebase Firestore NoSQL veritabanı ile Cloud Storage entegrasyonu, gerçek zamanlı veri senkronizasyonu ve ölçeklenebilir veri depolama imkanı sağlar. ODM (Object Document Mapping) pattern'i ile veri modelleri tanımlanmıştır.

**External Services Integration:**
Google Gemini 2.0 Flash API entegrasyonu, AI destekli soru üretimi ve içerik analizi için kullanılır. Firebase Authentication servisi ile güvenli kullanıcı kimlik doğrulama sistemi entegre edilmiştir.

**Mikroservis Bileşenleri:**

Platform, aşağıdaki mikroservis bileşenlerinden oluşmaktadır:

- **User Management Service:** Kullanıcı kaydı, giriş, profil yönetimi
- **Course Management Service:** Ders oluşturma, içerik yönetimi, konu organizasyonu
- **Quiz Generation Service:** AI destekli soru üretimi, sınav oluşturma
- **Assessment Service:** Sınav değerlendirme, performans analizi
- **Analytics Service:** Kullanıcı davranış analizi, raporlama
- **Document Processing Service:** PDF/DOCX belge işleme, içerik çıkarımı
- **Notification Service:** Bildirim yönetimi, e-posta servisleri

## 3.2. Kullanılan Teknolojiler ve Araçlar

Platform geliştirmesinde kullanılan teknolojiler, 2025'in en güncel ve stabil sürümlerinden oluşmaktadır:

**Frontend Teknoloji Yığını:**

**Next.js 15.0.2:**
- App Router mimarisi ile modern routing sistemi
- Server Components ve Client Components hibrit yapısı
- Edge Runtime desteği ile global CDN optimizasyonu
- Built-in performance optimization (Image, Font, Script)
- TypeScript native desteği

**React 19.0.0:**
- Concurrent rendering ile gelişmiş performans
- Automatic batching ile state güncellemelerinin optimizasyonu
- Suspense ve Error Boundaries ile asenkron veri yönetimi
- React Server Components desteği

**TailwindCSS 4.0.0:**
- Utility-first CSS framework
- JIT (Just-In-Time) compilation
- Custom design system entegrasyonu
- Dark/Light mode native desteği
- Responsive design utilities

**NextUI 2.4.8:**
- Modern React component library
- Accessibility (a11y) standartları uyumluluğu
- Customizable theme system
- TypeScript type definitions

**State Management ve Data Fetching:**

**Zustand 4.5.0:**
- Lightweight state management library
- DevTools integration
- Persistence middleware desteği
- TypeScript optimized

**TanStack Query 5.8.1:**
- Server state management
- Intelligent caching strategies
- Background refetching
- Optimistic updates

**Backend Teknoloji Yığını:**

**NestJS 10.3.0:**
- Node.js tabanlı progressive framework
- Decorator-based architecture
- Dependency Injection container
- Modular application structure
- Express.js compatibility

**TypeScript 5.3.2:**
- Static type checking
- Modern ES2023 features
- Strict type safety
- Enhanced developer experience

**Firebase SDK 10.7.1:**
- Authentication services
- Firestore NoSQL database
- Cloud Storage
- Cloud Functions
- Real-time synchronization

**AI ve API Entegrasyonları:**

**Google Generative AI 0.17.1:**
- Gemini 2.0 Flash model entegrasyonu
- Natural language processing
- Content generation APIs
- Multimodal input support

**Multer 1.4.5:**
- File upload middleware
- Memory ve disk storage options
- File type validation
- Size limitation controls

**Geliştirme ve DevOps Araçları:**

**Code Quality Tools:**
- ESLint 8.56.0: Code linting ve style guides
- Prettier 3.1.0: Code formatting
- Husky 8.0.3: Git hooks management
- lint-staged: Pre-commit code quality checks

**Testing Framework:**
- Jest 29.7.0: Unit testing framework
- React Testing Library: Component testing
- Supertest: API endpoint testing
- Cypress: End-to-end testing

**Monitoring ve Logging:**
- Winston 3.11.0: Structured logging
- Sentry: Error tracking ve performance monitoring
- Firebase Analytics: User behavior tracking

## 3.3. Veritabanı Tasarımı

Firebase Firestore NoSQL veritabanı, document-based data model kullanılarak tasarlanmıştır. Veri modeli, scalability ve performance gereksinimlerine uygun olarak optimize edilmiştir.

**Ana Veri Koleksiyonları:**

**Users Collection:**
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  profile: {
    firstName: string,
    lastName: string,
    educationLevel?: string,
    interests?: string[],
    language: string
  },
  preferences: {
    theme: 'light' | 'dark' | 'system',
    notifications: boolean,
    emailUpdates: boolean
  },
  statistics: {
    totalQuizzes: number,
    totalCorrectAnswers: number,
    averageScore: number,
    studyStreak: number
  }
}
```

**Courses Collection:**
```javascript
{
  id: string,
  title: string,
  description: string,
  coverImage?: string,
  createdBy: string, // User UID
  isPublic: boolean,
  tags: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  topics: {
    [topicId]: {
      title: string,
      subtopics: string[],
      order: number
    }
  },
  enrolledUsers: string[], // User UIDs
  statistics: {
    totalQuizzes: number,
    totalStudents: number,
    averageScore: number
  }
}
```

**Documents Collection:**
```javascript
{
  id: string,
  courseId: string,
  title: string,
  fileName: string,
  fileType: 'pdf' | 'docx' | 'txt',
  fileSize: number,
  uploadedBy: string, // User UID
  storageUrl: string,
  extractedText: string,
  analyzedTopics: string[],
  createdAt: Timestamp,
  processedAt?: Timestamp,
  processingStatus: 'pending' | 'completed' | 'failed'
}
```

**Quizzes Collection:**
```javascript
{
  id: string,
  title: string,
  courseId?: string,
  createdBy: string, // User UID
  type: 'quick' | 'personalized',
  questions: [{
    id: string,
    question: string,
    options: string[],
    correctAnswer: number,
    explanation?: string,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    generatedFrom?: string // Document ID
  }],
  settings: {
    timeLimit?: number,
    randomizeQuestions: boolean,
    showCorrectAnswers: boolean
  },
  createdAt: Timestamp,
  statistics: {
    totalAttempts: number,
    averageScore: number,
    averageTime: number
  }
}
```

**Quiz Attempts Collection:**
```javascript
{
  id: string,
  quizId: string,
  userId: string,
  answers: [{
    questionId: string,
    selectedAnswer: number,
    isCorrect: boolean,
    timeSpent: number
  }],
  score: number,
  percentage: number,
  totalTime: number,
  completedAt: Timestamp,
  feedback: {
    weakTopics: string[],
    recommendations: string[]
  }
}
```

**Indexing Stratejisi:**
Firestore'da optimal query performansı için composite indexler tanımlanmıştır:
- (courseId, createdAt) - Kurs bazlı sıralama
- (userId, completedAt) - Kullanıcı performans geçmişi
- (type, isPublic, createdAt) - Public quiz filtreleme
- (tags, createdAt) - Tag bazlı arama

**Veri Güvenliği ve Rules:**
Firestore Security Rules ile veri erişim kontrolü sağlanmıştır:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public courses are readable by authenticated users
    match /courses/{courseId} {
      allow read: if request.auth != null && resource.data.isPublic == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
  }
}
```

## 3.4. API Tasarımı ve Backend Geliştirme

Backend API, RESTful principles ve OpenAPI 3.0 specification'larına uygun olarak tasarlanmıştır. NestJS framework'ünün sunduğu decorator-based architecture ile clean ve maintainable kod yapısı oluşturulmuştur.

**API Endpoint Organizasyonu:**

**Authentication Endpoints:**
```
POST   /auth/register       # Kullanıcı kaydı
POST   /auth/login          # Kullanıcı girişi  
POST   /auth/logout         # Kullanıcı çıkışı
POST   /auth/refresh        # Token yenileme
POST   /auth/forgot-password # Şifre sıfırlama
GET    /auth/profile        # Kullanıcı profili
PUT    /auth/profile        # Profil güncelleme
```

**Course Management Endpoints:**
```
GET    /courses             # Kurs listesi
POST   /courses             # Yeni kurs oluşturma
GET    /courses/:id         # Kurs detayı
PUT    /courses/:id         # Kurs güncelleme
DELETE /courses/:id         # Kurs silme
POST   /courses/:id/enroll  # Kursa kaydolma
GET    /courses/:id/students # Kurs öğrencileri
```

**Quiz Management Endpoints:**
```
POST   /quizzes/generate    # Hızlı sınav oluşturma
POST   /quizzes/personalized # Kişiselleştirilmiş sınav
GET    /quizzes/:id         # Sınav detayı
POST   /quizzes/:id/submit  # Cevap gönderme
GET    /quizzes/history     # Sınav geçmişi
DELETE /quizzes/:id         # Sınav silme
```

**Document Processing Endpoints:**
```
POST   /documents/upload    # Belge yükleme
GET    /documents/:id       # Belge detayı
POST   /documents/analyze   # Belge analizi
DELETE /documents/:id       # Belge silme
GET    /documents/extract-text # Metin çıkarımı
```

**Request/Response DTO Tanımları:**

```typescript
// Quiz Generation Request DTO
export class GenerateQuizDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  questionCount?: number;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsOptional()
  @IsString()
  documentId?: string;
}

// Quiz Response DTO
export class QuizResponseDto {
  id: string;
  title: string;
  questions: QuestionDto[];
  timeLimit?: number;
  createdAt: Date;
}
```

**Middleware ve Guards:**

**Authentication Guard:**
```typescript
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

**Rate Limiting:**
```typescript
@Injectable()
export class ThrottlerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Rate limiting logic
    // 100 requests per 15 minutes per IP
    return this.throttlerService.checkLimit(context);
  }
}
```

**Error Handling:**
Global exception filter ile merkezi hata yönetimi:
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    this.logger.error(exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
```

## 3.5. Frontend Geliştirme ve Kullanıcı Arayüzü

Frontend geliştirmesi, modern React patterns ve Next.js 15'in sunduğu gelişmiş özellikler kullanılarak gerçekleştirilmiştir. Component-based architecture ile reusable ve maintainable UI bileşenleri oluşturulmuştur.

**Proje Yapısı ve Organizasyon:**

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── courses/
│   │   ├── quizzes/
│   │   └── analytics/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   └── Table.tsx
│   ├── forms/            # Form components
│   │   ├── QuizForm.tsx
│   │   ├── CourseForm.tsx
│   │   └── ProfileForm.tsx
│   ├── quiz/             # Quiz-specific components
│   │   ├── QuizCard.tsx
│   │   ├── QuestionView.tsx
│   │   ├── ResultCard.tsx
│   │   └── TimerComponent.tsx
│   └── layout/           # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useQuiz.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── store/                # Zustand state management
│   ├── authStore.ts
│   ├── quizStore.ts
│   ├── courseStore.ts
│   └── themeStore.ts
├── services/             # API layer
│   ├── api.ts            # Base API configuration
│   ├── authService.ts
│   ├── quizService.ts
│   ├── courseService.ts
│   └── documentService.ts
├── types/                # TypeScript definitions
│   ├── api.types.ts
│   ├── quiz.types.ts
│   ├── user.types.ts
│   └── course.types.ts
└── lib/                  # Utility functions
    ├── utils.ts
    ├── validations.ts
    ├── constants.ts
    └── formatters.ts
```

**State Management Stratejisi:**

**Zustand Store Implementation:**
```typescript
// Auth Store
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  }
}));
```

**TanStack Query Integration:**
```typescript
// Quiz Queries
export const useQuizzes = (filters?: QuizFilters) => {
  return useQuery({
    queryKey: ['quizzes', filters],
    queryFn: () => quizService.getQuizzes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quizService.createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create quiz: ${error.message}`);
    }
  });
};
```

**Component Architecture:**

**Reusable UI Components:**
```typescript
// Button Component with variants
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
```

**Responsive Design Implementation:**
TailwindCSS ile mobile-first responsive design:
```typescript
// Quiz Card Component
export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  return (
    <Card className="w-full max-w-sm mx-auto sm:max-w-md lg:max-w-lg xl:max-w-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl">
          {quiz.title}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {quiz.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Stat label="Questions" value={quiz.questionCount} />
          <Stat label="Duration" value={`${quiz.duration}m`} />
          <Stat label="Difficulty" value={quiz.difficulty} />
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          variant="primary" 
          size="md"
          className="w-full sm:w-auto"
          onClick={() => router.push(`/quiz/${quiz.id}`)}
        >
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );
};
```

## 3.6. Yapay Zeka Entegrasyonu

Google Gemini 2.0 Flash modelinin entegrasyonu, platform'un core functionality'sini oluşturmaktadır. AI servisleri, modular yapıda organize edilerek farklı use case'ler için optimize edilmiştir.

**Gemini API Entegrasyonu:**

```typescript
// AI Service Implementation
@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(
    private configService: ConfigService,
    private logger: Logger
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY')
    );
    
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
      ]
    });
  }

  async generateQuestions(
    content: string, 
    options: QuestionGenerationOptions
  ): Promise<GeneratedQuestion[]> {
    const prompt = this.buildQuestionPrompt(content, options);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseQuestionResponse(text);
    } catch (error) {
      this.logger.error('Question generation failed', error);
      throw new InternalServerErrorException('AI service unavailable');
    }
  }
}
```

**Prompt Engineering:**

Soru üretimi için optimize edilmiş prompt templates:

```typescript
private buildQuestionPrompt(content: string, options: QuestionGenerationOptions): string {
  const basePrompt = `
Aşağıdaki içerikten ${options.questionCount} adet çoktan seçmeli soru oluştur.

KURALLAR:
1. Sorular ${options.difficulty} seviyesinde olmalı
2. Her soru 4 seçenekli olacak (A, B, C, D)
3. Sadece 1 doğru cevap olacak
4. Yanlış seçenekler makul ve yanıltıcı olacak
5. Türkçe dilinde ve eğitimsel kalitede olacak
6. JSON formatında yanıt ver

ÇIKTI FORMATI:
{
  "questions": [
    {
      "question": "Soru metni?",
      "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"],
      "correctAnswer": 0,
      "explanation": "Doğru cevabın açıklaması",
      "topic": "Ana konu başlığı",
      "difficulty": "${options.difficulty}"
    }
  ]
}

İÇERİK:
${content}

ZORLUK SEVİYESİ: ${options.difficulty}
SORU SAYISI: ${options.questionCount}
`;

  return basePrompt;
}
```

**Content Analysis Implementation:**

```typescript
async analyzeDocument(documentText: string): Promise<DocumentAnalysis> {
  const analysisPrompt = `
Aşağıdaki eğitim içeriğini analiz et ve şu bilgileri çıkar:

1. Ana konular (topics)
2. Alt konular (subtopics)  
3. Anahtar kavramlar (key_concepts)
4. Zorluk seviyesi (difficulty_level)
5. İçerik türü (content_type)

JSON formatında yanıt ver:
{
  "topics": ["konu1", "konu2"],
  "subtopics": ["alt_konu1", "alt_konu2"],
  "key_concepts": ["kavram1", "kavram2"],
  "difficulty_level": "beginner|intermediate|advanced",
  "content_type": "lecture|tutorial|reference|exam_prep",
  "summary": "İçeriğin kısa özeti"
}

İÇERİK:
${documentText}
  `;

  try {
    const result = await this.model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();
    
    return this.parseAnalysisResponse(text);
  } catch (error) {
    this.logger.error('Document analysis failed', error);
    throw new Error('Analysis failed');
  }
}
```

**Adaptive Difficulty Algorithm:**

```typescript
class AdaptiveDifficultyService {
  calculateNextDifficulty(
    userPerformance: UserPerformance,
    currentDifficulty: Difficulty
  ): Difficulty {
    const { averageScore, recentScores, topicMastery } = userPerformance;
    
    // Son 5 sınav ortalaması
    const recentAverage = recentScores.slice(-5).reduce((a, b) => a + b, 0) / 5;
    
    // Konu hakimiyeti skoru
    const masteryScore = Object.values(topicMastery).reduce((a, b) => a + b, 0) / Object.keys(topicMastery).length;
    
    // Kombine skor hesaplama
    const combinedScore = (recentAverage * 0.6) + (masteryScore * 0.4);
    
    // Zorluk seviyesi belirleme
    if (combinedScore >= 80 && currentDifficulty !== 'hard') {
      return this.increaseDifficulty(currentDifficulty);
    } else if (combinedScore <= 60 && currentDifficulty !== 'easy') {
      return this.decreaseDifficulty(currentDifficulty);
    }
    
    return currentDifficulty;
  }
}
```

## 3.7. Güvenlik ve Performans Optimizasyonu

Platform güvenliği, multiple layer security approach ile sağlanmıştır. Performans optimizasyonu ise hem client hem de server tarafında comprehensive strategies ile gerçekleştirilmiştir.

**Güvenlik Önlemleri:**

**Authentication & Authorization:**
```typescript
// JWT Token Validation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

**Input Validation:**
```typescript
// Request Validation DTOs
export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  @Matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-_]+$/)
  title: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
```

**Rate Limiting ve CORS:**
```typescript
// Rate Limiting Configuration
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
}));

// CORS Configuration
app.enableCors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://aiquiz.com', 'https://www.aiquiz.com']
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Performans Optimizasyon Stratejileri:**

**Frontend Performance:**
```typescript
// Code Splitting with Dynamic Imports
const QuizEditor = dynamic(() => import('../components/QuizEditor'), {
  loading: () => <QuizEditorSkeleton />,
  ssr: false
});

// Image Optimization
import Image from 'next/image';

export const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    quality={85}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    {...props}
  />
);

// Memoization for expensive calculations
const MemoizedQuizCard = React.memo(({ quiz }) => {
  const formattedDuration = useMemo(() => 
    formatDuration(quiz.duration), [quiz.duration]
  );
  
  return (
    <Card>
      <CardContent>
        <h3>{quiz.title}</h3>
        <p>Duration: {formattedDuration}</p>
      </CardContent>
    </Card>
  );
});
```

**Backend Performance:**
```typescript
// Caching Strategy
@Injectable()
export class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }
}

// Database Query Optimization
@Injectable()
export class QuizService {
  async getQuizzesByUser(userId: string, limit = 10): Promise<Quiz[]> {
    return this.firestore
      .collection('quizzes')
      .where('createdBy', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.data()));
  }
}
```

## 3.8. Test Stratejisi ve Kalite Güvencesi

Comprehensive testing strategy ile platform'un reliability ve maintainability'si sağlanmıştır. Multi-layer testing approach benimsenmiştir.

**Test Piramidi Implementation:**

**Unit Tests:**
```typescript
// Service Unit Tests
describe('QuizService', () => {
  let service: QuizService;
  let mockFirestore: jest.Mocked<FirestoreService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: FirestoreService,
          useFactory: () => createMockFirestore()
        }
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    mockFirestore = module.get(FirestoreService);
  });

  describe('generateQuiz', () => {
    it('should generate quiz with correct number of questions', async () => {
      const options = { questionCount: 10, difficulty: 'medium' };
      const mockQuestions = createMockQuestions(10);
      
      mockFirestore.create.mockResolvedValue({ id: 'quiz-123' });
      
      const result = await service.generateQuiz('test content', options);
      
      expect(result.questions).toHaveLength(10);
      expect(result.difficulty).toBe('medium');
      expect(mockFirestore.create).toHaveBeenCalledTimes(1);
    });
  });
});
```

**Integration Tests:**
```typescript
// API Integration Tests
describe('QuizController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Setup test user authentication
    jwtToken = await getTestJwtToken();
  });

  describe('/quizzes (POST)', () => {
    it('should create a new quiz', () => {
      return request(app.getHttpServer())
        .post('/quizzes/generate')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          topic: 'Mathematics',
          questionCount: 5,
          difficulty: 'easy'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.questions).toHaveLength(5);
          expect(res.body.id).toBeDefined();
        });
    });
  });
});
```

**Frontend Component Tests:**
```typescript
// React Component Tests
describe('QuizCard Component', () => {
  const mockQuiz = {
    id: '1',
    title: 'Test Quiz',
    description: 'Test Description',
    questionCount: 10,
    difficulty: 'medium'
  };

  it('renders quiz information correctly', () => {
    render(<QuizCard quiz={mockQuiz} />);
    
    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', () => {
    const mockOnStart = jest.fn();
    render(<QuizCard quiz={mockQuiz} onStart={mockOnStart} />);
    
    fireEvent.click(screen.getByText('Start Quiz'));
    
    expect(mockOnStart).toHaveBeenCalledWith(mockQuiz.id);
  });
});
```

**E2E Tests:**
```typescript
// Cypress E2E Tests
describe('Quiz Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('test@example.com', 'password');
  });

  it('should complete full quiz journey', () => {
    // Navigate to quiz creation
    cy.contains('Create Quiz').click();
    
    // Fill quiz form
    cy.get('[data-testid="topic-input"]').type('JavaScript Basics');
    cy.get('[data-testid="question-count"]').select('5');
    cy.get('[data-testid="difficulty"]').select('easy');
    
    // Submit and start quiz
    cy.contains('Generate Quiz').click();
    cy.contains('Start Quiz').click();
    
    // Answer questions
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="option-0"]').click();
      cy.contains('Next').click();
    }
    
    // Verify results
    cy.contains('Quiz Completed').should('be.visible');
    cy.get('[data-testid="score"]').should('contain', '/5');
  });
});
```

**Code Quality Tools:**

**ESLint Configuration:**
```json
{
  "extends": [
    "@next/next/recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

**Pre-commit Hooks:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

Bu kapsamlı materyal ve yöntem bölümü, platformun teknik altyapısını, geliştirme sürecini ve kalite güvence mekanizmalarını detaylı şekilde dokumentlamaktadır. Tüm teknik kararlar, best practices ve implementation detayları akademik standartlarda sunulmuştur.
