// React hook for fetching and managing OSD data

import { useState, useEffect } from 'react'
import type { FormattedOSDData } from '@/types/osd'
import { getFormattedOSDData } from '@/utils/osdApi'

interface UseOSDDataResult {
  osdData: FormattedOSDData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage Official Series Description data
 * @param seriesName - Name of the soil series to fetch (e.g., "ABBOTT")
 * @param enabled - Whether to fetch data automatically (default: true)
 * @returns OSD data, loading state, error state, and refetch function
 */
export function useOSDData(seriesName: string | null, enabled = true): UseOSDDataResult {
  const [osdData, setOsdData] = useState<FormattedOSDData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!seriesName) {
      setOsdData(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getFormattedOSDData(seriesName)
      if (data) {
        setOsdData(data)
      } else {
        setError(`No OSD data found for series: ${seriesName}`)
        setOsdData(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch OSD data'
      setError(errorMessage)
      setOsdData(null)
      console.error('[useOSDData] Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (enabled && seriesName) {
      fetchData()
    } else {
      setOsdData(null)
      setError(null)
    }
  }, [seriesName, enabled])

  return {
    osdData,
    isLoading,
    error,
    refetch: fetchData,
  }
}
