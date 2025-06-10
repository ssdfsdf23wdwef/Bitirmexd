/**
 * Firebase performans izleme ve optimizasyon utilities
 */

export interface PerformanceMetrics {
  operation: string;
  collection: string;
  duration: number;
  cacheHit?: boolean;
  recordCount?: number;
  timestamp: Date;
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Son 1000 operasyonu sakla

  private constructor() {}

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  /**
   * Operasyon metriğini kaydeder
   */
  recordMetric(metric: Omit<PerformanceMetrics, 'timestamp'>): void {
    const fullMetric: PerformanceMetrics = {
      ...metric,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);

    // Limit aşılırsa eski metrikleri temizle
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Son N operasyonun ortalama süresini döndürür
   */
  getAverageOperationTime(operation: string, collection?: string, lastN: number = 10): number {
    let filteredMetrics = this.metrics.filter(m => m.operation === operation);
    
    if (collection) {
      filteredMetrics = filteredMetrics.filter(m => m.collection === collection);
    }

    const recentMetrics = filteredMetrics.slice(-lastN);
    
    if (recentMetrics.length === 0) return 0;
    
    const totalTime = recentMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalTime / recentMetrics.length;
  }

  /**
   * Cache hit oranını döndürür
   */
  getCacheHitRate(operation: string, collection?: string, lastN: number = 100): number {
    let filteredMetrics = this.metrics.filter(m => 
      m.operation === operation && m.cacheHit !== undefined
    );
    
    if (collection) {
      filteredMetrics = filteredMetrics.filter(m => m.collection === collection);
    }

    const recentMetrics = filteredMetrics.slice(-lastN);
    
    if (recentMetrics.length === 0) return 0;
    
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    return (cacheHits / recentMetrics.length) * 100;
  }

  /**
   * Yavaş operasyonları tespit eder
   */
  getSlowOperations(thresholdMs: number = 1000): PerformanceMetrics[] {
    return this.metrics
      .filter(m => m.duration > thresholdMs)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20); // En yavaş 20 operasyon
  }

  /**
   * Performans raporu oluşturur
   */
  generateReport(): {
    totalOperations: number;
    averageTime: number;
    cacheHitRate: number;
    slowOperations: PerformanceMetrics[];
    operationBreakdown: Record<string, { count: number; avgTime: number }>;
  } {
    const totalOperations = this.metrics.length;
    const totalTime = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageTime = totalOperations > 0 ? totalTime / totalOperations : 0;

    const cacheMetrics = this.metrics.filter(m => m.cacheHit !== undefined);
    const cacheHits = cacheMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = cacheMetrics.length > 0 ? (cacheHits / cacheMetrics.length) * 100 : 0;

    const slowOperations = this.getSlowOperations();

    // Operasyon türlerine göre breakdown
    const operationBreakdown: Record<string, { count: number; avgTime: number }> = {};
    
    this.metrics.forEach(metric => {
      const key = `${metric.operation}:${metric.collection}`;
      
      if (!operationBreakdown[key]) {
        operationBreakdown[key] = { count: 0, avgTime: 0 };
      }
      
      operationBreakdown[key].count++;
      operationBreakdown[key].avgTime = 
        (operationBreakdown[key].avgTime * (operationBreakdown[key].count - 1) + metric.duration) / 
        operationBreakdown[key].count;
    });

    return {
      totalOperations,
      averageTime,
      cacheHitRate,
      slowOperations,
      operationBreakdown,
    };
  }

  /**
   * Metrikleri temizler
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * Performans izleme decorator'u
 */
export function TrackPerformance(operation: string, collection?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const tracker = PerformanceTracker.getInstance();

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let recordCount: number | undefined;
      let cacheHit: boolean | undefined;

      try {
        const result = await originalMethod.apply(this, args);
        
        // Sonuç array ise kayıt sayısını al
        if (Array.isArray(result)) {
          recordCount = result.length;
        }

        return result;
      } finally {
        const duration = Date.now() - startTime;
        
        tracker.recordMetric({
          operation,
          collection: collection || 'unknown',
          duration,
          cacheHit,
          recordCount,
        });
      }
    };

    return descriptor;
  };
}

/**
 * Batch boyutunu optimize eder
 */
export function optimizeBatchSize(totalItems: number, maxBatchSize: number = 500): number {
  if (totalItems <= 100) return Math.min(totalItems, 50);
  if (totalItems <= 1000) return Math.min(totalItems, 100);
  if (totalItems <= 5000) return Math.min(totalItems, 250);
  return Math.min(totalItems, maxBatchSize);
}

/**
 * Paralel işlem sayısını optimize eder
 */
export function optimizeParallelism(totalOperations: number): number {
  if (totalOperations <= 10) return 2;
  if (totalOperations <= 50) return 3;
  if (totalOperations <= 100) return 5;
  return Math.min(10, Math.ceil(totalOperations / 20));
}

/**
 * Query sonuçlarını sayfalara böler
 */
export function paginateQuery<T>(
  items: T[],
  pageSize: number,
  page: number = 1
): {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  const data = items.slice(startIndex, endIndex);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
