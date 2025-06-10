import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PerformanceTracker } from '../common/utils/performance.utils';

@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  private readonly performanceTracker = PerformanceTracker.getInstance();

  @Get('report')
  @ApiOperation({ 
    summary: 'Firebase performans raporu',
    description: 'Firebase işlemlerinin performans metriklerini döndürür'
  })
  @ApiResponse({
    status: 200,
    description: 'Performans raporu başarıyla alındı',
  })
  getPerformanceReport() {
    return this.performanceTracker.generateReport();
  }

  @Get('slow-operations')
  @ApiOperation({ 
    summary: 'Yavaş işlemler',
    description: 'Belirtilen eşik değerinin üzerindeki yavaş işlemleri listeler'
  })
  @ApiQuery({ 
    name: 'threshold', 
    required: false, 
    description: 'Eşik değeri (ms)', 
    example: 1000 
  })
  @ApiResponse({
    status: 200,
    description: 'Yavaş işlemler başarıyla alındı',
  })
  getSlowOperations(@Query('threshold') threshold?: string) {
    const thresholdMs = threshold ? parseInt(threshold, 10) : 1000;
    return this.performanceTracker.getSlowOperations(thresholdMs);
  }

  @Get('cache-stats')
  @ApiOperation({ 
    summary: 'Cache istatistikleri',
    description: 'Belirtilen operasyon için cache hit oranını döndürür'
  })
  @ApiQuery({ 
    name: 'operation', 
    required: true, 
    description: 'Operasyon adı', 
    example: 'findById' 
  })
  @ApiQuery({ 
    name: 'collection', 
    required: false, 
    description: 'Koleksiyon adı', 
    example: 'users' 
  })
  @ApiQuery({ 
    name: 'lastN', 
    required: false, 
    description: 'Son N operasyon', 
    example: 100 
  })
  @ApiResponse({
    status: 200,
    description: 'Cache istatistikleri başarıyla alındı',
  })
  getCacheStats(
    @Query('operation') operation: string,
    @Query('collection') collection?: string,
    @Query('lastN') lastN?: string,
  ) {
    const n = lastN ? parseInt(lastN, 10) : 100;
    
    const cacheHitRate = this.performanceTracker.getCacheHitRate(
      operation, 
      collection, 
      n
    );

    const avgTime = this.performanceTracker.getAverageOperationTime(
      operation,
      collection,
      n
    );

    return {
      operation,
      collection: collection || 'all',
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      averageOperationTime: Math.round(avgTime * 100) / 100,
      sampleSize: n,
    };
  }

  @Get('clear-metrics')
  @ApiOperation({ 
    summary: 'Performans metriklerini temizle',
    description: 'Tüm performans metriklerini temizler'
  })
  @ApiResponse({
    status: 200,
    description: 'Performans metrikleri başarıyla temizlendi',
  })
  clearMetrics() {
    this.performanceTracker.clearMetrics();
    return { message: 'Performans metrikleri temizlendi' };
  }
}
