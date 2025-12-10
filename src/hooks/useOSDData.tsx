/**
 * Hook to fetch Official Series Description (OSD) data
 */

import { useEffect, useState } from 'react'

import type { OSDData } from '#src/utils/osdParser'

interface UseOSDDataResult {
  osdData: OSDData | null
  loading: boolean
  error: string | null
}

export function useOSDData(componentName: string | null): UseOSDDataResult {
  const [osdData, setOsdData] = useState<OSDData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!componentName) {
      setOsdData(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchOSD() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/osd?component=${encodeURIComponent(componentName)}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError(`No OSD file found for ${componentName}`)
          } else {
            setError('Failed to load OSD data')
          }
          setOsdData(null)
          return
        }

        const result = await response.json()

        if (!cancelled && result.success) {
          setOsdData(result.data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching OSD:', err)
          setError('Error loading OSD data')
          setOsdData(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchOSD()

    return () => {
      cancelled = true
    }
  }, [componentName])

  return { osdData, loading, error }
}
