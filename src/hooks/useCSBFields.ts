// Custom hook for CSB field data management

import { useState, useCallback, useEffect } from 'react'
import { geeApi } from '#lib/geeApiClient'
import type { CSBBounds, CSBFieldDetails, CSBQueryParams } from '#types/geeApi'

interface UseCSBFieldsOptions {
  autoFetch?: boolean
  initialParams?: CSBQueryParams
}

interface UseCSBFieldsReturn {
  // State
  bounds: CSBBounds | null
  selectedField: CSBFieldDetails | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchBounds: (params: CSBQueryParams) => Promise<void>
  selectFieldAtPoint: (lat: number, lng: number) => Promise<void>
  selectFieldById: (cluId: string) => Promise<void>
  clearSelection: () => void
  clearError: () => void
}

export function useCSBFields(options: UseCSBFieldsOptions = {}): UseCSBFieldsReturn {
  const { autoFetch = false, initialParams } = options

  const [bounds, setBounds] = useState<CSBBounds | null>(null)
  const [selectedField, setSelectedField] = useState<CSBFieldDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch CSB boundaries for a location
   */
  const fetchBounds = useCallback(async (params: CSBQueryParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await geeApi.getCSBBounds(params)
      setBounds(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch CSB boundaries'
      setError(errorMessage)
      console.error('Error fetching CSB bounds:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Select a field by clicking on a point
   */
  const selectFieldAtPoint = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const field = await geeApi.queryFieldAtPoint(lat, lng)
      
      if (field) {
        setSelectedField(field)
      } else {
        setError('No field found at this location')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select field'
      setError(errorMessage)
      console.error('Error selecting field:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Select a field by CLU ID
   */
  const selectFieldById = useCallback(async (cluId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const field = await geeApi.getFieldDetails(cluId)
      setSelectedField(field)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch field details'
      setError(errorMessage)
      console.error('Error fetching field details:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Clear selected field
   */
  const clearSelection = useCallback(() => {
    setSelectedField(null)
  }, [])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch && initialParams) {
      fetchBounds(initialParams)
    }
  }, [autoFetch, initialParams, fetchBounds])

  return {
    bounds,
    selectedField,
    loading,
    error,
    fetchBounds,
    selectFieldAtPoint,
    selectFieldById,
    clearSelection,
    clearError,
  }
}
