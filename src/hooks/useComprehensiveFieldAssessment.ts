/**
 * Comprehensive Field Assessment Hook
 * Combines SSURGO soil data with GEE terrain/productivity/resource concern data
 */

'use client'

import { useState, useCallback } from 'react'
import type * as GeoJSON from 'geojson'
import { geeApi } from '#lib/geeApiClient'
import { geometryToWKT } from '#lib/ssurgo-area-query'
import type { ComprehensiveFieldAssessment } from '#types/geeApi'
import type { ProcessedFieldData } from './useFieldSSURGO'

export interface EnhancedFieldData {
  // SSURGO soil data
  ssurgoData: ProcessedFieldData | null
  
  // GEE comprehensive assessment
  geeAssessment: ComprehensiveFieldAssessment | null
  
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
    year?: number
  ) => Promise<void>
  reset: () => void
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
      year?: number
    ) => {
      setLoading(true)
      setError(null)

      try {
        // Convert geometry to WKT for GEE API
        const wkt = geometryToWKT(geometry)

        // Query GEE comprehensive assessment
        console.log('Querying GEE comprehensive assessment...')
        const geeAssessment = await geeApi.getComprehensiveAssessment({
          wkt,
          year: year || new Date().getFullYear(),
          include_visualizations: true,
        })

        // Combine SSURGO and GEE data
        const enhancedData = combineData(ssurgoData, geeAssessment)
        setData(enhancedData)
        
        // Store in session storage
        sessionStorage.setItem('comprehensiveFieldAssessment', JSON.stringify(enhancedData))
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
    reset,
  }
}

/**
 * Combine SSURGO and GEE data into enhanced field data
 */
function combineData(
  ssurgoData: ProcessedFieldData | null,
  geeAssessment: ComprehensiveFieldAssessment
): EnhancedFieldData {
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

  return {
    ssurgoData,
    geeAssessment,
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
        surface_loss_mean: geeAssessment.svi.svi_metrics.surface_loss_mean,
        subsurface_drained_mean: geeAssessment.svi.svi_metrics.subsurface_drained_mean,
        subsurface_undrained_mean: geeAssessment.svi.svi_metrics.subsurface_undrained_mean,
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
