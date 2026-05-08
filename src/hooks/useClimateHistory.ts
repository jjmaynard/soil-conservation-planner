import { useState, useCallback, useEffect, useRef } from 'react'
import { geeApi } from '@/lib/geeApiClient'
import type { ClimateHistoryRequest, ClimateHistoryResponse } from '@/types/geeApi'

const CACHE_TTL_MS = 30 * 60 * 1000
const climateHistoryCache = new Map<string, { data: ClimateHistoryResponse; timestamp: number }>()
const climateHistoryInFlight = new Map<string, Promise<ClimateHistoryResponse>>()

function getClimateHistoryCacheKey(wkt?: string, year?: number): string {
  return `${wkt || ''}::${year || 'default'}`
}

function getCachedClimateHistory(cacheKey: string): ClimateHistoryResponse | null {
  const cached = climateHistoryCache.get(cacheKey)
  if (!cached) {
    return null
  }

  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    climateHistoryCache.delete(cacheKey)
    return null
  }

  return cached.data
}

interface UseClimateHistoryOptions {
  wkt?: string
  autoFetch?: boolean
  year?: number
}

interface UseClimateHistoryResult {
  data: ClimateHistoryResponse | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useClimateHistory(options: UseClimateHistoryOptions): UseClimateHistoryResult {
  const [data, setData] = useState<ClimateHistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const fetchInProgress = useRef(false)
  const cacheKey = getClimateHistoryCacheKey(options.wkt, options.year)

  const fetchClimateData = useCallback(async (forceRefresh = false) => {
    if (!options.wkt) return
    if (fetchInProgress.current) return

    if (!forceRefresh) {
      const cached = getCachedClimateHistory(cacheKey)
      if (cached) {
        setData(cached)
        setError(null)
        return
      }
    }

    const inFlightRequest = climateHistoryInFlight.get(cacheKey)
    if (inFlightRequest) {
      setLoading(true)
      setError(null)

      try {
        const result = await inFlightRequest
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch climate history'))
      } finally {
        setLoading(false)
      }
      return
    }

    fetchInProgress.current = true
    setLoading(true)
    setError(null)

    try {
      const request: ClimateHistoryRequest = {
        wkt: options.wkt,
        year: options.year,
      }

      console.log('[useClimateHistory] Fetching climate history')
      const requestPromise = geeApi.getClimateHistory(request)
      climateHistoryInFlight.set(cacheKey, requestPromise)

      const result = await requestPromise
      climateHistoryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      setData(result)
    } catch (err) {
      console.error('Error fetching climate history:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch climate history'))
    } finally {
      climateHistoryInFlight.delete(cacheKey)
      setLoading(false)
      fetchInProgress.current = false
    }
  }, [cacheKey, options.wkt, options.year])

  useEffect(() => {
    if (!options.wkt) {
      setData(null)
      setError(null)
      return
    }

    const cached = getCachedClimateHistory(cacheKey)
    setData(cached)
    setError(null)
  }, [cacheKey, options.wkt])

  useEffect(() => {
    if (options.autoFetch && options.wkt && !data && !loading && !error) {
      fetchClimateData()
    }
  }, [options.autoFetch, options.wkt, fetchClimateData, data, loading, error])

  return {
    data,
    loading,
    error,
    refetch: () => fetchClimateData(true)
  }
}
