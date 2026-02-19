/**
 * Comprehensive Field Assessment Hook
 * Combines SSURGO soil data with GEE terrain/productivity/resource concern data
 */

'use client'

import { useState, useCallback } from 'react'
import type * as GeoJSON from 'geojson'
import { geeApi } from '#lib/geeApiClient'
import { geometryToWKT } from '#lib/ssurgo-area-query'
import type { ComprehensiveFieldAssessment, ProductivityCropSpecificResponse } from '#types/geeApi'
import type { ProcessedFieldData } from './useFieldSSURGO'

// Cache configuration
const CACHE_DURATION_HOURS = 24
const CACHE_KEY_PREFIX = 'gee_assessment_'

export interface EnhancedFieldData {
  // SSURGO soil data
  ssurgoData: ProcessedFieldData | null
  
  // GEE comprehensive assessment
  geeAssessment: ComprehensiveFieldAssessment | null
  
  // Crop-specific productivity (optional - requires CSB ID)
  cropProductivity: ProductivityCropSpecificResponse | null
  
  // Combined/enhanced metrics
  combined: {
    // Erosion (combines SSURGO slope with GEE terrain)
    erosion: {
      ssurgo_slope_based: number | null
      gee_terrain_risk: number | null
      combined_risk: 'Low' | 'Moderate' | 'High' | 'Unknown'
      high_risk_area_pct: number | null
    }
    
    // Drainage (combines SSURGO drainage with GEE ponding)
    drainage: {
      ssurgo_hydric_pct: number | null
      gee_ponding_risk_pct: number | null
      depression_area_pct: number | null
      combined_concern: boolean
    }
    
    // Productivity
    productivity: {
      ndvi_peak_mean: number | null
      yield_gap_pct: number | null
      stability_cv: number | null
    }
    
    // Additional GEE metrics
    drought_risk: {
      water_balance_mm: number | null
      pdsi_mean: number | null
    }
    
    concentrated_flow: {
      channel_density: number | null
      gully_risk_pct: number | null
    }
    
    svi: {
      surface_loss_mean: number | null
      subsurface_drained_mean: number | null
      subsurface_undrained_mean: number | null
    }
  }
}

interface UseComprehensiveFieldAssessmentResult {
  data: EnhancedFieldData | null
  loading: boolean
  error: Error | null
  assessField: (
    geometry: GeoJSON.Polygon | number[][],
    ssurgoData?: ProcessedFieldData | null,
    year?: number,
    fieldId?: string
  ) => Promise<void>
  assessCropProductivity: (
    params: {
      csbId?: string
      wkt?: string
      startYear?: number
      endYear?: number
      fieldId?: string
    }
  ) => Promise<void>
  reset: () => void
}

// Generate cache key from field identifier
const getCacheKey = (wkt: string, fieldId?: string): string => {
  const identifier = fieldId || wkt.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')
  return `${CACHE_KEY_PREFIX}${identifier}`
}

// Check if cached data is still valid
const getCachedData = (cacheKey: string): EnhancedFieldData | null => {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    const ageHours = (now - timestamp) / (1000 * 60 * 60)

    if (ageHours < CACHE_DURATION_HOURS) {
      console.log(`📦 Using cached GEE assessment (${ageHours.toFixed(1)}h old)`)
      return data
    } else {
      console.log(`⏰ Cache expired (${ageHours.toFixed(1)}h old), refreshing...`)
      localStorage.removeItem(cacheKey)
      return null
    }
  } catch (error) {
    console.error('Failed to read GEE assessment cache:', error)
    return null
  }
}

// Save data to cache
const setCachedData = (cacheKey: string, data: EnhancedFieldData) => {
  try {
    const cacheEntry = { data, timestamp: Date.now() }
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry))
    console.log('💾 Cached GEE assessment for future use')
  } catch (error) {
    console.error('Failed to cache GEE assessment:', error)
    // Clear old caches if storage is full
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX) && key !== cacheKey) {
          localStorage.removeItem(key)
        }
      })
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
    } catch (retryError) {
      console.warn('Unable to cache GEE assessment - localStorage may be full')
    }
  }
}

/**
 * Hook for comprehensive field assessment combining SSURGO and GEE data
 */
export function useComprehensiveFieldAssessment(): UseComprehensiveFieldAssessmentResult {
  const [data, setData] = useState<EnhancedFieldData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const assessField = useCallback(
    async (
      geometry: GeoJSON.Polygon | number[][],
      ssurgoData?: ProcessedFieldData | null,
      year?: number,
      fieldId?: string
    ) => {
      const wkt = geometryToWKT(geometry)
      const cacheKey = getCacheKey(wkt, fieldId)
      
      // Check cache first
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setData(cachedData)
        setError(null)
        return
      }
      
      // No cache - fetch from API
      setLoading(true)
      setError(null)
      setData(null)

      try {
        // Query GEE comprehensive assessment (WITHOUT crop-specific - that's lazy loaded)
        console.log('Querying GEE comprehensive assessment...')
        const geeAssessment = await geeApi.getComprehensiveAssessment({
          wkt,
          year: year || new Date().getFullYear(),
          include_visualizations: true,
        })

        // Combine SSURGO and GEE data (cropProductivity will be null initially)
        const enhancedData = combineData(ssurgoData, geeAssessment, null)
        setData(enhancedData)
        
        // Cache for future use
        setCachedData(cacheKey, enhancedData)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        console.error('Comprehensive assessment error:', error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const assessCropProductivity = useCallback(
    async (params: {
      csbId?: string
      wkt?: string
      startYear?: number
      endYear?: number
      fieldId?: string
    }) => {
      const { csbId, wkt, startYear, endYear, fieldId } = params
      
      // Check if data already has crop productivity
      if (data?.cropProductivity) {
        console.log('📦 Crop-specific productivity already loaded')
        return
      }

      if (!data) {
        console.warn('No comprehensive assessment data available')
        return
      }
      
      if (!csbId && !wkt) {
        console.warn('Either csbId or wkt is required for crop-specific productivity')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const end = endYear || new Date().getFullYear()
        const start = startYear || 2017 // API minimum

        console.log('Querying crop-specific productivity with params:', { 
          csbId: csbId || 'none',
          wkt: wkt ? `${wkt.substring(0, 60)}...` : 'none',
          startYear: start, 
          endYear: end,
          fieldId 
        })
        const requestParams: any = {
          start_year: start,
          end_year: end
        }
        
        // For custom fields, prioritize WKT over csbId
        // If csbId starts with 'custom-', treat it as a custom field and require WKT
        const isCustomField = csbId?.startsWith('custom-')
        
        if (isCustomField) {
          if (!wkt) {
            throw new Error('Custom fields require WKT geometry')
          }
          requestParams.wkt = wkt
          console.log('[Productivity] Using WKT for custom field')
        } else if (csbId) {
          requestParams.csbid = csbId
          console.log('[Productivity] Using csbId for CSB field')
        } else if (wkt) {
          requestParams.wkt = wkt
          console.log('[Productivity] Using WKT (no csbId provided)')
        }
        
        const cropProductivity = await geeApi.getProductivityCropSpecific(requestParams)

        // Update data with crop-specific productivity
        const updatedData: EnhancedFieldData = {
          ...data,
          cropProductivity
        }
        setData(updatedData)
        
        // Update cache with crop-specific data
        if (wkt || fieldId) {
          const cacheKey = getCacheKey(wkt || '', fieldId)
          setCachedData(cacheKey, updatedData)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        console.error('Crop-specific productivity error:', error)
      } finally {
        setLoading(false)
      }
    },
    [data]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    assessField,
    assessCropProductivity,
    reset,
  }
}

/**
 * Combine SSURGO and GEE data into enhanced field data
 */
function combineData(
  ssurgoData: ProcessedFieldData | null,
  geeAssessment: ComprehensiveFieldAssessment,
  cropProductivity: ProductivityCropSpecificResponse | null = null
): EnhancedFieldData {
  console.log('combineData called with:')
  console.log('- ssurgoData:', !!ssurgoData)
  console.log('- geeAssessment:', !!geeAssessment)
  console.log('- cropProductivity:', cropProductivity)
  
  // Calculate combined erosion risk
  const ssurgoErosionRisk = ssurgoData?.erosion.avgErosion || null
  const geeErosionRisk = geeAssessment.erosion_risk.statistics.mean_risk
  const highRiskPct = geeAssessment.erosion_risk.statistics.high_risk_area_pct
  
  let combinedErosionRisk: 'Low' | 'Moderate' | 'High' | 'Unknown' = 'Unknown'
  if (geeErosionRisk !== null) {
    if (geeErosionRisk < 0.3 && highRiskPct < 10) {
      combinedErosionRisk = 'Low'
    } else if (geeErosionRisk < 0.6 && highRiskPct < 25) {
      combinedErosionRisk = 'Moderate'
    } else {
      combinedErosionRisk = 'High'
    }
  }

  // Calculate combined drainage concern
  const ssurgoHydricPct = ssurgoData?.drainage.hydricPercent || null
  const geePondingRiskPct = geeAssessment.ponding.ponding_metrics.high_ponding_risk_pct
  const combinedDrainageConcern = 
    (ssurgoHydricPct !== null && ssurgoHydricPct > 20) || 
    (geePondingRiskPct > 15)

  const getClassWeightedMean = (classPct: any): number | null => {
    if (!classPct || typeof classPct !== 'object') return null
    const low = Number(classPct.low_pct) || 0
    const moderate = Number(classPct.moderate_pct) || 0
    const moderatelyHigh = Number(classPct.moderately_high_pct) || 0
    const high = Number(classPct.high_pct) || 0
    const classifiedTotal = low + moderate + moderatelyHigh + high
    if (classifiedTotal <= 0) return null
    return ((low * 1) + (moderate * 2) + (moderatelyHigh * 3) + (high * 4)) / classifiedTotal
  }

  const sviMetrics = geeAssessment.svi.svi_metrics
  const surfaceLossMean =
    sviMetrics.surface_loss_mean ??
    getClassWeightedMean(sviMetrics.surface_loss_class_pct)
  const subsurfaceDrainedMean =
    sviMetrics.subsurface_drained_mean ??
    getClassWeightedMean(sviMetrics.subsurface_drained_class_pct)
  const subsurfaceUndrainedMean =
    sviMetrics.subsurface_undrained_mean ??
    getClassWeightedMean(sviMetrics.subsurface_undrained_class_pct)

  return {
    ssurgoData,
    geeAssessment,
    cropProductivity,
    combined: {
      erosion: {
        ssurgo_slope_based: ssurgoErosionRisk,
        gee_terrain_risk: geeErosionRisk,
        combined_risk: combinedErosionRisk,
        high_risk_area_pct: highRiskPct,
      },
      drainage: {
        ssurgo_hydric_pct: ssurgoHydricPct,
        gee_ponding_risk_pct: geePondingRiskPct,
        depression_area_pct: geeAssessment.ponding.ponding_metrics.depression_area_pct,
        combined_concern: combinedDrainageConcern,
      },
      productivity: {
        ndvi_peak_mean: geeAssessment.productivity.productivity_metrics.ndvi_peak_mean,
        yield_gap_pct: geeAssessment.productivity.yield_gap.mean_gap_pct,
        stability_cv: geeAssessment.soil_quality.productivity_stability.ndvi_peak_cv,
      },
      drought_risk: {
        water_balance_mm: geeAssessment.drought.water_balance.balance_mm,
        pdsi_mean: geeAssessment.drought.drought_indices.pdsi_mean,
      },
      concentrated_flow: {
        channel_density: geeAssessment.concentrated_flow.flow_metrics.channel_density_m_per_ha,
        gully_risk_pct: geeAssessment.concentrated_flow.flow_metrics.high_gully_risk_pct,
      },
      svi: {
        surface_loss_mean: surfaceLossMean,
        subsurface_drained_mean: subsurfaceDrainedMean,
        subsurface_undrained_mean: subsurfaceUndrainedMean,
      },
    },
  }
}

/**
 * Load comprehensive assessment from session storage
 */
export function loadComprehensiveAssessmentFromSession(): EnhancedFieldData | null {
  if (typeof window === 'undefined') return null
  
  const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
  if (stored) {
    try {
      return JSON.parse(stored) as EnhancedFieldData
    } catch (e) {
      console.error('Failed to parse stored comprehensive assessment:', e)
    }
  }
  return null
}
