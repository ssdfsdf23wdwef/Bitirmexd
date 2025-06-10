import { SetMetadata } from '@nestjs/common';

/**
 * Cache TTL (Time To Live) decorator'ı
 * Cache için yaşam süresi belirler
 *
 * @param ttl Cache yaşam süresi (saniye)
 * @example
 * @CacheTTL(300) // 5 dakika cache
 * @Get()
 * getData() { ... }
 */
export const CacheTTL = (ttl: number) => SetMetadata('cache_ttl', ttl);

/**
 * Varsayılan cache TTL değeri (5 dakika)
 */
export const DEFAULT_CACHE_TTL = 300;

/**
 * Cache key prefix'i
 */
export const CACHE_KEY_METADATA = 'cache_key';

/**
 * Cache key decorator'ı
 * @param key Cache anahtarı
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
