/**
 * React Hook for SSURGO Area Queries
 * Provides state management and caching for SSURGO data fetching
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import type * as L from 'leaflet'
import type * as GeoJSON from 'geojson'
import {
  querySSURGOByArea,
  type SSURGOQueryOptions,
  type MapUnitBasic,
  type MapUnitPolygon,
  type MapUnitWithComponents,
  type MapUnitComprehensive,
} from '#lib/ssurgo-area-query'

type QueryResult =
  | MapUnitBasic[]
  | MapUnitPolygon[]
  | MapUnitWithComponents[]
  | MapUnitComprehensive[]

interface UseSSURGOAreaQueryResult {
  data: QueryResult | null
  loading: boolean
  error: Error | null
  query: (
    geometry: L.Polygon | GeoJSON.Polygon | number[][],
    options?: SSURGOQueryOptions
  ) => Promise<void>
  reset: () => void
}

/**
 * React hook for querying SSURGO data by area
 * 
 * @example
 * const { data, loading, error, query } = useSSURGOAreaQuery()
 * 
 * // On polygon draw
 * await query(polygon, { what: 'components' })
 */
export function useSSURGOAreaQuery(): UseSSURGOAreaQueryResult {
  const [data, setData] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const query = useCallback(
    async (
      geometry: L.Polygon | GeoJSON.Polygon | number[][],
      options?: SSURGOQueryOptions
    ) => {
      // Cancel previous query if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      setLoading(true)
      setError(null)

      try {
        const result = await querySSURGOByArea(geometry, options)
        setData(result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        console.error('SSURGO query error:', error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    data,
    loading,
    error,
    query,
    reset,
  }
}

/**
 * Hook with caching support
 * Caches results based on WKT geometry string
 */
export function useSSURGOAreaQueryWithCache(): UseSSURGOAreaQueryResult & {
  clearCache: () => void
} {
  const [data, setData] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const cacheRef = useRef<Map<string, QueryResult>>(new Map())
  const abortControllerRef = useRef<AbortController | null>(null)

  const query = useCallback(
    async (
      geometry: L.Polygon | GeoJSON.Polygon | number[][],
      options?: SSURGOQueryOptions
    ) => {
      // Generate cache key from geometry and options
      const { geometryToWKT } = await import('#lib/ssurgo-area-query')
      const wkt = geometryToWKT(geometry)
      const cacheKey = `${wkt}::${JSON.stringify(options)}`

      // Check cache first
      if (cacheRef.current.has(cacheKey)) {
        setData(cacheRef.current.get(cacheKey)!)
        return
      }

      // Cancel previous query if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      setLoading(true)
      setError(null)

      try {
        const result = await querySSURGOByArea(geometry, options)
        setData(result)
        cacheRef.current.set(cacheKey, result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        console.error('SSURGO query error:', error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  return {
    data,
    loading,
    error,
    query,
    reset,
    clearCache,
  }
}

/**
 * Hook for progressive loading
 * Fetches mukeys first, then detailed data
 */
export function useSSURGOProgressiveQuery() {
  const [mukeys, setMukeys] = useState<MapUnitBasic[]>([])
  const [detailedData, setDetailedData] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const query = useCallback(
    async (
      geometry: L.Polygon | GeoJSON.Polygon | number[][],
      options?: Omit<SSURGOQueryOptions, 'what'>
    ) => {
      setLoading(true)
      setError(null)
      setProgress(0)

      try {
        // Step 1: Get mukeys (fast)
        setProgress(25)
        const mukeyResults = (await querySSURGOByArea(geometry, {
          ...options,
          what: 'mukey',
        })) as MapUnitBasic[]
        setMukeys(mukeyResults)
        setProgress(50)

        // Step 2: Get detailed data
        const detailed = (await querySSURGOByArea(geometry, {
          ...options,
          what: 'comprehensive',
        })) as MapUnitComprehensive[]
        setDetailedData(detailed)
        setProgress(100)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        console.error('SSURGO progressive query error:', error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setMukeys([])
    setDetailedData(null)
    setError(null)
    setLoading(false)
    setProgress(0)
  }, [])

  return {
    mukeys,
    detailedData,
    loading,
    progress,
    error,
    query,
    reset,
  }
}
