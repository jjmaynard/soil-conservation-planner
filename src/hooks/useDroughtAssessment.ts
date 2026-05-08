import { useState, useCallback, useEffect } from 'react'
import { geeApi } from '@/lib/geeApiClient'
import type { DroughtAssessmentResponse, DroughtAssessmentRequest } from '@/types/drought'

const CACHE_TTL_MS = 30 * 60 * 1000
const droughtAssessmentCache = new Map<string, { data: DroughtAssessmentResponse; timestamp: number }>()
const droughtAssessmentInFlight = new Map<string, Promise<DroughtAssessmentResponse>>()

function getDroughtCacheKey(wkt: string, date?: string): string {
  const effectiveDate = date || new Date().toISOString().split('T')[0]
  return `${wkt}::${effectiveDate}`
}

function getCachedDroughtAssessment(cacheKey: string): DroughtAssessmentResponse | null {
  const cached = droughtAssessmentCache.get(cacheKey)
  if (!cached) {
    return null
  }

  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    droughtAssessmentCache.delete(cacheKey)
    return null
  }

  return cached.data
}

interface UseDroughtAssessmentOptions {
  wkt: string;
  date?: string;
  autoFetch?: boolean;
}

export function useDroughtAssessment(options: UseDroughtAssessmentOptions) {
  const [data, setData] = useState<DroughtAssessmentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const cacheKey = getDroughtCacheKey(options.wkt, options.date)

  const fetchDroughtData = useCallback(async (forceRefresh = false) => {
    if (!options.wkt) return

    if (!forceRefresh) {
      const cached = getCachedDroughtAssessment(cacheKey)
      if (cached) {
        setData(cached)
        setError(null)
        return
      }
    }

    const inFlightRequest = droughtAssessmentInFlight.get(cacheKey)
    if (inFlightRequest) {
      setLoading(true)
      setError(null)

      try {
        const result = await inFlightRequest
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch drought assessment'))
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const request: DroughtAssessmentRequest = {
        wkt: options.wkt,
        date: options.date || new Date().toISOString().split('T')[0],
        include_technical: true,
        auto_adjust_date: true
      }
      
      const requestPromise = geeApi.getDroughtAssessment(request)
      droughtAssessmentInFlight.set(cacheKey, requestPromise)

      const result = await requestPromise
      droughtAssessmentCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      setData(result)
    } catch (err) {
      console.error('Error fetching drought assessment:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch drought assessment'))
    } finally {
      droughtAssessmentInFlight.delete(cacheKey)
      setLoading(false)
    }
  }, [cacheKey, options.wkt, options.date])

  useEffect(() => {
    if (!options.wkt) {
      setData(null)
      setError(null)
      return
    }

    const cached = getCachedDroughtAssessment(cacheKey)
    setData(cached)
    setError(null)
  }, [cacheKey, options.wkt])

  useEffect(() => {
    if (options.autoFetch && options.wkt && !data && !loading && !error) {
      fetchDroughtData()
    }
  }, [options.autoFetch, options.wkt, fetchDroughtData, data, loading, error])

  return {
    data,
    loading,
    error,
    refetch: () => fetchDroughtData(true)
  }
}
