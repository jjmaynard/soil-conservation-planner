// Browser Cache Layer
// LocalStorage-based caching with expiration, hit tracking, and stale data fallback

interface CacheEntry<T> {
  data: T;
  cached_at: number;
  expires_at: number;
  data_source?: string;
  endpoint?: string;
  hit_count: number;
}

/**
 * Get cached data if available and not expired
 * @param cacheKey - Unique key for the cached data
 * @param duration - Cache duration in seconds (optional, uses stored duration if omitted)
 * @returns Cached data or null if not found/expired
 */
export async function getCachedData<T>(
  cacheKey: string,
  duration?: number
): Promise<T | null> {
  try {
    const cached = localStorage.getItem(`api_cache:${cacheKey}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() > entry.expires_at) {
      localStorage.removeItem(`api_cache:${cacheKey}`);
      return null;
    }

    // Update hit count
    entry.hit_count++;
    localStorage.setItem(`api_cache:${cacheKey}`, JSON.stringify(entry));

    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Set cached data with expiration
 * @param cacheKey - Unique key for the cached data
 * @param data - Data to cache
 * @param duration - Cache duration in seconds
 * @param sourceId - Optional data source identifier
 * @param endpoint - Optional endpoint identifier
 */
export async function setCachedData<T>(
  cacheKey: string,
  data: T,
  duration: number,
  sourceId?: string,
  endpoint?: string
): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      cached_at: Date.now(),
      expires_at: Date.now() + (duration * 1000),
      data_source: sourceId,
      endpoint,
      hit_count: 0
    };

    localStorage.setItem(`api_cache:${cacheKey}`, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, clearing old cache entries');
      await cleanupExpiredCache();
      // Try again
      try {
        const entry: CacheEntry<T> = {
          data,
          cached_at: Date.now(),
          expires_at: Date.now() + (duration * 1000),
          data_source: sourceId,
          endpoint,
          hit_count: 0
        };
        localStorage.setItem(`api_cache:${cacheKey}`, JSON.stringify(entry));
      } catch (retryError) {
        console.error('Cache write failed after cleanup:', retryError);
      }
    } else {
      console.error('Cache write error:', error);
    }
  }
}

/**
 * Get stale data if API fails (resilience feature)
 * Returns expired cache data as a fallback
 * @param cacheKey - Unique key for the cached data
 * @returns Stale cached data or null if not found
 */
export async function getStaleData<T>(cacheKey: string): Promise<T | null> {
  try {
    const cached = localStorage.getItem(`api_cache:${cacheKey}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    console.warn(`Using stale cached data for ${cacheKey} (expired ${new Date(entry.expires_at).toLocaleString()})`);
    return entry.data;
  } catch (error) {
    console.error('Stale cache read error:', error);
    return null;
  }
}

/**
 * Invalidate specific cache entry
 * @param cacheKey - Unique key for the cached data to invalidate
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  localStorage.removeItem(`api_cache:${cacheKey}`);
}

/**
 * Invalidate all cache entries for a specific data source
 * @param sourceId - Data source identifier
 */
export async function invalidateCacheBySource(sourceId: string): Promise<number> {
  let removed = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('api_cache:')) {
      try {
        const entry = JSON.parse(localStorage.getItem(key)!);
        if (entry.data_source === sourceId) {
          localStorage.removeItem(key);
          removed++;
        }
      } catch (error) {
        console.error(`Error invalidating cache for key ${key}:`, error);
      }
    }
  }

  console.log(`Invalidated ${removed} cache entries for ${sourceId}`);
  return removed;
}

/**
 * Cleanup expired cache entries
 * @returns Number of entries removed
 */
export async function cleanupExpiredCache(): Promise<number> {
  let removed = 0;
  const now = Date.now();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('api_cache:')) {
      try {
        const entry = JSON.parse(localStorage.getItem(key)!);
        if (now > entry.expires_at) {
          localStorage.removeItem(key);
          removed++;
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key);
        removed++;
      }
    }
  }

  console.log(`Cleaned up ${removed} expired cache entries`);
  return removed;
}

/**
 * Clear all cache entries
 */
export async function clearAllCache(): Promise<number> {
  let removed = 0;

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('api_cache:')) {
      localStorage.removeItem(key);
      removed++;
    }
  }

  console.log(`Cleared ${removed} cache entries`);
  return removed;
}

/**
 * Get cache statistics
 * @returns Cache statistics including size, entries, and hit rates
 */
export function getCacheStats() {
  let totalSize = 0;
  let totalEntries = 0;
  let hitCount = 0;
  let expiredCount = 0;
  const now = Date.now();
  const sourceStats: Record<string, { entries: number; hits: number }> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('api_cache:')) {
      totalEntries++;
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        try {
          const entry = JSON.parse(value);
          hitCount += entry.hit_count || 0;
          
          // Check if expired
          if (now > entry.expires_at) {
            expiredCount++;
          }
          
          // Track by source
          if (entry.data_source) {
            if (!sourceStats[entry.data_source]) {
              sourceStats[entry.data_source] = { entries: 0, hits: 0 };
            }
            sourceStats[entry.data_source].entries++;
            sourceStats[entry.data_source].hits += entry.hit_count || 0;
          }
        } catch (e) {
          console.error('Error parsing cache entry:', e);
        }
      }
    }
  }

  return {
    totalEntries,
    totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    totalSizeBytes: totalSize,
    totalHits: hitCount,
    avgHitsPerEntry: totalEntries > 0 ? (hitCount / totalEntries).toFixed(2) : 0,
    expiredEntries: expiredCount,
    activeEntries: totalEntries - expiredCount,
    bySource: sourceStats,
    percentFull: `${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)}%` // Assuming 5MB localStorage limit
  };
}

/**
 * List all cache keys with metadata
 * @returns Array of cache key information
 */
export function listCacheKeys(): Array<{
  key: string;
  dataSource?: string;
  endpoint?: string;
  cachedAt: Date;
  expiresAt: Date;
  isExpired: boolean;
  hitCount: number;
  sizeKB: number;
}> {
  const keys: Array<any> = [];
  const now = Date.now();

  for (let i = 0; i < localStorage.length; i++) {
    const fullKey = localStorage.key(i);
    if (fullKey && fullKey.startsWith('api_cache:')) {
      const value = localStorage.getItem(fullKey);
      if (value) {
        try {
          const entry = JSON.parse(value);
          keys.push({
            key: fullKey.replace('api_cache:', ''),
            dataSource: entry.data_source,
            endpoint: entry.endpoint,
            cachedAt: new Date(entry.cached_at),
            expiresAt: new Date(entry.expires_at),
            isExpired: now > entry.expires_at,
            hitCount: entry.hit_count || 0,
            sizeKB: parseFloat((value.length / 1024).toFixed(2))
          });
        } catch (e) {
          console.error('Error parsing cache entry:', e);
        }
      }
    }
  }

  return keys.sort((a, b) => b.cachedAt.getTime() - a.cachedAt.getTime());
}
