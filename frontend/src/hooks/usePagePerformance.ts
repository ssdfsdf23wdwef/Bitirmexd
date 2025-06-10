"use client";

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  navigationStart: number;
  loadComplete: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

/**
 * Sayfa performansını izleyen hook
 */
export function usePagePerformance(pageName: string) {
  const startTime = useRef<number>(Date.now());
  const metricsReported = useRef<boolean>(false);

  useEffect(() => {
    const reportMetrics = () => {
      if (metricsReported.current || typeof window === 'undefined') return;

      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const metrics: PerformanceMetrics = {
          navigationStart: navigation.navigationStart,
          loadComplete: navigation.loadEventEnd,
          domContentLoaded: navigation.domContentLoadedEventEnd,
        };

        // Paint metrics
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) metrics.firstContentfulPaint = fcp.startTime;

        // LCP metric (if available)
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                metrics.largestContentfulPaint = lastEntry.startTime;
              }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // LCP not supported
          }
        }

        // Log yavaş sayfa yüklemeleri
        const loadTime = Date.now() - startTime.current;
        if (loadTime > 1000) {
          console.warn(`🐌 Yavaş sayfa yüklemesi: ${pageName} - ${loadTime}ms`);
        } else if (loadTime < 300) {
          console.log(`⚡ Hızlı sayfa yüklemesi: ${pageName} - ${loadTime}ms`);
        }

        // Metrikleri analytics'e gönder (isteğe bağlı)
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'page_performance', {
            page_name: pageName,
            load_time: loadTime,
            navigation_start: metrics.navigationStart,
            dom_content_loaded: metrics.domContentLoaded,
            first_contentful_paint: metrics.firstContentfulPaint,
          });
        }

        metricsReported.current = true;
      } catch (error) {
        console.error('Performance metrics hatası:', error);
      }
    };

    // DOM ready olduğunda metrikleri rapor et
    if (document.readyState === 'complete') {
      setTimeout(reportMetrics, 100);
    } else {
      window.addEventListener('load', () => setTimeout(reportMetrics, 100));
    }

    return () => {
      window.removeEventListener('load', reportMetrics);
    };
  }, [pageName]);

  return {
    startTime: startTime.current,
  };
}
