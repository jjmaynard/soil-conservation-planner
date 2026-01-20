// Resilient Fetch
// Provides retry logic, rate limiting, and fallback to static data

import { getDataSource, isStaticJSON } from './providers/registry';
import { loadStaticData } from './static-data-loader';

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  retries?: number;
  timeoutMs?: number;
  sourceId?: string; // Data source ID from registry
}

/**
 * Resilient fetch with retry logic, rate limiting, and static data fallback
 * @param url - The URL to fetch (ignored if sourceId points to static data)
 * @param options - Fetch options including retry configuration
 * @returns Promise with the fetched data
 */
export async function resilientFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { sourceId } = options;
  
  // If this is a static data source, load from JSON instead of fetching
  if (sourceId && isStaticJSON(sourceId)) {
    console.log(`Loading static data for ${sourceId}`);
    return await loadStaticData<T>(sourceId);
  }

  const {
    method = 'GET',
    body,
    headers = {},
    params,
    retries = 3,
    timeoutMs = 10000,
  } = options;

  // Build URL with query params
  let fullUrl = url;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    fullUrl = `${url}?${queryString}`;
  }

  // Rate limiting check (only for APIs)
  if (sourceId) {
    await checkRateLimit(sourceId);
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update rate limit tracking
      if (sourceId) {
        recordAPICall(sourceId);
      }

      return data as T;

    } catch (error) {
      lastError = error as Error;
      console.warn(`API call failed (attempt ${attempt}/${retries}):`, error);

      if (attempt < retries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`API call failed after ${retries} attempts: ${lastError?.message}`);
}

// ============================================================================
// Rate Limiting
// ============================================================================

const rateLimitTracking = new Map<string, number[]>();

async function checkRateLimit(sourceId: string): Promise<void> {
  const source = getDataSource(sourceId);
  if (source.type !== 'api' || !source.rateLimitPerMinute) return;

  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Get recent calls
  const recentCalls = rateLimitTracking.get(sourceId) || [];
  const callsInLastMinute = recentCalls.filter(time => time > oneMinuteAgo);

  if (callsInLastMinute.length >= source.rateLimitPerMinute) {
    const oldestCall = callsInLastMinute[0];
    const waitTime = 60000 - (now - oldestCall);
    console.warn(`Rate limit reached for ${sourceId}, waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

function recordAPICall(sourceId: string): void {
  const calls = rateLimitTracking.get(sourceId) || [];
  calls.push(Date.now());
  
  // Keep only last minute of calls
  const oneMinuteAgo = Date.now() - 60000;
  rateLimitTracking.set(
    sourceId,
    calls.filter(time => time > oneMinuteAgo)
  );
}

// ============================================================================
// Rate Limit Stats (for debugging/monitoring)
// ============================================================================

export function getRateLimitStats(sourceId: string): {
  callsInLastMinute: number;
  limit: number;
  remaining: number;
} {
  const source = getDataSource(sourceId);
  if (source.type !== 'api' || !source.rateLimitPerMinute) {
    return { callsInLastMinute: 0, limit: 0, remaining: 0 };
  }

  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const recentCalls = rateLimitTracking.get(sourceId) || [];
  const callsInLastMinute = recentCalls.filter(time => time > oneMinuteAgo).length;

  return {
    callsInLastMinute,
    limit: source.rateLimitPerMinute,
    remaining: Math.max(0, source.rateLimitPerMinute - callsInLastMinute)
  };
}

export function clearRateLimitTracking(): void {
  rateLimitTracking.clear();
  console.log('Rate limit tracking cleared');
}
