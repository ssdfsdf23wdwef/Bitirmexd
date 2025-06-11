# AI Quiz Frontend

> Modern React uygulaması - Next.js 15, React 19, TailwindCSS 4 ve NextUI ile geliştirilmiş responsive eğitim platformu arayüzü.

## 🚀 Özellikler

- **Next.js 15**: App Router, Server Components, Edge Runtime
- **React 19**: Latest React features ve concurrent rendering
- **TailwindCSS 4**: Utility-first CSS framework (latest version)
- **NextUI**: Modern React UI komponet kütüphanesi
- **TypeScript**: Full type safety ve developer experience
- **Zustand**: Lightweight state management
- **TanStack Query**: Powerful data fetching ve caching
- **Framer Motion**: Smooth animations ve micro-interactions

## 🎨 Design System

### Modern UI Components
- **Adaptive Theme**: Dark/Light mode with system preference
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized for Core Web Vitals
- **Animation**: Subtle micro-interactions with Framer Motion

### Color Palette
```css
/* Primary Brand Colors */
--primary: #3b82f6      /* Blue 500 */
--secondary: #8b5cf6    /* Purple 500 */
--accent: #f59e0b       /* Amber 500 */

/* Semantic Colors */
--success: #10b981      /* Emerald 500 */
--warning: #f59e0b      /* Amber 500 */
--error: #ef4444        /* Red 500 */
--info: #3b82f6         /* Blue 500 */
```

### Typography Scale
- **Font Family**: Inter (Primary), JetBrains Mono (Code)
- **Scale**: 12px → 14px → 16px → 18px → 24px → 32px → 48px
- **Line Height**: 1.2 (Headlines) → 1.5 (Body) → 1.6 (Reading)

## 📱 Responsive Breakpoints

```typescript
const breakpoints = {
  xs: '475px',    // Mobile small
  sm: '640px',    // Mobile
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Desktop large
  '2xl': '1536px' // Desktop extra large
}
```

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard layout
│   ├── courses/           # Course pages
│   ├── quiz/              # Quiz pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React Components
│   ├── ui/                # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── quiz/              # Quiz-specific components
│   ├── course/            # Course-specific components
│   ├── layout/            # Layout components
│   └── forms/             # Form components
├── services/              # API layer
│   ├── api.ts             # Base API configuration
│   ├── auth.service.ts    # Authentication API
│   ├── quiz.service.ts    # Quiz API
│   └── course.service.ts  # Course API
├── store/                 # State management
│   ├── authStore.ts       # Authentication state
│   ├── quizStore.ts       # Quiz state
│   └── themeStore.ts      # Theme state
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useQuiz.ts         # Quiz management hook
│   └── useTheme.ts        # Theme management hook
├── types/                 # TypeScript definitions
│   ├── api.types.ts       # API response types
│   ├── quiz.types.ts      # Quiz-related types
│   └── user.types.ts      # User-related types
├── styles/                # Style configuration
│   ├── globals.css        # Global CSS
│   ├── components.css     # Component styles
│   └── utilities.css      # Utility classes
└── lib/                   # Utility functions
    ├── utils.ts           # General utilities
    ├── api.ts             # API utilities
    └── validation.ts      # Form validation
```

## ⚡ Performance Features

### Build Optimizations
- **Bundle Analysis**: Webpack Bundle Analyzer integration
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Dead code elimination
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Font Optimization**: Google Fonts optimization

### Runtime Optimizations
- **Lazy Loading**: Dynamic imports for heavy components
- **Virtualization**: Large list rendering optimization
- **Memoization**: React.memo and useMemo optimizations
- **Caching**: Aggressive caching strategies with SWR

### Core Web Vitals
```
✅ LCP (Largest Contentful Paint): < 2.5s
✅ FID (First Input Delay): < 100ms
✅ CLS (Cumulative Layout Shift): < 0.1
✅ FCP (First Contentful Paint): < 1.8s
✅ TTFB (Time to First Byte): < 600ms
```

## 🔧 Development Commands

### Build & Development
```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
npm run analyze          # Bundle analysis
```

### Code Quality
```bash
npm run lint             # ESLint + Next.js linting
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript type checking
npm run format           # Prettier formatting
```

### Analysis & Optimization
```bash
npm run knip             # Find unused dependencies
npm run depcheck         # Check dependency usage
npm run bundle-analyzer  # Analyze bundle size
```

## 🎯 Key Components

### Authentication
- **LoginForm**: Firebase Auth integration
- **ProtectedRoute**: Route-level authentication
- **UserProfile**: User management interface

### Quiz Interface
- **QuizPlayer**: Interactive quiz taking experience
- **QuestionCard**: Individual question component
- **ProgressTracker**: Real-time progress indication
- **ResultsAnalysis**: Detailed performance analytics

### Course Management
- **CourseList**: Course browsing interface
- **CourseCreator**: Course creation wizard
- **DocumentUploader**: File upload with preview
- **TopicExtractor**: AI-powered topic extraction

### UI Components
- **ThemeToggle**: Dark/Light mode switcher
- **Navigation**: Responsive navigation menu
- **LoadingStates**: Skeleton loading components
- **ErrorBoundary**: Error handling UI

## 🌐 Internationalization

```typescript
// Supported Languages
const languages = {
  'tr': 'Türkçe',
  'en': 'English'
}

// Usage
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
```

## 📊 State Management

### Zustand Stores
```typescript
// Auth Store
interface AuthState {
  user: User | null
  isLoading: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

// Quiz Store
interface QuizState {
  currentQuiz: Quiz | null
  answers: Answer[]
  timeRemaining: number
  submitAnswer: (answer: Answer) => void
}
```

### React Query
- **Queries**: Data fetching with automatic caching
- **Mutations**: Optimistic updates
- **Infinite Queries**: Pagination support
- **Background Refetch**: Automatic data synchronization

## 🔒 Security Features

- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Request token validation
- **Route Protection**: Authentication-based routing
- **Content Security Policy**: CSP headers

## 🚀 Deployment

### Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain

# Optional
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Build Commands
```bash
# Production build
npm run build

# Start production server
npm start

# Docker deployment
docker build -t ai-quiz-frontend .
docker run -p 3000:3000 ai-quiz-frontend
```

## 📈 Performance Monitoring

- **Bundle Size Tracking**: Automatic bundle analysis
- **Runtime Performance**: React DevTools Profiler
- **Web Vitals**: Core Web Vitals monitoring
- **Error Tracking**: Sentry integration
- **Analytics**: User behavior tracking

---

**Geliştirme Teknolojileri**: Next.js 15.2+, React 19.1+, TypeScript 5+  
**UI Framework**: TailwindCSS 4, NextUI 2.6+  
**Build Tool**: Webpack 5, SWC Compiler  
**Package Manager**: npm 10+
