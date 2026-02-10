import { useState, useCallback, useEffect } from 'react'
import { geeApi } from '@/lib/geeApiClient'
import type { DroughtAssessmentResponse, DroughtAssessmentRequest } from '@/types/drought'

interface UseDroughtAssessmentOptions {
  wkt: string;
  date?: string;
  autoFetch?: boolean;
}

export function useDroughtAssessment(options: UseDroughtAssessmentOptions) {
  const [data, setData] = useState<DroughtAssessmentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDroughtData = useCallback(async () => {
    if (!options.wkt) return

    setLoading(true)
    setError(null)
    
    try {
      const request: DroughtAssessmentRequest = {
        wkt: options.wkt,
        date: options.date || new Date().toISOString().split('T')[0],
        include_technical: true,
        auto_adjust_date: true
      }
      
      const result = await geeApi.getDroughtAssessment(request)
      setData(result)
    } catch (err) {
      console.error('Error fetching drought assessment:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch drought assessment'))
    } finally {
      setLoading(false)
    }
  }, [options.wkt, options.date])

  useEffect(() => {
    if (options.autoFetch && options.wkt && !data && !loading && !error) {
      fetchDroughtData()
    }
  }, [options.autoFetch, options.wkt, fetchDroughtData, data, loading, error])

  return {
    data,
    loading,
    error,
    refetch: fetchDroughtData
  }
}
