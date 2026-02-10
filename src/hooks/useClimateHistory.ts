import { useState, useCallback, useEffect, useRef } from 'react'
import { geeApi } from '@/lib/geeApiClient'
import type { ClimateHistoryRequest, ClimateHistoryResponse } from '@/types/geeApi'

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

  const fetchClimateData = useCallback(async () => {
    if (!options.wkt) return
    if (fetchInProgress.current) return

    fetchInProgress.current = true
    setLoading(true)
    setError(null)

    try {
      const request: ClimateHistoryRequest = {
        wkt: options.wkt,
        year: options.year,
      }

      console.log('[useClimateHistory] Fetching climate history')
      const result = await geeApi.getClimateHistory(request)
      setData(result)
    } catch (err) {
      console.error('Error fetching climate history:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch climate history'))
    } finally {
      setLoading(false)
      fetchInProgress.current = false
    }
  }, [options.wkt, options.year])

  useEffect(() => {
    if (options.autoFetch && options.wkt && !data && !loading && !error) {
      fetchClimateData()
    }
  }, [options.autoFetch, options.wkt, fetchClimateData, data, loading, error])

  return {
    data,
    loading,
    error,
    refetch: fetchClimateData
  }
}
