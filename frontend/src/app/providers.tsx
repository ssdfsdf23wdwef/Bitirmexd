"use client";

import React, { ReactNode, useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

import dynamic from "next/dynamic";
import { setupLogging, setupGlobalErrorHandling, startFlow } from "@/lib/logger.utils";
import { FlowCategory } from "@/constants/logging.constants";

// Initialize logging only on client side
let logger: any = null;
if (typeof window !== 'undefined') {
  const isProd = process.env.NODE_ENV === 'production';
  // Loglama ve akış izleme servislerini başlat
  const logSetup = setupLogging({
    loggerOptions: {
      level: 'info', // Use string instead of LogLevel.INFO to avoid SSR issues
      enabled: !isProd,
      consoleOutput: false,
      sendLogsToApi: !isProd,
      writeToLocalFile: !isProd,
    },
    flowTrackerOptions: {
        enabled: !isProd,
      traceApiCalls: !isProd,
      traceStateChanges: !isProd,
      captureTimings: !isProd,
      consoleOutput: false,
      sendLogsToApi: !isProd,
      writeToLocalFile: !isProd,
    }
  });
  logger = logSetup.logger;
}

// Dynamic imports for better performance
const AnalyticsComponent = dynamic(
  () => import("@/components/analytics/AnalyticsComponent"),
  {
    ssr: false,
    loading: () => <></>, // Or a minimal skeleton/null
  },
);

// QueryClient oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}


/**
 * Tüm uygulama sağlayıcılarını (providers) bir araya getiren bileşen
 * Bu bileşen, RootLayout içerisinde tüm uygulamayı sarmalar
 */
export function Providers({ children }: ProvidersProps) {

  useEffect(() => {
    // Uygulama başladı flowunu izle
    const appFlow = startFlow(FlowCategory.Navigation, 'AppStartup');
    appFlow.trackStep('Uygulama başlangıç bileşenleri yüklendi');
    
    // Global hata yakalama
    setupGlobalErrorHandling();
    
    // Yakalanamayan hataları dinle
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error(
        `Yakalanmayan Promise reddi: ${event.reason}`,
        'Providers',
        'providers.tsx',
        '69',
        { 
          reason: event.reason?.toString(), 
          stack: event.reason instanceof Error ? event.reason.stack : undefined,
          errorObject: event.reason instanceof Error ? event.reason.toString() : event.reason
        }
      );
    };

    const handleGlobalError = (event: ErrorEvent) => {
      logger.error(
        `Yakalanmayan global hata: ${event.message}`,
        'Providers',
        event.filename || 'providers.tsx',
        event.lineno?.toString() || '80',
        { 
          errorName: event.error?.name,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      );
    };
    
    // Event listener'ları ekle
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    
    // Sayfanın önbelleğe alınması, görüntülenmesi ve yüklenme olaylarını izle
    const pageLoadFlow = startFlow(FlowCategory.Navigation, 'PageLoad');
    
    // Sayfa yükleme adımlarını kaydet
    if (document.readyState === 'loading') {
      pageLoadFlow.trackStep('Sayfa yükleniyor');
      document.addEventListener('DOMContentLoaded', () => {
        pageLoadFlow.trackStep('DOM yüklendi');
      });
    } else {
      pageLoadFlow.trackStep('DOM zaten yüklü');
    }
    
    window.addEventListener('load', () => {
      pageLoadFlow.trackStep('Sayfa tamamen yüklendi');
      pageLoadFlow.end('Sayfa yükleme tamamlandı');
      appFlow.trackStep('Uygulama tamamen yüklendi');
      appFlow.end();
    });
    
    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ToastProvider>
                {children}
                <AnalyticsComponent />
              </ToastProvider>
            </ThemeProvider>
          </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
